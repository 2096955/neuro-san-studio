# Production checklist

Sanitized control catalogue distilled from production delivery work. Use it as a
self-assessment rubric when hardening a Neuro SAN deployment — not every row applies
to a demo or PoC.

**How Neuro SAN helps:** many architecture rows map directly to framework primitives
(`CodedTool`, `sly_data`, HOCON topology, MCP, OpenFGA, Assessor). Rows marked
**application-layer** need custom code or infrastructure on top of the framework.

See [Architecture lessons](ARCHITECTURE_LESSONS.md) for the underlying patterns and
[Arize evals setup](ARIZE_EVALS.md) for the evaluation path this fork is integrating.

## 01 — Strategy & Use Case Definition

_Strategy and governance domain — skip for pure local demos unless a programme requires formal sign-off._

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| STR-001 | Use Case Definition | Define the business problem in one paragraph | Critical | Discovery |
| STR-002 | Use Case Definition | Name the business owner and their decision authority | Critical | Discovery |
| STR-003 | Use Case Definition | Document current-state assessment (People, Process, Technology) | High | Discovery |
| STR-004 | Prioritisation | Score use case against 3-factor framework (Business Value 40% / Technical Feasibility 30% / Implementation Readiness 30%) | High | Discovery |
| STR-005 | Prioritisation | Apply Buy vs Build decision matrix (OTS → Advanced OTS → Composite → Build) | High | Discovery |
| STR-006 | Success Criteria | Define numerical Go/No-Go gates at Exploration and Production milestones | Critical | Discovery |
| STR-007 | Success Criteria | Define what 'success looks like' in plain language for end users | High | Discovery |
| STR-008 | Stakeholders | Build a RACI for the project lifecycle | High | Discovery |
| STR-009 | Stakeholders | Confirm SME availability for evaluation labelling (hours/week) | Critical | Discovery |
| STR-010 | Business Case | Quantify expected ROI at 3/6/12 months | High | Discovery |
| STR-011 | Risk | Conduct AI-specific risk assessment | Critical | Discovery |
| STR-012 | Regulatory | Map all applicable regulations (GDPR, sector-specific, AI Act, gov't AI guidance) | Critical | Discovery |
| STR-013 | North Star | Articulate 12 GenAI guiding principles aligned to organisation values | Medium | Discovery |
| STR-014 | Roadmap | Sequence MVP → pilot → scale with clear exit criteria per phase | High | Discovery |
| STR-015 | Change Management | Adoption plan: champion network, training, support | Medium | Pilot |

<details><summary>Implementation guidance (expand)</summary>

**STR-001 — Define the business problem in one paragraph**
- *Why:* Ambiguous problem statements produce evaluation criteria you cannot agree on later.
- *How:* Single owner writes the problem statement. State the user, the pain, the current baseline (manual effort, error rate, cycle time), and what 'better' means in a number.

**STR-002 — Name the business owner and their decision authority**
- *Why:* Without an accountable executive the project will stall at the first cross-team friction.
- *How:* Single named individual (not a committee), their email, their level. Confirm in writing they accept ownership of go/no-go.

**STR-003 — Document current-state assessment (People, Process, Technology)**
- *Why:* You cannot measure improvement against a baseline you never captured.
- *How:* 3-dimensional gap analysis. People: roles, skills, headcount. Process: current workflow, hand-offs, decision points. Technology: existing systems, data sources, integration points.

**STR-004 — Score use case against 3-factor framework (Business Value 40% / Technical Feasibility 30% / Implementation Readiness 30%)**
- *Why:* Prevents stakeholders pushing favourite ideas with weak ROI.
- *How:* Each factor scored 0–10 across sub-criteria; weighted total. Reject anything below an agreed cut-off (recommended 6.0).

**STR-005 — Apply Buy vs Build decision matrix (OTS → Advanced OTS → Composite → Build)**
- *Why:* Default-to-build is the most expensive failure mode.
- *How:* Document the off-the-shelf options considered for each capability, why they were ruled out, and what we are uniquely able to build that they cannot.

**STR-006 — Define numerical Go/No-Go gates at Exploration and Production milestones**
- *Why:* Without quantitative gates, projects get promoted on optimism, not evidence.
- *How:* Per-gate metrics with thresholds, e.g. Exploration: faithfulness >= 0.85 on golden set; Production: ECE <= 0.10, p95 latency <= 4s, cost per task <= £0.X.

**STR-007 — Define what 'success looks like' in plain language for end users**
- *Why:* Technical metrics don't tell adoption story; user-facing definitions do.
- *How:* One paragraph per user persona: 'After this is live, when I do X, I expect Y, within Z time, with this level of trust.'

**STR-008 — Build a RACI for the project lifecycle**
- *Why:* Diffuse responsibility produces 'I thought you owned that' failure modes during incidents.
- *How:* RACI across Strategy, Product, GenAI Architecture, Security, Data, FinOps, Change Management, Legal, Risk.

**STR-009 — Confirm SME availability for evaluation labelling (hours/week)**
- *Why:* Golden sets cannot be built without SME time; this is the most-missed dependency.
- *How:* Named SMEs with weekly commitment for the duration of build and first 90 days of operation. Recorded in the project plan with their manager's sign-off.

**STR-010 — Quantify expected ROI at 3/6/12 months**
- *Why:* Without staged ROI checkpoints, projects survive on promise rather than evidence.
- *How:* Cost savings, productivity, error reduction, revenue uplift. Per-period targets. Owner: FinOps Lead + Business Owner co-sign.

**STR-011 — Conduct AI-specific risk assessment**
- *Why:* Generic project risk frameworks miss model-specific risks (hallucination, bias, drift, prompt injection).
- *How:* Risk register with AI-specific categories. Severity × likelihood × mitigation. Review monthly.

**STR-012 — Map all applicable regulations (GDPR, sector-specific, AI Act, gov't AI guidance)**
- *Why:* Late-discovered regulation triggers rework and costly delay.
- *How:* Legal sign-off on the applicable framework before architecture is finalised. public-sector guidance 'AI Playbook' and EU AI Act risk classification both documented.

**STR-013 — Articulate 12 GenAI guiding principles aligned to organisation values**
- *Why:* Principles are the appeal layer when low-level decisions get contentious.
- *How:* 12 principles signed off by leadership; embedded in all design reviews. e.g. 'human in the loop for irreversible actions', 'no surprise data exposure', 'governance by default, not by exception'.

**STR-014 — Sequence MVP → pilot → scale with clear exit criteria per phase**
- *Why:* Premature scaling burns budget; over-cautious MVPs lose momentum.
- *How:* 3-phase roadmap with population scope (e.g. MVP: 1 team / 50 users, Pilot: 1 dept / 500 users, Scale: org-wide).

**STR-015 — Adoption plan: champion network, training, support**
- *Why:* Brilliant tools die from no adoption.
- *How:* Named champions per business unit, training schedule, support channel, communications cadence, feedback loop.

</details>

## 02 — Architecture & Agent Design

Orchestrator / Specialist / Verifier triad, MCP design, async discipline, reusability.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| ARCH-001 | Topology | Adopt Orchestrator / Specialist / Verifier triad as the default agent topology | Critical | Design |
| ARCH-002 | Topology | One Specialist per role — do not merge similar-looking specialists | High | Design |
| ARCH-003 | Topology | Verifier on every Specialist output | Critical | Design |
| ARCH-004 | Async Discipline | Make the pipeline asynchronous end-to-end | Critical | Design |
| ARCH-005 | Async Discipline | Claim-check pattern — payloads in Fast-State Store, envelopes on the bus | Critical | Design |
| ARCH-006 | Async Discipline | Idempotency at intake — payload-hash + idempotency-key check | High | Design |
| ARCH-007 | Async Discipline | DLQs behind every async hop with deterministic consumers | High | Design |
| ARCH-008 | Tool Surface | Bound the Specialist's tool surface with hard depth, breadth and cardinality limits | Critical | Design |
| ARCH-009 | Tool Surface | Specialist never calls Context Assembler directly — all retrieval through Orchestrator | Critical | Design |
| ARCH-010 | Tool Surface | Rediscovery circuit breaker (default limit: 6 tool calls without structured output candidate) | Critical | Design |
| ARCH-011 | Tool Surface | Distinguish semantic rediscovery from infrastructure contention with separate counters | High | Design |
| ARCH-012 | MCP Design | Build Data-specific MCP servers, not Use-Case-specific pipelines | High | Design |
| ARCH-013 | MCP Design | Structured error responses from MCP tools — errorCategory, isRetryable, partial results | High | Design |
| ARCH-014 | MCP Design | Local error recovery in subagents; escalate only what can't be resolved locally | High | Design |
| ARCH-015 | Stateless Agents | Stateless agent design — all state externalised | Critical | Design |
| ARCH-016 | Reusability | Skill + Hook architecture — Skills are domain logic, Hooks are lifecycle controls | High | Design |
| ARCH-017 | Reusability | Skills must be hot-swappable at runtime based on user role / route | High | Design |
| ARCH-018 | Reusability | Pattern Library in graph DB — validator, extractor, synthesiser, investigator, reporter, anomaly_detector | High | Design |
| ARCH-019 | Human in the Loop | Explicit human approval workflow for elevated-impact actions | Critical | Design |
| ARCH-020 | Orchestration | Use durable workflow engine for top-level orchestration (Step Functions / Temporal / equivalent) | High | Build |
| ARCH-021 | Versioning | Version everything — prompts, schemas, rubrics, tool definitions, retrieval bounds | Critical | Build |
| ARCH-022 | Versioning | Configuration snapshots have audit-RTO of 72h and same compliance profile as cold vault | High | Build |
| ARCH-023 | Versioning | Model upgrade requires golden-set benchmark re-run | Critical | Ops |
| ARCH-024 | Multi-Agent | Inter-pipeline contracts when crossing trust boundaries | High | Design |
| ARCH-025 | Multi-Agent | Coverage annotations in synthesis output — which findings are well-supported vs gap | High | Design |

<details><summary>Implementation guidance (expand)</summary>

**ARCH-001 — Adopt Orchestrator / Specialist / Verifier triad as the default agent topology**
- *Why:* A single LLM doing reasoning, retrieval and verification is the most-cited cause of unauditable agentic systems. Separation creates the audit surface.
- *How:* Three distinct LLM invocations with explicit contracts. Orchestrator owns the bundle and the defect-append cycle. Specialist produces structured output. Verifier scores against a fixed rubric and returns to the Orchestrator (not the Specialist).

**ARCH-002 — One Specialist per role — do not merge similar-looking specialists**
- *Why:* Merging mapping, lineage, and rights-reasoning into one specialist produces a prompt nobody can debug.
- *How:* Each business role gets its own Specialist with its own prompt, schema and rubric. Resist the temptation to consolidate.

**ARCH-003 — Verifier on every Specialist output**
- *Why:* Without verification, structural defects, hallucinated citations and rubric-overrides reach downstream.
- *How:* Verifier scores against a fixed rubric, returns to the Orchestrator. Orchestrator decides retry / escalate / promote.

**ARCH-004 — Make the pipeline asynchronous end-to-end**
- *Why:* Synchronous chains of 3 LLM calls + DB traversals + sanitisation will not fit in any HTTP timeout in production. Synchronous failure mode is 'partial commit'.
- *How:* Intake returns 202 + correlation ID. Subsequent steps run on an event bus (SQS / Kafka / EventBridge). Every async hop has a DLQ behind it.

**ARCH-005 — Claim-check pattern — payloads in Fast-State Store, envelopes on the bus**
- *Why:* Passing fully-hydrated bundles over SQS (256KB) / EventBridge (256KB) / Kafka (1MB) causes broker-side OOM on real bundle sizes.
- *How:* Stateful objects (bundle, sanitised payload, tool results, defect history) live in Redis / DynamoDB / S3. Bus carries {request_id, correlation_id, state_pointer, status} only.

**ARCH-006 — Idempotency at intake — payload-hash + idempotency-key check**
- *Why:* Retries from clients otherwise create duplicate work and double-spends downstream.
- *How:* IntakeRequest.idempotency_key and payload_hash (SHA-256). Reject mismatched re-submissions.

**ARCH-007 — DLQs behind every async hop with deterministic consumers**
- *Why:* Silent message loss is the worst failure mode in a regulated pipeline.
- *How:* Each queue has a DLQ. DLQ consumer is deterministic (not an LLM), emits terminal status before paging.

**ARCH-008 — Bound the Specialist's tool surface with hard depth, breadth and cardinality limits**
- *Why:* No raw query passthrough — Specialists with unbounded tools rediscover, loop, and burn budget.
- *How:* Per-route limits R_max(r), D_max(r), B_max(r). Enforced at the boundary by the Context Assembler.

**ARCH-009 — Specialist never calls Context Assembler directly — all retrieval through Orchestrator**
- *Why:* Side-channel retrievals bypass entitlement and budget validators. The door and the side window must be the same door.
- *How:* Specialist emits a ToolCallIntent back to the Orchestrator. Orchestrator validates entitlement, executes, runs result through the same validators, resumes the Specialist.

**ARCH-010 — Rediscovery circuit breaker (default limit: 6 tool calls without structured output candidate)**
- *Why:* Without it, 85% of compute budget can be burned on rediscovery in poorly-bundled systems.
- *How:* Orchestrator tracks tool calls per Specialist invocation. If retrieval calls without an output candidate exceed limit, throw BUNDLE_DEFICIENCY_ERROR — route to bundle-assembly review queue (NOT retry).

**ARCH-011 — Distinguish semantic rediscovery from infrastructure contention with separate counters**
- *Why:* A contention-inducing adversary could otherwise trip the bundle-review breaker. A noisy infra event could falsely fail an OK Specialist.
- *How:* rediscovery_limit (semantic, default 6) vs fss_contention_counter (infra, default 3). Different breakers, different runbooks.

**ARCH-012 — Build Data-specific MCP servers, not Use-Case-specific pipelines**
- *Why:* Building three pipelines for three use cases is the fragmentation tax. Build one Document MCP, one Data MCP, share across cases.
- *How:* Document MCP (SharePoint, Confluence, S3) and Structured-Data MCP (SQL, graph). Each agent asks for 'Context'; the MCP layer handles location.

**ARCH-013 — Structured error responses from MCP tools — errorCategory, isRetryable, partial results**
- *Why:* Generic 'Operation failed' prevents the agent from making appropriate recovery decisions.
- *How:* Return errorCategory ∈ {transient, validation, business, permission}, isRetryable boolean, human-readable description, and partial results where available.

**ARCH-014 — Local error recovery in subagents; escalate only what can't be resolved locally**
- *Why:* Propagating every transient error to the coordinator floods it with non-actionable noise.
- *How:* Transient retries within the subagent; only access failures, permission errors, business errors propagate up. Include 'what was attempted' and partial results.

**ARCH-015 — Stateless agent design — all state externalised**
- *Why:* Stateful agents block horizontal scale and complicate orchestration.
- *How:* Agents read state from Fast-State Store (FSS) at start and write at end. No in-memory state across invocations.

**ARCH-016 — Skill + Hook architecture — Skills are domain logic, Hooks are lifecycle controls**
- *Why:* Reuse across document intelligence use case, compliance use case, and Fraud is impossible without a clean Skill/Hook separation.
- *How:* Skills: document_analysis, rule_evaluation, anomaly_detection, etc. Hooks: pre/post execution (input validation, PII, audit, response filter, confidence score, trace).

**ARCH-017 — Skills must be hot-swappable at runtime based on user role / route**
- *Why:* A 'fraud bot' and 'architect bot' built separately produces silos. A common reasoning engine with role-loaded skills is the path to scale.
- *How:* LangGraph (or equivalent) loads skills at runtime based on principal role. Single brain, swappable toolbelt.

**ARCH-018 — Pattern Library in graph DB — validator, extractor, synthesiser, investigator, reporter, anomaly_detector**
- *Why:* Without a pattern library, every new agent is a snowflake. The Agent Foundry depends on a queryable pattern catalogue.
- *How:* graph database (or equivalent) holding Skill / Orchestration / Hook / Prompt patterns. Foundry queries the library when auto-generating agents.

**ARCH-019 — Explicit human approval workflow for elevated-impact actions**
- *Why:* Irreversible or high-blast-radius actions must not be fully autonomous in a regulated context.
- *How:* Approval gate on a defined list of actions (publish, modify production data, send external comms, raise tickets above £X). Logged with approver identity and timestamp.

**ARCH-020 — Use durable workflow engine for top-level orchestration (Step Functions / Temporal / equivalent)**
- *Why:* In-process orchestration loses state on worker restart; durable engines survive.
- *How:* AWS Step Functions for top-level workflow. Each LLM call, retrieval and verification is a state. Failures resumable.

**ARCH-021 — Version everything — prompts, schemas, rubrics, tool definitions, retrieval bounds**
- *Why:* Without versioning, you cannot reproduce a 6-month-old decision in audit.
- *How:* ConfigurationSnapshot object holds {prompt_hash, schema_hash, rubric_hash, tool_def_hash, route_bounds_hash, model_id}. Saved to content-addressed object store with append-only writes.

**ARCH-022 — Configuration snapshots have audit-RTO of 72h and same compliance profile as cold vault**
- *Why:* Snapshots-captured-and-lost = bi-temporal contract is documentary, not operational.
- *How:* Cross-region replication, audit-RTO 72h, append-only writes, active-snapshot pointer.

**ARCH-023 — Model upgrade requires golden-set benchmark re-run**
- *Why:* A model upgrade without a benchmark re-run is an unverified change.
- *How:* Block deployment if N≥300 evaluation benchmark hasn't been re-run within the last 24h against the candidate model.

**ARCH-024 — Inter-pipeline contracts when crossing trust boundaries**
- *Why:* Multi-agent across trust boundaries (prod ↔ dev, on-prem ↔ cloud) is a different beast from single pipeline.
- *How:* Documented contract per pipeline pair: who initiates, what data crosses, how PII is handled at boundary, retry semantics.

**ARCH-025 — Coverage annotations in synthesis output — which findings are well-supported vs gap**
- *Why:* A confident-sounding synthesis with unflagged gaps is worse than no synthesis.
- *How:* Each synthesis field marked {well-supported, partial, gap, source-unavailable}.

</details>

## 03 — Context Engineering & Memory

The most-missed layer. Bundles, budgets, blackboard, bi-temporal retrieval, four memory layers.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| CTX-001 | Context Budget | Set explicit token budgets per field in the BriefBundle | Critical | Design |
| CTX-002 | Context Budget | Deterministic rule-based degradation pass before hard fail on budget overrun | High | Build |
| CTX-003 | Context Budget | FIFO eviction with token budget for unbounded-growth fields (defect history, scratchpad) | High | Build |
| CTX-004 | Bundle Contract | Typed BriefBundle with AccessPolicy and per-field token budgets | Critical | Design |
| CTX-005 | Bundle Contract | Entitlement validation BEFORE Specialist invocation (no LLM ever sees data the user can't see) | Critical | Build |
| CTX-006 | Retrieval Contract | Single retrieval choke point — all retrieval (initial + mid-flight) through Orchestrator | Critical | Build |
| CTX-007 | Retrieval Contract | Route-shaped retrieval bounds — R_max(r), D_max(r), B_max(r) | High | Build |
| CTX-008 | Retrieval Contract | Bi-temporal retrieval — every retrieval parameterised by effective_timestamp | Critical | Build |
| CTX-009 | Retrieval Contract | Max-date sentinels for active records — never NULL valid_to | High | Build |
| CTX-010 | Retrieval Contract | No vector chunks over structured documents — no raw matrices into LLMs | High | Build |
| CTX-011 | Context Assembler | Context Assembler is deterministic Python, not an LLM | Critical | Build |
| CTX-012 | Memory Layers | Four explicit memory layers with documented boundaries | Critical | Design |
| CTX-013 | Memory Layers | Cross-session contamination prevention — session-bounded memory isolation | Critical | Build |
| CTX-014 | Memory Layers | Scratchpad files for long-running agents to persist key findings across context boundaries | High | Build |
| CTX-015 | Memory Layers | Summarise-then-spawn — summarise prior exploration phase before new subagent | High | Build |
| CTX-016 | Memory Layers | Structured state persistence for crash recovery — manifest pattern | High | Build |
| CTX-017 | Memory Layers | Subagent delegation to isolate verbose tool output from coordinator context | High | Build |
| CTX-018 | Precedent Store | Precedent quarantine — no auto-promotion from feedback log to canonical store | Critical | Build |
| CTX-019 | Precedent Store | valid_from / valid_to stamping on every promoted precedent | High | Build |
| CTX-020 | Precedent Store | Benchmark air-gap — exclude synthetic precedents from evaluation set | High | Build |
| CTX-021 | Token Vault | Session-scoped Token Vault for PII tokenisation — hot vault with short TTL → cold vault with long TTL | Critical | Build |
| CTX-022 | Token Vault | HMAC verification on Re-identifier lookup | Critical | Build |
| CTX-023 | Token Vault | Pre-swap egress DLP scan after token resolution | Critical | Build |
| CTX-024 | Token Vault | Per-subject crypto-shredding key hierarchy for Right-to-be-Forgotten | Critical | Build |
| CTX-025 | Fast-State Store | Optimistic concurrency on every FSS write with re-validate on conflict | High | Build |
| CTX-026 | Provenance | Authority and freshness metadata on every retrieved fact | Critical | Build |
| CTX-027 | Provenance | System-derived provenance URIs (named_graph) via KMS-signed HMAC — never LLM-generated | Critical | Build |
| CTX-028 | ToolCallIntent | Constrained ToolCallIntent — rationale_category enum + rationale_detail bounded restricted-char-class | High | Build |
| CTX-029 | JIT Credentials | Token Vending Machine for per-tool-call credential scoping | Critical | Build |
| CTX-030 | Capability Trigger | Don't instrument trajectory-level eval against a system without trajectories | Medium | Build |
| CTX-031 | Cost Runaway | IntakeRequest.max_estimated_cost_usd + daily principal budget + COST_BUDGET_EXCEEDED state edge | High | Build |
| CTX-032 | Cost Runaway | Saturation backpressure — intake returns 503, doesn't cascade to DLQ | High | Build |
| CTX-033 | Anthropic SDK Memory | Use Anthropic Memory tool / equivalent for explicit long-term agent memory | Medium | Build |
| CTX-034 | Caching | Caching strategy for repeated retrievals and embeddings | High | Build |
| CTX-035 | Context Hygiene | No system metadata in user-visible context — separate control plane and data plane | Critical | Build |

<details><summary>Implementation guidance (expand)</summary>

**CTX-001 — Set explicit token budgets per field in the BriefBundle**
- *Why:* Model accuracy is non-monotonic in context size — adds, plateaus, then degrades. The validator's job is to prevent context rot.
- *How:* Typed BriefBundle with per-field TokenBudget. Validator catches budget overruns. Hard ceiling per route.

**CTX-002 — Deterministic rule-based degradation pass before hard fail on budget overrun**
- *Why:* Fail-closed-on-overrun causes outages on edge-case bundles. Fail-open hides context rot.
- *How:* Ordered degradation: drop low-priority fields, summarise verbose fields, truncate evidence with markers. Hard fail only after degradation pass.

**CTX-003 — FIFO eviction with token budget for unbounded-growth fields (defect history, scratchpad)**
- *Why:* Defect history is the unbounded context-rot vector that smuggles itself in through the validator's back door.
- *How:* ~500 token budget, FIFO eviction at three reports — last three are relevant; older are stale guidance the Specialist already responded to. BundleField validator catches budget overruns.

**CTX-004 — Typed BriefBundle with AccessPolicy and per-field token budgets**
- *Why:* Untyped bundles produce unauditable surprises: a field changed silently because a prompt was edited.
- *How:* Pydantic / equivalent typed model. AccessPolicy validated against invoking principal's entitlements BEFORE Specialist is invoked.

**CTX-005 — Entitlement validation BEFORE Specialist invocation (no LLM ever sees data the user can't see)**
- *Why:* ENTITLEMENT_REFUSED at the Specialist boundary is the audit-grade safety boundary.
- *How:* Orchestrator verifies invoking principal holds entitlements for every field. Fail = ENTITLEMENT_REFUSED, logged. ReBAC engine (Zanzibar / OpenFGA) recommended.

**CTX-006 — Single retrieval choke point — all retrieval (initial + mid-flight) through Orchestrator**
- *Why:* A side-window that skips validators is not a 'optimisation'; it's a hole.
- *How:* Specialist emits ToolCallIntent. Orchestrator validates against same entitlement and budget rules used at initial assembly.

**CTX-007 — Route-shaped retrieval bounds — R_max(r), D_max(r), B_max(r)**
- *Why:* Static bounds either starve workflows that need fan-out or pollute workflows that don't.
- *How:* Bounds vary per route. reconcile_conflict needs wider graph fanout than new_mapping. Declared in Context Assembler config.

**CTX-008 — Bi-temporal retrieval — every retrieval parameterised by effective_timestamp**
- *Why:* Replaying a 2024 case in 2026 must yield the same answer it did in 2024. Without bi-temporal you cannot defend an audit.
- *How:* Graph edges, document versions, ontology nodes, tabular rows returned as-of effective_timestamp. Use named graphs with validity intervals / SCD-2 / point-in-time queryable doc stores.

**CTX-009 — Max-date sentinels for active records — never NULL valid_to**
- *Why:* NULL valid_to breaks bi-temporal joins; a sentinel (9999-12-31) is queryable.
- *How:* All temporal-tracked records have valid_from / valid_to. Active records use a sentinel value, not NULL.

**CTX-010 — No vector chunks over structured documents — no raw matrices into LLMs**
- *Why:* Structured documents have structure that chunking destroys; raw matrices into LLMs are a token-waste and quality regression.
- *How:* Structured documents queried via the hierarchical-tree pattern. Tabular data summarised by TFM (Table-Function-Mapping) before injection.

**CTX-011 — Context Assembler is deterministic Python, not an LLM**
- *Why:* If the agent figures out what to fetch, you are paying the rediscovery tax. The Context Assembler exists precisely so it doesn't have to.
- *How:* Unit-tested. Contract-tested. SLOs in observability. Bounded queries, hierarchical slicing, TFM, vector retrieval restricted to fuzzy-prose stores, top-K with justified K.

**CTX-012 — Four explicit memory layers with documented boundaries**
- *Why:* Conflating session, scratchpad, precedent and shared memory produces leakage and contamination.
- *How:* L1 context window (volatile), L2 session (session store / Redis, scoped by session_id), L3 shared blackboard (S3 / MinIO, scoped by run_id), L4 precedent store (canonical, promoted only).

**CTX-013 — Cross-session contamination prevention — session-bounded memory isolation**
- *Why:* Session A's tokens leaking into Session B is the cross-session injection attack.
- *How:* Thread-scoped boundaries. Memory keys namespaced by session_id with cryptographic separation. HMAC verification on lookup.

**CTX-014 — Scratchpad files for long-running agents to persist key findings across context boundaries**
- *Why:* Context degradation in extended sessions causes models to give inconsistent answers and reference 'typical patterns' rather than specific findings.
- *How:* Each agent writes key findings to a scratchpad file. Subsequent reasoning references the scratchpad. Counteracts context rot in long sessions.

**CTX-015 — Summarise-then-spawn — summarise prior exploration phase before new subagent**
- *Why:* Verbose exploration output crowds the coordinator's context; summarising compresses without losing key state.
- *How:* Coordinator summarises phase output, injects summary into next subagent's initial context. Subagent operates on summary, not full history.

**CTX-016 — Structured state persistence for crash recovery — manifest pattern**
- *Why:* Without manifests, a crash mid-multi-agent-run is unrecoverable.
- *How:* Each agent exports state to a known location. Coordinator loads a manifest on resume. State is structured (not free text).

**CTX-017 — Subagent delegation to isolate verbose tool output from coordinator context**
- *Why:* Putting raw tool output in the coordinator's context pollutes its reasoning surface.
- *How:* Spawn subagent for specific question ('find all test files', 'trace refund flow dependencies'). Subagent does the verbose work; coordinator gets the summary.

**CTX-018 — Precedent quarantine — no auto-promotion from feedback log to canonical store**
- *Why:* A closed loop where verifier-passed outputs become future canonical context is autonomous model collapse.
- *How:* Verifier-passed outputs land in quarantine. Promotion requires deterministic structural check OR human spot-check.

**CTX-019 — valid_from / valid_to stamping on every promoted precedent**
- *Why:* The fastest-mutating memory breaks bi-temporal replay within a fortnight without it.
- *How:* Mandatory valid_from at promotion time. Context Assembler's get_precedent_mapping filters by both bounds.

**CTX-020 — Benchmark air-gap — exclude synthetic precedents from evaluation set**
- *Why:* Synthetic precedents contaminating the benchmark inflates apparent quality.
- *How:* Tag precedent provenance. Benchmark eval excludes synthetic-origin precedents. CI/CD check.

**CTX-021 — Session-scoped Token Vault for PII tokenisation — hot vault with short TTL → cold vault with long TTL**
- *Why:* Cold vault expiring before audit retention window = security mechanism blocks the audit it was meant to support.
- *How:* Hot vault (short syntactic tokens, short TTL). Cold-vault transition under separate Auditor KMS key. Cold vault retention matches audit retention requirement.

**CTX-022 — HMAC verification on Re-identifier lookup**
- *Why:* A hallucinated token from parametric memory must be detected and routed to security anomaly queue.
- *How:* Tokens not present or whose HMACs don't verify → TOKEN_HALLUCINATION_ERROR → security anomaly queue (NOT silent drop).

**CTX-023 — Pre-swap egress DLP scan after token resolution**
- *Why:* LLM may hallucinate a realistic-looking SSN from parametric memory into a free-text field; the token swap can only validate tokens it sees.
- *How:* Run Sanitiser's detection rules in reverse on resolved output. Pattern + NER + domain rules. Hits route to security anomaly queue, not publish.

**CTX-024 — Per-subject crypto-shredding key hierarchy for Right-to-be-Forgotten**
- *Why:* GDPR Article 17 requires erasure; a flat key hierarchy means erasure is impossible without re-keying everything.
- *How:* Per-subject keys. Erasure = destroy subject's key = data is cryptographically inaccessible across vault, cache, and precedent store. Ordered saga.

**CTX-025 — Optimistic concurrency on every FSS write with re-validate on conflict**
- *Why:* Last-write-wins on concurrent ToolCallIntent races silently corrupts the bundle.
- *How:* Version field on FSS objects. Conflict → re-read, re-validate, retry. After fss_contention_counter limit (default 3) → SYSTEM_CONTENTION_ERROR.

**CTX-026 — Authority and freshness metadata on every retrieved fact**
- *Why:* A claim with no source and no date is an unsourced quote in an audit.
- *How:* Every triple in the graph, every node in a document tree, every TFM result carries: source identifier, ingestion timestamp, version, authority classification.

**CTX-027 — System-derived provenance URIs (named_graph) via KMS-signed HMAC — never LLM-generated**
- *Why:* LLM-emitted system identifiers cause format drift, stale identifier reuse, and silently corrupt provenance.
- *How:* Specialist emits bare triples. Orchestrator stamps named_graph deterministically from request_id + effective_timestamp.

**CTX-028 — Constrained ToolCallIntent — rationale_category enum + rationale_detail bounded restricted-char-class**
- *Why:* Unbounded free-text rationale logged but ungated = adversary in Specialist reasoning exfiltrates via mid-flight intent.
- *How:* rationale_category is an enum (e.g. NEEDS_PRECEDENT, NEEDS_RULE_LOOKUP). rationale_detail is length-bounded + character-class restricted. IG2 gates intermediate intents.

**CTX-029 — Token Vending Machine for per-tool-call credential scoping**
- *Why:* A worker process holding the union of every credential = compromised worker = compromised everything.
- *How:* TVM separates principal-attestation authority (Intake signs) from credential-execution authority (TVM verifies + ABAC + issues scoped credential). Worker presents Intake attestation to TVM per call.

**CTX-030 — Don't instrument trajectory-level eval against a system without trajectories**
- *Why:* Empty dashboards waste budget and breed cynicism about evaluation.
- *How:* Activate eval techniques only when capability is introduced. See sheet '05 — Evaluation' for the matrix.

**CTX-031 — IntakeRequest.max_estimated_cost_usd + daily principal budget + COST_BUDGET_EXCEEDED state edge**
- *Why:* Cost runaway is architectural, not 'operational' — pathological retries burn budget; saturation cascades to DLQ instead of 503.
- *How:* Per-request cost ceiling. Per-principal daily budget. Explicit state edge for COST_BUDGET_EXCEEDED. Intake-side 503 shed.

**CTX-032 — Saturation backpressure — intake returns 503, doesn't cascade to DLQ**
- *Why:* Cascading to DLQ on saturation produces a thundering herd at recovery time.
- *How:* Intake measures queue depth + worker availability; sheds with 503 above threshold. Client retries with backoff.

**CTX-033 — Use Anthropic Memory tool / equivalent for explicit long-term agent memory**
- *Why:* Ad-hoc memory in prompts is unauditable and uncached.
- *How:* If using Claude Agent SDK, use the memory tool. Document the schema. Otherwise, custom memory layer with same contract: structured, scoped, retrievable, auditable.

**CTX-034 — Caching strategy for repeated retrievals and embeddings**
- *Why:* Re-embedding the same chunk on every query is a 100x cost regression.
- *How:* Redis / ElastiCache for embeddings (cache key = chunk hash). API Gateway / CloudFront for query responses where deterministic. TTLs aligned with data freshness SLAs.

**CTX-035 — No system metadata in user-visible context — separate control plane and data plane**
- *Why:* Confused-deputy attacks succeed when user input and system instructions are visually indistinguishable to the LLM.
- *How:* Datamarking / delimiters / spotlighting for trusted vs untrusted data boundaries. Structured prompt templates.

</details>

## 04 — Data & Knowledge Foundation

Ingestion, quality, lineage, embedding, retrieval, knowledge graph, PII.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| DAT-001 | Data Inventory | Catalogue all data sources with owner, classification, freshness | Critical | Discovery |
| DAT-002 | Data Quality | Quality gates: completeness, consistency, accuracy, timeliness | Critical | Build |
| DAT-003 | Data Quality | Documented data lineage from source to model output | High | Build |
| DAT-004 | Versioning | Version every training and reference dataset | High | Build |
| DAT-005 | Ingestion | Document MCP and Data MCP servers as the only ingestion paths | High | Build |
| DAT-006 | Document Processing | OCR validation accuracy >= 95% on test set | High | Build |
| DAT-007 | Document Processing | Table extraction accuracy >= 90% measured on representative sample | High | Build |
| DAT-008 | Chunking | Document chunking strategy is documented per content type, not one-size-fits-all | High | Build |
| DAT-009 | Embeddings | Embedding model selection documented with evaluation against use case | High | Build |
| DAT-010 | Embeddings | Embedding refresh cadence matches data freshness SLA | High | Build |
| DAT-011 | Retrieval | Hybrid retrieval (semantic + keyword) with reranking | High | Build |
| DAT-012 | Retrieval Quality | Retrieval quality metrics tracked per query: contextual precision, recall, MRR | High | Build |
| DAT-013 | Knowledge Graph | Triple validation with provenance tracking (W3C PROV) | High | Build |
| DAT-014 | Knowledge Graph | Graph anomaly detection for topology changes | Medium | Ops |
| DAT-015 | Knowledge Graph | Immutable audit logs for graph modifications (append-only) | Critical | Build |
| DAT-016 | PII Detection | Automated PII detection in ALL ingested documents | Critical | Build |
| DAT-017 | PII Detection | Multilingual PII detection where applicable | High | Build |
| DAT-018 | Data Governance | Data sovereignty — confirm processing region matches regulatory requirement | Critical | Design |
| DAT-019 | Retention | Documented retention and deletion policy per data class | High | Build |
| DAT-020 | Right to be Forgotten | DSAR / right-to-be-forgotten workflow tested end-to-end | Critical | Build |
| DAT-021 | Labelled Data | Labelled dataset for evaluation (not training-only) | Critical | Build |
| DAT-022 | Bias Audit | Audit dataset for representativeness across protected characteristics | High | Build |
| DAT-023 | Drift | Data drift monitoring on retrieval corpus | High | Ops |
| DAT-024 | Multi-modal | Multi-modal input handling pipeline (text, image, table, audio) | Medium | Build |
| DAT-025 | Source Verification | Cryptographic signatures on knowledge updates (NIST FIPS 186-4) | Critical | Build |

<details><summary>Implementation guidance (expand)</summary>

**DAT-001 — Catalogue all data sources with owner, classification, freshness**
- *Why:* You cannot govern what you haven't catalogued.
- *How:* Per source: owner, sensitivity classification (public/internal/confidential/restricted), update frequency, access method (MCP / API / file), retention policy.

**DAT-002 — Quality gates: completeness, consistency, accuracy, timeliness**
- *Why:* Garbage-in is the most common cause of agents looking incompetent.
- *How:* Per source: % completeness, format consistency, freshness SLA. Reject anything below threshold from ingestion.

**DAT-003 — Documented data lineage from source to model output**
- *Why:* An audit needs to trace any output back to its source data.
- *How:* Apache Atlas / DataHub / equivalent. Lineage captured at each transformation. Queryable from incident response runbooks.

**DAT-004 — Version every training and reference dataset**
- *Why:* Without versioning you cannot reproduce a 6-month-old evaluation result.
- *How:* LakeFS / DVC / dataset version table. Hash + timestamp + provenance per version.

**DAT-005 — Document MCP and Data MCP servers as the only ingestion paths**
- *Why:* Ad-hoc ingestion scripts proliferate and become unauditable shadow pipelines.
- *How:* All document ingestion through Document MCP (S3/SharePoint/Confluence). All structured data through Data MCP (SQL/graph). Code review enforced.

**DAT-006 — OCR validation accuracy >= 95% on test set**
- *Why:* Bad OCR poisons every downstream step silently.
- *How:* Amazon Textract / Rekognition / equivalent with measured accuracy. Confidence threshold for human review.

**DAT-007 — Table extraction accuracy >= 90% measured on representative sample**
- *Why:* Tables are where the numbers live; broken tables = broken decisions.
- *How:* Textract Tables / Document AI. Compare extracted to ground truth on a labelled sample. Tracked over time.

**DAT-008 — Document chunking strategy is documented per content type, not one-size-fits-all**
- *Why:* Generic chunking destroys table boundaries, mid-paragraph splits ruin retrieval.
- *How:* Per content type (policy doc, technical doc, table-heavy PDF, FAQ, code): chunk size, overlap, boundary rule. Tested for retrieval quality.

**DAT-009 — Embedding model selection documented with evaluation against use case**
- *Why:* Default-to-OpenAI ada-002 (or equivalent) without testing is a quality leak.
- *How:* Compare candidate embedding models on a domain-relevant set. Record dimension, cost, latency, quality. Decision recorded.

**DAT-010 — Embedding refresh cadence matches data freshness SLA**
- *Why:* Stale embeddings against fresh data retrieves the wrong thing.
- *How:* On document update, embedding re-computed. Async pipeline with idempotency. Backfill on schema change.

**DAT-011 — Hybrid retrieval (semantic + keyword) with reranking**
- *Why:* Pure semantic retrieval misses exact-match cases (codes, IDs, acronyms); pure keyword misses paraphrasing.
- *How:* OpenSearch / equivalent with BM25 + k-NN + reranker (Cohere / cross-encoder). Tuned for use case. Contextual Precision >= 0.5.

**DAT-012 — Retrieval quality metrics tracked per query: contextual precision, recall, MRR**
- *Why:* If you don't measure retrieval, you cannot improve it.
- *How:* RAGAS / equivalent. Contextual Precision >= 0.5, Recall >= target, MRR tracked. Per-query results stored.

**DAT-013 — Triple validation with provenance tracking (W3C PROV)**
- *Why:* Untracked triples poison the graph in ways that surface months later.
- *How:* Every triple has source, ingestion timestamp, version, authority. PROV-O compliant. SHACL constraints enforced for RDF.

**DAT-014 — Graph anomaly detection for topology changes**
- *Why:* A malicious / mistaken edge addition can re-route reasoning silently.
- *How:* Pattern-based real-time detection + async ML (Neo4j GDS / equivalent) on topology changes. Alert on anomalies.

**DAT-015 — Immutable audit logs for graph modifications (append-only)**
- *Why:* Mutable graph history = unauditable system.
- *How:* Append-only write log with periodic cryptographic sealing (Certificate Transparency-style). Batch seal hourly/daily.

**DAT-016 — Automated PII detection in ALL ingested documents**
- *Why:* A single PII leak from training data poisons every output downstream.
- *How:* Amazon Comprehend / Microsoft Presidio / equivalent. Detection + tokenisation at ingestion. 0 PII entities in output (measured).

**DAT-017 — Multilingual PII detection where applicable**
- *Why:* English-only PII detectors miss real PII in mixed-language docs.
- *How:* Test detector against representative multilingual sample. Document language coverage. Fall-back rules for unsupported languages.

**DAT-018 — Data sovereignty — confirm processing region matches regulatory requirement**
- *Why:* Inference of UK regulated data outside UK triggers regulator engagement.
- *How:* Document required processing region per data category. Provider region locked. Spot-check via cloud config rules.

**DAT-019 — Documented retention and deletion policy per data class**
- *Why:* Indefinite retention is a regulator's first finding.
- *How:* Per data class: hot retention, cold retention, deletion trigger. Automated enforcement (S3 lifecycle / equivalent).

**DAT-020 — DSAR / right-to-be-forgotten workflow tested end-to-end**
- *Why:* If you can't delete a person's data within 30 days, you're not GDPR-compliant.
- *How:* Documented workflow. Tested against synthetic subjects. DSAR response < 30 days. Crypto-shredding enables this (see CTX-024).

**DAT-021 — Labelled dataset for evaluation (not training-only)**
- *Why:* A model is only as honest as its evaluation set.
- *How:* SME-labelled, representative of production traffic, includes edge cases. Versioned. Air-gapped from training data.

**DAT-022 — Audit dataset for representativeness across protected characteristics**
- *Why:* Biased training/retrieval data produces biased outputs at scale.
- *How:* Demographic / category breakdown of dataset. Identify gaps. Mitigation plan (oversample, synthetic, exclusion).

**DAT-023 — Data drift monitoring on retrieval corpus**
- *Why:* Drift in source data invalidates retrieval quality silently.
- *How:* Per-source change rate, distribution shift in embedding space, new entity emergence. Alert on drift.

**DAT-024 — Multi-modal input handling pipeline (text, image, table, audio)**
- *Why:* If your use case includes mixed media, single-modality pipelines miss content.
- *How:* Per modality: extraction, embedding, retrieval. Documented. Tested end-to-end.

**DAT-025 — Cryptographic signatures on knowledge updates (NIST FIPS 186-4)**
- *Why:* An adversary updating the knowledge base = tool-confusion attack pattern attack succeeds.
- *How:* Digital signatures on writes to authoritative source. Verify on retrieval. Signature key in HSM.

</details>

## 05 — Evaluation & Testing

Golden sets, capability triggers, calibration, drift, safety, cost.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| EVL-001 | Golden Sets | Smoke-Test Golden Set (~30 cases) for CI/CD gating | Critical | Build |
| EVL-002 | Golden Sets | Evaluation Benchmark Set (N >= 300) for ECE, drift, deployment gating | Critical | Build |
| EVL-003 | Golden Sets | Adversarial Golden Set — prompt injection, jailbreak, edge cases | Critical | Build |
| EVL-004 | Golden Sets | Golden sets exclude synthetic / model-generated content (air-gap) | High | Build |
| EVL-005 | Capability Trigger | Activate trajectory eval only when reasoning loops exist (ReAct / plan-then-execute) | Medium | Build |
| EVL-006 | Capability Trigger | Tool-call correctness eval triggers when agent has tool surface beyond bounded retrieval | Medium | Build |
| EVL-007 | Capability Trigger | Routing accuracy + cascade-failure eval when LLM-based supervisor / intent classifier introduced | High | Build |
| EVL-008 | Capability Trigger | Conversational-state eval activates when multi-turn interaction is introduced | Medium | Build |
| EVL-009 | Capability Trigger | Sub-agent interaction trace + message-protocol correctness when inter-agent communication introduced | High | Build |
| EVL-010 | Capability Trigger | Agent-as-a-Judge + retry-effectiveness eval when self-correction loops introduced | High | Build |
| EVL-011 | Quality Metrics | Faithfulness — output grounded in retrieved context (RAGAS) | Critical | Build |
| EVL-012 | Quality Metrics | Answer Relevancy + Contextual Precision + Contextual Recall (RAGAS) | High | Build |
| EVL-013 | Quality Metrics | Composite quality score combining correctness, completeness, helpfulness, coherence | Medium | Build |
| EVL-014 | LLM-as-Judge | LLM-as-judge with structured output and inter-rater reliability vs SMEs | High | Build |
| EVL-015 | LLM-as-Judge | Judge model differs from generation model to reduce shared failure modes | High | Build |
| EVL-016 | Calibration | Expected Calibration Error (ECE) <= 0.10 on confidence scores | High | Ops |
| EVL-017 | Drift | Output drift detection (KL divergence on output distribution week-over-week) | High | Ops |
| EVL-018 | Drift | Retrieval drift detection (top-K change rate) | High | Ops |
| EVL-019 | Latency | p50, p95, p99 latency tracked per route with SLOs | High | Ops |
| EVL-020 | Latency | TTFT (Time to First Token) tracked for streamed responses | Medium | Ops |
| EVL-021 | Throughput | Sustained throughput target validated under load test | High | Build |
| EVL-022 | Cost | Cost per task measured and tracked over time | High | Ops |
| EVL-023 | Safety Eval | Refusal-on-harmful and refusal-on-allowed measured separately | Critical | Build |
| EVL-024 | Bias Eval | Demographic-parity / equalised-odds test on outcomes | Critical | Build |
| EVL-025 | Robustness | Adversarial robustness testing — paraphrase, typo, instruction injection variants | High | Build |
| EVL-026 | A/B Testing | A/B testing infrastructure for prompt / model / retrieval changes | High | Build |
| EVL-027 | User Feedback | Thumbs-up/down + free-text feedback collected and triaged | High | Build |
| EVL-028 | Red Team | Red-team exercises quarterly with documented findings | High | Ops |
| EVL-029 | Reasoning Trace | Reasoning-trace analysis for long agentic processes (>10 LLM calls per request) | High | Ops |
| EVL-030 | Regression | Regression suite blocks deployment on >= 2% drop on benchmark | Critical | Build |

<details><summary>Implementation guidance (expand)</summary>

**EVL-001 — Smoke-Test Golden Set (~30 cases) for CI/CD gating**
- *Why:* Without a CI-gating set, prompt changes ship without measurement.
- *How:* ~30 high-value, deterministic cases. Runs on every PR. Block merge on regression. Stored under version control.

**EVL-002 — Evaluation Benchmark Set (N >= 300) for ECE, drift, deployment gating**
- *Why:* Smoke set is too small for statistical validity on real metrics. Promotion-gating requires N >= 300.
- *How:* Stratified across routes, complexity, edge cases. SME-labelled. Versioned. Re-run on every model upgrade.

**EVL-003 — Adversarial Golden Set — prompt injection, jailbreak, edge cases**
- *Why:* A model that scores 95% on benign cases can fail 100% on adversarial inputs.
- *How:* Curated set of known attack patterns. Tested separately. Pass rate tracked. Includes tool-confusion attack pattern / RAG-poisoning attack pattern patterns.

**EVL-004 — Golden sets exclude synthetic / model-generated content (air-gap)**
- *Why:* Synthetic precedents in benchmark inflate apparent quality.
- *How:* Provenance tagged. CI/CD check excludes synthetic-origin content from benchmark eval. Documented.

**EVL-005 — Activate trajectory eval only when reasoning loops exist (ReAct / plan-then-execute)**
- *Why:* Instrumenting trajectory eval against a stateless retriever produces empty dashboards.
- *How:* Trigger condition: LLM-driven reasoning loops introduced. Then add: extra-steps, unmatched-steps, order-sensitivity.

**EVL-006 — Tool-call correctness eval triggers when agent has tool surface beyond bounded retrieval**
- *Why:* Tool-call eval against a system that doesn't call tools is wasted infra.
- *How:* Trigger: agent invokes external tools beyond fixed retrieval. Add: tool-call correctness, sequencing, error-handling-on-tool-failure.

**EVL-007 — Routing accuracy + cascade-failure eval when LLM-based supervisor / intent classifier introduced**
- *Why:* If routing fails silently, downstream specialists work on the wrong task.
- *How:* Per-route precision/recall. Cascade-failure analysis: what % of bad outputs trace to misrouting?

**EVL-008 — Conversational-state eval activates when multi-turn interaction is introduced**
- *Why:* Single-turn metrics don't catch coherence drift across turns.
- *How:* Memory-recall accuracy, turn-coherence, persona consistency. Tested on multi-turn dialogue set.

**EVL-009 — Sub-agent interaction trace + message-protocol correctness when inter-agent communication introduced**
- *Why:* Multi-agent message protocol failures produce unexplainable downstream errors.
- *How:* Traces show agent A → B messages, schema compliance, NACK-handling correctness.

**EVL-010 — Agent-as-a-Judge + retry-effectiveness eval when self-correction loops introduced**
- *Why:* Self-correction loops can amplify hallucinations if unverified.
- *How:* Independent judge LLM scores retry deltas. Track: % retries that improved score, % that regressed.

**EVL-011 — Faithfulness — output grounded in retrieved context (RAGAS)**
- *Why:* Hallucinated outputs that look authoritative are the highest-impact failure.
- *How:* RAGAS faithfulness >= 0.85. LLM-as-judge with structured output. Per-output stored.

**EVL-012 — Answer Relevancy + Contextual Precision + Contextual Recall (RAGAS)**
- *Why:* Single quality metric is too coarse; multi-metric is needed for diagnosis.
- *How:* RAGAS suite. Thresholds per metric per route. Dashboards.

**EVL-013 — Composite quality score combining correctness, completeness, helpfulness, coherence**
- *Why:* One number for trend-watching across the org; finer metrics for diagnosis.
- *How:* Weighted composite. Documented weights. Used in business reporting; not used in isolation for decisions.

**EVL-014 — LLM-as-judge with structured output and inter-rater reliability vs SMEs**
- *Why:* LLM-as-judge that disagrees with SMEs is worse than no judge.
- *How:* Calibrate judge against SME labels on 100+ cases. Cohen's kappa >= 0.6 before using in CI. Re-calibrate quarterly.

**EVL-015 — Judge model differs from generation model to reduce shared failure modes**
- *Why:* Same model judging itself produces self-flattery and shared blind spots.
- *How:* Generator: Claude Sonnet 3.7. Judge: Claude 4 / GPT-4 / Gemini Pro. Documented.

**EVL-016 — Expected Calibration Error (ECE) <= 0.10 on confidence scores**
- *Why:* A 95%-confident model that's actually 70%-accurate erodes user trust faster than a less-confident accurate one.
- *How:* Confidence-binned accuracy curve. ECE computed monthly. Re-calibrate (temperature scaling / Platt) when ECE > 0.10.

**EVL-017 — Output drift detection (KL divergence on output distribution week-over-week)**
- *Why:* Models that worked yesterday fail today when input distribution shifts.
- *How:* Per-route output distribution tracked. Alert on KL divergence above threshold. Trigger investigation.

**EVL-018 — Retrieval drift detection (top-K change rate)**
- *Why:* A change in what gets retrieved for the same query = silent regression.
- *How:* Same canonical queries run daily; top-K Jaccard similarity tracked. Alert on drop below threshold.

**EVL-019 — p50, p95, p99 latency tracked per route with SLOs**
- *Why:* Average latency hides tail problems that destroy user experience.
- *How:* Per route SLO. e.g. p95 <= 4s, p99 <= 8s. Alert on breach. Tracked through tracing backend.

**EVL-020 — TTFT (Time to First Token) tracked for streamed responses**
- *Why:* A 30-second answer is perceived as broken if the first token doesn't arrive in 2s.
- *How:* TTFT < 2s for streaming. Measured and tracked. Streaming-mode toggle per route.

**EVL-021 — Sustained throughput target validated under load test**
- *Why:* A system that meets latency at low load fails at expected production load.
- *How:* Load test at 2× expected peak. Latency SLOs hold. Locust / k6 / equivalent.

**EVL-022 — Cost per task measured and tracked over time**
- *Why:* A working system that's economically untenable is worse than no system.
- *How:* Cost = input tokens × price + output tokens × price + tool costs. Per-route. Trend-watched.

**EVL-023 — Refusal-on-harmful and refusal-on-allowed measured separately**
- *Why:* A model that refuses too much (false refusals) is unusable; refuses too little is unsafe.
- *How:* Two test sets: harmful prompts (should refuse), benign-but-superficially-edgy (should answer). Both rates tracked.

**EVL-024 — Demographic-parity / equalised-odds test on outcomes**
- *Why:* An agent making decisions about people that systematically disadvantages a group is a regulator finding.
- *How:* Per protected characteristic (where applicable): disparate impact analysis. Threshold + mitigation plan.

**EVL-025 — Adversarial robustness testing — paraphrase, typo, instruction injection variants**
- *Why:* Production users mistype, paraphrase and try to break the system.
- *How:* Per canonical query, generate 5 paraphrases + 5 typo variants + 3 injection attempts. Score consistency.

**EVL-026 — A/B testing infrastructure for prompt / model / retrieval changes**
- *Why:* Without A/B, you cannot measure live-traffic impact of a change.
- *How:* Feature flagging (feature-flag platform / equivalent). Routing rule per experiment. Metrics auto-collected per arm. Statistical-significance gate before rollout.

**EVL-027 — Thumbs-up/down + free-text feedback collected and triaged**
- *Why:* The cheapest signal of quality is the user telling you.
- *How:* Per-response feedback widget. Daily triage of negative feedback into failure modes. Loop back to golden set additions.

**EVL-028 — Red-team exercises quarterly with documented findings**
- *Why:* In-house teams develop blind spots; external red-teamers find what you don't.
- *How:* Quarterly engagement, defined scope. Findings tracked in security issue tracker with owner + due date.

**EVL-029 — Reasoning-trace analysis for long agentic processes (>10 LLM calls per request)**
- *Why:* In long traces, root-cause sits 7 LLM calls deep. Without trace analysis, debugging is guessing.
- *How:* Traces stored, queryable by correlation_id. Intermediate-state inspection. Triggers when call depth crosses 10.

**EVL-030 — Regression suite blocks deployment on >= 2% drop on benchmark**
- *Why:* 2% drops accumulate; the system you ship in 6 months is unrecognisably worse without gating.
- *How:* CI gate against benchmark. Drop above threshold blocks merge / deployment. Override requires named approval.

</details>

## 06 — Security — MCP & Tools

Synthesised from MCP sheet. OAuth 2.1, tool poisoning, supply chain, sandboxing.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| MCP-001 | AuthN/Z | OAuth 2.1 with mandatory PKCE for all MCP clients | Critical | Build |
| MCP-002 | AuthN/Z | External authorisation server — not MCP server as both resource + auth server | Critical | Build |
| MCP-003 | AuthN/Z | Authorisation header only — never tokens in URI query strings | Critical | Build |
| MCP-004 | AuthN/Z | Audience validation — tokens issued specifically for this MCP server | Critical | Build |
| MCP-005 | AuthN/Z | Short-lived access tokens (max 1 hour) with automatic refresh | High | Build |
| MCP-006 | AuthN/Z | Integrate with existing IdP / SSO for internal users | High | Build |
| MCP-007 | AuthN/Z | MFA for privileged MCP server access | Critical | Build |
| MCP-008 | Tool Registration | Corporate email verification + MFA for tool publishers | Critical | Build |
| MCP-009 | Tool Registration | Digital signature on every tool definition (PKI) | Critical | Build |
| MCP-010 | Tool Registration | SAST on submitted tool code | Critical | Build |
| MCP-011 | Tool Registration | SCA for dependency vulnerability scanning | Critical | Build |
| MCP-012 | Tool Registration | Immutable registry of approved tool signatures with tamper detection | Critical | Build |
| MCP-013 | Tool Registration | Runtime signature verification before tool invocation | Critical | Build |
| MCP-014 | Tool Registration | Certificate revocation for compromised tools | High | Build |
| MCP-015 | Tool Poisoning | Full-Schema Poisoning (FSP) detection across entire tool schema | Critical | Build |
| MCP-016 | Tool Poisoning | Tool shadowing / name-collision detection | High | Build |
| MCP-017 | Transport | HTTPS / TLS 1.2 minimum (1.3 preferred) for all MCP communication | Critical | Build |
| MCP-018 | Transport | Certificate validation + chain verification — no self-signed in prod | Critical | Build |
| MCP-019 | Transport | Rate limiting and throttling on MCP endpoints | High | Build |
| MCP-020 | Input Validation | JSON schema validation on all structured inputs (client + server) | Critical | Build |
| MCP-021 | Input Validation | Parameterised queries only — no string-concat SQL/Cypher | Critical | Build |
| MCP-022 | Input Validation | Microsoft AI Prompt Shields or equivalent for indirect prompt injection | Critical | Build |
| MCP-023 | Input Validation | Spotlighting / datamarking to separate trusted vs untrusted data | High | Build |
| MCP-024 | Access Control | Dynamic OAuth token → tool-role mapping | Critical | Build |
| MCP-025 | Access Control | Tool-level permissions with explicit access requirements | Critical | Build |
| MCP-026 | Access Control | ABAC for context-aware permissions (time, location, sensitivity) | High | Build |
| MCP-027 | Access Control | Just-in-time access provisioning for sensitive operations | High | Build |
| MCP-028 | Access Control | Human-in-the-loop approvals for elevated privilege operations | High | Build |
| MCP-029 | Monitoring | Log every tool invocation with parameters, results, principal | Critical | Build |
| MCP-030 | Monitoring | Real-time anomaly detection for unusual tool invocation sequences | High | Build |
| MCP-031 | Monitoring | SIEM integration (ELK / Splunk / Sentinel) | High | Build |
| MCP-032 | Monitoring | Log encryption + integrity protection (HMAC) | High | Build |
| MCP-033 | Incident Response | MCP-specific incident response playbooks | Critical | Build |
| MCP-034 | Incident Response | Emergency procedures for disabling MCP functionality org-wide | Critical | Build |
| MCP-035 | Configuration | IaC with version control for all MCP configurations | High | Build |
| MCP-036 | Configuration | Secrets in dedicated managers — no plaintext credential storage | Critical | Build |
| MCP-037 | Configuration | Automated credential rotation for API keys and tokens | High | Build |
| MCP-038 | Network | Network segmentation — DMZ for public MCP, micro-segmentation internally | High | Build |
| MCP-039 | Network | Zero-trust principles — every component untrusted | High | Build |
| MCP-040 | Network | WAF with MCP-specific rules for public-facing endpoints | High | Build |
| MCP-041 | Container | Hardened minimal base images with vuln scanning | High | Build |
| MCP-042 | Container | Non-root execution + read-only filesystems where possible | High | Build |
| MCP-043 | Container | Resource limits to prevent exhaustion attacks | High | Build |
| MCP-044 | Container | Service mesh for mTLS between MCP components | Medium | Build |
| MCP-045 | Supply Chain | Vendor vetting + approval for every external MCP server | Critical | Build |
| MCP-046 | Supply Chain | Hash verification before execution + tamper detection | Critical | Build |
| MCP-047 | Supply Chain | SBOM in CycloneDX or SPDX with vulnerability correlation | High | Build |
| MCP-048 | Vulnerability Mgmt | Audit existing MCP implementations for known CVEs (mcp-remote etc.) | Critical | Build |
| MCP-049 | Vulnerability Mgmt | Automated vulnerability scanning in CI/CD | High | Build |
| MCP-050 | Vulnerability Mgmt | Patch management for MCP dependencies | High | Build |

<details><summary>Implementation guidance (expand)</summary>

**MCP-001 — OAuth 2.1 with mandatory PKCE for all MCP clients**
- *Why:* Without PKCE, authorisation-code interception is trivial in mobile/desktop clients.
- *How:* Implement OAuth 2.1 spec. PKCE mandatory. Reference: modelcontextprotocol.io spec.

**MCP-002 — External authorisation server — not MCP server as both resource + auth server**
- *Why:* Combining roles in one server doubles the blast radius of any compromise.
- *How:* Use Keycloak / Auth0 / Azure AD / Cognito as authorisation server. MCP server is resource server only.

**MCP-003 — Authorisation header only — never tokens in URI query strings**
- *Why:* Tokens in URLs leak into logs, history, referrer headers.
- *How:* HTTP Authorization: Bearer header. Reject requests with tokens elsewhere.

**MCP-004 — Audience validation — tokens issued specifically for this MCP server**
- *Why:* Confused-deputy: a token for service A used to access service B.
- *How:* Validate aud claim against this MCP server's identifier. Reject mismatched tokens.

**MCP-005 — Short-lived access tokens (max 1 hour) with automatic refresh**
- *Why:* Long-lived tokens are the most-stolen credentials.
- *How:* exp <= 3600s. Refresh tokens for public clients are rotated. Secure storage required.

**MCP-006 — Integrate with existing IdP / SSO for internal users**
- *Why:* A parallel identity store is a parallel attack surface.
- *How:* Azure AD / Okta / equivalent. SSO. MFA enforced for privileged actions.

**MCP-007 — MFA for privileged MCP server access**
- *Why:* A compromised admin credential without MFA is an organisation-wide breach.
- *How:* Hardware-key MFA for admin paths. SMS MFA forbidden.

**MCP-008 — Corporate email verification + MFA for tool publishers**
- *Why:* Anonymous tool publishers cannot be held accountable for malicious tools.
- *How:* Publisher onboarding requires verified corporate email + MFA + signed code-of-conduct.

**MCP-009 — Digital signature on every tool definition (PKI)**
- *Why:* Tool-poisoning attacks succeed when tool metadata can be modified post-registration.
- *How:* PKI infrastructure. Cryptographic signature on tool definition + metadata. Verify at runtime.

**MCP-010 — SAST on submitted tool code**
- *Why:* Tool code is code; treat it as such.
- *How:* Semgrep / Checkmarx / Snyk / equivalent on submission. Block on Critical/High findings.

**MCP-011 — SCA for dependency vulnerability scanning**
- *Why:* A safe tool with vulnerable dependencies is still vulnerable.
- *How:* Snyk / Dependabot / equivalent. SBOM generated. Vulnerable deps block submission.

**MCP-012 — Immutable registry of approved tool signatures with tamper detection**
- *Why:* A mutable registry can be silently updated by an attacker.
- *How:* Append-only store (S3 Object Lock / immudb / equivalent). Tamper detection on read.

**MCP-013 — Runtime signature verification before tool invocation**
- *Why:* A tool whose signature isn't verified at runtime might have been swapped post-deployment.
- *How:* Every invocation: verify signature against registry. Mismatch = reject + alert.

**MCP-014 — Certificate revocation for compromised tools**
- *Why:* Without revocation, a compromised tool remains executable.
- *How:* CRL / OCSP / revocation list pulled by MCP gateway. Periodic refresh.

**MCP-015 — Full-Schema Poisoning (FSP) detection across entire tool schema**
- *Why:* Adversary can hide instructions in description, params, examples, anywhere in the schema.
- *How:* Static analysis of all metadata fields (not just description). Pattern matching for instruction-like strings.

**MCP-016 — Tool shadowing / name-collision detection**
- *Why:* A malicious tool with a similar name to a trusted one fools the LLM into selecting it.
- *How:* Detect near-duplicate names (Levenshtein, soundex). Alert on registration.

**MCP-017 — HTTPS / TLS 1.2 minimum (1.3 preferred) for all MCP communication**
- *Why:* Plaintext MCP traffic carries credentials, tool calls, and reasoning rationale.
- *How:* Mandate TLS 1.2+. Reject older. WSS for WebSocket, HTTPS for SSE.

**MCP-018 — Certificate validation + chain verification — no self-signed in prod**
- *Why:* MITM is trivial without cert validation.
- *How:* Verify chain against trusted roots. Pin where possible. Forward secrecy.

**MCP-019 — Rate limiting and throttling on MCP endpoints**
- *Why:* Without throttling, a single compromised credential can DoS or exfiltrate.
- *How:* Per-principal rate limits. Burst + sustained. Cloud-native (API Gateway / AWS WAF).

**MCP-020 — JSON schema validation on all structured inputs (client + server)**
- *Why:* Client-side validation alone is bypassable; server-side alone produces poor UX.
- *How:* Defined schemas. Client-side for feedback. Server-side as security boundary. Mismatch rejected.

**MCP-021 — Parameterised queries only — no string-concat SQL/Cypher**
- *Why:* SQL/Cypher injection through MCP tool parameters is a known attack class.
- *How:* ORMs / parameterised drivers exclusively. Lint rule blocks string concatenation.

**MCP-022 — Microsoft AI Prompt Shields or equivalent for indirect prompt injection**
- *Why:* Tool descriptions / retrieved content can contain instructions targeting the LLM.
- *How:* Real-time injection detection on tool descriptions, retrieved content, user input. Reject on detection.

**MCP-023 — Spotlighting / datamarking to separate trusted vs untrusted data**
- *Why:* LLMs cannot reliably distinguish instructions from data without structural markers.
- *How:* Delimiters around untrusted data. Datamarking with prefixes. Documented protocol.

**MCP-024 — Dynamic OAuth token → tool-role mapping**
- *Why:* Static role assignment doesn't survive a fluid principal model (users, agents, services).
- *How:* OAuth scopes map to allowed tools per principal. Refresh per session.

**MCP-025 — Tool-level permissions with explicit access requirements**
- *Why:* Wildcard 'use any tool' permissions are how blast radii grow.
- *How:* Per-tool permission. Default deny. Explicit grant per role.

**MCP-026 — ABAC for context-aware permissions (time, location, sensitivity)**
- *Why:* A user permitted to do action X in office hours shouldn't necessarily do it at 3am from a new country.
- *How:* OPA / Cerbos / equivalent. Policy evaluated per call with full context.

**MCP-027 — Just-in-time access provisioning for sensitive operations**
- *Why:* Standing credentials for sensitive ops are stolen sooner or later.
- *How:* STS-style temporary credentials. Scoped to operation. Short TTL.

**MCP-028 — Human-in-the-loop approvals for elevated privilege operations**
- *Why:* Some operations are irreversible enough that one human-approval is cheap insurance.
- *How:* Approval queue with named approvers. Timeout fail-closed.

**MCP-029 — Log every tool invocation with parameters, results, principal**
- *Why:* Reconstructing 'what did the agent actually do' without logs is impossible.
- *How:* Structured JSONL logs. Append-only. SIEM-integrated.

**MCP-030 — Real-time anomaly detection for unusual tool invocation sequences**
- *Why:* A trusted tool used in an untrusted sequence is an attack pattern.
- *How:* Behavioural baselines per principal. Alert on sequence anomalies.

**MCP-031 — SIEM integration (ELK / Splunk / Sentinel)**
- *Why:* Per-app logs are inadequate for cross-system threat detection.
- *How:* Forward structured logs to central SIEM. Documented correlation rules.

**MCP-032 — Log encryption + integrity protection (HMAC)**
- *Why:* An attacker who tampers with audit logs eliminates the evidence of their attack.
- *How:* Logs encrypted at rest. Periodic HMAC sealing.

**MCP-033 — MCP-specific incident response playbooks**
- *Why:* Generic IR playbooks miss MCP-specific attack patterns (tool poisoning, prompt injection, credential compromise).
- *How:* Playbooks for: tool poisoning, prompt injection, credential compromise, tool shadowing.

**MCP-034 — Emergency procedures for disabling MCP functionality org-wide**
- *Why:* In a worst-case compromise, the only safe response is shutdown.
- *How:* Documented kill-switch. Tested quarterly. Authority + approval matrix defined.

**MCP-035 — IaC with version control for all MCP configurations**
- *Why:* Drift between intended and actual config is a frequent silent vulnerability.
- *How:* Terraform / CloudFormation / Bicep. PR-reviewed. Drift detection automated.

**MCP-036 — Secrets in dedicated managers — no plaintext credential storage**
- *Why:* Plaintext credentials in env / config files are the #1 cause of incidents in surveyed teams.
- *How:* AWS Secrets Manager / Azure Key Vault / HashiCorp Vault. Rotation automated.

**MCP-037 — Automated credential rotation for API keys and tokens**
- *Why:* Static long-lived credentials are vulnerable to slow-leak attacks.
- *How:* Rotation cadence per credential class. Application supports rotation without downtime.

**MCP-038 — Network segmentation — DMZ for public MCP, micro-segmentation internally**
- *Why:* Flat networks let one compromised pod reach everything.
- *How:* Kubernetes NetworkPolicies. Per-pod allow-lists. Default deny.

**MCP-039 — Zero-trust principles — every component untrusted**
- *Why:* A trusted internal network is a single-firewall failure away from a breach.
- *How:* mTLS between services. Each call authenticated. No 'internal' trust shortcuts.

**MCP-040 — WAF with MCP-specific rules for public-facing endpoints**
- *Why:* WAF with default rules misses MCP-specific patterns.
- *How:* AWS WAF / Azure FrontDoor with custom rules. OWASP Top 10 + MCP-specific.

**MCP-041 — Hardened minimal base images with vuln scanning**
- *Why:* Bloated base images are a larger attack surface.
- *How:* Distroless / Chainguard / scratch. Trivy / Snyk scan in CI. Block Critical CVEs.

**MCP-042 — Non-root execution + read-only filesystems where possible**
- *Why:* Root containers are escape vectors.
- *How:* runAsNonRoot: true. readOnlyRootFilesystem: true. emptyDir for scratch.

**MCP-043 — Resource limits to prevent exhaustion attacks**
- *Why:* Without limits, one pod can starve the cluster.
- *How:* CPU + memory requests/limits. PID limits. NoStateNoTrust for ephemeral pods.

**MCP-044 — Service mesh for mTLS between MCP components**
- *Why:* Mesh-managed mTLS is the simplest way to get pervasive mTLS right.
- *How:* Istio / Linkerd. Default mTLS. Per-service policies.

**MCP-045 — Vendor vetting + approval for every external MCP server**
- *Why:* An MCP server you didn't vet is a tool you can't trust.
- *How:* Documented vetting process. SAST/SCA on the code. Security questionnaire. Approval recorded.

**MCP-046 — Hash verification before execution + tamper detection**
- *Why:* Even an approved package can be tampered with between approval and execution.
- *How:* Hash verification at deploy. Sigstore / cosign. Block mismatch.

**MCP-047 — SBOM in CycloneDX or SPDX with vulnerability correlation**
- *Why:* When a new CVE drops, you need to know in seconds whether you're affected.
- *How:* SBOM generated at build. Correlated with CVE feeds. Alerting integrated.

**MCP-048 — Audit existing MCP implementations for known CVEs (mcp-remote etc.)**
- *Why:* Known CVEs in the MCP ecosystem (CVE-2025-6514) are exploitable today.
- *How:* Inventory. Version check. Patch to >= 0.10.1 for mcp-remote. Ongoing scan.

**MCP-049 — Automated vulnerability scanning in CI/CD**
- *Why:* Manual scanning at irregular intervals leaves windows.
- *How:* CI scans on every PR. CD scans pre-deploy. Block on Critical findings.

**MCP-050 — Patch management for MCP dependencies**
- *Why:* A dependency vulnerability not patched is one that will be exploited.
- *How:* Dependabot / Renovate. Patch SLA per severity. Tested in staging.

</details>

## 07 — Security — RAG & Vector DB

Synthesised from RAG-GRAG sheet. Embeddings, exfiltration, injection, graph security.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| RAG-001 | Agent AuthN/Z | Zero-trust auth for AI agents with cryptographic identities | Critical | Build |
| RAG-002 | Agent AuthN/Z | Non-Human Identity (NHI) management for agent credentials | High | Build |
| RAG-003 | Agent AuthN/Z | Context-aware (ABAC) access controls with dynamic permissions | High | Build |
| RAG-004 | Agent AuthN/Z | Granular audit trails for every agent action | Critical | Build |
| RAG-005 | Knowledge Graph | Triple validation with provenance (W3C PROV-O) | High | Build |
| RAG-006 | Knowledge Graph | Graph anomaly detection for topology changes | High | Build |
| RAG-007 | Knowledge Graph | Immutable audit log for graph modifications | Critical | Build |
| RAG-008 | Tool Execution | Tool sandboxing with container isolation | Critical | Build |
| RAG-009 | Tool Execution | Tool registry with SLSA verification | High | Build |
| RAG-010 | Tool Execution | Runtime monitoring for anomalous tool usage | High | Build |
| RAG-011 | Vector DB | Application-layer encryption (ALE) for embeddings | Critical | Build |
| RAG-012 | Vector DB | Embedding inversion prevention (vector shuffling / segmentation) | High | Build |
| RAG-013 | Vector DB | Segment-specific encryption with key rotation | High | Build |
| RAG-014 | Vector DB | Differential privacy in embedding generation (for external-facing RAG) | Medium | Build |
| RAG-015 | Vector DB | Multi-tenant isolation for shared vector spaces | High | Build |
| RAG-016 | Reasoning Chain | Cryptographic integrity checks on reasoning chains | High | Build |
| RAG-017 | Reasoning Chain | Contextual isolation between agent sessions | High | Build |
| RAG-018 | Reasoning Chain | Adversarial training for reasoning robustness | Medium | Build |
| RAG-019 | Source Verification | Automated provenance verification (ProVe-style) | High | Build |
| RAG-020 | Source Verification | Cryptographic signatures on knowledge updates (NIST FIPS 186-4) | Critical | Build |
| RAG-021 | Source Verification | Cross-reference validation against multiple sources for critical claims | High | Build |
| RAG-022 | Input Validation | Multi-layered validation with semantic analysis | Critical | Build |
| RAG-023 | Input Validation | Query complexity limits with fast rejection | High | Build |
| RAG-024 | Input Validation | Multi-modal input sanitisation (text, image, audio) | High | Build |
| RAG-025 | Exfiltration | Rate limiting and query throttling | High | Build |
| RAG-026 | Exfiltration | DLP scanning on RAG responses | Critical | Build |
| RAG-027 | Exfiltration | Response filtering with allowlist approach | High | Build |
| RAG-028 | Exfiltration | Vector query monitoring for similarity exploitation | Medium | Build |
| RAG-029 | Exfiltration | Session pattern analysis for iterative extraction (sliding windows) | High | Build |
| RAG-030 | Prompt Injection | Multi-layer prompt injection detection | Critical | Build |
| RAG-031 | Prompt Injection | Data hygiene for external knowledge sources | Critical | Build |
| RAG-032 | Prompt Injection | Clear control/data plane distinction (instruction vs data) | High | Build |
| RAG-033 | Graph Traversal | Node-level access controls with fine-grained permissions | High | Build |
| RAG-034 | Graph Traversal | Graph query filtering based on user permissions (query rewriting) | High | Build |
| RAG-035 | Memory Security | Memory isolation with thread-scoped boundaries | Critical | Build |
| RAG-036 | Memory Security | Cryptographic integrity checks on stored context (HMAC) | High | Build |
| RAG-037 | Memory Security | Regular memory sanitisation and cleanup (async) | Medium | Build |
| RAG-038 | Memory Security | Memory poisoning detection algorithms | Medium | Build |
| RAG-039 | Inter-Agent | mTLS for all inter-agent communications | Critical | Build |
| RAG-040 | Inter-Agent | Message integrity with HMAC + replay protection (nonces + timestamps) | High | Build |
| RAG-041 | Emerging Threats | tool-confusion attack pattern attack detection (document poisoning) | High | Build |
| RAG-042 | Emerging Threats | RAG-poisoning attack pattern detection for relation manipulation in KG | Medium | Build |
| RAG-043 | Emerging Threats | Supply chain monitoring for ML model integrity | High | Build |

<details><summary>Implementation guidance (expand)</summary>

**RAG-001 — Zero-trust auth for AI agents with cryptographic identities**
- *Why:* Agents act on behalf of principals; their identity must be as strong as a human's.
- *How:* PKI infrastructure. Unique per-agent certs. NIST Zero Trust Architecture aligned. JWT after handshake for performance.

**RAG-002 — Non-Human Identity (NHI) management for agent credentials**
- *Why:* Agents are non-human identities. Treating them as human users breaks both audit and lifecycle.
- *How:* Dedicated NHI provider (CyberArk / HashiCorp Vault). API key rotation with cached validation.

**RAG-003 — Context-aware (ABAC) access controls with dynamic permissions**
- *Why:* Role-only auth misses context (time, source IP, sensitivity of data being accessed).
- *How:* OPA / Cerbos. Cached ABAC decisions, periodic refresh. XACML semantics.

**RAG-004 — Granular audit trails for every agent action**
- *Why:* Without per-action audit, attributing a bad outcome to a specific decision is impossible.
- *How:* Immutable logs. Cryptographic integrity. Async to avoid hot-path cost.

**RAG-005 — Triple validation with provenance (W3C PROV-O)**
- *Why:* Untracked triples in the graph silently re-route reasoning.
- *How:* PROV-O ontology. Automated consistency checking. SHACL constraints for RDF.

**RAG-006 — Graph anomaly detection for topology changes**
- *Why:* RAG-poisoning attack pattern-style attacks insert/modify relationships to mislead reasoning.
- *How:* Pattern-based detection in-line + async GNN. Alert on suspicious changes.

**RAG-007 — Immutable audit log for graph modifications**
- *Why:* Mutable graph history = no defence against insider tampering.
- *How:* Append-only with periodic cryptographic sealing. Hyperledger / Certificate Transparency style.

**RAG-008 — Tool sandboxing with container isolation**
- *Why:* Tool code runs untrusted by default in an agent context.
- *How:* gVisor / Kata Containers / pre-warmed gVisor pods. NIST SP 800-190 hardening.

**RAG-009 — Tool registry with SLSA verification**
- *Why:* A tool not built through SLSA is a tool with no provenance guarantee.
- *How:* SLSA level >= 3 for production tools. Cached attestations, async verification.

**RAG-010 — Runtime monitoring for anomalous tool usage**
- *Why:* A tool used in a different pattern than usual is a leading indicator of compromise.
- *How:* Behavioural analysis + rate limiting. MITRE ATLAS-aligned. Real-time scoring + async deep analysis.

**RAG-011 — Application-layer encryption (ALE) for embeddings**
- *Why:* Encrypted-at-rest only is insufficient — embeddings leaked at the application layer reveal training data.
- *How:* ALE with envelope encryption. Decrypt in memory only. Strong memory isolation (consider SGX).

**RAG-012 — Embedding inversion prevention (vector shuffling / segmentation)**
- *Why:* Embedding inversion attacks can reconstruct original text from vectors.
- *How:* Pre-segment vectors by sensitivity. Avoid per-query shuffling for performance.

**RAG-013 — Segment-specific encryption with key rotation**
- *Why:* A single key for all vectors = single point of failure.
- *How:* Per-segment keys. Cached decrypt keys in memory. Rotation per NIST SP 800-57.

**RAG-014 — Differential privacy in embedding generation (for external-facing RAG)**
- *Why:* Without DP, an external-facing RAG can be probed to extract individual data points.
- *How:* Calibrated noise on indexing (not per-query). Google DP library / equivalent.

**RAG-015 — Multi-tenant isolation for shared vector spaces**
- *Why:* Cross-tenant leakage is the most severe failure for shared infrastructure.
- *How:* Tenant-specific encryption + access control. Namespace enforcement. Tested with tenant-bleed probes.

**RAG-016 — Cryptographic integrity checks on reasoning chains**
- *Why:* A tampered intermediate reasoning step misroutes the final answer.
- *How:* Checkpoint critical decisions. Lightweight checksums for hot path. Merkle trees for batch verification.

**RAG-017 — Contextual isolation between agent sessions**
- *Why:* Session bleed = cross-user data leak.
- *How:* Session-bounded memory. Clear session boundaries. Avoid cross-contamination.

**RAG-018 — Adversarial training for reasoning robustness**
- *Why:* Models that haven't seen adversarial inputs fail on them.
- *How:* Fine-tune / RLHF against known reasoning-manipulation attacks. Refresh quarterly.

**RAG-019 — Automated provenance verification (ProVe-style)**
- *Why:* Unverified retrieval sources are the input layer to tool-confusion attack pattern.
- *How:* ProVe framework / equivalent. Verification cached, refresh periodically.

**RAG-020 — Cryptographic signatures on knowledge updates (NIST FIPS 186-4)**
- *Why:* Unsigned updates can be tampered with in transit / at rest.
- *How:* Sign sensitive data on write. Verify on access. HSM key custody.

**RAG-021 — Cross-reference validation against multiple sources for critical claims**
- *Why:* A single source is a single point of failure.
- *How:* Require N independent confirmations for critical data. Async cross-reference. Flag single-source claims.

**RAG-022 — Multi-layered validation with semantic analysis**
- *Why:* Pattern-only validation misses semantic attacks; semantic-only validation is too slow for hot path.
- *How:* Multi-stage: regex → lightweight ML → deep scan only if flagged. OWASP Input Validation.

**RAG-023 — Query complexity limits with fast rejection**
- *Why:* Unbounded queries can DoS or extract excess data.
- *How:* Hard limits on query depth, breadth, token count. Reject above threshold.

**RAG-024 — Multi-modal input sanitisation (text, image, audio)**
- *Why:* Image-embedded instructions and audio prompts are real attack vectors.
- *How:* Per-modality scanners. Parallel processing. Reject ambiguous content.

**RAG-025 — Rate limiting and query throttling**
- *Why:* Iterative data extraction is defeated by rate-limiting.
- *How:* Token bucket per principal. In-memory tracking. Minimal DB lookups.

**RAG-026 — DLP scanning on RAG responses**
- *Why:* Even if input is clean, RAG output can leak PII from sources.
- *How:* Microsoft Purview DLP / equivalent. Pre-compiled regex + async deep scanning.

**RAG-027 — Response filtering with allowlist approach**
- *Why:* Block-list filtering plays whack-a-mole; allow-list is bounded.
- *How:* Quick allowlist check + async content analysis. Block on suspicious patterns.

**RAG-028 — Vector query monitoring for similarity exploitation**
- *Why:* Crafted queries can probe similarity space to extract specific data.
- *How:* Fast cosine similarity checks. Threshold-based alerts.

**RAG-029 — Session pattern analysis for iterative extraction (sliding windows)**
- *Why:* Iterative extraction is invisible at request level but obvious at session level.
- *How:* In-memory session tracking with sliding windows. Alert on extraction patterns.

**RAG-030 — Multi-layer prompt injection detection**
- *Why:* Indirect prompt injection through retrieved content is the highest-impact RAG-specific attack.
- *How:* Content security policies on LLM output. Real-time pattern + async ML.

**RAG-031 — Data hygiene for external knowledge sources**
- *Why:* Anything that gets ingested is a potential injection vector.
- *How:* Strict curation. Validate before indexing. Block known-bad sources by reputation.

**RAG-032 — Clear control/data plane distinction (instruction vs data)**
- *Why:* LLMs confuse instructions and data without structural separation = confused deputy attack.
- *How:* Structured prompt templates. Clear boundaries. Delimiters / spotlighting.

**RAG-033 — Node-level access controls with fine-grained permissions**
- *Why:* Coarse graph permissions = unauthorised traversal yields sensitive data.
- *How:* RBAC/ABAC per node. Cached permissions. Fast intersection checks.

**RAG-034 — Graph query filtering based on user permissions (query rewriting)**
- *Why:* Post-filter is too late if the engine touches restricted data.
- *How:* Rewrite queries pre-execution to include permission bounds.

**RAG-035 — Memory isolation with thread-scoped boundaries**
- *Why:* Shared memory across sessions = cross-session attack vector.
- *How:* Process/thread isolation. Namespace boundaries. Without crypto overhead where possible.

**RAG-036 — Cryptographic integrity checks on stored context (HMAC)**
- *Why:* Tampered memory store = tampered next inference.
- *How:* HMAC on memory writes. Verify on read. Lightweight vs full sig for hot path.

**RAG-037 — Regular memory sanitisation and cleanup (async)**
- *Why:* Stale session data is both a leak risk and a context-rot vector.
- *How:* Background cleanup. Periodic sanitisation. TTL-driven.

**RAG-038 — Memory poisoning detection algorithms**
- *Why:* If memory is poisoned silently, every subsequent answer is wrong.
- *How:* Pattern monitoring for suspicious memory writes. Alert on anomalies.

**RAG-039 — mTLS for all inter-agent communications**
- *Why:* Inter-agent plaintext = sniffable lateral comms.
- *How:* Mutual TLS. Session establishment once, reuse for session.

**RAG-040 — Message integrity with HMAC + replay protection (nonces + timestamps)**
- *Why:* Replay attacks succeed without timestamps and nonces.
- *How:* Per-message nonce + timestamp. HMAC. Window-based replay protection.

**RAG-041 — tool-confusion attack pattern attack detection (document poisoning)**
- *Why:* A poisoned document in the corpus turns the entire RAG into the attacker's mouthpiece.
- *How:* Content fingerprinting + async deep analysis. Alert on injection-like patterns in newly-indexed docs.

**RAG-042 — RAG-poisoning attack pattern detection for relation manipulation in KG**
- *Why:* A malicious edge addition can mislead all KG-grounded reasoning.
- *How:* Monitor graph changes for suspicious patterns. Pattern + behavioural detection.

**RAG-043 — Supply chain monitoring for ML model integrity**
- *Why:* A compromised model = silent compromise of every downstream decision.
- *How:* Model signatures verified at deploy. Cached, periodic re-verification.

</details>

## 08 — Responsible AI & Guardrails

8-dimension RAI framework. PII, bias, hallucination, IG1/IG2/IG3, human-in-loop, contestability.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| RAI-001 | Framework | Adopt Responsible AI Framework with 8 dimensions | Critical | Discovery |
| RAI-002 | Framework | Align with public-sector guidance AI Playbook + EU AI Act risk classification | Critical | Discovery |
| RAI-003 | Transparency | Model Card published per deployed model | Critical | Build |
| RAI-004 | Transparency | Data Protection Impact Assessment (DPIA) completed before processing | Critical | Discovery |
| RAI-005 | Transparency | Algorithmic Transparency Record published (public-sector guidance) | Critical | Pilot |
| RAI-006 | Transparency | User-facing explanation of why each AI decision was made | Critical | Build |
| RAI-007 | Fairness | Demographic parity / equalised odds tested where the system affects people | Critical | Build |
| RAI-008 | Fairness | Bias audit on training and reference data | High | Build |
| RAI-009 | Privacy | PII detection at input + output + retrieved-context (3-layer) | Critical | Build |
| RAI-010 | Privacy | Tokenisation (not just redaction) for reversible PII handling | Critical | Build |
| RAI-011 | Privacy | Data minimisation — only retrieve / process the minimum necessary | High | Build |
| RAI-012 | Safety | Input Guardrail 1 (IG1) — prompt injection / jailbreak / structural sabotage classifier BEFORE Sanitiser | Critical | Build |
| RAI-013 | Safety | Input Guardrail 2 (IG2) — rubric-override and structural-sabotage detection on Specialist draft | Critical | Build |
| RAI-014 | Safety | Input Guardrail 3 (IG3) — retrieval guardrail on returned content (indirect injection) | Critical | Build |
| RAI-015 | Safety | Bedrock Guardrails (or equivalent) configured: harmful content, jailbreak, PII, denied topics, hallucination | Critical | Build |
| RAI-016 | Safety | Content moderation on user-facing output (toxicity, hate, self-harm, sexual) | Critical | Build |
| RAI-017 | Safety | Refusal-on-harmful / answer-on-benign measured separately | Critical | Build |
| RAI-018 | Reliability | Hallucination detection via groundedness check against retrieved context | Critical | Build |
| RAI-019 | Reliability | Citation of sources for every factual claim | Critical | Build |
| RAI-020 | Reliability | Confidence scores on every output, calibrated (ECE <= 0.10) | High | Build |
| RAI-021 | Robustness | Adversarial robustness testing — paraphrase, typo, injection variants | High | Build |
| RAI-022 | Robustness | Red-team exercises quarterly with documented findings | High | Ops |
| RAI-023 | Accountability | Human in the Loop for high-impact / irreversible actions | Critical | Design |
| RAI-024 | Accountability | Immutable audit log of every model decision + cited sources | Critical | Build |
| RAI-025 | Accountability | Named accountable executive per AI system (data protection officer, SIRO, AI Owner) | Critical | Discovery |
| RAI-026 | Contestability | User can challenge AI decisions and request human review | Critical | Build |
| RAI-027 | Contestability | Right-to-be-forgotten workflow tested end-to-end (< 30 days) | Critical | Build |
| RAI-028 | Drift | Continuous monitoring for model drift / performance degradation | High | Ops |
| RAI-029 | Governance | Technical Design Authority (technical design authority) reviews every new AI system before deployment | High | Build |
| RAI-030 | Governance | Stage gates: Ideation → Exploration → Pilot → Production each with entry/exit criteria | Critical | Design |

<details><summary>Implementation guidance (expand)</summary>

**RAI-001 — Adopt Responsible AI Framework with 8 dimensions**
- *Why:* Ad-hoc responsible AI is unauditable. A framework with named dimensions makes obligations concrete.
- *How:* 8 dimensions: Fairness, Transparency, Accountability, Privacy, Safety, Reliability, Robustness, Contestability. Each with controls.

**RAI-002 — Align with public-sector guidance AI Playbook + EU AI Act risk classification**
- *Why:* Misclassified system = non-compliant by default.
- *How:* Document AI Act risk class (prohibited / high-risk / limited / minimal). public-sector guidance AI Playbook controls mapped. Legal sign-off.

**RAI-003 — Model Card published per deployed model**
- *Why:* A model in production without a Model Card is a model nobody can explain.
- *How:* Per model: intended use, out-of-scope use, training data, metrics, biases, limitations. Versioned. Public to users where applicable.

**RAI-004 — Data Protection Impact Assessment (DPIA) completed before processing**
- *Why:* GDPR Article 35 requires DPIA for high-risk processing. Skipping it is a regulator finding.
- *How:* DPIA per use case. Reviewed by data protection officer. Mitigation plan for identified risks.

**RAI-005 — Algorithmic Transparency Record published (public-sector guidance)**
- *Why:* public-sector guidance's algorithmic transparency standard requires public records for AI used in public-sector decision-making.
- *How:* Filed in gov.uk algorithmic transparency records. Reviewed annually.

**RAI-006 — User-facing explanation of why each AI decision was made**
- *Why:* GDPR Article 22 + AI Act require explanations for automated decisions affecting individuals.
- *How:* Per response: cited sources, confidence score, decision rationale, opt-out path.

**RAI-007 — Demographic parity / equalised odds tested where the system affects people**
- *Why:* Systems making decisions about people that systematically disadvantage a group is a regulator finding and a moral failure.
- *How:* Per protected characteristic: disparate impact analysis. Threshold per metric. Mitigation if breached.

**RAI-008 — Bias audit on training and reference data**
- *Why:* Biased data = biased model, regardless of how careful the architecture is.
- *How:* Demographic breakdown of data. Gap identification. Mitigation (oversample, synthetic, exclude).

**RAI-009 — PII detection at input + output + retrieved-context (3-layer)**
- *Why:* Single-layer PII detection misses PII coming back from sources or hallucinated by the LLM.
- *How:* Pre-input scan, post-retrieval scan, pre-output scan. Each with redaction / blocking action.

**RAI-010 — Tokenisation (not just redaction) for reversible PII handling**
- *Why:* Redaction loses information; tokenisation preserves analytical value while protecting PII.
- *How:* Session-scoped Token Vault. Hot vault → cold vault transition. See CTX-021/022/023.

**RAI-011 — Data minimisation — only retrieve / process the minimum necessary**
- *Why:* Excess data retrieval = excess exposure surface + GDPR violation.
- *How:* Per-route, document the minimum fields required. Context Assembler bounds enforce.

**RAI-012 — Input Guardrail 1 (IG1) — prompt injection / jailbreak / structural sabotage classifier BEFORE Sanitiser**
- *Why:* An adversary injecting prompts gets past the sanitiser if classification happens after.
- *How:* Classifier on raw payload. Block on detection. Order is non-negotiable: IG1 → Sanitiser.

**RAI-013 — Input Guardrail 2 (IG2) — rubric-override and structural-sabotage detection on Specialist draft**
- *Why:* A Specialist following an injected instruction can route the system away from the rubric.
- *How:* Classifier on Specialist's draft output BEFORE Verifier sees it. Block + route to security queue.

**RAI-014 — Input Guardrail 3 (IG3) — retrieval guardrail on returned content (indirect injection)**
- *Why:* The third injection vector: adversary planted instructions in retrievable documents.
- *How:* Scan retrieved content for instruction-like patterns before injection into Specialist context.

**RAI-015 — Bedrock Guardrails (or equivalent) configured: harmful content, jailbreak, PII, denied topics, hallucination**
- *Why:* Native guardrails are cheap defence-in-depth; not using them is a missed control.
- *How:* Per-route guardrail config. Thresholds set + reviewed. Logged.

**RAI-016 — Content moderation on user-facing output (toxicity, hate, self-harm, sexual)**
- *Why:* A model that produces harmful content is a brand and safety incident.
- *How:* Perspective API / Azure Content Safety / equivalent. Per-category thresholds. Block + log.

**RAI-017 — Refusal-on-harmful / answer-on-benign measured separately**
- *Why:* A model that over-refuses is useless; under-refuses is unsafe.
- *How:* Two test sets. Both rates tracked. Calibrated per route.

**RAI-018 — Hallucination detection via groundedness check against retrieved context**
- *Why:* Unfounded outputs that sound authoritative are the highest-impact failure mode.
- *How:* Per claim, verify supported by retrieved context. Faithfulness >= 0.85. Bedrock Automated Reasoning where applicable.

**RAI-019 — Citation of sources for every factual claim**
- *Why:* Uncited claims are unauditable.
- *How:* Output includes source ID + URI for each cited claim. Click-through for users. Verified at runtime.

**RAI-020 — Confidence scores on every output, calibrated (ECE <= 0.10)**
- *Why:* Uncalibrated confidence misleads users about trustworthiness.
- *How:* Confidence per response. ECE measured. Re-calibration when breached. See EVL-016.

**RAI-021 — Adversarial robustness testing — paraphrase, typo, injection variants**
- *Why:* Real users mistype and adversaries deliberately mutate inputs.
- *How:* Per canonical query: paraphrase + typo + injection variants. Consistency scored.

**RAI-022 — Red-team exercises quarterly with documented findings**
- *Why:* Internal teams develop blind spots; external red-team finds what you don't.
- *How:* Quarterly engagement. Findings in security tracker. Owner + SLA per finding.

**RAI-023 — Human in the Loop for high-impact / irreversible actions**
- *Why:* Some actions should not be fully autonomous in a regulated context.
- *How:* Defined list. Approval queue with named approvers. Audit logged.

**RAI-024 — Immutable audit log of every model decision + cited sources**
- *Why:* An audit without an audit log is an opinion.
- *How:* Per decision: model version, prompt, retrieved context (or pointer), confidence, output, user feedback. Append-only, cryptographically sealed periodically.

**RAI-025 — Named accountable executive per AI system (data protection officer, SIRO, AI Owner)**
- *Why:* Diffuse accountability = no accountability.
- *How:* Per system: data protection officer, SIRO equivalent, AI Owner (business). Named in RACI. Confirmed in writing.

**RAI-026 — User can challenge AI decisions and request human review**
- *Why:* EU AI Act + GDPR Article 22 give individuals the right to challenge automated decisions.
- *How:* Documented contest workflow. Response SLA. Human reviewer trained and unbiased.

**RAI-027 — Right-to-be-forgotten workflow tested end-to-end (< 30 days)**
- *Why:* Failure to honour erasure requests = GDPR finding.
- *How:* See DAT-020 + CTX-024. Tested quarterly with synthetic subjects.

**RAI-028 — Continuous monitoring for model drift / performance degradation**
- *Why:* A model that worked yesterday can fail today; without monitoring you find out from users.
- *How:* Daily eval against benchmark subset. Drift alerts. Drift breach triggers re-evaluation.

**RAI-029 — Technical Design Authority (technical design authority) reviews every new AI system before deployment**
- *Why:* Without architecture governance, every project invents its own (often-flawed) wheel.
- *How:* technical design authority charter. Cadence. Required artifacts per submission. Decision authority documented.

**RAI-030 — Stage gates: Ideation → Exploration → Pilot → Production each with entry/exit criteria**
- *Why:* Promotion-by-momentum is how unsafe systems reach production.
- *How:* Per stage: required artifacts, eval thresholds, approvers. Documented gate decisions.

</details>

## 09 — Observability, Telemetry & Audit

Correlation IDs, OTel, vault-aware exporters, immutable audit, SLOs, replay.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| OBS-001 | Tracing | Correlation ID minted at user request, threaded through every agent call, tool call, retrieval, LLM completion | Critical | Build |
| OBS-002 | Tracing | OpenTelemetry-compatible distributed tracing across agent / tool / LLM / retrieval spans | High | Build |
| OBS-003 | Tracing | Span-level cost attribution (input tokens, output tokens, $ cost) per LLM call | Critical | Build |
| OBS-004 | Tracing | Trace sampling strategy: 100% for errors, 100% for cost-anomaly, sampled for steady-state | Medium | Ops |
| OBS-005 | Privacy in telemetry | Vault-aware OTel exporter: drop or hash raw PII / secret payloads before they leave the trust boundary | Critical | Build |
| OBS-006 | Privacy in telemetry | Telemetry exporters allow-listed; no default export of agent inputs/outputs to third parties | Critical | Build |
| OBS-007 | Privacy in telemetry | Raw prompts / completions stored only in audit store (encrypted, access-controlled) — never in metrics/log search | Critical | Build |
| OBS-008 | Logging | Structured JSONL logging — never free-text print statements | High | Build |
| OBS-009 | Logging | Log levels used consistently: DEBUG/INFO/WARN/ERROR/FATAL; production default = INFO | Medium | Build |
| OBS-010 | Logging | Centralised log aggregation (CloudWatch Logs + cross-account if multi-account) | High | Build |
| OBS-011 | Audit | Immutable audit log for every privileged action (tool invocation, retrieval, model call, write to source-of-truth) | Critical | Build |
| OBS-012 | Audit | Audit records include: who (principal), what (action), when (UTC ts), where (resource), why (correlation_id + reason) | Critical | Build |
| OBS-013 | Audit | CloudTrail enabled across all accounts; org trail; log file integrity validation on | Critical | Build |
| OBS-014 | Audit | Token-vault accesses (resolve, store, revoke) are audited with the principal, the token-id, and the purpose | Critical | Build |
| OBS-015 | Audit | ConfigurationSnapshot persisted per run: model version, prompt hash, tool catalogue hash, policy version, retrieval index versions | High | Build |
| OBS-016 | Metrics | Golden signals dashboard: request rate, error rate, p50/p95/p99 latency, cost-per-task | High | Ops |
| OBS-017 | Metrics | LLM-specific metrics: tokens in/out per call, completion-rate, refusal-rate, tool-error-rate, retry-rate | High | Build |
| OBS-018 | Metrics | Quality metrics in observability: faithfulness, answer-relevance, groundedness, refusal-when-uncertain rate | High | Ops |
| OBS-019 | SLOs | SLOs defined and tracked per use case: availability, p95 latency, quality threshold, cost-per-task ceiling | High | Design |
| OBS-020 | SLOs | Error budget policy: when budget burnt, freeze non-critical changes; pages on burn-rate | Medium | Ops |
| OBS-021 | Alerting | Alerts route to on-call, with severity tied to user impact — not to internal metric anomalies | High | Ops |
| OBS-022 | Alerting | Cost-anomaly alerting (per-day, per-principal, per-route) with auto-throttle on breach | Critical | Ops |
| OBS-023 | Alerting | Security alerts: prompt injection signature hits, tool-poisoning attempts, anomalous tool-call sequences | Critical | Ops |
| OBS-024 | Alerting | Quality regression alerts: drop > threshold in faithfulness, answer-relevance, refusal-rate | High | Ops |
| OBS-025 | Replay | Full conversation/agent-run replay from audit store + ConfigurationSnapshot | High | Build |
| OBS-026 | Replay | Forensic readiness: chain of custody, tamper-evident logs, time-sync to NTP across all components | High | Build |
| OBS-027 | Health | Per-component health endpoints (liveness, readiness) and synthetic probes hitting them | High | Build |
| OBS-028 | Health | Dependency health surfaced: Bedrock, graph database, session store, S3, OpenSearch, MCP servers | Medium | Ops |
| OBS-029 | Runbooks | Each alert is bound to a runbook URL; runbook tested in game-day before go-live | High | Ops |
| OBS-030 | Tracing | AWS X-Ray + Step Functions execution history retained for full agent run reconstruction | High | Build |
| OBS-031 | DLQ | Dead-letter queues for every async path; DLQ depth monitored and paged on >0 | High | Build |

<details><summary>Implementation guidance (expand)</summary>

**OBS-001 — Correlation ID minted at user request, threaded through every agent call, tool call, retrieval, LLM completion**
- *Why:* Without a single ID stitching the trace you can't reconstruct what an agent did when it goes wrong — and it will go wrong.
- *How:* Generate UUIDv7 at API gateway. Pass via x-correlation-id header / Step Functions execution context. Every log line includes it.

**OBS-002 — OpenTelemetry-compatible distributed tracing across agent / tool / LLM / retrieval spans**
- *Why:* OTel is the lingua franca: keeps you portable across Datadog, Honeycomb, X-Ray, Arize without rewrites.
- *How:* OTel SDK in every component. Span attributes: agent.id, agent.role, tool.name, retrieval.route, llm.model, llm.tokens.in/out.

**OBS-003 — Span-level cost attribution (input tokens, output tokens, $ cost) per LLM call**
- *Why:* Without per-span cost you cannot find the runaway agent or the route that's 100x more expensive than the median.
- *How:* Attach llm.cost.usd, llm.tokens.in, llm.tokens.out, llm.model to every completion span. Aggregate by route / principal / day.

**OBS-004 — Trace sampling strategy: 100% for errors, 100% for cost-anomaly, sampled for steady-state**
- *Why:* 100% sampling at scale bankrupts the observability bill before the LLM does. Errors must always be captured.
- *How:* Tail-based sampling. Always-on for spans with error=true or cost > p99. 10% baseline for the rest.

**OBS-005 — Vault-aware OTel exporter: drop or hash raw PII / secret payloads before they leave the trust boundary**
- *Why:* LangSmith / Arize / Datadog as cleartext PII sinks is one of the most common GDPR breaches in production AI systems.
- *How:* Custom SpanProcessor that consults token vault. Replace tokens with hash. Drop raw user_input from external exporters.

**OBS-006 — Telemetry exporters allow-listed; no default export of agent inputs/outputs to third parties**
- *Why:* The default in most OTel integrations is to export full prompts and completions. That is an exfiltration channel.
- *How:* Span attribute allow-list per exporter. Document where each attribute flows. DPIA covers all destinations.

**OBS-007 — Raw prompts / completions stored only in audit store (encrypted, access-controlled) — never in metrics/log search**
- *Why:* Splunk / CloudWatch text search is not access-controlled at the field level. Once raw prompts land there, every SRE can read them.
- *How:* Two-tier: (1) metrics + hashed identifiers in observability stack, (2) raw payloads in encrypted S3 audit bucket with separate IAM.

**OBS-008 — Structured JSONL logging — never free-text print statements**
- *Why:* Free-text logs make every incident a regex archaeology project at 3 AM.
- *How:* One JSON object per line. Fields: ts, level, correlation_id, agent_id, tool, event, attrs. Standard schema across services.

**OBS-009 — Log levels used consistently: DEBUG/INFO/WARN/ERROR/FATAL; production default = INFO**
- *Why:* If everything is INFO, nothing is. If errors don't escalate as ERROR, your alerts won't fire.
- *How:* Logging standard documented. Code review enforces. DEBUG only enabled per-trace via correlation ID.

**OBS-010 — Centralised log aggregation (CloudWatch Logs + cross-account if multi-account)**
- *Why:* A log line you have to SSH into a Lambda runtime to find is a log line that doesn't exist.
- *How:* All Lambda / ECS / Step Functions output to CloudWatch. Subscription filters to central log account. Retention per data class.

**OBS-011 — Immutable audit log for every privileged action (tool invocation, retrieval, model call, write to source-of-truth)**
- *Why:* Audit isn't logging. Logging is for ops; audit is for after-the-fact reconstruction and is a regulatory requirement.
- *How:* Append-only S3 bucket with Object Lock (compliance mode). Lifecycle to Glacier. Retention >= 7 years (per organisational AI operating model records policy).

**OBS-012 — Audit records include: who (principal), what (action), when (UTC ts), where (resource), why (correlation_id + reason)**
- *Why:* An audit log without 'why' is a list of mystery events that doesn't survive a regulator's first question.
- *How:* Canonical AuditEvent schema. Validation at write time. Reject incomplete events.

**OBS-013 — CloudTrail enabled across all accounts; org trail; log file integrity validation on**
- *Why:* CloudTrail is the AWS-level audit floor. Without it you can't prove who did what at the cloud layer.
- *How:* Org-level CloudTrail to dedicated security account. KMS-encrypted. Validation digests verified daily.

**OBS-014 — Token-vault accesses (resolve, store, revoke) are audited with the principal, the token-id, and the purpose**
- *Why:* The vault is where re-identification happens. If you can't audit accesses, you can't bound the blast radius of a breach.
- *How:* Every vault API call writes AuditEvent. Tie token-id to a purpose-of-use string. Alert on out-of-policy access.

**OBS-015 — ConfigurationSnapshot persisted per run: model version, prompt hash, tool catalogue hash, policy version, retrieval index versions**
- *Why:* Without snapshots you can't replay 'why did the agent say that on Tuesday?' six weeks later when the auditor asks.
- *How:* Snapshot record at run start. Stored with audit event. Hash-linked to artifacts in S3.

**OBS-016 — Golden signals dashboard: request rate, error rate, p50/p95/p99 latency, cost-per-task**
- *Why:* The four golden signals tell you the system's heartbeat. Without them you're operating blind.
- *How:* CloudWatch dashboard per use case (compliance use case, fraud-detection use case, document intelligence use case). On-call sees it on shift start.

**OBS-017 — LLM-specific metrics: tokens in/out per call, completion-rate, refusal-rate, tool-error-rate, retry-rate**
- *Why:* LLM systems fail in LLM-shaped ways. Vanilla web telemetry misses refusals, hallucinations-on-tools, and retry storms.
- *How:* Custom CloudWatch metrics. Per-route and per-agent dimensions. Anomaly detection on each.

**OBS-018 — Quality metrics in observability: faithfulness, answer-relevance, groundedness, refusal-when-uncertain rate**
- *Why:* If quality only shows up in offline evals, you find regressions days late. Run a sampled online judge.
- *How:* LLM-as-judge on 1% of production traffic. Emit metrics. Alert on >2σ drop.

**OBS-019 — SLOs defined and tracked per use case: availability, p95 latency, quality threshold, cost-per-task ceiling**
- *Why:* SLOs are the contract with the business. No SLO means no clear definition of 'broken'.
- *How:* Per use case: 99.5% availability, p95 < target, faithfulness >= 0.85, cost-per-task <= budget. Error budget tracked.

**OBS-020 — Error budget policy: when budget burnt, freeze non-critical changes; pages on burn-rate**
- *Why:* Without an error-budget policy SLOs are aspirational graphs nobody acts on.
- *How:* Documented policy. Burn-rate alerts (fast: 2% in 1h; slow: 10% in 6h). Change freeze trigger documented.

**OBS-021 — Alerts route to on-call, with severity tied to user impact — not to internal metric anomalies**
- *Why:* Pager fatigue is the leading cause of missed incidents. If everything pages, nothing does.
- *How:* Severity ladder. P1 pages on-call immediately. P2 next business day. P3 ticket. Quarterly alert hygiene review.

**OBS-022 — Cost-anomaly alerting (per-day, per-principal, per-route) with auto-throttle on breach**
- *Why:* A runaway agent can burn a year's budget in a weekend. Detection must be automatic, not Monday-morning.
- *How:* CloudWatch anomaly detector on cost metrics. >3σ triggers alert + circuit-breaker. Daily principal budgets enforced upstream.

**OBS-023 — Security alerts: prompt injection signature hits, tool-poisoning attempts, anomalous tool-call sequences**
- *Why:* Security events in agent systems look like 'unusual prompts' or 'odd tool sequences', not classic IDS hits.
- *How:* Bedrock Guardrails violations → SNS → SecOps. tool-confusion attack pattern / RAG-poisoning attack pattern signatures monitored. SIEM forwarding.

**OBS-024 — Quality regression alerts: drop > threshold in faithfulness, answer-relevance, refusal-rate**
- *Why:* Silent quality regressions — same uptime, worse answers — are the most damaging because users absorb it.
- *How:* Daily eval delta. Alert on > 5pp drop. Page on > 10pp drop.

**OBS-025 — Full conversation/agent-run replay from audit store + ConfigurationSnapshot**
- *Why:* When a user reports 'the agent did something weird' you need to reproduce it deterministically, not guess.
- *How:* Replay harness reads snapshot + original inputs. Pins model/prompt/tools to snapshot. Runs in shadow account.

**OBS-026 — Forensic readiness: chain of custody, tamper-evident logs, time-sync to NTP across all components**
- *Why:* If you can't prove the log wasn't altered, the log isn't evidence.
- *How:* Object Lock + KMS signing of audit batches. NTP from AWS Time Sync. Documented forensic procedure.

**OBS-027 — Per-component health endpoints (liveness, readiness) and synthetic probes hitting them**
- *Why:* A pod can be running but unable to reach Bedrock, graph database, or the token vault — synthetic probes catch that.
- *How:* GET /health (liveness), /ready (deps OK). Synthetic probe via CloudWatch Synthetics every 1 min.

**OBS-028 — Dependency health surfaced: Bedrock, graph database, session store, S3, OpenSearch, MCP servers**
- *Why:* Most agent incidents are upstream dependency incidents in disguise. Surface them so triage starts in the right place.
- *How:* Health page per environment. Dependency status colour-coded. Linked to upstream provider status pages.

**OBS-029 — Each alert is bound to a runbook URL; runbook tested in game-day before go-live**
- *Why:* An alert without a runbook is a 3-AM Stack Overflow search. Runbooks must exist and be rehearsed.
- *How:* Runbook-per-alert. Linked in alert metadata. Game-day rehearsals before any production change.

**OBS-030 — AWS X-Ray + Step Functions execution history retained for full agent run reconstruction**
- *Why:* Step Functions native history is your free-of-charge agent trace; lose it and replay becomes impossible.
- *How:* X-Ray active tracing on state machines + Lambdas. Execution history exported to audit S3 at termination.

**OBS-031 — Dead-letter queues for every async path; DLQ depth monitored and paged on >0**
- *Why:* Silent message drops are the worst kind of incident — no one notices until reconciliation a week later.
- *How:* SQS DLQ per Lambda async invocation, Step Functions task. CloudWatch alarm on ApproximateNumberOfMessages > 0.

</details>

## 10 — Deployment & Operations

Pipelines, eval-gated CI/CD, blue-green, kill switches, DR, on-call, change management.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| OPS-001 | CI/CD | Every change goes through a pipeline — no manual deploys to production | Critical | Build |
| OPS-002 | CI/CD | Eval gates in pipeline — block merge on benchmark regression beyond tolerance | Critical | Build |
| OPS-003 | CI/CD | Security gates: SAST, SCA, secret scanning, container scan, IaC scan on every PR | Critical | Build |
| OPS-004 | CI/CD | Immutable build artifacts; same artifact promoted dev → staging → prod | High | Build |
| OPS-005 | CI/CD | Build provenance attestations (SLSA) emitted and verified at deploy time | High | Build |
| OPS-006 | Environments | Separate AWS accounts per environment (dev / staging / prod / security) | Critical | Design |
| OPS-007 | Environments | Production data never copied to lower environments; synthetic data used for dev/test | Critical | Build |
| OPS-008 | Deployment | Canary or blue-green deployment with automatic rollback on metric breach | High | Build |
| OPS-009 | Deployment | Kill switch / feature flag per agent and per tool — instant disable without deploy | Critical | Build |
| OPS-010 | Deployment | Schema-compatible changes only (or two-phase migrations) for blackboard / KG / token vault | High | Build |
| OPS-011 | IaC | All infrastructure as code — no console clicks in production | Critical | Build |
| OPS-012 | IaC | Drift detection scheduled (daily); drift alerts as incident | Medium | Ops |
| OPS-013 | DR | Documented RPO and RTO per use case; tested annually | High | Ops |
| OPS-014 | DR | S3 cross-region replication for audit, blackboard, and source-of-truth buckets | High | Build |
| OPS-015 | DR | RDS / Aurora point-in-time recovery enabled (35 day retention); graph database / OpenSearch snapshots | Critical | Build |
| OPS-016 | DR | Restore tests quarterly — proof that backups are restorable | High | Ops |
| OPS-017 | Capacity | Bedrock quota / provisioned-throughput sized for peak + 30% headroom | High | Build |
| OPS-018 | Capacity | Auto-scaling configured for Lambda concurrency, ECS tasks, RDS read replicas | Medium | Build |
| OPS-019 | Capacity | Load testing pre-production: 2x peak, sustained 1 hour, before each major release | High | Test |
| OPS-020 | Chaos | Chaos experiments: dependency failure (Bedrock, graph database, session store), throttling, latency injection | Medium | Ops |
| OPS-021 | Chaos | Circuit breakers on every external dependency (Bedrock, MCP server, vector DB, KG) | High | Build |
| OPS-022 | On-call | 24x7 on-call rotation defined; pager tested; escalation policy documented | High | Ops |
| OPS-023 | On-call | Incident classification: P1 (user impact) / P2 (degraded) / P3 (potential) — each with SLA + runbook | High | Ops |
| OPS-024 | On-call | Post-incident review (blameless) within 5 business days; action items tracked to closure | High | Ops |
| OPS-025 | Change mgmt | Change Advisory Board for model upgrades, prompt changes, tool catalogue changes affecting prod | High | Ops |
| OPS-026 | Change mgmt | Model upgrades treated as a major change — full benchmark + canary + rollback plan | Critical | Ops |
| OPS-027 | Patching | Patching SLAs: Critical < 7 days, High < 30, Medium < 90 — for OS, container, language runtimes, MCP servers | High | Ops |
| OPS-028 | Secrets | Automated rotation of all secrets (DB creds, MCP server keys, signing keys); rotation tested | High | Build |
| OPS-029 | Documentation | Service catalogue: every component has an owner, on-call, runbook, dashboard, deploy guide | Medium | Ops |
| OPS-030 | Documentation | Architecture Decision Records (ADRs) for every significant choice — kept in repo | Medium | Build |

<details><summary>Implementation guidance (expand)</summary>

**OPS-001 — Every change goes through a pipeline — no manual deploys to production**
- *Why:* Manual deploys are the leading cause of 'we don't know what's running'. Pipelines are the audit trail.
- *How:* GitHub Actions / CodePipeline. Branch protection: PR + reviews + checks. Production deploy only from main.

**OPS-002 — Eval gates in pipeline — block merge on benchmark regression beyond tolerance**
- *Why:* If quality doesn't gate the merge, quality regressions reach production. Period.
- *How:* Pipeline runs benchmark (N>=300). Compare against baseline. Block on >2pp drop in headline metric.

**OPS-003 — Security gates: SAST, SCA, secret scanning, container scan, IaC scan on every PR**
- *Why:* A pipeline that ships code without security checks is a faster way to ship vulnerabilities.
- *How:* Semgrep / CodeQL (SAST), Snyk / Dependabot (SCA), trufflehog (secrets), Trivy (containers), Checkov (IaC). Fail on High/Critical.

**OPS-004 — Immutable build artifacts; same artifact promoted dev → staging → prod**
- *Why:* Build-per-environment means you can't trust that staging tested what production runs.
- *How:* Container image / Lambda zip built once. Tagged with git SHA. Promoted via deployment, not rebuild.

**OPS-005 — Build provenance attestations (SLSA) emitted and verified at deploy time**
- *Why:* Without provenance, supply-chain compromise via the build pipeline goes undetected.
- *How:* GitHub Actions OIDC → cosign signed attestations. Verify at deploy time. SLSA Build Level 3 target.

**OPS-006 — Separate AWS accounts per environment (dev / staging / prod / security)**
- *Why:* Shared-account separation by IAM is one IAM-misconfiguration away from cross-environment compromise.
- *How:* AWS Organizations. SCP guardrails. Cross-account roles for deploy only. Security account separate.

**OPS-007 — Production data never copied to lower environments; synthetic data used for dev/test**
- *Why:* Prod-data-in-dev is the breach mechanism for most leaked datasets — and it bypasses every privacy control.
- *How:* Synthetic generation. Anonymisation if real-shape needed. Documented in DPIA. Code review enforces.

**OPS-008 — Canary or blue-green deployment with automatic rollback on metric breach**
- *Why:* In-place updates are how a bad deployment takes down 100% of users instead of 10%.
- *How:* Lambda traffic shifting (canary 10% for 10 min) or ECS blue-green. Rollback on error rate, p95 latency, quality.

**OPS-009 — Kill switch / feature flag per agent and per tool — instant disable without deploy**
- *Why:* When an agent goes rogue at 2 AM you need an off-switch faster than a CI/CD round trip.
- *How:* feature-flag platform / AWS AppConfig flag per agent + per tool. Toggle propagates < 60s. Documented in runbook.

**OPS-010 — Schema-compatible changes only (or two-phase migrations) for blackboard / KG / token vault**
- *Why:* A backwards-incompatible schema change breaks every in-flight agent run mid-flight.
- *How:* Expand-migrate-contract pattern. Schema version field. Code reads N and N+1. Deprecate after burn-in.

**OPS-011 — All infrastructure as code — no console clicks in production**
- *Why:* Console changes are invisible to git, untestable, and the source of 'works in one region only' surprises.
- *How:* CDK / Terraform. Drift detection scheduled. Console writes restricted by SCP in production accounts.

**OPS-012 — Drift detection scheduled (daily); drift alerts as incident**
- *Why:* Undetected drift means your IaC is fiction and your DR is theoretical.
- *How:* CloudFormation drift detection / Terraform plan in CI. Alert on drift > 0. Triage as P3 incident.

**OPS-013 — Documented RPO and RTO per use case; tested annually**
- *Why:* Untested DR is undefined DR. The first failover should never be in a real incident.
- *How:* Target RPO < 1h, RTO < 2h for compliance use case / fraud-detection use case / document intelligence use case. Annual DR exercise. Results documented.

**OPS-014 — S3 cross-region replication for audit, blackboard, and source-of-truth buckets**
- *Why:* Single-region storage = single-region availability and durability bound. Audit data especially must survive.
- *How:* CRR on critical buckets. Replication metrics monitored. Target region documented per data class.

**OPS-015 — RDS / Aurora point-in-time recovery enabled (35 day retention); graph database / OpenSearch snapshots**
- *Why:* Backup that you can't restore from is not a backup. PITR is the floor.
- *How:* PITR 35 days. Daily graph database dump to S3. OpenSearch automated snapshots. Restore tested quarterly.

**OPS-016 — Restore tests quarterly — proof that backups are restorable**
- *Why:* Schrödinger's backup: until you restore it, it both exists and doesn't.
- *How:* Quarterly restore drill. Document time-to-restore. Validate data integrity. Update runbook.

**OPS-017 — Bedrock quota / provisioned-throughput sized for peak + 30% headroom**
- *Why:* Bedrock throttling under load means agents fail at the worst possible moment.
- *How:* Capacity model per use case. Provisioned throughput where cost-justified. Quota increase requests submitted ahead.

**OPS-018 — Auto-scaling configured for Lambda concurrency, ECS tasks, RDS read replicas**
- *Why:* Hard ceilings cause cliff-edge failure. Auto-scale to absorb spikes.
- *How:* Provisioned concurrency baselines for hot Lambdas. Application Auto Scaling on ECS. Aurora auto-scale read replicas.

**OPS-019 — Load testing pre-production: 2x peak, sustained 1 hour, before each major release**
- *Why:* Load profiles unique to agent systems (long tool chains, retries, backoff) aren't covered by classic web load tests.
- *How:* k6 / Locust scenarios mirroring real agent runs. Run in staging at 2x peak. Failure threshold documented.

**OPS-020 — Chaos experiments: dependency failure (Bedrock, graph database, session store), throttling, latency injection**
- *Why:* If you haven't tested the failure mode, you haven't tested the system.
- *How:* AWS Fault Injection Simulator. Quarterly game day. Targets: dep timeout, network partition, throttle.

**OPS-021 — Circuit breakers on every external dependency (Bedrock, MCP server, vector DB, KG)**
- *Why:* A slow dependency cascades into agent timeouts → retries → thundering herd → outage.
- *How:* Resilience4j-style: failure threshold, cool-down, half-open probe. Falls back to documented degraded behaviour.

**OPS-022 — 24x7 on-call rotation defined; pager tested; escalation policy documented**
- *Why:* An incident at 3 AM with no on-call is an incident that's three hours older when someone notices.
- *How:* on-call platform / on-call platform. Primary + secondary. Escalation to senior eng / SRE lead. Quarterly pager test.

**OPS-023 — Incident classification: P1 (user impact) / P2 (degraded) / P3 (potential) — each with SLA + runbook**
- *Why:* If everything's P1, nothing is. Classification drives the response.
- *How:* IR policy documented. P1: page, 15min ack. P2: page next business hour. P3: ticket. Drives runbook choice.

**OPS-024 — Post-incident review (blameless) within 5 business days; action items tracked to closure**
- *Why:* Incidents you don't review are incidents that repeat. Blame culture kills honest reporting.
- *How:* Template: timeline, impact, root cause, contributing factors, actions. Closed in tracker. Quarterly trend review.

**OPS-025 — Change Advisory Board for model upgrades, prompt changes, tool catalogue changes affecting prod**
- *Why:* A 'minor prompt tweak' that drops quality 10pp is a major change in agent systems.
- *How:* CAB cadence. Categories: standard (pre-approved), normal (CAB), emergency (post-hoc review). Documented.

**OPS-026 — Model upgrades treated as a major change — full benchmark + canary + rollback plan**
- *Why:* A new model version is a new system. 'It's the same model, just newer' has killed many systems.
- *How:* Full benchmark vs current. Side-by-side eval on shadow traffic. Canary 1%→10%→50%→100%. Rollback ready.

**OPS-027 — Patching SLAs: Critical < 7 days, High < 30, Medium < 90 — for OS, container, language runtimes, MCP servers**
- *Why:* Unpatched MCP-server CVEs (e.g. CVE-2025-6514) are the most common open hole in agent stacks.
- *How:* SLA documented. Patching dashboards. Auto-rebuild on base-image update. Exception process for delays.

**OPS-028 — Automated rotation of all secrets (DB creds, MCP server keys, signing keys); rotation tested**
- *Why:* Static secrets are credential leakage waiting for time. Rotation must be automatic or it doesn't happen.
- *How:* AWS Secrets Manager. Rotation Lambdas. Max age policy. KMS keys auto-rotate annually.

**OPS-029 — Service catalogue: every component has an owner, on-call, runbook, dashboard, deploy guide**
- *Why:* A service no one owns is a service no one fixes.
- *How:* Backstage / Confluence catalogue. Owner per service. Health page linked. Reviewed quarterly.

**OPS-030 — Architecture Decision Records (ADRs) for every significant choice — kept in repo**
- *Why:* Without ADRs, six months later no one remembers why the system makes the choices it does.
- *How:* ADR template. PR-reviewed. Indexed in repo /docs/adr. Required for new components.

</details>

## 11 — Compliance & Governance

UK GDPR / DPA, EU AI Act, algorithmic transparency record, ISO 42001/27001, NIST AI RMF, technical design authority, stage gates, supplier assurance.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| COM-001 | UK Data Protection | UK GDPR & DPA 2018 lawful basis identified, documented per processing activity | Critical | Design |
| COM-002 | UK Data Protection | DPIA completed and signed off before any production processing of personal data | Critical | Design |
| COM-003 | UK Data Protection | Data subject rights workflow: access, rectification, erasure, restriction, portability, objection | Critical | Build |
| COM-004 | UK Data Protection | Right to be forgotten (Art. 17) implementable across all stores within 30 days (matches blueprint commitment) | Critical | Build |
| COM-005 | UK Data Protection | Art. 22 — solely automated decisions with legal/significant effect flagged; human review path provided | Critical | Design |
| COM-006 | UK Data Protection | International transfers documented; transfer mechanism in place (adequacy / SCCs / BCRs); TIA done | Critical | Design |
| COM-007 | UK Data Protection | Records of Processing Activities (ROPA) maintained per Art. 30 | High | Design |
| COM-008 | UK Data Protection | 72-hour breach notification process to ICO; data subject notification process for high-risk breaches | Critical | Ops |
| COM-009 | EU AI Act | AI Act risk classification per use case (Prohibited / High / Limited / Minimal) | High | Design |
| COM-010 | EU AI Act | If High-Risk: technical documentation per Annex IV maintained | High | Build |
| COM-011 | EU AI Act | GPAI transparency obligations met where Bedrock / Claude usage triggers them | Medium | Design |
| COM-012 | UK AI Playbook | Algorithmic Transparency Recording Standard (algorithmic transparency record) record created and published for in-scope systems | High | Design |
| COM-013 | UK AI Playbook | public-sector guidance AI Playbook 10 principles applied — evidence per principle | High | Design |
| COM-014 | UK AI Playbook | Equality Impact Assessment completed (Public Sector Equality Duty, Equality Act 2010) | Critical | Design |
| COM-015 | Standards | ISO/IEC 42001 (AI Management System) controls mapped — gap-assessed for certification readiness | Medium | Design |
| COM-016 | Standards | ISO/IEC 27001 ISMS scope covers AI / agent platform; risks in register | High | Design |
| COM-017 | Standards | NIST AI Risk Management Framework (AI RMF 1.0) Govern / Map / Measure / Manage practices applied | Medium | Design |
| COM-018 | Standards | Cyber Essentials Plus certification for the platform; on annual renewal | High | Ops |
| COM-019 | Procurement | AI procurement guidance (Crown Commercial AI Framework) followed for any sub-procurement | Medium | Design |
| COM-020 | Supply chain | Supplier risk assessments (SOC 2 Type II / ISO 27001) for every third-party AI / data processor | High | Ops |
| COM-021 | Records mgmt | Records retention schedule applied — audit (>=7yr), logs (per data class), backups (per RTO/RPO) | High | Design |
| COM-022 | FOI | Freedom of Information Act 2000 considerations — what the public could request and what could be released | Medium | Design |
| COM-023 | Governance | AI Steering Group / Ethics Board reviews each use case before pilot and before prod | High | Design |
| COM-024 | Governance | Technical Design Authority (technical design authority) approves architecture for every AI system pre-build | Critical | Design |
| COM-025 | Governance | Stage gates: Ideation → Exploration → Pilot → Production with documented entry/exit criteria | Critical | Design |
| COM-026 | Contracts | Data Processing Agreement (DPA) with every processor; Joint Controllership where appropriate | High | Design |
| COM-027 | Contracts | IP ownership of generated artefacts, training data, fine-tunes clarified contractually | Medium | Design |
| COM-028 | Assurance | Internal audit (NAO / organisational AI operating model Internal Audit) plan includes AI controls | Medium | Ops |
| COM-029 | Assurance | Independent assurance / red-team / external testing on at least an annual basis | High | Ops |
| COM-030 | Sustainability | Energy / carbon footprint of inference tracked; routing favours lower-carbon options where quality permits | Low | Ops |

<details><summary>Implementation guidance (expand)</summary>

**COM-001 — UK GDPR & DPA 2018 lawful basis identified, documented per processing activity**
- *Why:* No lawful basis = no lawful processing. ICO will ask first; you must answer in writing.
- *How:* ROPA entry per processing activity. Lawful basis stated. data protection officer review. Linked to data flow diagram.

**COM-002 — DPIA completed and signed off before any production processing of personal data**
- *Why:* DPIA is mandatory under Art. 35 for AI processing of personal data. No DPIA, no go-live.
- *How:* organisational AI operating model DPIA template. data protection officer sign-off. Mitigations tracked. Reviewed annually + on material change.

**COM-003 — Data subject rights workflow: access, rectification, erasure, restriction, portability, objection**
- *Why:* Rights requests have statutory deadlines (1 month). 'We didn't know how' is not a defence.
- *How:* DSAR intake. Search across blackboard, KG, audit (where lawful). Crypto-shred for erasure. SLA dashboards.

**COM-004 — Right to be forgotten (Art. 17) implementable across all stores within 30 days (matches blueprint commitment)**
- *Why:* Erasure across vector DBs, KGs, blackboards, model fine-tunes, and backups is genuinely hard — must be designed in.
- *How:* Crypto-shred token vault keys → re-identification impossible. Tombstone in KG. Vector re-index. Backup carve-out policy.

**COM-005 — Art. 22 — solely automated decisions with legal/significant effect flagged; human review path provided**
- *Why:* Art. 22 is the regulatory teeth for AI decisions. Misclassifying a use case is a compliance gap.
- *How:* Per use case: classified as Art. 22 or not. Where Art. 22 applies: meaningful human review, contestability, explanation.

**COM-006 — International transfers documented; transfer mechanism in place (adequacy / SCCs / BCRs); TIA done**
- *Why:* Routing inference to a non-UK region can be an unlawful transfer. UK inference constraint exists for a reason.
- *How:* Bedrock UK regions enforced. SCCs + TIA if any non-UK processor. ROPA reflects transfers.

**COM-007 — Records of Processing Activities (ROPA) maintained per Art. 30**
- *Why:* ROPA is the documentary backbone for every other GDPR control. The ICO asks for it.
- *How:* organisational AI operating model ROPA template per use case. Owners. Annual review. Linked to DPIA + data flows.

**COM-008 — 72-hour breach notification process to ICO; data subject notification process for high-risk breaches**
- *Why:* Statutory deadline. Late notification is its own breach.
- *How:* IR runbook includes ICO notification path + template. Tabletop exercised. Contact details current.

**COM-009 — AI Act risk classification per use case (Prohibited / High / Limited / Minimal)**
- *Why:* Classification dictates obligations. Misclassification = unlawful deployment if EU market is touched.
- *How:* Risk assessment per use case. Documented rationale. Reviewed annually. data protection officer + Legal sign-off.

**COM-010 — If High-Risk: technical documentation per Annex IV maintained**
- *Why:* Annex IV technical file is the AI Act equivalent of the GDPR DPIA — large, detailed, mandatory.
- *How:* Template covering: system purpose, design, data, training, validation, accuracy, human oversight, risk management.

**COM-011 — GPAI transparency obligations met where Bedrock / Claude usage triggers them**
- *Why:* Even consumers of GPAI carry obligations. Don't assume the provider absorbs all of them.
- *How:* Model documentation referenced. Output labelling where required. Disclosure to users where mandated.

**COM-012 — Algorithmic Transparency Recording Standard (algorithmic transparency record) record created and published for in-scope systems**
- *Why:* algorithmic transparency record is a public-sector guidance commitment. Public-sector AI use should be on the register.
- *How:* algorithmic transparency record template (Tier 1 + Tier 2). Reviewed before publication. Updated on material change.

**COM-013 — public-sector guidance AI Playbook 10 principles applied — evidence per principle**
- *Why:* The Playbook is the de-facto standard for public-sector guidance AI. Auditors / NAO will check against it.
- *How:* Self-assessment per principle. Evidence linked. Gaps tracked. Reviewed quarterly.

**COM-014 — Equality Impact Assessment completed (Public Sector Equality Duty, Equality Act 2010)**
- *Why:* PSED is a hard legal duty for public bodies. AI systems can have differential impact across protected characteristics.
- *How:* ethical impact assessment per use case. Engage equalities team. Mitigations tracked. Reviewed on material change.

**COM-015 — ISO/IEC 42001 (AI Management System) controls mapped — gap-assessed for certification readiness**
- *Why:* ISO 42001 is becoming the procurement floor. organisational AI operating model contracts increasingly reference it.
- *How:* Map controls. Gap assessment. Roadmap to certification or self-attestation. Linked to existing ISO 27001.

**COM-016 — ISO/IEC 27001 ISMS scope covers AI / agent platform; risks in register**
- *Why:* The AI platform is not outside the ISMS. If it's not in scope, it's not governed.
- *How:* ISMS scope statement updated. AI-specific risks in register. SoA refreshed.

**COM-017 — NIST AI Risk Management Framework (AI RMF 1.0) Govern / Map / Measure / Manage practices applied**
- *Why:* NIST AI RMF is the most actionable framework for AI risk and complements ISO 42001.
- *How:* Govern / Map / Measure / Manage functions documented. Profile per use case. Evidence linked.

**COM-018 — Cyber Essentials Plus certification for the platform; on annual renewal**
- *Why:* CE+ is a baseline for public-sector guidance suppliers and contractually required.
- *How:* CE+ scope. Annual audit. Findings tracked. Lapsed cert blocks deploy.

**COM-019 — AI procurement guidance (Crown Commercial AI Framework) followed for any sub-procurement**
- *Why:* Sub-procurement that bypasses framework is a procurement irregularity, not just an AI risk.
- *How:* Spend Control / DSAT route. AI framework references. Supplier due diligence per CCS.

**COM-020 — Supplier risk assessments (SOC 2 Type II / ISO 27001) for every third-party AI / data processor**
- *Why:* Third-party risk is your risk under GDPR. 'Our supplier did it' is not a defence.
- *How:* Annual supplier reviews. SOC 2 reports filed. Contract clauses (DPA, security addendum). Exit plan documented.

**COM-021 — Records retention schedule applied — audit (>=7yr), logs (per data class), backups (per RTO/RPO)**
- *Why:* Over-retention is a GDPR breach; under-retention is a records-management breach. Schedules resolve the conflict.
- *How:* Schedule documented per data class. Lifecycle rules in S3. Reviewed by Information Asset Owner.

**COM-022 — Freedom of Information Act 2000 considerations — what the public could request and what could be released**
- *Why:* FOI applies to organisational AI operating model. Algorithm logic, training data, prompts can all be in scope.
- *How:* FOI register entry. Liaise with FOI team. Pre-redaction guidance for AI artefacts.

**COM-023 — AI Steering Group / Ethics Board reviews each use case before pilot and before prod**
- *Why:* Governance after deployment is post-mortem. It must precede go-live.
- *How:* Charter. Membership. Cadence. Required submission pack. Decision log.

**COM-024 — Technical Design Authority (technical design authority) approves architecture for every AI system pre-build**
- *Why:* technical design authority is the technical gate. Without it, every team invents its own (often flawed) architecture.
- *How:* technical design authority charter. Required artefacts. Decision authority. Linked to Cognizant AI-powered Architecture Governance work.

**COM-025 — Stage gates: Ideation → Exploration → Pilot → Production with documented entry/exit criteria**
- *Why:* Promotion-by-momentum is how unsafe systems reach production.
- *How:* Stage gate template. Criteria per stage. Sign-off documented. Audit trail.

**COM-026 — Data Processing Agreement (DPA) with every processor; Joint Controllership where appropriate**
- *Why:* Controller-processor relationship governs liability. Get it wrong and you take liability you don't intend.
- *How:* DPA template per organisational AI operating model Legal. Roles documented. SCCs annexed where transfers. Reviewed annually.

**COM-027 — IP ownership of generated artefacts, training data, fine-tunes clarified contractually**
- *Why:* IP ambiguity in AI artefacts is a future dispute. Resolve in writing.
- *How:* Contract clauses. Crown ownership of outputs unless explicitly otherwise. Reviewed by organisational AI operating model Legal.

**COM-028 — Internal audit (NAO / organisational AI operating model Internal Audit) plan includes AI controls**
- *Why:* If AI is out of the audit plan, AI controls effectiveness is unverified.
- *How:* Coordinate with Internal Audit. Provide artefact register. Address findings.

**COM-029 — Independent assurance / red-team / external testing on at least an annual basis**
- *Why:* Internal-only testing has blind spots. External eyes find what your team can't see.
- *How:* Annual independent assessment. Findings tracked. Compensating controls or fixes.

**COM-030 — Energy / carbon footprint of inference tracked; routing favours lower-carbon options where quality permits**
- *Why:* public-sector guidance has net-zero commitments. Compute carbon is in scope.
- *How:* AWS Customer Carbon Footprint Tool. Per-use-case carbon estimate. Model selection consider cost+carbon+quality.

</details>

## 12 — Cost & FinOps

Token accounting, per-principal budgets, route bounds, caching, anomaly detection, unit economics.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| FIN-001 | Accounting | Per-call token + cost attribution: input_tokens, output_tokens, model, $ cost emitted as span attribute | Critical | Build |
| FIN-002 | Accounting | Cost dimensions: principal (user/agent), use case, route, model, environment | High | Build |
| FIN-003 | Accounting | Cost-per-task metric defined and tracked per use case (document intelligence use case / compliance use case / fraud-detection use case) | Critical | Design |
| FIN-004 | Budgets | Per-principal daily budget ceiling enforced upstream (auth layer rejects beyond) | Critical | Build |
| FIN-005 | Budgets | max_estimated_cost_usd per run; refusal to start if estimate exceeds | High | Build |
| FIN-006 | Budgets | COST_BUDGET_EXCEEDED is a first-class state edge in the FSM, not a runtime exception | High | Build |
| FIN-007 | Budgets | AWS Budgets with notification at 50% / 80% / 100% per account + per service | High | Ops |
| FIN-008 | Routing | Route-shaped bounds (R_max, D_max, B_max) limit retrieval, depth, branching per route — cap on agent expense | Critical | Build |
| FIN-009 | Routing | Cheaper-model first; escalate to Sonnet only on uncertainty / failed verification (where eval permits) | High | Build |
| FIN-010 | Routing | Prompt-caching enabled where supported (Bedrock prompt caching / Anthropic API) | High | Build |
| FIN-011 | Routing | Output length capped via max_tokens; agents prompted to be concise; long-form behind explicit ask | Medium | Build |
| FIN-012 | Caching | Semantic / exact-match caching of LLM calls where output is deterministic over identical input | Medium | Build |
| FIN-013 | Caching | Retrieval result caching (vector hits, KG queries) where source-of-truth versioning permits | Medium | Build |
| FIN-014 | Reserved capacity | Bedrock Provisioned Throughput vs on-demand decision documented per use case | High | Ops |
| FIN-015 | Reserved capacity | Savings Plans / RIs for steady-state Lambda / compute / RDS | Medium | Ops |
| FIN-016 | Storage | S3 Intelligent-Tiering for audit + blackboard + scratchpad buckets | Medium | Build |
| FIN-017 | Storage | Lifecycle policy: scratchpads / ephemeral blackboard entries deleted after retention window | High | Build |
| FIN-018 | Right-sizing | Lambda memory tuned per function via AWS Lambda Power Tuning | Low | Ops |
| FIN-019 | Right-sizing | OpenSearch / graph database sized to load — not aspirations; auto-scale or rightsize quarterly | Medium | Ops |
| FIN-020 | Anomaly | AWS Cost Anomaly Detection on all linked accounts; alerts to FinOps + service owner | High | Ops |
| FIN-021 | Anomaly | Per-route / per-principal cost anomaly with auto-throttle on >3σ daily spend | Critical | Build |
| FIN-022 | Reporting | Monthly FinOps report per use case: cost, cost-per-task trend, top contributors, anomalies, savings actions | Medium | Ops |
| FIN-023 | Reporting | Unit economics dashboard: $ / task vs business value per task — drives go/no-go on use cases | High | Ops |
| FIN-024 | Decom | Idle resources reaped: old endpoints, orphaned KMS keys, unattached EBS, stale Bedrock PT, dev sandboxes | Medium | Ops |
| FIN-025 | Decom | Decommissioning plan per AI system; sunset criteria defined (cost, usage, value) | Low | Ops |

<details><summary>Implementation guidance (expand)</summary>

**FIN-001 — Per-call token + cost attribution: input_tokens, output_tokens, model, $ cost emitted as span attribute**
- *Why:* If you don't measure cost at the unit-of-work level, you can't manage it. Aggregates hide outliers.
- *How:* LLM SDK wrapper emits cost per call. Attach to OTel span. Roll up via metrics pipeline.

**FIN-002 — Cost dimensions: principal (user/agent), use case, route, model, environment**
- *Why:* Without dimensions you can see total cost but never the which-or-why. The dimensions ARE the answer.
- *How:* Tag every call. Standard tagging schema. Cost & Usage Report sliced on these dimensions.

**FIN-003 — Cost-per-task metric defined and tracked per use case (document intelligence use case / compliance use case / fraud-detection use case)**
- *Why:* Cost-per-task is the unit economic. Without it the business case is unverifiable.
- *How:* Define 'task' per use case. Aggregate cost. Trend. Compare against business-case baseline.

**FIN-004 — Per-principal daily budget ceiling enforced upstream (auth layer rejects beyond)**
- *Why:* Budgets that detect overspend after-the-fact don't prevent it. Enforcement must be at the gate.
- *How:* Budget service. Bedrock call interceptor consults remaining budget. Reject (COST_BUDGET_EXCEEDED) on breach.

**FIN-005 — max_estimated_cost_usd per run; refusal to start if estimate exceeds**
- *Why:* Some agent runs are knowably-expensive before they start (deep research, long horizons). Estimate up front, refuse if over.
- *How:* Pre-flight estimator from route + bounds. Hard cap per run. Override only with explicit approval flag.

**FIN-006 — COST_BUDGET_EXCEEDED is a first-class state edge in the FSM, not a runtime exception**
- *Why:* If overrun is an exception, it's an outage. If it's a state, it's a graceful degrade.
- *How:* State machine includes BUDGET_EXCEEDED transition. Returns partial result + notice. Audited.

**FIN-007 — AWS Budgets with notification at 50% / 80% / 100% per account + per service**
- *Why:* Bedrock and Lambda are the usual cost surprises. Notifications surface them early.
- *How:* AWS Budgets per account. Notifications to FinOps + service owner. Reviewed monthly.

**FIN-008 — Route-shaped bounds (R_max, D_max, B_max) limit retrieval, depth, branching per route — cap on agent expense**
- *Why:* An agent with unbounded retrieval depth is an agent with unbounded cost. Bounds are the cost contract.
- *How:* Bounds per route in route config. Enforced in orchestrator. Logged. Exceptions audited.

**FIN-009 — Cheaper-model first; escalate to Sonnet only on uncertainty / failed verification (where eval permits)**
- *Why:* 80% of calls don't need the largest model. Default-to-best is the path to a budget blow-out.
- *How:* Where eval shows Haiku / smaller variants meet bar: route there first. Escalate to Sonnet on verifier disagreement.

**FIN-010 — Prompt-caching enabled where supported (Bedrock prompt caching / Anthropic API)**
- *Why:* Repeated system prompts and tool catalogues are 80%+ of input tokens — caching them is the easiest win.
- *How:* Enable prompt caching. Mark cache breakpoints in template. Measure cache-hit rate.

**FIN-011 — Output length capped via max_tokens; agents prompted to be concise; long-form behind explicit ask**
- *Why:* Output tokens are the expensive direction. Verbose-by-default doubles cost vs concise-by-default.
- *How:* max_tokens set per route. Style guide enforces concision. Long outputs need a 'long_form=true' route flag.

**FIN-012 — Semantic / exact-match caching of LLM calls where output is deterministic over identical input**
- *Why:* The same question asked twice should not cost twice. Cache hit is free.
- *How:* Redis cache keyed on (prompt_hash, tools_hash, model). TTL per route. Cache-hit metric tracked.

**FIN-013 — Retrieval result caching (vector hits, KG queries) where source-of-truth versioning permits**
- *Why:* Embedding lookups and graph traversals add up; cache when source data hasn't changed.
- *How:* Cache key includes index version + query hash. TTL aligned with index refresh cadence.

**FIN-014 — Bedrock Provisioned Throughput vs on-demand decision documented per use case**
- *Why:* PT is cheaper at sustained high volume; on-demand wins for bursty/exploratory. The wrong choice doubles spend.
- *How:* Capacity plan per use case. Break-even analysis. Re-evaluate quarterly.

**FIN-015 — Savings Plans / RIs for steady-state Lambda / compute / RDS**
- *Why:* Steady-state on-demand is leaving 30-72% on the table.
- *How:* Compute Savings Plans for predictable Lambda baseline. RIs for RDS. Annual review.

**FIN-016 — S3 Intelligent-Tiering for audit + blackboard + scratchpad buckets**
- *Why:* Audit data must persist for years but is rarely read after the first 30 days — tiering is essentially free savings.
- *How:* Lifecycle rule: Intelligent-Tiering from day 0. Or rule to Glacier IR after 90 days. Cost dashboard.

**FIN-017 — Lifecycle policy: scratchpads / ephemeral blackboard entries deleted after retention window**
- *Why:* Forever-retained intermediates inflate storage + risk + audit scope.
- *How:* Lifecycle rules per prefix. Scratch: 7 days. Blackboard envelopes: 30 days. Final artefacts: 7 years.

**FIN-018 — Lambda memory tuned per function via AWS Lambda Power Tuning**
- *Why:* Default Lambda memory is rarely the cost-optimal setting; over- and under-provisioning both waste money.
- *How:* Power Tuning state machine on each Lambda. Memory set to lowest-cost balance. Re-tune on code change.

**FIN-019 — OpenSearch / graph database sized to load — not aspirations; auto-scale or rightsize quarterly**
- *Why:* Over-provisioned graph / vector clusters silently absorb a sizable share of monthly spend.
- *How:* Capacity dashboard. Quarterly review. Auto-scale where supported.

**FIN-020 — AWS Cost Anomaly Detection on all linked accounts; alerts to FinOps + service owner**
- *Why:* A runaway can burn weeks of budget in a day. Anomaly detection is the safety net.
- *How:* CAD monitors per service + per account. Threshold-based notifications.

**FIN-021 — Per-route / per-principal cost anomaly with auto-throttle on >3σ daily spend**
- *Why:* AWS Cost Anomaly is account-level. You need agent-level anomaly with automatic action.
- *How:* CloudWatch anomaly on per-route cost metric. Alarm triggers throttle (rate limit on auth layer).

**FIN-022 — Monthly FinOps report per use case: cost, cost-per-task trend, top contributors, anomalies, savings actions**
- *Why:* Without a regular review cadence, cost discussions only happen after a blow-out.
- *How:* Automated report from Cost & Usage Report. Reviewed in FinOps lead. Actions tracked.

**FIN-023 — Unit economics dashboard: $ / task vs business value per task — drives go/no-go on use cases**
- *Why:* Cost without value is meaningless. The unit economic ratio is the real question.
- *How:* Per use case: $ / task and value / task tracked. Linked to business case. Reviewed by steering group.

**FIN-024 — Idle resources reaped: old endpoints, orphaned KMS keys, unattached EBS, stale Bedrock PT, dev sandboxes**
- *Why:* Idle resource sprawl is the long-tail of cloud bills. Reaping is the highest ROI FinOps action.
- *How:* Tagging-based reaper. Weekly sweep. Owner-notify-then-delete. Exception list.

**FIN-025 — Decommissioning plan per AI system; sunset criteria defined (cost, usage, value)**
- *Why:* Systems that should be retired but aren't accrue cost and risk indefinitely.
- *How:* Sunset criteria in use-case business case. Annual review of low-usage systems. Documented decommission.

</details>

## 13 — Failure Modes Catalogue

Institutional memory of what NOT to do, drawn from architecture lessons doc §11 and real-world agent post-mortems.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| FAIL-001 | IG2 / Guardrails | Silent fail-open IG2: rubric-override guardrail returns 'no violation' on parse error | Critical | Build |
| FAIL-002 | Tool Calls | Unbounded ToolCallIntent.rationale field swallows context window and leaks PII | High | Build |
| FAIL-003 | Configuration | ConfigurationSnapshot captured but never persisted — replay impossible | High | Build |
| FAIL-004 | Token Vault | Token vault entries expiring before audit retention period — re-identification needed but impossible | Critical | Build |
| FAIL-005 | Bi-temporal | Precedent store missing valid_from / valid_to — silent reuse of stale precedent | High | Build |
| FAIL-006 | Provenance | LLM emits provenance / system-metadata strings that downstream code trusts | Critical | Build |
| FAIL-007 | Sanitiser | Re-identifier trusts token-swap as the whole egress check — bypasses content scan | Critical | Build |
| FAIL-008 | Async bus | Async event bus carries full BriefBundle payload — context window blows up on consumer | High | Build |
| FAIL-009 | Bi-temporal | NULL valid_to in precedent / KG record breaks bi-temporal query semantics | Medium | Build |
| FAIL-010 | Counters | Conflating semantic-contention counter with infrastructural-contention counter (fss_contention_counter) | Medium | Build |
| FAIL-011 | Memory eviction | No eviction policy on per-field TokenBudget — context window fills with stale defect history | High | Build |
| FAIL-012 | Memory eviction | Summarise-then-spawn fails: parent doesn't summarise, sub-agent inherits full context | High | Build |
| FAIL-013 | Retrieval | Vector chunking over structured documents (forms, tables) loses semantic boundaries | High | Build |
| FAIL-014 | Retrieval | Multiple retrieval choke points — agents bypass governance by calling vector DB directly | Critical | Build |
| FAIL-015 | Retrieval | tool-confusion attack pattern: retrieval returns a doc whose content overrides the system prompt | Critical | Build |
| FAIL-016 | Retrieval | RAG-poisoning attack pattern: malicious KG triples introduced via ingestion contaminate downstream agents | High | Build |
| FAIL-017 | Orchestration | Rediscovery circuit breaker disabled or set too permissive (default 6) — agents loop forever | High | Build |
| FAIL-018 | Orchestration | Verifier becomes a rubber-stamp: agreement rate >95% in benchmark = verifier broken | High | Build |
| FAIL-019 | Orchestration | Specialist takes the Orchestrator's role on context overflow — single-agent fallback | High | Build |
| FAIL-020 | Evaluation | LLM-as-judge with kappa < 0.6 vs human gold — judges that disagree with humans aren't judges | High | Test |
| FAIL-021 | Evaluation | Benchmark covers happy path but no adversarial / edge / failure cases — false confidence | High | Test |
| FAIL-022 | Evaluation | Capability triggers ignored: trajectory eval added to system without trajectories | Medium | Test |
| FAIL-023 | Operational | On-call paged on every quality micro-regression — pager fatigue | Medium | Ops |
| FAIL-024 | Operational | Deploy without canary on a Friday afternoon — classic 'why is on-call paged at 4pm' | Medium | Ops |
| FAIL-025 | Operational | Prompt change merged without eval — quality regression noticed when users complain | High | Build |
| FAIL-026 | Security | MCP server installed without code review — supply chain compromise (CVE-2025-6514 class) | Critical | Build |
| FAIL-027 | Security | Tool catalogue exposed to agent includes destructive tool without dry-run / confirmation | Critical | Build |
| FAIL-028 | Security | JIT credentials via TVM not enforced — long-lived tokens persist in agent memory | High | Build |
| FAIL-029 | Compliance | DPIA done, mitigations identified, but mitigations never actually implemented in the system | Critical | Design |
| FAIL-030 | Compliance | algorithmic transparency record / Model Card published but stale — system has changed materially since publication | Medium | Ops |
| FAIL-031 | Process | Use case promoted to production without technical design authority sign-off — architecture invented in haste | Critical | Design |
| FAIL-032 | Process | Smoke set used as benchmark — 30 cases is a smoke test, not a benchmark | High | Test |

<details><summary>Implementation guidance (expand)</summary>

**FAIL-001 — Silent fail-open IG2: rubric-override guardrail returns 'no violation' on parse error**
- *Why:* If IG2 fails open silently, a single malformed response disables the rubric override defence for an entire run.
- *How:* IG2 parser MUST fail closed: on parse error, block + emit GUARDRAIL_PARSE_ERROR. Alert + audit.

**FAIL-002 — Unbounded ToolCallIntent.rationale field swallows context window and leaks PII**
- *Why:* Free-text rationale fields are where models stuff every variable in scope — including secrets and PII.
- *How:* Bounded length on rationale. Sanitiser passes rationale through PII / token-vault scan. Reject on hit.

**FAIL-003 — ConfigurationSnapshot captured but never persisted — replay impossible**
- *Why:* A snapshot in memory that doesn't reach durable storage is no snapshot at all.
- *How:* Persist immediately at run start. Verify-on-write. Replay harness reads from durable store, not memory.

**FAIL-004 — Token vault entries expiring before audit retention period — re-identification needed but impossible**
- *Why:* If the vault expires keys before the audit horizon, you have audit logs you can't re-identify even with cause.
- *How:* Vault retention >= audit retention. Coordinated lifecycle. Crypto-shred is the deliberate erasure path, not expiry.

**FAIL-005 — Precedent store missing valid_from / valid_to — silent reuse of stale precedent**
- *Why:* A precedent that was right yesterday and wrong today will be silently reused if its temporal validity isn't tracked.
- *How:* Every precedent record has effective_timestamp + valid_from + valid_to. Queries respect them. Tested.

**FAIL-006 — LLM emits provenance / system-metadata strings that downstream code trusts**
- *Why:* LLM-generated 'this is from source X' strings are wishes, not facts. Trusting them is a known exploit path (tool-confusion attack pattern).
- *How:* System-derived URIs only. KMS-signed HMAC tags. Reject any LLM-emitted provenance claim.

**FAIL-007 — Re-identifier trusts token-swap as the whole egress check — bypasses content scan**
- *Why:* Swapping tokens isn't the same as scanning content. Anything that isn't tokenised passes through.
- *How:* Egress DLP scan in addition to token-swap. Two-layer check. Alert on residual PII.

**FAIL-008 — Async event bus carries full BriefBundle payload — context window blows up on consumer**
- *Why:* Bundles on the bus produce duplication, race conditions, and unbounded message sizes.
- *How:* Claim-check pattern: state in FSS / S3, envelopes on bus carry pointer + minimal metadata.

**FAIL-009 — NULL valid_to in precedent / KG record breaks bi-temporal query semantics**
- *Why:* NULL is silently equal-to-nothing in many query engines — meaning queries return zero or all, neither is right.
- *How:* NOT NULL constraint. 'Open-ended' represented as far-future timestamp (e.g. 9999-12-31). Tested.

**FAIL-010 — Conflating semantic-contention counter with infrastructural-contention counter (fss_contention_counter)**
- *Why:* They have different default thresholds (6 vs 3) and tripping the wrong one is wrong escalation.
- *How:* Separate counter classes. Distinct names. Distinct alarms. Documented in runbook.

**FAIL-011 — No eviction policy on per-field TokenBudget — context window fills with stale defect history**
- *Why:* Without FIFO eviction, history grows unbounded and pushes critical current context out of the window.
- *How:* FIFO eviction at 3 reports (~500 tokens) for defect history. Configurable per field. Audit on eviction.

**FAIL-012 — Summarise-then-spawn fails: parent doesn't summarise, sub-agent inherits full context**
- *Why:* If sub-agents inherit full context, every spawn doubles cost and breaks token budgets.
- *How:* Spawn API requires explicit BriefBundle. Reject spawn missing summary. Test on every PR.

**FAIL-013 — Vector chunking over structured documents (forms, tables) loses semantic boundaries**
- *Why:* A table chunked by token count is a table that no longer answers questions about itself.
- *How:* Structured docs: extract to schema. Don't chunk. RAG-over-structured uses field retrieval, not similarity.

**FAIL-014 — Multiple retrieval choke points — agents bypass governance by calling vector DB directly**
- *Why:* If there's more than one path to the vector DB, governance lives on the path the agents don't use.
- *How:* Single retrieval API. Network policy blocks direct vector DB access from agent subnet. Audit confirms.

**FAIL-015 — tool-confusion attack pattern: retrieval returns a doc whose content overrides the system prompt**
- *Why:* If retrieved content can issue instructions that the model follows, retrieval is now arbitrary code execution.
- *How:* System prompt asserts retrieval is data not instructions. IG3 guardrail. Adversarial eval set includes tool-confusion attack pattern.

**FAIL-016 — RAG-poisoning attack pattern: malicious KG triples introduced via ingestion contaminate downstream agents**
- *Why:* A poisoned triple in a graph is harder to detect than a poisoned chunk in a vector store.
- *How:* Triple provenance + signing. Adversarial eval. Periodic graph integrity check.

**FAIL-017 — Rediscovery circuit breaker disabled or set too permissive (default 6) — agents loop forever**
- *Why:* Without the breaker, an agent rediscovering the same fact in a loop is the most common runaway.
- *How:* Default 6. Per-route override allowed. Tested. Trip increments cost-runaway counter.

**FAIL-018 — Verifier becomes a rubber-stamp: agreement rate >95% in benchmark = verifier broken**
- *Why:* A verifier that never disagrees isn't verifying.
- *How:* Disagreement rate as a metric. Alert if <5% over benchmark. Re-test verifier prompt.

**FAIL-019 — Specialist takes the Orchestrator's role on context overflow — single-agent fallback**
- *Why:* When the Orchestrator's plan exceeds its context, a Specialist may improvise — bypassing all plan-level guardrails.
- *How:* Specialists have no orchestration tools. Plan is data, not instructions. Tested by adversarial eval.

**FAIL-020 — LLM-as-judge with kappa < 0.6 vs human gold — judges that disagree with humans aren't judges**
- *Why:* A judge that doesn't agree with humans is generating noise, not signal. Acting on its scores is acting on noise.
- *How:* Calibration set with human labels. Cohen's kappa >= 0.6 required. Re-calibrate quarterly.

**FAIL-021 — Benchmark covers happy path but no adversarial / edge / failure cases — false confidence**
- *Why:* A 99% benchmark on easy tasks is not 99% on the long tail. Adversarial cases reveal real coverage.
- *How:* Adversarial / edge subset (>=20% of benchmark). Updated as failures surface. Failure cases auto-added.

**FAIL-022 — Capability triggers ignored: trajectory eval added to system without trajectories**
- *Why:* Bolting on metrics meant for other architectures produces nonsense scores that mislead governance.
- *How:* Capability triggers matrix: only enable metrics where the prerequisite capability exists. Documented.

**FAIL-023 — On-call paged on every quality micro-regression — pager fatigue**
- *Why:* Alerting on every blip means the real signal gets missed. Pager noise reduces incident response quality.
- *How:* Sustained-breach alerting (>=5min). Severity tiers. Quarterly alert hygiene review.

**FAIL-024 — Deploy without canary on a Friday afternoon — classic 'why is on-call paged at 4pm'**
- *Why:* High-risk windows for change are well documented. Choose them as a policy decision, not by accident.
- *How:* Deployment freeze windows documented. Friday afternoon + holidays restricted. Override needs approval.

**FAIL-025 — Prompt change merged without eval — quality regression noticed when users complain**
- *Why:* Treating prompts as 'just config' bypasses every quality gate. Prompts ARE code.
- *How:* Prompts versioned in git. PR + eval gate. Same pipeline as code. Documented in playbook.

**FAIL-026 — MCP server installed without code review — supply chain compromise (CVE-2025-6514 class)**
- *Why:* MCP servers run with platform credentials. A compromised server is platform-level compromise.
- *How:* Allow-list MCP servers. Code review + SBOM + signature verification before install. SecOps approval.

**FAIL-027 — Tool catalogue exposed to agent includes destructive tool without dry-run / confirmation**
- *Why:* An agent will eventually call DELETE on the wrong record. Confirmation step is the difference between mistake and disaster.
- *How:* Destructive tools require explicit confirmation or are gated by human-in-loop. No agent-only delete.

**FAIL-028 — JIT credentials via TVM not enforced — long-lived tokens persist in agent memory**
- *Why:* A static token in agent context is exfiltrated by the first prompt injection that asks for it.
- *How:* Token Vending Machine. Per-call scoped credentials. Short TTL (<= 15 min). Verified by audit.

**FAIL-029 — DPIA done, mitigations identified, but mitigations never actually implemented in the system**
- *Why:* DPIA as paperwork rather than design input is a regulator's favourite finding.
- *How:* DPIA mitigations tracked to closure. Linked to backlog items. Closure reviewed by data protection officer.

**FAIL-030 — algorithmic transparency record / Model Card published but stale — system has changed materially since publication**
- *Why:* Transparency artefacts that don't reflect the system are misinformation under a transparency label.
- *How:* Update trigger: material change. Review cadence: 6-monthly. Owner tracked.

**FAIL-031 — Use case promoted to production without technical design authority sign-off — architecture invented in haste**
- *Why:* Promotion-by-momentum is how unsafe systems reach production.
- *How:* Stage gate enforced. technical design authority sign-off mandatory. Audit trail. No-exceptions policy.

**FAIL-032 — Smoke set used as benchmark — 30 cases is a smoke test, not a benchmark**
- *Why:* Smoke = pre-flight. Benchmark = decisional. They serve different purposes. Conflating them gives false confidence.
- *How:* Smoke set ~30 (pre-PR). Benchmark N>=300 (release gate). Documented and distinct.

</details>

## 14 — Production Readiness Gate

The go/no-go pack. All Critical items closed, sign-offs collected, rollback + kill-switch tested.

| ID | Category | Control | Priority | Phase |
|---|---|---|---|---|
| GATE-001 | Strategy | Use case has a documented business case with measurable success metrics | Critical | Design |
| GATE-002 | Strategy | Senior Responsible Owner identified and engaged; sign-off recorded | Critical | Design |
| GATE-003 | Eval | Benchmark N>=300 with documented thresholds met: faithfulness >= 0.85, ECE <= 0.10 | Critical | Test |
| GATE-004 | Eval | Adversarial / red-team eval passed: no Critical findings open | Critical | Test |
| GATE-005 | Eval | Capability-trigger matrix applied: evals are appropriate for the system's architecture | High | Test |
| GATE-006 | Eval | Online quality monitoring + drift detection live; alerts route to on-call | High | Ops |
| GATE-007 | Security | CISO / SecOps sign-off: pen test passed, residual risks accepted in writing | Critical | Test |
| GATE-008 | Security | All Critical and High security findings resolved or risk-accepted with documented mitigation | Critical | Test |
| GATE-009 | Security | Token vault, sanitiser contract, IG1/IG2/IG3 guardrails enabled and tested end-to-end | Critical | Test |
| GATE-010 | Compliance | data protection officer sign-off: DPIA complete, mitigations implemented, lawful basis recorded | Critical | Design |
| GATE-011 | Compliance | DSAR / RTBF / Art. 22 workflows tested end-to-end against this system | Critical | Test |
| GATE-012 | Compliance | algorithmic transparency record published; Model Card up-to-date; ethical impact assessment + AI-Act risk class recorded | High | Design |
| GATE-013 | Compliance | technical design authority approval of architecture; AI Ethics / Steering Group endorsement | Critical | Design |
| GATE-014 | Ops | Runbooks complete, rehearsed in game day, linked from alerts | Critical | Ops |
| GATE-015 | Ops | On-call rotation active, pager tested, escalation policy documented | Critical | Ops |
| GATE-016 | Ops | DR exercise completed within last 12 months; RPO / RTO met | High | Ops |
| GATE-017 | Ops | Rollback tested in staging environment with production-equivalent data shape | Critical | Test |
| GATE-018 | Ops | Kill switch / feature flag tested; off-state behaviour documented and acceptable | Critical | Test |
| GATE-019 | FinOps | Cost-per-task within business-case budget; per-principal daily caps enforced | Critical | Ops |
| GATE-020 | FinOps | Cost-anomaly auto-throttle wired and tested | High | Test |
| GATE-021 | UX | Transparency to users: clear AI-disclosure, contestability path, route to human review | Critical | Design |
| GATE-022 | UX | Accessibility (WCAG 2.2 AA) tested on any user-facing interface | High | Test |
| GATE-023 | Docs | Architecture diagram, data-flow diagram, decision records, runbooks all current and linked from gate pack | High | Design |
| GATE-024 | Docs | ConfigurationSnapshot captured for the production release; replay tested | High | Build |
| GATE-025 | Decision | Go/no-go meeting with all sign-offs collected; decision recorded with rationale and conditions | Critical | Design |
| GATE-026 | Decision | Hyper-care plan: enhanced monitoring + on-call presence for first 2 weeks post-launch | High | Ops |
| GATE-027 | Decision | Post-launch review at 30 / 60 / 90 days against business-case metrics; sunset trigger documented | Medium | Ops |

<details><summary>Implementation guidance (expand)</summary>

**GATE-001 — Use case has a documented business case with measurable success metrics**
- *Why:* A system going to production without an objective measure of success is a system without a stop-condition.
- *How:* Business case signed off by senior responsible owner. Success metrics in the gate pack. Baseline measured.

**GATE-002 — Senior Responsible Owner identified and engaged; sign-off recorded**
- *Why:* senior responsible owner is the accountable role. No senior responsible owner sign-off, no production deployment.
- *How:* senior responsible owner named in business case. Sign-off captured. Stand-in named for continuity.

**GATE-003 — Benchmark N>=300 with documented thresholds met: faithfulness >= 0.85, ECE <= 0.10**
- *Why:* Quality thresholds set the floor for go-live. Without them, 'good enough' is a moving target.
- *How:* Benchmark run on candidate build. Results in gate pack. Threshold breaches block.

**GATE-004 — Adversarial / red-team eval passed: no Critical findings open**
- *Why:* Adversarial misses are how the system breaks in the wild — they must be closed before go-live.
- *How:* Red-team report. Findings tracked. Critical closed before gate. High mitigated or accepted.

**GATE-005 — Capability-trigger matrix applied: evals are appropriate for the system's architecture**
- *Why:* Inappropriate evals give false-positive sign-off.
- *How:* Matrix in gate pack. Justification per included / excluded metric.

**GATE-006 — Online quality monitoring + drift detection live; alerts route to on-call**
- *Why:* Offline gates are point-in-time; production quality must be observed continuously.
- *How:* Online judge sampled. Drift alarms wired. On-call tested.

**GATE-007 — CISO / SecOps sign-off: pen test passed, residual risks accepted in writing**
- *Why:* Security sign-off is non-delegable. The CISO bears the accountability.
- *How:* Pen test report. Residual risk register. CISO signature in gate pack.

**GATE-008 — All Critical and High security findings resolved or risk-accepted with documented mitigation**
- *Why:* Open Critical/High at go-live is a known-vulnerable system in production.
- *How:* Security findings tracker. Closed / accepted with mitigation. Reviewed in gate.

**GATE-009 — Token vault, sanitiser contract, IG1/IG2/IG3 guardrails enabled and tested end-to-end**
- *Why:* If the privacy + safety floor isn't on, the system isn't ready.
- *How:* E2E test of guardrail chain. Audit trail. Sanitiser eval set passed.

**GATE-010 — data protection officer sign-off: DPIA complete, mitigations implemented, lawful basis recorded**
- *Why:* No data protection officer sign-off = unlawful processing risk.
- *How:* DPIA + mitigations + signature in gate pack.

**GATE-011 — DSAR / RTBF / Art. 22 workflows tested end-to-end against this system**
- *Why:* If statutory rights workflows don't work for this system, you're one DSAR away from a regulator visit.
- *How:* Test cases per right. Evidence in gate pack. Owner of run-the-test named.

**GATE-012 — algorithmic transparency record published; Model Card up-to-date; ethical impact assessment + AI-Act risk class recorded**
- *Why:* Transparency artefacts are part of the go-live contract.
- *How:* Links to live algorithmic transparency record / Model Card / ethical impact assessment in gate pack.

**GATE-013 — technical design authority approval of architecture; AI Ethics / Steering Group endorsement**
- *Why:* Governance bodies must have reviewed and endorsed the design before it goes to users.
- *How:* Decision records. Sign-offs in gate pack.

**GATE-014 — Runbooks complete, rehearsed in game day, linked from alerts**
- *Why:* Runbooks that haven't been rehearsed don't survive contact with a real incident.
- *How:* Runbook per alert. Game day completed. Issues raised + closed.

**GATE-015 — On-call rotation active, pager tested, escalation policy documented**
- *Why:* A platform without an on-call is a platform that's offline overnight.
- *How:* Rotation in on-call platform / on-call platform. Test page completed. Escalation tree.

**GATE-016 — DR exercise completed within last 12 months; RPO / RTO met**
- *Why:* Untested DR is undefined DR.
- *How:* DR exercise report. RPO / RTO actual vs target. Gaps tracked.

**GATE-017 — Rollback tested in staging environment with production-equivalent data shape**
- *Why:* A rollback you've never run is a wish, not a control.
- *How:* Documented test. Rollback time recorded. Communicated to on-call.

**GATE-018 — Kill switch / feature flag tested; off-state behaviour documented and acceptable**
- *Why:* The off-state is the safety net. It must be known to work and known to be safe.
- *How:* Kill-switch test in staging + production canary. Off-state UX documented.

**GATE-019 — Cost-per-task within business-case budget; per-principal daily caps enforced**
- *Why:* A system that bursts past its budget on day one undermines the business case.
- *How:* Cost-per-task measured. Caps live. FinOps lead sign-off.

**GATE-020 — Cost-anomaly auto-throttle wired and tested**
- *Why:* The cost circuit-breaker must be proven to fire before it's needed.
- *How:* Throttle test in staging. Alarm verified. Documented in runbook.

**GATE-021 — Transparency to users: clear AI-disclosure, contestability path, route to human review**
- *Why:* Users must know they're interacting with AI and how to challenge an outcome. Hidden AI is a trust killer.
- *How:* UI patterns reviewed. Test users confirm. Contestability route ticketed.

**GATE-022 — Accessibility (WCAG 2.2 AA) tested on any user-facing interface**
- *Why:* Public-sector services have a legal accessibility duty. AI interfaces are no exception.
- *How:* WCAG 2.2 AA audit. Findings closed. Accessibility statement published.

**GATE-023 — Architecture diagram, data-flow diagram, decision records, runbooks all current and linked from gate pack**
- *Why:* Documentation that doesn't reflect the running system is misinformation.
- *How:* Doc index in gate pack. Each item dated within last 30 days or marked 'still current'.

**GATE-024 — ConfigurationSnapshot captured for the production release; replay tested**
- *Why:* Without a snapshot, an audit question about the system 6 weeks from now is unanswerable.
- *How:* Snapshot stored in audit S3. Replay harness run against it. Evidence in gate pack.

**GATE-025 — Go/no-go meeting with all sign-offs collected; decision recorded with rationale and conditions**
- *Why:* The gate is a decision, not a checklist completion. Recording it makes it accountable.
- *How:* Gate meeting minutes. Decision recorded. Conditions tracked to closure.

**GATE-026 — Hyper-care plan: enhanced monitoring + on-call presence for first 2 weeks post-launch**
- *Why:* The launch period has the highest incident rate. Hyper-care catches what passes the gate.
- *How:* Hyper-care window defined. Enhanced alerting. Daily standup. Exit criteria documented.

**GATE-027 — Post-launch review at 30 / 60 / 90 days against business-case metrics; sunset trigger documented**
- *Why:* A system that doesn't deliver against its case should be sunset, not allowed to drift.
- *How:* Post-launch reviews scheduled. Metric thresholds for continue / pivot / stop. Decision authority.

</details>
