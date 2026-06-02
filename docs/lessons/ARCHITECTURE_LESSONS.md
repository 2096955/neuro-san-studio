# Architecture lessons from production

Sanitized patterns from enterprise agent deployments — reframed as **lessons from the past** and
mapped to **how Neuro SAN helps you get there**.

Original source material covered regulated classification-with-retrieval systems (compliance,
clinical, financial). The principles generalize to any Neuro SAN network that must be **correct,
not merely plausible**, under review.

---

## Lesson 1: The agent isn't the agent

The demo works. The first end-to-end run looks correct. Then a reviewer asks:

> How did the system reach this conclusion, what did it look at, was it entitled to see it, and
> how do you know the answer is correct?

Chain-of-thought is not an answer. **Architecture is** — contracts, sanitisation, provenance,
context budgets, verifiers, and golden sets that make output defensible *before* it ships.

**Neuro SAN helps:** HOCON-declared topology lets SMEs review the graph; `CodedTool` and
`sly_data` give you deterministic boundaries the LLM never owns; MCP and OpenFGA cover
composition and entitlements when you wire them.

---

## Lesson 2: Split reasoning from retrieval from verification

The shape that survived audit has **three LLM roles** plus deterministic components:

```
Caller → Intake → [Guardrails + Sanitiser] → Orchestrator
         → Context Assembler (deterministic) → Specialist → Verifier → Publish
```

| Role | Job | Neuro SAN mapping |
|------|-----|-------------------|
| **Orchestrator** | Route, bundle validation, sole retrieval choke point, provenance stamping | Coordinator agent in HOCON; mediates all tool calls |
| **Specialist** | Structured output against a fixed schema | Downstream agent(s); one role per specialist |
| **Verifier** | Fixed rubric score; returns defects to orchestrator | Separate agent with its own prompt + LLM spec |
| **Context Assembler** | Bounded, bi-temporal retrieval — **not an LLM** | `CodedTool` with `async_invoke(args, sly_data)` |
| **Sanitiser / Re-identifier** | Tokenise PII; vault-gated restore on egress | `sly_data` transport + CodedTools |

**Do not** let one agent do routing, open-ended retrieval, reasoning, and self-verification.
That produces rediscovery loops, schema drift, and unauditable rationale.

The current **MAA demo** uses AAOSA claim-and-consolidate inside each network (sync HTTP). Full
async event-bus pipelines with DLQs are Phase 2+ — see phased delivery below.

---

## Lesson 3: Seven contracts that compose

Drop any one and the others lose teeth. Neuro SAN covers the **transport**; you author the **policy**.

### 1. Sanitisation contract
- Adversarial-input guardrail **before** PII redaction (different engines, both required).
- Stable opaque tokens (e.g. `<VLT-01>`) in LLM context; vault outside the bundle.
- Egress DLP after verification — hallucinated identifiers bypass token swap.
- **Neuro SAN:** `sly_data` keeps vault pointers off the chat stream; guardrails are CodedTools or upstream services.

### 2. Retrieval contract
- Context Assembler is deterministic Python with route-shaped bounds `R_max`, `D_max`, `B_max`.
- Bi-temporal queries at `effective_timestamp` where stores support it.
- No vector chunks over structured documents; no raw matrices into LLMs.
- Retrieval guardrail on returned content (indirect prompt injection).
- **Neuro SAN:** implement as `CodedTool`; registry agents never query stores directly.

### 3. Bundle contract
- Typed brief with `AccessPolicy` and per-field token budgets.
- Deterministic degradation before hard fail on overrun.
- `ToolCallIntent` mediation — specialist never calls the assembler directly.
- **Neuro SAN:** validate entitlements before invoke; use OpenFGA when multi-tenant.

### 4. Quality contract
- Verifier on every output; fixed rubric (not free-form critique).
- Smoke set (~30) for CI; Benchmark set (N≥300) for calibration and deploy gates.
- Cost-per-correct as a first-class metric.
- **Neuro SAN:** Assessor for failure-mode classification; **Arize evals** for online/offline judges — [ARIZE_EVALS.md](ARIZE_EVALS.md).

### 5. Feedback contract
- Verified outputs → quarantine → promotion (never auto-write to canonical precedent store).
- Weekly feedback loop; drift signals in observability.
- **Neuro SAN:** precedent store is application-layer; quarantine logic is yours.

### 6. Runtime contract
- Async by default for production (`202` + correlation ID); terminal status contract for callers.
- Claim-check pattern: state in Fast-State Store, envelopes on the bus.
- DLQ at every hop; provider circuit breaker separate from application DLQ.
- **Neuro SAN:** sync demo today; durable workflow (Step Functions / Temporal) is infra choice.

