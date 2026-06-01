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

# Optional: cloud web-search backend. DuckDuckGo (ddgs_search) is rate-limited/blocked from
# datacenter egress (and the lean cloud image omits the `ddgs` package), so when a TAVILY_API_KEY
# is available we swap ddgs_search -> tavily_search (step [2]) and forward the key to Cloud Run.
# Source it from the repo .env if not already in the environment. The swap and the key are COUPLED:
# no key -> no swap (ddgs stays; web search stays broken on Cloud Run rather than emitting tavily
# references with nothing behind them).
if [ -z "${TAVILY_API_KEY:-}" ] && [ -f "$STUDIO/.env" ]; then
  set -a; . "$STUDIO/.env"; set +a
fi
TAVILY_ENV=""
if [ -n "${TAVILY_API_KEY:-}" ]; then
  export SWAP_DDGS_TO_TAVILY=1
  TAVILY_ENV="@TAVILY_API_KEY=${TAVILY_API_KEY}"
  echo "  TAVILY_API_KEY found -> cloud web search = Tavily (ddgs_search will be swapped)"
else
  echo "  WARNING: TAVILY_API_KEY not set -> keeping ddgs_search; web search will be blocked on Cloud Run"
fi

echo "[1/5] copy build context (exclude vcs/caches/heavy dirs + secrets)"
rsync -a --exclude '.git' --exclude 'node_modules' --exclude '__pycache__' \
      --exclude 'logs' --exclude 'frontend' --exclude '.venv' --exclude '.env' "$STUDIO/" "$BT/"

echo "[2/5] swap registries ollama -> gemini, then validate"
python3 "$STUDIO/deploy/cloud-maa/swap_llm_for_deploy.py" "$BT/registries"
! grep -rnE '"ollama"|qwen3\.6' "$BT/registries"/*.hocon || { echo "ollama still present"; exit 1; }
if [ "${SWAP_DDGS_TO_TAVILY:-}" = "1" ]; then
  ! grep -rnE '"toolbox"[[:space:]]*[:=][[:space:]]*"ddgs_search"' "$BT/registries"/*.hocon \
    || { echo "ddgs_search toolbox ref still present after tavily swap"; exit 1; }
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
  --set-env-vars "^@^AGENT_ALLOW_CORS_HEADERS=1@AGENT_MANIFEST_FILE=${APP}/registries/manifest.hocon@AGENT_TOOL_PATH=coded_tools@AGENT_TOOLBOX_INFO_FILE=${APP}/toolbox/toolbox_info.hocon@AGENT_LLM_INFO_FILE=${APP}/llm_info_extra.hocon@GOOGLE_API_KEY=${GEMINI_API_KEY}${TAVILY_ENV}"

gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)'
rm -rf "$BT"
