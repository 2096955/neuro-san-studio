#!/usr/bin/env bash
# Bring up the local Multi-Agent Accelerator: neuro-san backend (:8080) + Next.js UI (:3000).
# See neuro-san-ui-reference/docs/LOCAL_MAA.md for details.
set -euo pipefail
STUDIO=/Users/anthonylui/NeuroSAN/neuro-san-studio
UI=/Users/anthonylui/NeuroSAN/neuro-san-ui-reference

echo "[1/5] free :3000"
PID=$(lsof -nP -iTCP:3000 -sTCP:LISTEN -t || true)
[ -n "$PID" ] && kill "$PID" || true

echo "[2/5] ollama"
curl -sf localhost:11434/api/tags >/dev/null || { echo "start ollama serve first"; exit 1; }

echo "[3/5] backend :8080"
pkill -f server_main_loop 2>/dev/null || true
sleep 1
(
  cd "$STUDIO" && \
    AGENT_MANIFEST_FILE="$STUDIO/registries/manifest.hocon" \
    AGENT_TOOL_PATH="$STUDIO/coded_tools" \
    AGENT_TOOLBOX_INFO_FILE="$STUDIO/toolbox/toolbox_info.hocon" \
    AGENT_HTTP_PORT=8080 AGENT_ALLOW_CORS_HEADERS=1 \
    nohup python3 -m neuro_san.service.main_loop.server_main_loop > /tmp/neurosan-server.log 2>&1 &
)
for i in $(seq 1 40); do curl -sf localhost:8080/ >/dev/null && break; sleep 2; done
curl -sf localhost:8080/ >/dev/null && echo "  backend UP" || { echo "  backend FAILED — see /tmp/neurosan-server.log"; exit 1; }

echo "[4/5] UI env + client"
# Create local env from the tracked example if missing (keeps secrets out of git).
[ -f "$UI/apps/main/.env.local" ] || cp "$UI/apps/main/.env.local.example" "$UI/apps/main/.env.local"
# The generated client is committed; regenerate from the LOCAL server only if missing.
if [ ! -f "$UI/packages/ui-common/generated/neuro-san/NeuroSanClient.ts" ]; then
  ( cd "$UI/packages/ui-common" && yarn openapi-typescript http://localhost:8080/api/v1/docs \
      --enum --immutable --make-paths-enum --empty-objects-unknown \
      --root-types --root-types-no-schema-prefix \
      --output ./generated/neuro-san/NeuroSanClient.ts )
fi

echo "[5/5] UI :3000"
(
  cd "$UI/apps/main" && nohup yarn dev > /tmp/neurosan-ui.log 2>&1 &
)
echo "Open http://localhost:3000/multiAgentAccelerator  (logs: /tmp/neurosan-server.log, /tmp/neurosan-ui.log)"
