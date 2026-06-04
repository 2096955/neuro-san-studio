# Neuro-SAN Studio Frontend – Design Notes

**Purpose:** Trust and RAI monitoring UI for agentic systems: RAI dashboard, guardrails, policies, multi-agent accelerator, and chat with agent networks.

**Tone:** Professional, clear, and data-dense without clutter. Blue/slate palette for primary UI; purple reserved as a semantic accent for "Coded Tool" nodes in graph visualizations. No purple gradients in backgrounds. Outfit for UI typography (avoids Inter).

**Constraints:** React 19 + Vite + Tailwind; WCAG AA contrast; keyboard nav and visible focus; single API base URL from `src/config/api.ts`.

**Signature:** Blue/slate theme, RAI sidebar with light-blue gradient (not purple), React Flow for multi-agent topology, and consistent error + retry patterns (no mocks in production paths).

**Per-route titles:** Set in `App.tsx` via `ROUTE_TITLES`; default app title in `index.html` is "Neuro-SAN Studio".

**Design tokens:** Theme colors live in `src/index.css` (`@theme` / `--color-*`). Prefer Tailwind semantic classes (`bg-primary`, `text-foreground`) or `var(--color-primary)` in MUI `sx` over hardcoded hex. ChatBox and TrustLayerConsole should migrate remaining hex values to these variables for consistency.

**Test IDs:** Key interactive areas use `data-testid` for Playwright: `chatbox`, `chat-input`, `chat-send`, `chat-messages`, `trust-generate-evidence-pack`, `topology-graph`.
