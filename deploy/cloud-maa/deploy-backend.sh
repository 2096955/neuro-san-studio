#!/usr/bin/env bash
# Build & deploy the Multi-Agent Accelerator neuro-san BACKEND to Cloud Run on Gemini.
# Reproduces the working deploy. Repo stays local/Ollama-intact: all edits happen on a temp copy.
#
# Prereqs:
#   - gcloud authed as an SA that can submit Cloud Build + deploy Cloud Run in gbg-neuro
#     (verified: bfs-gen-ai@gbg-neuro can build+read-logs; healthcare-poc-vertexai can set public IAM)
#   - a VALID Gemini API key in $GEMINI_API_KEY (the env one on this machine works;
#     do NOT reuse the old neuro-san-backend key — Google flagged it leaked)
set -euo pipefail

PROJECT="${PROJECT:-gbg-neuro}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-neuro-san-maa-backend}"
IMAGE="gcr.io/${PROJECT}/${SERVICE}:latest"
STUDIO="$(cd "$(dirname "$0")/../.." && pwd)"          # repo root
BT="$(mktemp -d /tmp/nsmaa-backend.XXXX)"
APP=/usr/local/neuro-san/myapp                          # APP_SOURCE inside the SDK image

: "${GEMINI_API_KEY:?set GEMINI_API_KEY to a valid Google AI Studio key}"

# Cloud web-search provider selection. DuckDuckGo (ddgs_search) is rate-limited/blocked from
# datacenter egress (and the lean cloud image omits the `ddgs` package), so when a TAVILY_API_KEY
# is available the web_search network's backing toolbox is switched to tavily_search at LOAD TIME
# via $WEB_SEARCH_TOOLBOX (no registry rewrite; callers only ever reference /web_search). The key
# and the provider selection are COUPLED: no key -> stay on ddgs (web search stays blocked on Cloud
# Run rather than selecting tavily with nothing behind it). Source the key from repo .env if needed.
if [ -z "${TAVILY_API_KEY:-}" ] && [ -f "$STUDIO/.env" ]; then
  set -a; . "$STUDIO/.env"; set +a
fi
TAVILY_ENV=""
WEB_SEARCH_ENV=""
if [ -n "${TAVILY_API_KEY:-}" ]; then
  TAVILY_ENV="@TAVILY_API_KEY=${TAVILY_API_KEY}"
  WEB_SEARCH_ENV="@WEB_SEARCH_TOOLBOX=tavily_search"
  echo "  TAVILY_API_KEY found -> cloud web search = Tavily (WEB_SEARCH_TOOLBOX=tavily_search)"
else
  echo "  WARNING: TAVILY_API_KEY not set -> web_search stays on ddgs; web search will be blocked on Cloud Run"
fi

echo "[1/5] copy build context (exclude vcs/caches/heavy dirs + secrets)"
rsync -a --exclude '.git' --exclude 'node_modules' --exclude '__pycache__' \
      --exclude 'logs' --exclude 'frontend' --exclude '.venv' --exclude '.env' "$STUDIO/" "$BT/"

echo "[2/5] swap registries ollama -> gemini, then validate"
python3 "$STUDIO/deploy/cloud-maa/swap_llm_for_deploy.py" "$BT/registries"
! grep -rnE '"ollama"|qwen3\.6' "$BT/registries"/*.hocon || { echo "ollama still present"; exit 1; }
# Web search provider is env-driven (WEB_SEARCH_TOOLBOX, no rewrite). If we intend to select Tavily,
# FUNCTIONALLY assert the swapped web_search.hocon actually RESOLVES to tavily_search under the env
# override (loads it through neuro-san's own restorer) — not just that the interpolation text exists,
# else the env var could silently no-op.
if [ -n "${WEB_SEARCH_ENV}" ]; then
  WEB_SEARCH_TOOLBOX=tavily_search AGENT_TOOLBOX_INFO_FILE="$STUDIO/toolbox/toolbox_info.hocon" BT="$BT" \
  python3 -c 'import os,sys
from neuro_san.internals.graph.persistence.agent_network_restorer import AgentNetworkRestorer as R
cfg=R().restore(file_reference=os.environ["BT"]+"/registries/web_search.hocon").get_config()
tb=next((t.get("toolbox") for t in cfg.get("tools",[]) if t.get("name")=="website_search"),None)
sys.exit(0 if tb=="tavily_search" else "web_search did not resolve to tavily_search; got "+repr(tb))' \
    || { echo "deploy gate failed: WEB_SEARCH_TOOLBOX override not honored by web_search.hocon"; exit 1; }
fi

echo "[3/5] lean requirements + cloud Dockerfile (py3.11 + gcc + toolbox)"
cp "$STUDIO/deploy/cloud-maa/requirements-cloud.txt" "$BT/requirements.txt"
cp "$BT/deploy/Dockerfile" "$BT/Dockerfile"
python3 - "$BT/Dockerfile" <<'PY'
import sys, pathlib
f = pathlib.Path(sys.argv[1]); t = f.read_text()
t = t.replace("python:3.13-slim", "python:3.11-slim")
t = t.replace("/usr/local/lib/python3.13/site-packages", "/usr/local/lib/python3.11/site-packages")
m = 'COPY ./coded_tool[s] ${APP_SOURCE}/coded_tools'
extra = ''
if 'COPY ./toolbox' not in t: extra += '\nCOPY ./toolbox ${APP_SOURCE}/toolbox'
if 'llm_info_extra' not in t: extra += '\nCOPY ./deploy/cloud-maa/llm_info_extra.hocon ${APP_SOURCE}/llm_info_extra.hocon'
if extra: t = t.replace(m, m + extra)
a = 'RUN if [ -f ${APP_SOURCE}/requirements.txt ]; \\'
if 'build-essential' not in t:
    t = t.replace(a, 'RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*\n' + a)
f.write_text(t)
PY

echo "[4/5] build image"
( cd "$BT" && gcloud builds submit --tag "$IMAGE" . )

echo "[5/5] deploy public Cloud Run (Gemini + CORS + dotted AGENT_TOOL_PATH)"
gcloud run deploy "$SERVICE" --image "$IMAGE" --region "$REGION" --allow-unauthenticated \
  --port 8080 --memory 4Gi --cpu 2 --timeout 600 --max-instances 5 \
  --min-instances 1 --cpu-boost \
  --set-env-vars "^@^AGENT_ALLOW_CORS_HEADERS=1@AGENT_MANIFEST_FILE=${APP}/registries/manifest.hocon@AGENT_TOOL_PATH=coded_tools@AGENT_TOOLBOX_INFO_FILE=${APP}/toolbox/toolbox_info.hocon@AGENT_LLM_INFO_FILE=${APP}/llm_info_extra.hocon@GOOGLE_API_KEY=${GEMINI_API_KEY}${TAVILY_ENV}${WEB_SEARCH_ENV}"

gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)'
rm -rf "$BT"
