# Arize tracing and evals (integration in progress)

This fork is wiring **Arize AX** for production-grade trajectory observability and
**Phoenix-style evaluators** for the Smoke / Benchmark discipline from
[architecture lessons](ARCHITECTURE_LESSONS.md) and [production checklist](PRODUCTION_CHECKLIST.md).

Status: **in progress** — dependencies and docs land first; bootstrap hooks and CI gates follow.

---

## Why Arize here

Past deployments hit the same wall: you need **traces** to debug multi-agent fan-out and **evals**
to gate prompt/model changes. Neuro SAN exposes LangChain/AAOSA graphs that map cleanly to
OpenInference instrumentation.

| Need | Lesson source | Arize / Phoenix piece |
|------|---------------|------------------------|
| Trajectory observability | Architecture lesson § quality + runtime | AX traces via `arize-otel` + LangChain instrumentor |
| Smoke gate (~30 cases) | Checklist EVL-001 | Offline eval run → block merge on regression |
| Benchmark gate (N≥300) | Checklist EVL-002, GATE-003 | LLM-as-judge + export scores to AX |
| Drift monitoring | Checklist EVL-018, GATE-006 | Online sampling + AX dashboards |
| Vault-aware export | Sanitisation contract | **Your wrapper** — never ship raw PII in span attributes |

Neuro SAN also ships **Assessor** upstream for structured failure-mode labels on golden sets.
Arize complements Assessor: traces for *what happened*, evals for *whether it was good enough to ship*.

---

## Dependencies

Optional stack — the MAA backend runs without it:

```bash
cd neuro-san-studio
pip install -r requirements-observability.txt
```

| Package | Role |
|---------|------|
| `arize-otel` | Register AX tracer provider |
| `openinference-instrumentation-langchain` | Auto-trace LangChain / Gemini agent graph |
| `arize` | Export spans; attach eval scores (`spans.update_evaluations`) |
| `arize-phoenix-evals` | LLM-as-judge evaluators |
| `litellm` | Judge can reuse Gemini key (no separate OpenAI key required) |

Cloud Run image: tracing deps may be added to `deploy/cloud-maa/requirements-cloud.txt` when
bootstrap is stable. **Eval runners stay local/CI** — not in the production container.

---

## Environment variables

Add to `neuro-san-studio/.env` (never commit):

```bash
# Arize AX — tracing (no-op if unset)
ARIZE_SPACE_ID=<your-space-id>
ARIZE_API_KEY=<your-api-key>

# Optional service identity for OTEL
OTEL_SERVICE_NAME=neuro-san-maa
OTEL_SERVICE_VERSION=local

# Eval judge — reuse existing Gemini / Vertex auth where possible
# GOOGLE_API_KEY or Vertex ADC (see run-local-maa.sh)
```

Tracing is a **no-op** until both `ARIZE_SPACE_ID` and `ARIZE_API_KEY` are set.

---

## Intended bootstrap flow

```text
server start
  → deploy/otel_bootstrap.py (when present)
      → arize.otel.register(space_id, api_key)
      → LangChainInstrumentor().instrument()
  → neuro-san main loop serves requests
  → spans appear in Arize AX UI

offline eval (CI or pre-promote)
  → run golden set against target registry
  → Phoenix evaluators score faithfulness / relevance / etc.
  → scores attached to exported spans OR gate script exits non-zero
```

`deploy/otel_bootstrap.py` is referenced from `requirements-observability.txt` and will be
imported early in the server entry path (local MAA + optional cloud). Until merged, install
deps and set env vars — instrumentation will not activate.

---

## Golden set layout (planned)

```text
evals/
  smoke/           # ~30 cases — CI on every PR touching registries/prompts
    manifest.json
    cases/*.yaml
  benchmark/       # N>=300 — pre-promote to Cloud Run / model upgrade
    manifest.json
    cases/*.yaml
  adversarial/     # separate pass — injection / jailbreak patterns
```

Each case should specify: `network`, `input`, `expected_routes` (optional), `rubric_ref`,
and `metadata.tags` for stratification (route, complexity, domain).

---

## Gates (align with checklist)

| Event | Minimum eval |
|-------|----------------|
| PR touching `registries/` or coded tools | Smoke — block on regression |
| `GEMINI_MODEL` or `llm_info_extra.hocon` change | Smoke + Benchmark sample |
| Cloud Run promote | Benchmark full run; document rollback SHA |
| Weekly ops | Drift check on Benchmark sample in AX |

Thresholds are programme-specific. Starting defaults from lessons work:

- Smoke: block merge on any Critical case failure
- Benchmark: block promote on >2pp drop on headline faithfulness metric
- Adversarial: no open Critical findings

---

## Vault-aware tracing (required for regulated data)

Lesson from production: **spans must not carry pre-sanitisation payload**.

Before export:

1. Run span attributes and message bodies through the same redaction rules as intake sanitisation.
2. Emit token placeholders (`<VLT-NN>`) or hashed fields only.
3. Drop raw PII at the exporter boundary — retrofitting after go-live is expensive.

Implement as a thin wrapper around the OTEL processor, not as post-hoc AX UI scrubbing.

---

## Local MAA quick start (when bootstrap lands)

```bash
# Terminal 1 — backend with tracing
cd neuro-san-studio
pip install -r requirements-observability.txt
source .env   # ARIZE_* + existing MAA vars
bash ../scripts/run-local-maa.sh   # or start server with OTEL bootstrap

# Terminal 2 — run smoke eval (planned script)
# python -m evals.run --suite smoke --network agentic_evidence_exchange
```

Inspect traces in [Arize AX](https://app.arize.com/).

---

## Related

- [Architecture lessons — evaluation](ARCHITECTURE_LESSONS.md#lesson-7-evaluation-is-not-optional)
- [Production checklist — sheet 05 eval rows](PRODUCTION_CHECKLIST.md)
- [Cloud deploy discipline](../../deploy/cloud-maa/README.md#production-deploy-discipline)
- Cruse Phoenix plugin (alternate local UI path): `cruse-agentic-ui/plugins/phoenix/` in workspace
