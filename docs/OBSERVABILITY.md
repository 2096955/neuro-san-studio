# Observability (Arize, Phoenix, Langfuse)

This fork supports three LangChain tracing backends plus structured subprocess logging.
They share the upstream **plugin** architecture from `neuro_san_studio` (Phase 2) and the
fork's **Arize AX** production path (Phase 3).

## Quick reference

| Path | Entry | Tracing |
|------|-------|---------|
| Local MAA (`run-local-maa.sh`) | `run.py` → `otel_bootstrap.py` | Arize when `ARIZE_*` set |
| `ns run` | `neuro_san_server_wrapper` + `config/plugins.hocon` | Plugin-selected |
| Cloud Run | `deploy/entrypoint.sh` → `otel_bootstrap.py` | Arize when `ARIZE_*` set |
| Offline evals | `evals/run_evals.py` | Reads spans from AX (no server plugin) |

**Rule:** enable **one** primary LangChain instrumentor (Arize *or* Phoenix *or* Langfuse).

## Arize AX (production default)

```bash
pip install -r requirements-observability.txt   # or plugins/arize/requirements.txt

export ARIZE_SPACE_ID=...
export ARIZE_API_KEY=...
export ARIZE_PROJECT_NAME=neuro-san-maa   # optional
```

Tracing is a no-op until both `ARIZE_SPACE_ID` and `ARIZE_API_KEY` are present.

Implementation: `neuro_san_studio/plugins/arize/tracing.py` (`init_arize_tracing`), used by:

- `deploy/otel_bootstrap.py` — must run **before** neuro-san imports LangChain (Cloud Run + `run.py`)
- `ArizePlugin` — same function, for `ns run` when `ARIZE_ENABLED=true`

## Phoenix (upstream local UI)

```bash
pip install -r neuro_san_studio/plugins/phoenix/requirements.txt
export PHOENIX_ENABLED=true
# optional: PHOENIX_AUTOSTART=true
ns run
```

See [neuro_san_studio/plugins/phoenix/README.md](../neuro_san_studio/plugins/phoenix/README.md).

## Langfuse (upstream SaaS / self-hosted)

```bash
pip install -r neuro_san_studio/plugins/langfuse/requirements.txt
export LANGFUSE_ENABLED=true
export LANGFUSE_SECRET_KEY=...
export LANGFUSE_PUBLIC_KEY=...
ns run
```

See [neuro_san_studio/plugins/langfuse/README.md](../neuro_san_studio/plugins/langfuse/README.md).

## Plugin configuration

Editable copy: [`config/plugins.hocon`](../config/plugins.hocon) (takes precedence over the bundled template).

Environment toggles:

| Variable | Plugin |
|----------|--------|
| `ARIZE_ENABLED` | Arize AX |
| `PHOENIX_ENABLED` | Phoenix |
| `LANGFUSE_ENABLED` | Langfuse |
| `LOGBRIDGE_ENABLED` | Process log bridge (default on) |

## Evals (offline)

LLM-as-judge and span export are **not** server plugins. See [docs/lessons/ARIZE_EVALS.md](lessons/ARIZE_EVALS.md).

```bash
pip install -r requirements-observability.txt
python evals/run_evals.py --help
```

Eval packages are intentionally **excluded** from the Cloud Run image; only tracing deps ship in `deploy/cloud-maa/requirements-cloud.txt`.
