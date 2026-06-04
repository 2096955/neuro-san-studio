# AEEN FAERS/CMS tool fix — handoff to commit

**Date:** 2026-06-02
**From:** AEEN + deploy session
**For:** whoever reconciles AEEN into the shared branch / `main`
**Status:** Fix is **LIVE on Cloud Run** (rev `neuro-san-maa-backend-00012-rjb`) and now **committed on branch `feat/aeen`** (`5c8ee17`, on top of the AEEN PoC commit `cce4e1d`). It is **still uncommitted in the shared `feat/local-maa-categories` working tree**, where `registries/agentic_evidence_exchange.hocon` shows as untracked (`??`). No redeploy needed — what remains is git reconciliation only (details below).

---

## What was broken

When the LLM invoked the FAERS tool `Adverse_Event_Signal_Lookup`, the server threw:

```
pydantic.v1.errors.ConfigError: unable to infer type for attribute "limit"
Tool._arun() got Exception: unable to infer type for attribute "limit"
```

Gemini then **hallucinated** the safety-signal answer (round numbers, no live counts) instead of using the tool. The CMS tool `Medicare_Prescribing_Analytics` had the identical latent bug on its `max_rows` param (would throw the same on invocation).

This was invisible to the unit tests because they call `invoke()` directly and never build the LangChain args-schema — the failure is at **tool-schema build time**, only when the LLM actually calls the tool.

## Root cause

neuro-san 0.6.23's `BaseModelDictionaryConverter.TYPE_LOOKUP`
(`neuro_san/internals/run_context/langchain/core/base_model_dictionary_converter.py`) only maps the tokens
`string / int / float / boolean / array / object`. It does **not** know the JSON-Schema/OpenAI-standard
`"integer"` / `"number"`. A `"type":"integer"` property resolves to `None`, so `create_model` builds a
pydantic field with no inferable type → `ConfigError`.

`"int"` is the neuro-san-internal idiom (its own bundled `toolbox_info.hocon` uses `"int"`). LangChain
re-serializes the pydantic `int` field back to JSON-Schema `"integer"` (gapic `INTEGER` for Gemini), so the
model still sees a standard type — the `"int"` token never reaches the LLM.

## The change (committed on `feat/aeen`; also live in the shared working tree)

`registries/agentic_evidence_exchange.hocon`, two lines:

```
- "type": "integer",   # max_rows (Medicare_Prescribing_Analytics / CMS)
+ "type": "int",
- "type": "integer",   # limit (Adverse_Event_Signal_Lookup / FAERS)
+ "type": "int",
```

That's the entire fix. Registry-side on purpose: it travels into the Cloud Run image via the deploy rsync/COPY,
whereas an SDK patch would be erased by `pip install neuro-san==0.6.23`.

## Verified

- Both tool schemas now build via the real `AgentNetworkRestorer` + `LangChainOpenAIFunctionTool` path:
  `limit:int`, `max_rows:int`, `required=False`.
- Live FAERS chat (local throwaway `:8181` **and** cloud rev `00012-rjb`): empagliflozin → **Total Reports 69,331**,
  exactly matching openFDA ground truth (`meta.results.total`), with the real top-10 MedDRA reactions. Zero
  `ConfigError` in the logs. Grounded, not hallucinated.
- Reviewed by Codex (APPROVE-WITH-NITS) and a 3-agent fan-out (RCA + blast-radius + adversarial fix critique).

## What remains (git reconciliation only)

It's already deployed and already committed on `feat/aeen`, so nothing is urgent. The one thing to watch:
a **git/CI-based** redeploy from `feat/local-maa-categories` (rather than the local rsync `deploy-backend.sh`)
would **not** carry this fix, because on that branch the registry is still untracked. Pick whichever path fits:

- **(A) Merge/PR `feat/aeen` → `main`.** Carries the whole AEEN PoC plus this fix as reviewed commits
  (`cce4e1d` + `5c8ee17`). `feat/aeen` = `origin/main` + AEEN only, so the diff is clean. Recommended.
- **(B) If AEEN should ride the shared branch instead,** commit the working-tree AEEN files on
  `feat/local-maa-categories` (registry + `coded_tools/aeen/**` + tests), or cherry-pick `cce4e1d` then `5c8ee17`
  onto it. `git status` first so the commit is scoped to AEEN and doesn't sweep the peer's `web_search`/app edits.

Either way the fixed registry is identical to what's running on `00012-rjb` — `feat/aeen:registries/agentic_evidence_exchange.hocon` is byte-for-byte the deployed file.

## Optional follow-up (not blocking)

File an upstream neuro-san issue/PR to add `"integer"`→int and `"number"`→float aliases to `TYPE_LOOKUP`, so
future registries can use standard JSON-Schema tokens without this footgun.
