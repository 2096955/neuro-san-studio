# Cloud Run deploy — Multi-Agent Accelerator (Gemini)

Public deploy of the categorized MAA: the Next.js UI (in `neuro-san-ui-reference`) talking to
this neuro-san backend, both on Cloud Run in `gbg-neuro`/`us-central1`, on **Gemini**
(local Ollama can't run on Cloud Run).

## Live services
- UI:      https://neuro-san-maa-ui-kcvokjzgdq-uc.a.run.app/multiAgentAccelerator
- Backend: https://neuro-san-maa-backend-kcvokjzgdq-uc.a.run.app

## Architecture
```
Browser → neuro-san-maa-ui (Next.js)  ──CORS──>  neuro-san-maa-backend (neuro-san :8080) ──> Gemini (GOOGLE_API_KEY)
```

## Redeploy
Backend:
```bash
export GEMINI_API_KEY=<valid Google AI Studio key>   # NOT the old leaked one
bash deploy/cloud-maa/deploy-backend.sh
```
UI (in the neuro-san-ui-reference repo, after the backend URL is known):
```bash
bash deploy/cloud-maa/deploy-ui.sh
```

## Web search providers
Web search is a **toolbox-layer provider chosen at load time** (no registry rewrite); callers only
ever reference `/web_search`. DuckDuckGo (`ddgs_search`) is rate-limited/blocked from datacenter
egress, so the cloud uses API-key providers that work from Cloud Run:

| Caller | Cloud provider | Local default | Key |
|---|---|---|---|
| Shared `/web_search` (and `agentic_rag`) | **Tavily** via `WEB_SEARCH_TOOLBOX=tavily_search` | `brave_search` | `TAVILY_API_KEY` |
| AEEN `Clinical_Literature_Search` | **Brave** (pinned in the registry) | `brave_search` | `BRAVE_API_KEY` |

- `deploy-backend.sh` sources `TAVILY_API_KEY` and `BRAVE_API_KEY` from `.env` **per key** (it won't
  clobber a value already exported) and passes both to Cloud Run. `.env` is gitignored and
  rsync-excluded from the build context — it is never committed or uploaded.
- The shared provider is switched only via `WEB_SEARCH_TOOLBOX` at deploy time. Without
  `TAVILY_API_KEY` the shared search falls back to its registry default (`brave_search`); AEEN always
  uses Brave regardless of that toggle, so its literature search is independent of the shared one.
- A deploy gate asserts `web_search.hocon` actually **resolves** to `tavily_search` under the
  override before the image builds, so a typo'd/empty env var can't silently no-op.
- Brave free tier ≈ 2,000 queries/month at 1 req/sec; heavy multi-agent fan-out can still 429
  (the tool does one short retry).

## Observability — Arize AX (traces + evals)
neuro-san runs on LangChain, so a single OpenInference instrumentor captures the whole AAOSA graph
(coordinator → specialists → tools → LLM) with **no registry/agent changes**.

- **How it's wired:** both launch paths go through `deploy/otel_bootstrap.py`, which instruments
  LangChain *before* importing neuro-san and then execs the real server. It is a **no-op** unless both
  `ARIZE_SPACE_ID` and `ARIZE_API_KEY` are set, so the server runs identically when tracing is off.
- **Enable it:** add `ARIZE_SPACE_ID` and `ARIZE_API_KEY` to `.env` (or export them) before
  `deploy-backend.sh`. The script sources them per-key (same pattern as the web-search keys) and passes
  them to Cloud Run; spans go to the Arize project `ARIZE_PROJECT_NAME` (default `neuro-san-maa`) over
  gRPC to `otlp.arize.com`. `.env` is gitignored / rsync-excluded — keys are never committed.
- **Deps:** the cloud image adds `arize-otel` + `openinference-instrumentation-langchain`
  (`requirements-cloud.txt`). Locally: `pip install -r requirements-observability.txt`.
- **Local runs** use the same path: `python run.py` with the two ARIZE vars set traces to the same AX
  space (Gemini *and* Ollama LLM calls are both captured via the LangChain callback layer).
- **Evaluations:** `python evals/run_evals.py` drives the questions in
  `evals/aeen_eval_questions.jsonl` through the backend (`BACKEND_URL`, default localhost:8080), then
  runs LLM-as-judge evals (correctness + relevance) over the resulting AX spans and logs the scores
  back onto the traces (`spans.update_evaluations`). The judge auto-selects OpenAI → Gemini → local
  Ollama from whatever key is present. A local `evals/report.md` + `results.csv` is always written.
  Use `--no-drive` to evaluate spans already in AX.
- **Note:** if gRPC export is ever blocked from Cloud Run, switch to HTTP OTLP (Arize supports both).

## Identities (gbg-neuro SA keys under ~/SubAgents/GCP-Package)
- `bfs-gen-ai@gbg-neuro` — can submit Cloud Build **and read build logs** (use for builds).
- `healthcare-poc-vertexai@gbg-neuro` — can set the public `allUsers` invoker IAM binding.

## Gotchas learned (so we don't repeat them)
- **LLM**: registries are Ollama locally; `swap_llm_for_deploy.py` flips them to `gemini-2.5-flash`
  on a temp build copy. neuro-san class `gemini` = `langchain_google_genai.ChatGoogleGenerativeAI`
  (uses `GOOGLE_API_KEY`), so the cloud image needs `langchain-google-genai` (see requirements-cloud.txt).
- **Leaked key**: the old `neuro-san-backend` service's `GOOGLE_API_KEY` was flagged "leaked" by
  Google and is dead — rotate it. Use the machine's valid `GEMINI_API_KEY`.
- **Coded tools**: `AGENT_TOOL_PATH` must be the dotted module path `coded_tools` (entrypoint puts
  `$APP_SOURCE` on PYTHONPATH), NOT an absolute path, or class-based coded tools fail to import.
- **Toolbox**: the SDK Dockerfile doesn't copy `toolbox/`; the cloud Dockerfile adds that COPY.
- **Build deps**: the full repo requirements.txt fails on slim images; use `requirements-cloud.txt`.
- **Secret Manager** is permission-blocked for the available SAs, so `GOOGLE_API_KEY` is a plain
  Cloud Run env (same posture as the existing services). Migrate to Secret Manager when IAM allows.

## Production deploy discipline

Condensed from [production lessons](../../docs/lessons/README.md). Full context:

- [Architecture lessons](../../docs/lessons/ARCHITECTURE_LESSONS.md)
- [Production checklist](../../docs/lessons/PRODUCTION_CHECKLIST.md)
- [Arize evals (in progress)](../../docs/lessons/ARIZE_EVALS.md)

### Before every promote

- **Secrets** — `.env` is gitignored and rsync-excluded; run secret scanning in CI (trufflehog or
  equivalent). Rotate any key flagged as leaked before redeploy.
- **Immutable artifact** — Cloud Build produces one image tagged with the git SHA; promote that
  image to Cloud Run. Do not rebuild with different env for “the same” release.
- **Web search keys** — confirm `TAVILY_API_KEY` / `BRAVE_API_KEY` are set in `.env` (or exported)
  before `deploy-backend.sh`; the deploy gate checks Tavily resolution for shared search.

### Model and registry changes (major change)

Treat these like a production release, not a config tweak:

- **`GEMINI_MODEL`** or `llm_info_extra.hocon` changes
- Registry prompt / rubric edits
- New or renamed CodedTools on the hot path

Minimum bar:

1. Re-run the **Smoke** golden set (~30 cases) — CI merge gate.
2. Re-run the **Benchmark** set (N≥300) before promote — block on >2pp regression on the headline
   metric unless explicitly risk-accepted.
3. Document rollback: previous image SHA + previous `GEMINI_MODEL` + env snapshot.
4. Use **Assessor** where available to classify failure modes on the candidate build.

### Operational controls (Phase 2+)

Not required for the public MAA demo, but expected on regulated production:

- **Kill switch** — per-network or per-tool feature flag; disable without redeploy.
- **Provider circuit breaker** — pause consumption on sustained LLM 429/5xx rather than DLQ-flooding
  on provider outages.
- **Configuration snapshot** — pin prompt hash, rubric hash, model id, and tool definitions with the
  release artefact so audit replay is evidential, not documentary.

### MCP and tool boundaries

When exposing networks as MCP servers:

- Hard depth / breadth / cardinality limits on tool calls (no raw query passthrough).
- Structured MCP error responses (`errorCategory`, `isRetryable`) so agents recover locally.
- Specialists never call data stores directly — retrieval goes through validated CodedTool boundaries.
