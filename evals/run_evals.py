#!/usr/bin/env python3
# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT
"""LLM-as-judge evaluations for the neuro-san MAA backend, logged onto the Arize AX traces.

Pipeline:
  1. (optional) DRIVE: send each question in evals/aeen_eval_questions.jsonl to the backend's
     /api/v1/{agent}/streaming_chat so it produces traces in the Arize AX project.
  2. EXPORT: pull the resulting spans back with arize.ArizeClient().spans.export_to_df(...).
  3. JUDGE: run phoenix.evals.llm_classify over each trace's (question, answer) for two metrics —
     "correctness" and "relevance" (reference-free LLM-as-judge).
  4. LOG BACK: write the scores to AX via spans.update_evaluations(...) so they appear on the traces,
     and always also write evals/report.md + evals/results.csv locally.

Env:
  ARIZE_SPACE_ID, ARIZE_API_KEY   required
  ARIZE_PROJECT_NAME              optional (default "neuro-san-maa")
  BACKEND_URL                    optional (default "http://localhost:8080")
  Judge model auto-selected: OPENAI_API_KEY -> gpt-4o-mini; else GEMINI_API_KEY/GOOGLE_API_KEY ->
  gemini/gemini-2.5-flash (via litellm); else local Ollama (OLLAMA_API_BASE, EVAL_OLLAMA_MODEL).

Usage:
  python evals/run_evals.py                       # drive + eval + log back
  python evals/run_evals.py --no-drive            # eval existing recent spans only
  python evals/run_evals.py --judge-model gpt-4o  # force a judge model
"""

import argparse
import datetime as dt
import json
import os
import sys
import time

import pandas as pd
import requests

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_QUESTIONS = os.path.join(HERE, "aeen_eval_questions.jsonl")

CORRECTNESS_TEMPLATE = """You are grading an AI assistant's answer to a user's question.
[BEGIN DATA]
Question: {input}
Answer: {output}
[END DATA]
Is the answer factually accurate and a sufficient, on-topic response to the question?
Respond with exactly one word: "correct" or "incorrect"."""
CORRECTNESS_RAILS = ["correct", "incorrect"]

RELEVANCE_TEMPLATE = """You are grading whether an AI assistant's answer is relevant to the question.
[BEGIN DATA]
Question: {input}
Answer: {output}
[END DATA]
Is the answer on-topic and responsive to the question (not off-topic, empty, or a refusal)?
Respond with exactly one word: "relevant" or "irrelevant"."""
RELEVANCE_RAILS = ["relevant", "irrelevant"]

EVALS = [
    {
        "name": "correctness",
        "template": CORRECTNESS_TEMPLATE,
        "rails": CORRECTNESS_RAILS,
        "good": "correct",
    },
    {
        "name": "relevance",
        "template": RELEVANCE_TEMPLATE,
        "rails": RELEVANCE_RAILS,
        "good": "relevant",
    },
]


def drive_queries(backend_url: str, questions: list, timeout: float = 240.0) -> None:
    """Send each question to the backend so it emits traces. Best-effort; prints a short answer."""
    for i, q in enumerate(questions, 1):
        agent = q["agent"]
        body = {
            "user_message": {"type": "HUMAN", "text": q["question"]},
            "chat_filter": {"chat_filter_type": "MINIMAL"},
        }
        url = f"{backend_url.rstrip('/')}/api/v1/{agent}/streaming_chat"
        try:
            resp = requests.post(url, json=body, timeout=timeout, stream=True)
            answer = ""
            for line in resp.iter_lines():
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                text = (obj.get("response") or {}).get("text")
                if text:
                    answer = text
            print(f"  [{i}/{len(questions)}] {agent}: {answer[:90]!r}")
        except requests.RequestException as err:
            print(f"  [{i}/{len(questions)}] {agent}: DRIVE ERROR {err}")


def build_judge(judge_model_arg):
    """Return (model, label) picking the first available judge: OpenAI -> Gemini -> local Ollama."""
    from phoenix.evals import LiteLLMModel, OpenAIModel

    if judge_model_arg:
        if judge_model_arg.startswith("gpt") or judge_model_arg.startswith("o1"):
            return OpenAIModel(model=judge_model_arg), f"openai/{judge_model_arg}"
        return LiteLLMModel(model=judge_model_arg), judge_model_arg
    if os.getenv("OPENAI_API_KEY"):
        return OpenAIModel(model="gpt-4o-mini"), "openai/gpt-4o-mini"
    if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
        return LiteLLMModel(model="gemini/gemini-2.5-flash"), "gemini/gemini-2.5-flash"
    base = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
    model = os.getenv("EVAL_OLLAMA_MODEL", "qwen3.6:35b-a3b")
    return LiteLLMModel(
        model=f"ollama/{model}", model_kwargs={"api_base": base}
    ), f"ollama/{model}"


