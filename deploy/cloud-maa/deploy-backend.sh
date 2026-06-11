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
STUDIO="$(cd "$(dirname "$0")/../.." && pwd)"          # repo root
# Immutable image tag: <short-sha>-<timestamp>. Pinning the deploy to a unique tag (never :latest)
# guarantees each revision points at exactly the bits we built, and makes rollbacks unambiguous.
SHA=$(git -C "$STUDIO" rev-parse --short HEAD 2>/dev/null || echo nogit)
STAMP=$(date +%Y%m%d-%H%M%S)
TAG="${SHA}-${STAMP}"
IMAGE="gcr.io/${PROJECT}/${SERVICE}:${TAG}"
BT="$(mktemp -d /tmp/nsmaa-backend.XXXX)"
trap 'rm -rf "$BT"' EXIT
APP=/usr/local/neuro-san/myapp                          # APP_SOURCE inside the SDK image

: "${GEMINI_API_KEY:?set GEMINI_API_KEY to a valid Google AI Studio key}"

# Cloud web-search provider selection. DuckDuckGo (ddgs_search) is rate-limited/blocked from
# datacenter egress (and the lean cloud image omits the `ddgs` package), so when a TAVILY_API_KEY
# is available the web_search network's backing toolbox is switched to tavily_search at LOAD TIME
# via $WEB_SEARCH_TOOLBOX (no registry rewrite; callers only ever reference /web_search). The key
# and the provider selection are COUPLED: no key -> stay on ddgs (web search stays blocked on Cloud
# Run rather than selecting tavily with nothing behind it). Source the key from repo .env if needed.
# Pull TAVILY_API_KEY / BRAVE_API_KEY from repo .env ONLY when not already set in the environment.
# (Don't blanket-source .env — that would clobber explicitly-exported values, e.g. an explicit
# TAVILY_API_KEY when only BRAVE_API_KEY is missing.)
if [ -f "$STUDIO/.env" ]; then
  for _k in TAVILY_API_KEY BRAVE_API_KEY ARIZE_SPACE_ID ARIZE_API_KEY ARIZE_PROJECT_NAME; do
    if [ -z "${!_k:-}" ]; then
      _v="$(grep -E "^${_k}=" "$STUDIO/.env" | tail -n1 | cut -d= -f2- || true)"
      [ -n "$_v" ] && export "${_k}=${_v}"
    fi
  done
  unset _k _v
fi
TAVILY_ENV=""
WEB_SEARCH_ENV=""
if [ -n "${TAVILY_API_KEY:-}" ]; then
  TAVILY_ENV="@TAVILY_API_KEY=${TAVILY_API_KEY}"
  WEB_SEARCH_ENV="@WEB_SEARCH_TOOLBOX=tavily_search"
  echo "  TAVILY_API_KEY found -> cloud shared /web_search = Tavily (WEB_SEARCH_TOOLBOX=tavily_search)"
else
  echo "  WARNING: TAVILY_API_KEY not set -> shared /web_search falls back to its registry default"
  echo "           (brave_search), so ALL networks' web search would use Brave in cloud, not just AEEN."
fi
# AEEN's Clinical_Literature_Search is pinned to brave_search (see agentic_evidence_exchange.hocon),
# so the Brave key must reach Cloud Run independently of the shared /web_search provider above.
BRAVE_ENV=""
if [ -n "${BRAVE_API_KEY:-}" ]; then
  BRAVE_ENV="@BRAVE_API_KEY=${BRAVE_API_KEY}"
  echo "  BRAVE_API_KEY found -> AEEN Clinical_Literature_Search = Brave"
else
  echo "  WARNING: BRAVE_API_KEY not set -> AEEN clinical literature search will fail on Cloud Run"