### 7. Multi-pipeline contract (when crossing trust boundaries)
- Sovereignty over data; scoped credentials per channel; audit metadata on the wire.
- **Neuro SAN:** MCP server per network; AAOSA inside, MCP between networks.

---

## Lesson 4: What Neuro SAN gives vs what you build

| Framework gives | You still build |
|-----------------|-----------------|
| HOCON agent topology | O/S/V role design; one specialist per business role |
| `sly_data` | Sanitisation policy, hot/cold vault, egress DLP |
| `CodedTool` | Context assembler, validators, retrieval bounds |
| Per-agent LLM + fallbacks | Verifier rubric; config snapshots for replay |
| MCP-by-default | Cross-deployment auth and TTL discipline |
| OpenFGA | Bundle-level `AccessPolicy` enforcement |
| Assessor + OTEL hooks | Golden sets, Smoke/Benchmark gates, vault-aware export |
| AAOSA coordination | Orchestrator choke-point discipline in registry design |

**Read it this way:** Neuro SAN is the substrate; these lessons are the application-layer
architecture you build on top. Choose the framework whose primitives match your contracts — for
supervised O/S/V pipelines with strict boundaries, the mapping is direct.

---

## Lesson 5: Operating principles (non-negotiables)

Condensed from production post-mortems. Full checklist rows in [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md).

1. Define contracts before storage; version every shared schema (`schema_version` on in-flight state).
2. Async + terminal status for production callers (not the sync MAA demo path).
3. Guard adversarial input and sanitise PII — two gates, in order.
4. Pass typed bundles, not the whole knowledge graph; enforce token budgets per field.
5. Entitlement check at bundle boundary before the specialist runs.
6. Bounded tool surfaces — no raw query passthrough.
7. One specialist per role.
8. Verifier on every output; orchestrator owns the defect-append cycle.
9. Provenance on every retrieved fact; system-derived URIs, never LLM-generated.
10. Trajectory observability from day one — **vault-aware** exporters (Arize / OTEL).
11. Golden sets split: Smoke for CI, Benchmark for promote gates.
12. Single retrieval choke point — initial and mid-flight tool calls.
13. Bi-temporal retrieval where audit replay matters.
14. Precedent quarantine — no autonomous poisoning of canonical context.
15. State on the side, envelopes on the bus (claim-check at scale).
16. Route-shaped retrieval bounds, not static global limits.
17. DLQ at every async boundary.
18. Optimistic concurrency on shared bundle state.
19. Idempotency at intake with payload-hash verification.
20. Provider circuit breaker with failover before DLQ saturation.
21. Configuration snapshots travel with every request (prompt/rubric/model hashes).
22. Explicit TTL on fast-state objects.
23. Tenant isolation at every boundary (`tenant_id` from day zero).
24. Per-request and per-principal cost caps at intake.
25. Intake backpressure (`503` + `Retry-After`) under saturation.

---

## Lesson 6: Phased delivery

Don't skip Phase 0 contracts to ship a demo-by-Friday system that fails its first audit.

| Phase | Focus | This fork today |
|-------|-------|-----------------|
| **0 — Contracts** | Schemas, access policy, eval harness, observability plan | Partial — HOCON + CodedTools + checklist docs |
| **1 — Single route** | One network end-to-end with O/S/V + deterministic boundaries | **MAA demo** — local Ollama + Cloud Run Gemini |
| **2 — Priority set** | More sources; quarantined feedback loop | AEEN PoC direction |
| **3 — Benchmark** | Full benchmark set; replay drill; cost-per-correct | **Arize evals integration in progress** |
| **4 — Scale-out** | Cross-pipeline MCP, advanced routing | Future |

Each phase ends when its acceptance threshold is met — not when the calendar says so.

---

## Lesson 7: Evaluation is not optional

A model upgrade without a Benchmark re-run is an unverified change.

| Set | Size | Gate |
|-----|------|------|
| Smoke | ~30 | Block PR merge on regression |
| Benchmark | N≥300 | Block production promote |
| Adversarial | curated | No open Critical before go-live |

**Neuro SAN helps:** Assessor classifies failure modes on data-driven test cases.
**This fork adds:** Arize AX traces for trajectory debugging + Phoenix evaluators for LLM-as-judge
metrics — see [ARIZE_EVALS.md](ARIZE_EVALS.md).

---

## Related docs

- [Lessons index](README.md)
- [Production checklist](PRODUCTION_CHECKLIST.md)
- [Arize evals setup](ARIZE_EVALS.md)
- [Production readiness summary](../PRODUCTION_READINESS.md)
