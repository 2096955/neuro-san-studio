# AEEN → Cloud Run Deployment Handoff

**Audience:** an agent/engineer deploying the AEEN (Agentic Evidence Exchange Network) backend to Google Cloud Run.
**Date:** 2026-06-02
**Status:** AEEN code reviewed (multi-agent + Codex), all blocker/medium issues fixed, 17/17 unit tests green, validated on local `:8080` and a throwaway `:8081`. Ready to deploy.

---

## TL;DR

The deploy is already automated. From the repo root (`neuro-san-studio/`):

```bash
export GEMINI_API_KEY="<valid Google AI Studio key>"   # NOT the old leaked neuro-san-backend key
# TAVILY_API_KEY is auto-sourced from .env if present (needed for literature + cloud web search)
./deploy/cloud-maa/deploy-backend.sh
```

This builds a lean image, swaps Ollama→Gemini on a **throwaway copy** of the registries (the repo stays local/Ollama-intact), deploys to Cloud Run public, and prints the service URL. Then run the **Post-deploy verification** below.

> If you prefer Vertex auth over an AI Studio API key, see **Auth options**.

---

## What the network is

- Registry: `registries/agentic_evidence_exchange.hocon` (AAOSA pattern). Front-man `Evidence_Exchange_Coordinator` → specialists `Real_World_Evidence_Specialist`, `Clinical_Assurance_Specialist`, `Audience_Matching_Specialist` → tools `Medicare_Prescribing_Analytics` (CMS Part D), `Adverse_Event_Signal_Lookup` (openFDA FAERS), `Clinical_Literature_Search` (Tavily).
- Registered in `registries/manifest.hocon`: `"agentic_evidence_exchange.hocon": true`. Sidebar category: **Healthcare**.
- Coded tools: `coded_tools/aeen/{cms_part_d_query.py, openfda_faers_query.py, data_paths.py}`.
- PoC anchor: SGLT2i (empagliflozin/dapagliflozin) prescribing-volume signal in community cardiology. **QI/education use case, not regulatory submission.**

---

## What `deploy-backend.sh` already does (don't re-implement)

1. `rsync` repo → temp build dir, excluding `.git`, `node_modules`, `__pycache__`, `logs`, `.venv`, **`.env`** (secrets never enter the image).
2. Runs `swap_llm_for_deploy.py` on the temp `registries/` then **gates**: `! grep -rnE '"ollama"|qwen3\.6'` must pass.
3. Copies `requirements-cloud.txt` → `requirements.txt`; patches `deploy/Dockerfile` (py3.11, gcc/build-essential, `COPY ./toolbox`, `COPY ./deploy/cloud-maa/llm_info_extra.hocon`).
4. `gcloud builds submit` → `gcr.io/<project>/neuro-san-maa-backend:latest`.
5. `gcloud run deploy` public, port 8080, 4Gi/2cpu, min-instances 1, with `--set-env-vars` (see below).

Defaults: `PROJECT=gbg-neuro`, `REGION=us-central1`, `SERVICE=neuro-san-maa-backend` (override via env).

---

## AEEN-specific must-knows (these are why the deploy works now)

1. **Import fix is load-bearing in cloud too.** `cms_part_d_query.py` now imports its sibling as `from coded_tools.aeen.data_paths import aeen_data_root`. The image sets `PYTHONPATH=${APP_SOURCE}` and copies `coded_tools/` there, so this resolves. The previous bare `from aeen.data_paths` raised `ModuleNotFoundError` under that PYTHONPATH and would have crashed the CMS tool on first call in cloud. **Do not "simplify" it back.**
2. **Model.** AEEN's primary LLM is `gemini-3.5-flash`, registered in `llm_info_extra.hocon` (neuro-san 0.6.23 doesn't ship that ID). The deploy copies that file and sets `AGENT_LLM_INFO_FILE`. The swap rewrites AEEN's *secondary* Ollama fallback (`qwen3.6` → `gemini-2.5-flash`) but **leaves the `gemini-3.5-flash` primary untouched** (swap only rewrites already-`ollama` classes / `qwen3.6` model names). Net cloud fallback chain: `gemini-3.5-flash` → `gemini-2.5-flash`. ✅ Confirm `gemini-3.5-flash` is enabled in the target GCP project before relying on it.
3. **`AGENT_MANIFEST_FILE` override matters.** The base Dockerfile defaults to `manifest_deploy.hocon`; `deploy-backend.sh` overrides to `manifest.hocon` (which has AEEN enabled). Keep that override or AEEN won't be served.
4. **`AGENT_TOOL_PATH=coded_tools`** (dotted/relative, set by the deploy env-vars) — NOT the Dockerfile's absolute `${APP_SOURCE}/coded_tools` default, which breaks class-based coded tools. The deploy `--set-env-vars` already overrides this correctly.

---

## Required env / secrets (set at deploy, never baked in image)

| Var | Required | Purpose |
|-----|----------|---------|
| `GOOGLE_API_KEY` (`=${GEMINI_API_KEY}`) | Yes (AI Studio path) | Gemini auth. The Google SDK reads `GOOGLE_API_KEY`; deploy-backend.sh maps it from `GEMINI_API_KEY`. |
| `TAVILY_API_KEY` | Strongly recommended | `Clinical_Literature_Search` + cloud web search. Without it, literature search returns an error and `web_search` stays on ddgs (blocked from datacenter egress). |
| `OPENFDA_API_KEY` | Optional | Raises FAERS rate tier 1k→120k/day. Now correctly sent as `?api_key=` query param. FAERS works anonymously without it. |
| `AGENT_MANIFEST_FILE` | Yes | Must point to `…/registries/manifest.hocon` (deploy script sets it). |
| `AGENT_TOOL_PATH` | Yes | `coded_tools` (dotted). |
| `AGENT_TOOLBOX_INFO_FILE`, `AGENT_LLM_INFO_FILE` | Yes | Toolbox + the gemini-3.5 catalog overlay (deploy script sets both). |