def _find_col(df: pd.DataFrame, *candidates: str):
    for c in candidates:
        if c in df.columns:
            return c
    return None


def _content_of(msg) -> str:
    """Pull the human-readable text out of one OpenInference/LangChain message dict."""
    if not isinstance(msg, dict):
        return str(msg) if msg else ""
    data = msg.get("data") if isinstance(msg.get("data"), dict) else msg
    val = data.get("content")
    if isinstance(val, str) and val.strip():
        return val
    ak = data.get("additional_kwargs")
    if (
        isinstance(ak, dict)
        and isinstance(ak.get("content"), str)
        and ak["content"].strip()
    ):
        return ak["content"]
    return ""


def _extract_text(raw) -> str:
    """Best-effort plain text from a span input/output value (often a JSON-wrapped message list)."""
    if raw is None:
        return ""
    s = str(raw)
    try:
        obj = json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return s.strip()
    if isinstance(obj, dict):
        msgs = obj.get("messages")
        if isinstance(msgs, list) and msgs:
            for msg in reversed(msgs):  # last non-empty message = the final answer
                c = _content_of(msg)
                if c:
                    return c.strip()
        for key in ("input", "question"):
            if isinstance(obj.get(key), str) and obj[key].strip():
                return obj[key].strip()
        c = _content_of(obj)
        if c:
            return c.strip()
    if isinstance(obj, list) and obj:
        for msg in reversed(obj):
            c = _content_of(msg)
            if c:
                return c.strip()
    return s.strip()


