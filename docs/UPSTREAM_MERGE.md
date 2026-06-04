# Upstream merge analysis

Dry-run merge of `upstream/main` ([cognizant-ai-lab/neuro-san-studio](https://github.com/cognizant-ai-lab/neuro-san-studio)) into `feat/local-maa-categories` at commit `dc180c03`.

Method: isolated worktree + `git merge upstream/main --no-commit`.

## Summary

| Metric | Value |
|--------|-------|
| Upstream commits since merge-base | ~50 |
| Files changed on upstream | ~697 |
| **Merge conflicts** | **49 paths** |

A full merge is feasible but should be staged — not one shot. Phase 1 work lives on branch `sync/upstream-phase1-0.6.57`.

## Conflict files (49)

### Docs & entrypoints (5)

- `README.md`
- `docs/api_key.md`
- `docs/examples.md`
- `docs/user_guide.md`
- `deploy/entrypoint.sh`

### Fork-only vs upstream-deleted (3)

| File | Conflict type |
|------|----------------|
| `run.py` | modify/delete — upstream removed; fork still uses it |
| `toolbox/toolbox_info.hocon` | modify/delete — upstream moved to `neuro_san_studio/toolbox/` |
| `registries/agent_network_html_creator.hocon` | modify/delete |
| `registries/airline_policy.hocon` | modify/delete — upstream moved to `registries/industry/` |

### Search registry rename (1)

- `registries/ddgs_search.hocon` — **rename/rename**: fork → `registries/web_search.hocon`; upstream → `registries/tools/ddgs_search.hocon`

Also conflicted as content: `registries/web_search.hocon`, `registries/tools/ddgs_search.hocon`

### Manifest (1)

- `registries/manifest.hocon` — fork category tags + AEEN vs upstream grouped includes

### Registries — content conflicts (35)

- `registries/aaosa.hocon`, `registries/aaosa_basic.hocon`
- `registries/agent_network_designer.hocon`
- `registries/basic/*.hocon` (11 files: coffee_finder, hello_world, music_nerd*, smart_home)
- `registries/experimental/six_thinking_hats.hocon`
- `registries/industry/*.hocon` (14 files)
- `registries/tools/agentforce.hocon`, `agentic_rag.hocon`, `now_agents.hocon`, `pdf_rag.hocon`

### Dependencies (1)

- `requirements.txt`

## Fork-only assets (keep in any merge)

Not in upstream — do not drop during merge:

- `deploy/cloud-maa/` — Cloud Run MAA + Gemini + Tavily/Brave + Arize
- `scripts/run-local-maa.sh`
- `coded_tools/aeen/`, `registries/agentic_evidence_exchange.hocon`
- `coded_tools/tavily_search.py`, `registries/web_search.hocon` provider switching
- `docs/lessons/`, `requirements-observability.txt`, `deploy/otel_bootstrap.py`, `evals/`
- Local Ollama / Vertex ADC wiring in run scripts

## Phase 1 (`sync/upstream-phase1-0.6.57`)

Cherry-picked without full merge:

1. **Bump** `neuro-san==0.6.57`, `nsflow==0.6.15`
2. **Import** upstream `web_fetch`, `read_file`, `sly_data_lock` + tests
3. **Register** tools in `neuro_san_studio/toolbox/toolbox_info.hocon` (Phase 2 path; was `toolbox/` pre-Phase 2)
4. **Deps** `leaf-common`, `beautifulsoup4`

## Phase 2 (`sync/upstream-phase2-package`)

Imported upstream installable package without full merge:

1. **`neuro_san_studio/`** — `ns` / `neuro-san-studio` CLI, runner, plugins loader, bundled toolbox + MCP config
2. **Toolbox tools** — live in `neuro_san_studio/coded_tools/`; fork `tavily_search` stays at `coded_tools/tavily_search.py`
3. **`pyproject.toml`** — editable install + entry points (`ns`, `neuro-san-studio`)
4. **Paths** — `AGENT_TOOLBOX_INFO_FILE` → `neuro_san_studio/toolbox/toolbox_info.hocon`
5. **Legacy** — root `run.py` retained (Replit/grpc/cloud-maa customizations); prefer `ns run` for upstream parity

Domain coded tools (`aeen/`, `agent_network_designer/`, etc.) remain under root `coded_tools/` with `AGENT_TOOL_PATH=coded_tools`.

## Recommended merge phases (after Phase 2)

| Phase | Scope |
|-------|--------|
| ~~3~~ | ~~Phoenix/Langfuse plugins — reconcile with Arize~~ → **done** (Phase 3) |
| 4 | Registry/manifest regrouping — preserve fork tags + AEEN |
| 5 | Upstream `brave_search` diff vs fork implementation |

## Phase 3 (`sync/upstream-phase3-observability`)

Reconciled upstream observability plugins with fork Arize production tracing:

1. **`ArizePlugin`** + shared `init_arize_tracing()` — used by plugin path and `deploy/otel_bootstrap.py`
2. **`config/plugins.hocon`** — fork defaults (Arize / Phoenix / Langfuse / LogBridge env toggles)
3. **`neuro_san_server_wrapper`** — lazy-imports neuro-san **after** plugin instrumentation
4. **`docs/OBSERVABILITY.md`** — one primary tracer rule + entry-point matrix

Cloud Run and legacy `run.py` keep `otel_bootstrap.py` (pre-import instrumentation). `ns run` uses plugins.

## Phase 4 (`sync/upstream-phase4-5-registries-search`)

Adopted upstream's flat-to-grouped registry layout while preserving fork-only
content (Ollama fallbacks, category tags, AEEN, web_search provider switch).

1. **Subdir layout** — `basic/`, `tools/`, `industry/`, `experimental/`,
   `generated/`. Each gets its own `manifest.hocon`. Root `manifest.hocon`
   becomes 5 sub-manifest includes plus the designer family + AEEN.
2. **Moves (50 files via `git mv`)** — fork edits preserved. Aligns paths
   with upstream so future merges have a smaller surface.
3. **Cross-network refs rewritten** — `"/web_search"` → `"/tools/web_search"`,
   `"/macys"` → `"/industry/macys"`, etc. across 8 files / 22 occurrences.
4. **Adopted from upstream (disabled by default)** — net-new registries in each
   subdir (book_recommender, coding_assistant, copy_cat, mdap_decomposer,
   gemini_image_generation, persistent_memory, etc.) plus root infra
   (`manifest_and.hocon`, `manifest_multiuser_overlay.hocon`,
   `llm_config.hocon`, `aaosa_basic_debug.hocon`, designer support networks
   `agent_network_editor / instructions_editor / query_generator /
   test_generator`, `config/llm_config.hocon`).
5. **Skipped** — `experimental/cruse_theme_agent`, `cruse_widget_agent` (separate
   `cruse-agentic-ui` repo at workspace root). Upstream's substantive edits to
   fork-already-present registries (would clobber Ollama fallbacks); revisit
   selectively for `metadata.description` / `sample_queries` later.
6. **Deleted (matches upstream)** — `vc_*.hocon` (8), `vibecoding_evaluator.hocon`,
   `manifest_deploy.hocon`. `deploy/Dockerfile` default updated to
   `manifest.hocon` (matches what `deploy/cloud-maa/deploy-backend.sh` already
   overrides to).
7. **`scripts/tag_registries.py`** — subdir-aware path lookup (`REG.rglob`).
   Categories unchanged.
8. **AEEN cherry-picked** from `feat/aeen` (commits `cce4e1dc` + `5c8ee174`)
   so the manifest entry has its file. Healthcare sidebar tag preserved.

Restorer smoke test: 32 public + 3 protected = 35 networks served, 0 validation
errors.

## Phase 5 (`sync/upstream-phase4-5-registries-search`)

Reconciled `brave_search` between fork and upstream.

1. **`neuro_san_studio/coded_tools/brave_search.py`** — full upstream
   replacement. Pulls in safety fixes:
   - `results.get("web", {}).get("results", [])` (tolerates missing
     `"results"` key)
   - explicit `requests.Timeout` exception handling
   - clearer comments on headers / params / status-check
2. **`registries/tools/brave_search.hocon`** — adopt upstream's toolbox-based
   structure (searcher front-man + `brave_search` toolbox tool with
   explicit `brave_url` / `brave_timeout` / `count` args) but keep fork's
   local-native `llm_config` (Ollama `qwen3.6:35b-a3b` → `27b` fallbacks)
   and `Tools` category tag. Header note clarifies that
   `registries/tools/web_search.hocon` remains the unified entry point that
   switches provider via `WEB_SEARCH_TOOLBOX`; this file stays as the
   literal-Brave demo.

AEEN clinical search is unaffected — it calls the `brave_search` toolbox tool
directly through the toolbox layer, not via this registry.

## Fork divergence table

Files where the fork intentionally diverges from upstream. The next sync MUST
re-apply (or formally drop) each row; do not silently let an upstream change
revert these.

| File | Upstream behavior | Fork override | Reason |
|------|------------------|---------------|--------|
| `neuro_san_studio/coded_tools/brave_search.py` | `Timeout` handler references `response.status_code`, raising `UnboundLocalError` because `response` is unassigned when `requests.get(..., timeout=...)` times out. | Initialize `response = None` before `try`; read `status_code` defensively via `getattr(getattr(time_out_err, "response", None), "status_code", None)`. Same pattern applied to the `HTTPError` handler. | Crash on every Brave timeout in production. Track upstream PR (TBD) and drop the patch once merged. |
| `apps/cruse/cruse_assistant.py` | Used `pyhocon.ConfigFactory.parse_file(AGENT_MANIFEST_FILE)` to enumerate enabled networks (legacy upstream pattern when manifests were flat). | Uses `neuro_san_studio.utils.manifest_loader.load_public_networks` (RegistryManifestRestorer-backed). | After Phase 4 the root manifest uses grouped `include` directives whose relative-path semantics pyhocon resolves wrong (`registries/registries/...`). Upstream may keep pyhocon since their flat layout still works there; ours needs the neuro-san loader. |
| `registries/manifest.hocon` | Upstream lays out a flat manifest at root with all `*.hocon` keys at the top level and category tags omitted. | Fork uses 5 grouped sub-manifest `include`s (basic / tools / industry / experimental / generated) plus the designer family + AEEN at root. Each registry carries `metadata.tags = ["<Category>"]` injected by `scripts/tag_registries.py`. | Sidebar categorization for the MAA UI; smaller diff surface for future syncs since sub-manifest groups match upstream's directory groups. |
| `neuro_san_studio/coded_tools/` (fork-only) | N/A — not in upstream. | `tavily_search.py`, `aeen/*` (AEEN PoC), Cloud Run-only adapters. | Fork-specific tooling (Tavily as Cloud Run search provider; AEEN clinical-evidence agents). |
| `deploy/cloud-maa/` | N/A. | Cloud Run MAA wiring (Gemini, Tavily/Brave, Arize). | Fork's deploy target. |
| `evals/`, `requirements-observability.txt`, `deploy/otel_bootstrap.py` | N/A. | Fork-only Arize tracing + LLM-as-judge eval harness. | Production observability the fork relies on; observability deps deliberately excluded from `requirements.cloudrun.txt` to keep image small. |
| Local Ollama fallbacks in registries | Upstream registries `include "config/llm_config.hocon"` (Gemini-only). | Fork registries embed inline `llm_config` with `qwen3.6:35b-a3b` → `qwen3:27b` Ollama fallbacks alongside cloud configs. | Local-native development without API keys; Phase 4 only adopted upstream's NEW registries (disabled by default) to avoid clobbering these fallbacks. |

When a row's upstream PR lands, drop the row and remove the fork patch in the
same commit.

## Recommended merge phases (after Phase 5)

All registry-side work is reconciled. Remaining upstream-merge debt is
incremental and optional:

| Item | Scope |
|------|-------|
| Cherry-pick metadata | Adopt upstream's `metadata.description` /
`sample_queries` per registry to power MAA UI sample-query buttons. Each
registry needs the per-tool `parameters` schema (Gemini-friendly) folded in
without clobbering Ollama fallbacks. |
| Adopt `manifest_and.hocon` runtime | Wire up `manifest_and` / `multiuser_overlay`
features in deploys that need them. |
| Cherry-pick `max_iterations` → `max_steps` rename | neuro-san 0.6.x API rename;
fork registries still use the legacy key in places. |
| File upstream PR for `brave_search.py` Timeout handler | Send the `getattr` /
defensive-init fix upstream so the fork patch can be dropped. Tracking row
in the divergence table above. |
| Migrate trunk `app.py` + Cloud Run `app.py` to `manifest_loader` helper |
The shared helper is in place (`neuro_san_studio/utils/manifest_loader.py`)
and `apps/cruse/cruse_assistant.py` is migrated. Trunk and Cloud Run
entrypoints to follow once the Cloud Run manifest is restructured. |

## Re-run dry-run

```bash
git fetch upstream
git worktree add /tmp/ns-merge-test HEAD
cd /tmp/ns-merge-test && git merge upstream/main --no-commit --no-ff
git diff --name-only --diff-filter=U | sort
cd - && git worktree remove /tmp/ns-merge-test --force
```