**Egress:** Cloud Run needs outbound HTTPS to `api.fda.gov` (FAERS, live) and `api.tavily.com` (literature). Default Cloud Run egress allows this.

---

## Auth options (pick one)

- **A — AI Studio API key (what `deploy-backend.sh` does today):** `--set-env-vars …GOOGLE_API_KEY=${GEMINI_API_KEY}…`. Simplest. Use a valid, non-leaked key.
- **B — Vertex AI via ADC (what local `:8080` uses):** run the Cloud Run service as a service account with Vertex access and set `GOOGLE_CLOUD_PROJECT=gbg-neuro`, `GOOGLE_CLOUD_LOCATION=us-central1`, and **do not** set `GOOGLE_API_KEY`/`GEMINI_API_KEY`. The gemini class then uses ADC. If you choose B, edit the `--set-env-vars` in `deploy-backend.sh` to drop `GOOGLE_API_KEY` and add the two `GOOGLE_CLOUD_*` vars, and grant the Cloud Run SA `roles/aiplatform.user`.

---

## Data state

- **OpenFDA FAERS: LIVE** — queried at runtime, no local file. Works immediately in cloud.
- **CMS Part D / Synthea OMOP / SynPUF / CCW: NOT loaded.** `data/aeen/*` holds only `.gitkeep`. `cms_part_d_query` returns a graceful "download the CSV" error until data is staged. The network instructions already degrade to literature + safety when CMS data is absent.
- If you want CMS in cloud: stage the CSV at `data/aeen/cms_part_d/*.csv` **before** running the deploy (rsync copies `data/` into the build context, so it bakes into the image — mind image size, multi-GB CMS files are large), or mount from GCS and point `AEEN_DATA_ROOT` at the mount. The tool honors `AEEN_DATA_ROOT`.

---

## Step by step

1. `gcloud auth login` / ensure the active account can run Cloud Build + deploy Cloud Run in the project.
2. `export GEMINI_API_KEY="<valid key>"` (or set up Vertex ADC per option B).
3. Ensure `TAVILY_API_KEY` is in `neuro-san-studio/.env` (deploy-backend.sh auto-sources it) or exported.
4. `cd neuro-san-studio && ./deploy/cloud-maa/deploy-backend.sh`
5. Note the printed service URL.
6. Run Post-deploy verification.

---

## Post-deploy verification (smoke tests)

```bash
URL="$(gcloud run services describe neuro-san-maa-backend --region us-central1 --format='value(status.url)')"

# 1. AEEN is served under Healthcare
curl -s "$URL/api/v1/list" | python3 -c "import sys,json;d=json.load(sys.stdin);a={x['agent_name']:x.get('tags') for x in d['agents']};print('AEEN tags:',a.get('agentic_evidence_exchange'))"
# expect: AEEN tags: ['Healthcare']

# 2. Graph resolves (all 7 nodes)
curl -s -o /dev/null -w "connectivity %{http_code}\n" "$URL/api/v1/agentic_evidence_exchange/connectivity"
# expect: connectivity 200

# 3. End-to-end LLM + live FAERS tool (confirms Gemini auth + egress)
#    Send a streaming_chat asking: "What FAERS safety signals exist for empagliflozin?"
#    Expect a response citing openFDA FAERS counts (empagliflozin ~69k reports as of 2026-06).
```

Also check Cloud Run logs for: `Reading …/llm_info_extra.hocon` (gemini-3.5 registered), no `ModuleNotFoundError`, and `models: {"gemini": …}` (not falling back).

---

## Known caveats / gotchas

- **`gemini-3.5-flash` availability** in the GCP project is the #1 risk — verify it resolves before trusting the primary; otherwise it falls through to `gemini-2.5-flash` (post-swap secondary), which is fine but a different model.
- **Leaked-key warning** (from `deploy-backend.sh` header): do not reuse the old `neuro-san-backend` key — Google flagged it.
- **Model heterogeneity:** Ollama-native registries deploy on `gemini-2.5-flash` (swap default `GEMINI_MODEL`), while AEEN runs `gemini-3.5-flash`. Set `GEMINI_MODEL=gemini-3.5-flash` before the swap if you want the whole fleet uniform.
- **No CMS data** → the RWE prescribing path returns a download-path message; demo with FAERS + literature, or stage data first.
- **Ollama fallback never reached in cloud** (swapped out) — harmless.

---

## Source-of-truth files

- `deploy/cloud-maa/deploy-backend.sh` — the deploy automation (read it; it's current).
- `deploy/cloud-maa/swap_llm_for_deploy.py` — Ollama→Gemini rewrite (default `GEMINI_MODEL=gemini-2.5-flash`).
- `deploy/cloud-maa/llm_info_extra.hocon` — registers `gemini-3.5-flash` (+ `gemini-3-flash`, `gemini-2.5-flash` overrides).
- `deploy/cloud-maa/requirements-cloud.txt` — lean cloud deps (includes `requests`, used by FAERS + Tavily tools).
- `deploy/Dockerfile` — base image (patched at build time by deploy-backend.sh).
- `registries/manifest.hocon` — AEEN enabled here (not `manifest_deploy.hocon`).