fi
# Optional observability: send backend traces to Arize AX. The image always launches via
# deploy/otel_bootstrap.py, which is a NO-OP unless both ARIZE_SPACE_ID and ARIZE_API_KEY are present.
ARIZE_ENV=""
if [ -n "${ARIZE_SPACE_ID:-}" ] && [ -n "${ARIZE_API_KEY:-}" ]; then
  ARIZE_ENV="@ARIZE_SPACE_ID=${ARIZE_SPACE_ID}@ARIZE_API_KEY=${ARIZE_API_KEY}@ARIZE_PROJECT_NAME=${ARIZE_PROJECT_NAME:-neuro-san-maa}"
  echo "  ARIZE keys found -> backend traces -> Arize AX (project=${ARIZE_PROJECT_NAME:-neuro-san-maa})"
else
  echo "  ARIZE_* not set -> backend runs WITHOUT tracing (otel_bootstrap is a no-op)"
fi

echo "[1/6] copy build context (exclude vcs/caches/heavy dirs + secrets)"
rsync -a --exclude '.git' --exclude 'node_modules' --exclude '__pycache__' \
      --exclude 'logs' --exclude 'frontend' --exclude '.venv' \
      --exclude '.env*' --exclude '*.key' "$STUDIO/" "$BT/"

echo "[2/6] swap registries ollama -> gemini, then validate"
python3 "$STUDIO/deploy/cloud-maa/swap_llm_for_deploy.py" "$BT/registries"
# `-r` recurses on its own; the previous shell glob `*.hocon` only matched root-level files,
# so post-Phase-4 subdir registries (basic/ tools/ industry/ experimental/) escaped the gate.
# Pass the directory and let grep walk it.
! grep -rnE '"ollama"|qwen3\.6' "$BT/registries" || { echo "ollama still present"; exit 1; }
# Web search provider is env-driven (WEB_SEARCH_TOOLBOX, no rewrite). If we intend to select Tavily,
# FUNCTIONALLY assert the swapped web_search.hocon actually RESOLVES to tavily_search under the env
# override (loads it through neuro-san's own restorer) — not just that the interpolation text exists,
# else the env var could silently no-op. Path is registries/tools/web_search.hocon after Phase 4.
if [ -n "${WEB_SEARCH_ENV}" ]; then
  WEB_SEARCH_TOOLBOX=tavily_search AGENT_TOOLBOX_INFO_FILE="$STUDIO/neuro_san_studio/toolbox/toolbox_info.hocon" BT="$BT" \
  python3 -c 'import os,sys
from neuro_san.internals.graph.persistence.agent_network_restorer import AgentNetworkRestorer as R
cfg=R().restore(file_reference=os.environ["BT"]+"/registries/tools/web_search.hocon").get_config()
tb=next((t.get("toolbox") for t in cfg.get("tools",[]) if t.get("name")=="website_search"),None)
sys.exit(0 if tb=="tavily_search" else "web_search did not resolve to tavily_search; got "+repr(tb))' \
    || { echo "deploy gate failed: WEB_SEARCH_TOOLBOX override not honored by web_search.hocon"; exit 1; }
fi

echo "[3/6] lean requirements + cloud Dockerfile (py3.11 + gcc + neuro_san_studio package)"
cp "$STUDIO/deploy/cloud-maa/requirements-cloud.txt" "$BT/requirements.txt"
cp "$BT/deploy/Dockerfile" "$BT/Dockerfile"
python3 - "$BT/Dockerfile" <<'PY'
import sys, pathlib
f = pathlib.Path(sys.argv[1]); t = f.read_text()
t = t.replace("python:3.13-slim", "python:3.11-slim")
t = t.replace("/usr/local/lib/python3.13/site-packages", "/usr/local/lib/python3.11/site-packages")
m = 'COPY ./coded_tool[s] ${APP_SOURCE}/coded_tools'
extra = ''
if 'COPY ./neuro_san_studio' not in t: extra += '\nCOPY ./neuro_san_studio ${APP_SOURCE}/neuro_san_studio'
if 'COPY ./config' not in t: extra += '\nCOPY ./config ${APP_SOURCE}/config'
if 'llm_info_extra' not in t: extra += '\nCOPY ./deploy/cloud-maa/llm_info_extra.hocon ${APP_SOURCE}/llm_info_extra.hocon'
# Ship the tracing bootstrap (the patched entrypoint launches the server through it).
if 'otel_bootstrap' not in t: extra += '\nCOPY ./deploy/otel_bootstrap.py ${APP_SOURCE}/deploy/otel_bootstrap.py'
if extra: t = t.replace(m, m + extra)
a = 'RUN if [ -f ${APP_SOURCE}/requirements.txt ]; \\'
if 'build-essential' not in t:
    t = t.replace(a, 'RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*\n' + a)
