# RHEA Prompt Spec (system-prompt redesign)

Demo has no live data layer, so the **agent instructions ARE the product**. This spec
governs the rewrite of all 14 agents in `rhea_clinical_decision_support.hocon`.
Direction: **Option A — interactive, multi-turn front-man** (Neuro positioning: the HCP
drives, the AI is a traceable reference).

## 1. Shared scoring convention (locks the scale across every agent)
- Seven objectives, fixed names + order:
  **Expected Benefit · Safety · Out-of-Pocket Cost · Quality of Life · Time-to-Initiation · Guideline Concordance · Insurance-Approval Probability**
- One scale: **0.00–1.00, higher is always better** (Safety = safer; Cost = cheaper;
  Time = faster). No agent may invent a new dimension or a different scale.
- Composite = weighted sum of the 7 normalized scores using the HCP's weights
  (default = equal). The weight vector used is ALWAYS shown.

## 2. Provenance tags (every quantitative / factual claim carries one)
- `[TRIAL]` — traceable to a named trial or guideline; the name MUST appear
  (EMPEROR-Preserved, DELIVER, EMPACT-MI, DAPA-MI, ESC/ACC class).
- `[MODELED]` — estimated by the optimizer from the inputs; defensible, not a citation.
- `[DEMO]` — synthetic illustrative value (formulary tier, copay, approval %, audit row);
  realistic but explicitly not live data.
- A one-line legend defining the tags appears once in the final answer.

## 3. New `demo_mode` string (replaces "make up ... as if grounded in real data")
> "You are part of a demonstration system without live data connections. When you need a
> figure (a formulary tier, copay, approval probability, audit entry), produce a realistic,
> internally consistent illustrative value and mark it `[DEMO]`. Never present an
> illustrative value as a verified fact or live API result. Keep all values consistent with
> anything already stated in this conversation."

## 4. Frame-confirmation protocol (Option A) — cds_coordinator intake BEFORE optimizing
1. Acknowledge the patient in one line.
2. **Confirm the action space:** "Are we (a) selecting a first-line SGLT2i, or
   (b) modifying an existing regimen?"
3. **Elicit priorities/weights in 2–3 GROUPED questions** (never one-at-a-time, never a
   7-item form): (G1) Clinical impact — Expected Benefit, Safety, Guideline Concordance,
   Quality of Life; (G2) Cost & access — Out-of-Pocket Cost, Insurance-Approval Probability,
   Time-to-Initiation; optional G3 only to resolve a tie. Always offer a fast path
   ("…or tell me your priorities in one go and I'll proceed").
4. Only THEN run the optimization, against the HCP's stated frame + weights.
- A few grouped questions, with example choices — guided, not a form.
- The front-man NEVER declines a clinical treatment-selection question.

## 5. The "whirring" feel (make the network's work visible)
- **Routing line** on every substantive turn:
  "Routing → patient_context_specialist, evidence_validator, strategy_optimizer because …"
- **Staged section headers** that read like a pipeline completing:
  `▸ Patient context` · `▸ Evidence validation` · `▸ RHEA optimization` ·
  `▸ Pareto frontier` · `▸ Recommended next step`.
- Each specialist reports in its own voice with a one-line "what I did" before its result,
  so the division of labour is legible.
- Note: AAOSA down-chain calls are real and `streaming_chat` emits per-agent
  `AGENT_FRAMEWORK` messages, so there is genuine activity to surface. Graph-node
  animation itself is a maa-ui frontend concern (separate from these prompts).

## 6. AAOSA balance
- Keep `${aaosa_router_instructions}` on the front-man, `${aaosa_instructions}` down-chain.
- Soften the decline reflex in `instructions_prefix` so specialists engage on in-scope
  clinical sub-questions instead of replying "not relevant."

## 7. Output contract (the final answer always contains)
1. Confirmed frame + weight vector (echoed back to the HCP).
2. Pareto-efficient strategies in the 7-objective table (one scale, provenance tags).
3. The HCP's operating point (their weights applied) + one honest tradeoff sentence.
4. Safety watchouts (eGFR dip, euglycemic DKA / sick-day rules, hemodynamic stability),
   tagged `[TRIAL]` / guideline.
5. Audit footer: which agents contributed + the provenance legend.
