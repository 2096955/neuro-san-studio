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
3. **Register** tools in `toolbox/toolbox_info.hocon`
4. **Deps** `leaf-common`, `beautifulsoup4`

## Recommended merge phases (after Phase 1)

| Phase | Scope |
|-------|--------|
| 2 | `ns` CLI + `neuro_san_studio/` package layout (migrate `coded_tools/`) |
| 3 | Phoenix/Langfuse plugins — reconcile with Arize |
| 4 | Registry/manifest regrouping — preserve fork tags + AEEN |
| 5 | Upstream `brave_search` diff vs fork implementation |

## Re-run dry-run

```bash
git fetch upstream
git worktree add /tmp/ns-merge-test HEAD
cd /tmp/ns-merge-test && git merge upstream/main --no-commit --no-ff
git diff --name-only --diff-filter=U | sort
cd - && git worktree remove /tmp/ns-merge-test --force
```