f.write_text(t)
PY
# Assert the 3.13 -> 3.11 rewrite actually landed. If the base Dockerfile ever moves to a
# different Python (so the .replace() finds nothing), we must NOT ship a 3.13 image against
# the 3.11 site-packages paths — fail loudly instead.
if ! grep -q 'python:3.11' "$BT/Dockerfile" || grep -q 'python:3.13' "$BT/Dockerfile"; then
  echo "python-rewrite guard failed: staged Dockerfile is not pinned to python:3.11 (base image may have changed)"
  exit 1
fi

echo "[4/6] build image (immutable tag ${TAG}, also tagged :latest for compatibility)"
echo "  IMAGE=${IMAGE}"
( cd "$BT" && gcloud builds submit --tag "$IMAGE" . )
# gcloud builds submit takes only one --tag; mirror the immutable build to :latest afterwards.
gcloud container images add-tag "$IMAGE" "gcr.io/${PROJECT}/${SERVICE}:latest" --quiet

echo "[5/6] deploy public Cloud Run (Gemini + CORS + dotted AGENT_TOOL_PATH)"
# Rollback breadcrumb: remember the currently-serving revision BEFORE we shift traffic.
PREV_REV=$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
  --format 'value(status.latestReadyRevisionName)' 2>/dev/null || true)
# Deploy the IMMUTABLE tag (never :latest) so the revision is pinned to exactly these bits.
# --timeout 600 / --concurrency 16 are required for the 600s networks; pin them here so a
# fresh service doesn't silently inherit Cloud Run defaults and break.
gcloud run deploy "$SERVICE" --image "$IMAGE" --region "$REGION" --allow-unauthenticated \
  --port 8080 --memory 4Gi --cpu 2 --timeout 600 --concurrency 16 --max-instances 5 \
  --min-instances 1 --cpu-boost \
  --set-env-vars "^@^AGENT_ALLOW_CORS_HEADERS=1@AGENT_MANIFEST_FILE=${APP}/registries/manifest.hocon@AGENT_TOOL_PATH=coded_tools@AGENT_TOOLBOX_INFO_FILE=${APP}/neuro_san_studio/toolbox/toolbox_info.hocon@AGENT_LLM_INFO_FILE=${APP}/llm_info_extra.hocon@GOOGLE_API_KEY=${GEMINI_API_KEY}${TAVILY_ENV}${WEB_SEARCH_ENV}${BRAVE_ENV}${ARIZE_ENV}"

echo "[6/6] smoke test deployed revision (retry list endpoint, require rhea network present)"
URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
  --format 'value(status.url)')
NEW_REV=$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
  --format 'value(status.latestReadyRevisionName)' 2>/dev/null || true)
echo "  URL=${URL}"
SMOKE_OK=0
for _i in 1 2 3 4 5 6; do
  if curl -fsS --max-time 30 "$URL/api/v1/list" 2>/dev/null | grep -q '"rhea_clinical_decision_support"'; then
    SMOKE_OK=1
    break
  fi
  echo "  smoke attempt ${_i}/6 not ready yet, sleeping 10s..."
  sleep 10
done
if [ "$SMOKE_OK" -eq 1 ]; then
  echo "SMOKE OK -> deployed revision ${NEW_REV} serving at ${URL}"
else
  echo "SMOKE FAILED after 6 attempts against ${URL}/api/v1/list"
  echo "ROLLBACK: gcloud run services update-traffic ${SERVICE} --region ${REGION} --to-revisions ${PREV_REV}=100"
  exit 1
fi
