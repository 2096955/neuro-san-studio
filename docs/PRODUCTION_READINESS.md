# Production readiness

Quick index for hardening the MAA demo toward auditable production. **Sanitized source material** (lessons from past deployments + checklist + Arize eval path) lives in
**[`docs/lessons/`](lessons/README.md)**.

## Start here

| Doc | What it is |
|-----|------------|
| [**Lessons index**](lessons/README.md) | How Neuro SAN maps to production patterns |
| [**Architecture lessons**](lessons/ARCHITECTURE_LESSONS.md) | O/S/V topology, seven contracts, phased delivery |
| [**Production checklist**](lessons/PRODUCTION_CHECKLIST.md) | ~400 sanitized controls across 15 domains |
| [**Arize evals**](lessons/ARIZE_EVALS.md) | Tracing + Smoke/Benchmark gates — **in progress** |

The main README [**Building for production**](../README.md#building-for-production) section is the
short summary; these docs are the expandable reference.

## When to use which checklist domain

| Domain | Use for this fork |
|--------|-------------------|
| Architecture & agent design | **Always** — registries, CodedTools |
| Context engineering & memory | RAG / retrieval-heavy networks (AEEN, agentic_rag) |
| Evaluation & testing | **Before model upgrades** — pairs with [Arize evals](lessons/ARIZE_EVALS.md) |
| Deployment & operations | **Cloud Run** — [deploy/cloud-maa](../deploy/cloud-maa/README.md) |
| Security (MCP / RAG) | When exposing MCP or vector stores |
| Strategy / compliance | Enterprise programmes only — skip for pure demos |

## Evaluation discipline

| Set | Size | Gate |
|-----|------|------|
| **Smoke** | ~30 | CI merge |
| **Benchmark** | N≥300 | Pre-promote |

Neuro SAN **Assessor** (upstream) + **Arize Phoenix evals** (this fork) + optional **AX traces**.
See [ARIZE_EVALS.md](lessons/ARIZE_EVALS.md).

## This fork's phase

**Phase 0–1 today:** categorized MAA sidebar, local Ollama, Cloud Run Gemini, AEEN PoC direction.
**Phase 3 in flight:** Arize eval integration for promote gates.

Async pipelines, formal vault/DLQ topology, and programme sign-off gates are Phase 2+ — see
[architecture lessons — phased delivery](lessons/ARCHITECTURE_LESSONS.md#lesson-6-phased-delivery).
