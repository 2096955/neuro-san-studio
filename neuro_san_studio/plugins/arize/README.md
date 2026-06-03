# Arize AX observability plugin

Production tracing for this fork. Sends OpenInference LangChain spans to **Arize AX**
when `ARIZE_SPACE_ID` and `ARIZE_API_KEY` are set.

## Install

```bash
pip install -r neuro_san_studio/plugins/arize/requirements.txt
# or
pip install -r requirements-observability.txt
```

## Enable

**Via `ns run` / plugin config** (see `config/plugins.hocon`):

```bash
export ARIZE_ENABLED=true
export ARIZE_SPACE_ID=...
export ARIZE_API_KEY=...
export ARIZE_PROJECT_NAME=neuro-san-maa   # optional
ns run
```

**Via Cloud Run / Docker entrypoint** — unchanged: `deploy/entrypoint.sh` launches
`deploy/otel_bootstrap.py`, which calls the same shared `init_arize_tracing()` before
the neuro-san server imports LangChain.

**Via legacy `run.py`** — still uses `otel_bootstrap.py` for the server subprocess
(grpc/Replit path). Same shared tracing module.

## Pick one primary tracer

| Backend | Enable | Best for |
|---------|--------|----------|
| **Arize AX** | `ARIZE_*` (+ `ARIZE_ENABLED` for plugins) | Production MAA / cloud-maa |
| **Phoenix** | `PHOENIX_ENABLED=true` | Local UI + OTLP collector |
| **Langfuse** | `LANGFUSE_ENABLED=true` | Langfuse Cloud / self-hosted |

Do **not** enable more than one LangChain instrumentor at a time — spans will duplicate
or conflict. This fork defaults to **Arize off** in the bundled template and **Phoenix/Langfuse off**;
`config/plugins.hocon` enables Arize for local `ns run` when you opt in.

Evals (`evals/run_evals.py`, `arize-phoenix-evals`) are separate from live tracing and
run offline against exported AX spans.

See also: [docs/OBSERVABILITY.md](../../docs/OBSERVABILITY.md), [docs/lessons/ARIZE_EVALS.md](../../docs/lessons/ARIZE_EVALS.md).
