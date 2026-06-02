# Lessons from production — how Neuro SAN gets you there

These docs capture **sanitized lessons** from past regulated and enterprise agent deployments.
They are reframed for this fork: what broke in production, what patterns survived audit, and
**which parts Neuro SAN already ships** versus what you still build in application code.

They are **not** a programme SOW, client deliverable, or copy-paste architecture mandate. Use them
when moving from the MAA demo (Phase 0–1) toward auditable production.

## What's in this folder

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE_LESSONS.md](ARCHITECTURE_LESSONS.md) | Patterns that survived audit — O/S/V topology, seven contracts, substrate mapping |
| [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) | Sanitized 15-domain control catalogue (~400 rows) for self-assessment |
| [ARIZE_EVALS.md](ARIZE_EVALS.md) | Tracing + eval path (Arize AX / Phoenix evals) — **integration in progress** on this fork |

Quick entry points elsewhere in the repo:

- MAA demo setup — [README § This fork](../../README.md)
- Cloud Run gotchas — [deploy/cloud-maa/README.md](../../deploy/cloud-maa/README.md)
- Summary index — [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md)

## The core lesson

Demos fail audits for the same reason: someone asks *how the agent reached a conclusion, what it
looked at, whether it was entitled to see it, and how you know the answer is correct*. The
answer is not a chain-of-thought transcript — it is **architecture**: contracts, deterministic
boundaries, provenance, context budgets, and evaluation harnesses.

Neuro SAN is the **substrate** that makes those contracts cheaper to express. It does not remove
the need to design them.

## Neuro SAN primitives ↔ production patterns

| Production need | Neuro SAN primitive | Still your work |
|-----------------|-------------------|-----------------|
| Private data off the LLM stream | `sly_data` | Sanitisation rules, vault lifecycle |
| Deterministic retrieval / validation | `CodedTool` | Context assembler logic, bounds per route |
| Declarative agent topology | HOCON registries | O/S/V role assignment |
| Cross-network composition | MCP-by-default | Auth, TTLs, trust boundaries |
| Entitlements | OpenFGA integration | Per-field access policy |
| Failure-mode testing | Assessor (upstream) | Golden sets, rubrics, gates |
| Trajectory observability | OTEL hooks | **Arize AX** — see [ARIZE_EVALS.md](ARIZE_EVALS.md) |

## Evaluation stack (current direction)

This fork is integrating **Arize AX tracing** plus **Phoenix-style LLM-as-judge evals** for the
Smoke / Benchmark split described in the checklist:

- **Smoke (~30 cases)** — CI merge gate on every registry or prompt change
- **Benchmark (N≥300)** — pre-promote gate before Cloud Run or model upgrades

Dependencies live in [`requirements-observability.txt`](../../requirements-observability.txt).
Tracing is optional and no-ops without `ARIZE_SPACE_ID` + `ARIZE_API_KEY`.

## How to use the checklist

1. Pick domains relevant to your scope (see [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md)).
2. Walk [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) — Critical rows first.
3. For each row, ask: *does Neuro SAN cover this, or is it application-layer?*
4. Wire eval gates before the next model or prompt promote.

Skip strategy/compliance domains for pure local demos unless your programme requires formal sign-off.