def select_answer_spans(df: pd.DataFrame) -> pd.DataFrame:
    """One clean (question, answer) row per logical request.

    neuro-san emits several top-level spans per request that all carry the question, but only the
    front-man span carries the final answer (the others echo the system prompt). We extract plain text
    from each root span, then dedupe by question keeping the longest answer (the real one).
    """
    in_col = _find_col(df, "attributes.input.value", "input.value")
    out_col = _find_col(df, "attributes.output.value", "output.value")
    parent_col = _find_col(df, "parent_id", "attributes.parent_id")
    sid_col = _find_col(df, "context.span_id", "span_id")
    if not (in_col and out_col):
        raise SystemExit(
            f"export missing input/output columns; have: {list(df.columns)[:30]}"
        )
    # the arize export can contain duplicate column labels — keep the first of each
    work = df.loc[:, ~df.columns.duplicated()].copy()
    if parent_col is not None:
        is_root = work[parent_col].isna() | (
            work[parent_col].astype(str).str.strip().isin(["", "None", "nan"])
        )
        roots = work[is_root].copy()
    else:
        roots = work
    if roots.empty:
        return roots.head(0)
    sid = (
        roots[sid_col].astype(str)
        if sid_col
        else pd.Series(roots.index.astype(str), index=roots.index)
    )
    clean = pd.DataFrame(
        {
            "context.span_id": sid.values,
            "input": roots[in_col].map(_extract_text).values,
            "output": roots[out_col].map(_extract_text).values,
        }
    )
    # keep rows with a real question + a substantive answer (drop system-prompt-only echoes)
    clean = clean[clean["input"].str.strip().str.len() > 0]
    clean = clean[clean["output"].str.strip().str.len() >= 30]
    if clean.empty:
        return clean
    # dedupe by question, keeping the longest answer (the front-man's final synthesis)
    clean["_qkey"] = clean["input"].str.strip().str.lower().str.slice(0, 200)
    clean["_olen"] = clean["output"].str.len()
    clean = clean.sort_values("_olen", ascending=False).drop_duplicates(
        "_qkey", keep="first"
    )
    clean = clean.drop(columns=["_qkey", "_olen"]).reset_index(drop=True)
    clean["input"] = clean["input"].str.slice(0, 4000)
    clean["output"] = clean["output"].str.slice(0, 4000)
    return clean


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--backend-url", default=os.getenv("BACKEND_URL", "http://localhost:8080")
    )
    ap.add_argument(
        "--project", default=os.getenv("ARIZE_PROJECT_NAME", "neuro-san-maa")
    )
    ap.add_argument("--questions", default=DEFAULT_QUESTIONS)
    ap.add_argument(
        "--no-drive",
        action="store_true",
        help="skip sending queries; eval existing spans",
    )
    ap.add_argument("--judge-model", default=os.getenv("EVAL_JUDGE_MODEL"))
    ap.add_argument(
        "--wait",
        type=int,
        default=150,
        help="seconds to wait for AX ingestion after driving",
    )
    ap.add_argument("--lookback-min", type=int, default=60)
    ap.add_argument(
        "--no-log-back",
        action="store_true",
        help="compute evals but do not write to AX",
    )
    args = ap.parse_args()

    space_id = os.getenv("ARIZE_SPACE_ID")
    api_key = os.getenv("ARIZE_API_KEY")
    if not (space_id and api_key):
        print("ERROR: set ARIZE_SPACE_ID and ARIZE_API_KEY")
        return 2

    questions = [json.loads(line) for line in open(args.questions) if line.strip()]

    if not args.no_drive:
        print(f"Driving {len(questions)} queries at {args.backend_url} ...")
        drive_queries(args.backend_url, questions)
        print(f"Waiting {args.wait}s for AX ingestion ...")
        time.sleep(args.wait)

    from arize import ArizeClient

    client = ArizeClient(api_key=api_key)
    end = dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=5)
    start = end - dt.timedelta(minutes=args.lookback_min + 5)
    print(
        f"Exporting spans for project '{args.project}' ({args.lookback_min}m lookback) ..."
    )
    spans = client.spans.export_to_df(
        space_id=space_id, project_name=args.project, start_time=start, end_time=end
    )
    print(f"  exported {len(spans)} spans")
    answers = select_answer_spans(spans)
    print(f"  {len(answers)} answer-level spans to evaluate")
    if answers.empty:
        print("No answer spans found — nothing to evaluate.")
        return 1

    from phoenix.evals import llm_classify

    judge, judge_label = build_judge(args.judge_model)
    print(f"Judge model: {judge_label}")

    sid = answers["context.span_id"].astype(str)
    results = answers[["input", "output"]].copy()
    results["context.span_id"] = sid.values
    annotation_frames = []

    for ev in EVALS:
        print(f"Running eval: {ev['name']} ...")
        out = llm_classify(
            data=answers[["input", "output"]],
            model=judge,
            template=ev["template"],
            rails=ev["rails"],
            provide_explanation=True,
            run_sync=True,
        )
        out = out.reindex(answers.index)
        label = out["label"].astype(str)
        score = (label == ev["good"]).astype(float)
        expl = (
            out["explanation"]
            if "explanation" in out.columns
            else pd.Series("", index=out.index)
        )
        results[f"{ev['name']}.label"] = label.values
        results[f"{ev['name']}.score"] = score.values
        ann = pd.DataFrame(
            {
                "context.span_id": sid.values,
                f"eval.{ev['name']}.label": label.values,
                f"eval.{ev['name']}.score": score.values,
                f"eval.{ev['name']}.explanation": expl.astype(str).values,
            }
        )
        annotation_frames.append(ann)

    # ---- local report (always) ----
    os.makedirs(HERE, exist_ok=True)
    results.to_csv(os.path.join(HERE, "results.csv"), index=False)
    lines = [
        "# neuro-san MAA eval report",
        "",
        f"- project: `{args.project}`",
        f"- judge: `{judge_label}`",
        f"- answer spans evaluated: {len(results)}",
        "",
    ]
    for ev in EVALS:
        col = f"{ev['name']}.score"
        if col in results:
            rate = 100.0 * results[col].mean()
            lines.append(
                f"- **{ev['name']}**: {rate:.0f}% `{ev['good']}` ({int(results[col].sum())}/{len(results)})"
            )
    lines += ["", "## Per-answer", ""]
    for _, r in results.iterrows():
        lines.append(
            f"- _{str(r['input'])[:80]}_ → "
            + ", ".join(
                f"{ev['name']}={r.get(ev['name'] + '.label', '?')}" for ev in EVALS
            )
        )
    report = os.path.join(HERE, "report.md")
    open(report, "w").write("\n".join(lines) + "\n")
    print(f"Wrote {report} and results.csv")

    # ---- log evals back onto the AX traces ----
    if args.no_log_back:
        print("--no-log-back set; skipping AX update_evaluations.")
        return 0
    merged = annotation_frames[0]
    for extra in annotation_frames[1:]:
        merged = merged.merge(extra, on="context.span_id", how="outer")
    try:
        client.spans.update_evaluations(
            space_id=space_id, project_name=args.project, dataframe=merged
        )
        print(
            f"Logged {len(merged)} span evaluations to Arize AX (project {args.project})."
        )
    except Exception as err:  # pylint: disable=broad-except
        print(
            f"WARNING: update_evaluations failed ({err}); local report still written."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
