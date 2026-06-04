#!/bin/bash
# Quick deployment script for Cloud Run

set -e

echo "🚀 Deploying Neuro SAN Studio to Cloud Run"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Try multiple service account keys in order of preference
# tiaa-gen-ai is verified to work with Cloud Run deployments
SERVICE_ACCOUNT_KEYS=(
    "/Users/anthonylui/SubAgents/GCP-Package/gbg-neuro-ba6a9a1ecbd8.json"   # tiaa-gen-ai (VERIFIED WORKING)
    "/Users/anthonylui/SubAgents/GCP-Package/gbg-neuro-de8fe07b12da.json"  # platform-integration-sa
    "/Users/anthonylui/SubAgents/GCP-Package/gbg-neuro-55c79ec90ea2.json"  # flowsourcedev
    "/Users/anthonylui/SubAgents/GCP-Package/gbg-neuro-25cf04c7e88a.json"   # cog-life-sciences
    "/Users/anthonylui/SubAgents/GCP-Package/gbg-neuro-3f7108911be8.json" # healthcare-poc-vertexai
)

SERVICE_ACCOUNT_KEY=""
PROJECT_ID=""

# Find first available key
for key in "${SERVICE_ACCOUNT_KEYS[@]}"; do
    if [ -f "$key" ]; then
        SERVICE_ACCOUNT_KEY="$key"
        PROJECT_ID=$(python3 -c "import json; print(json.load(open('$key'))['project_id'])" 2>/dev/null)
        if [ -n "$PROJECT_ID" ]; then
            break
        fi
    fi
done

if [ -z "$SERVICE_ACCOUNT_KEY" ] || [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No valid service account key found"
    echo "Checked: ${SERVICE_ACCOUNT_KEYS[*]}"
    exit 1
fi

echo "✅ Using service account: $SERVICE_ACCOUNT_KEY"
echo "✅ Project: $PROJECT_ID"

# Authenticate with service account
echo "🔐 Authenticating with service account..."
gcloud auth activate-service-account --key-file="$SERVICE_ACCOUNT_KEY"
gcloud config set project "$PROJECT_ID"

# Get region (default to us-central1)
REGION=${1:-us-central1}
echo "✅ Region: $REGION"

# Service name
SERVICE_NAME="neuro-san-studio"
echo "✅ Service: $SERVICE_NAME"
echo ""

# --- Agent network registry persistence (HOCON writes) ----------------------
# The agent_network_designer tool writes generated networks to registries/.
# Cloud Run's image filesystem is read-only, so pick a strategy via env vars:
#
#   * GCS volume  : REGISTRY_BUCKET=my-bucket ./deploy.sh
#                   -> persists across restarts AND instances (recommended)
#   * return-only : AGENT_NETWORK_WRITE_TO_FILE=false ./deploy.sh
#                   -> designer just returns the HOCON text, never writes
#   * ephemeral   : leave both unset
#                   -> code auto-falls back to /tmp (works, but lost on restart)
REGISTRY_BUCKET="${REGISTRY_BUCKET:-}"
REGISTRY_MOUNT_PATH="${REGISTRY_MOUNT_PATH:-/registries}"
AGENT_NETWORK_WRITE_TO_FILE="${AGENT_NETWORK_WRITE_TO_FILE:-true}"
# How often (seconds) the neuro-san serving layer re-scans the manifest so a
# network generated at runtime becomes servable without a restart (0 disables).
AGENT_MANIFEST_UPDATE_PERIOD_SECONDS="${AGENT_MANIFEST_UPDATE_PERIOD_SECONDS:-5}"
# Web-search backing provider for web_search.hocon. Cloud uses Tavily because
# DuckDuckGo blocks datacenter egress. NOTE: Tavily needs TAVILY_API_KEY, which
# is a secret and must be set separately (e.g. gcloud ... --update-env-vars
# TAVILY_API_KEY=...), NOT committed here.
WEB_SEARCH_TOOLBOX="${WEB_SEARCH_TOOLBOX:-tavily_search}"
# Toolbox tool definitions (tavily/brave/rag/etc.) live in toolbox/toolbox_info.hocon.
# The studio uses DirectAgentSession (not `ns run`), so without this only neuro-san's
# package-default toolbox (requests/datetime) loads and web_search fails at call time.
# Path matches Dockerfile.cloudrun's WORKDIR (/app).
AGENT_TOOLBOX_INFO_FILE="${AGENT_TOOLBOX_INFO_FILE:-/app/toolbox/toolbox_info.hocon}"

ENV_VARS="AGENT_NETWORK_WRITE_TO_FILE=${AGENT_NETWORK_WRITE_TO_FILE}"
ENV_VARS="${ENV_VARS},AGENT_MANIFEST_UPDATE_PERIOD_SECONDS=${AGENT_MANIFEST_UPDATE_PERIOD_SECONDS}"
ENV_VARS="${ENV_VARS},WEB_SEARCH_TOOLBOX=${WEB_SEARCH_TOOLBOX}"
ENV_VARS="${ENV_VARS},AGENT_TOOLBOX_INFO_FILE=${AGENT_TOOLBOX_INFO_FILE}"
VOLUME_FLAGS=()
if [ -n "$REGISTRY_BUCKET" ]; then
    echo "✅ Persisting agent networks to gs://$REGISTRY_BUCKET (mounted at $REGISTRY_MOUNT_PATH)"
    VOLUME_FLAGS=(
        --add-volume "name=registries,type=cloud-storage,bucket=$REGISTRY_BUCKET"
        --add-volume-mount "volume=registries,mount-path=$REGISTRY_MOUNT_PATH"
    )
    ENV_VARS="${ENV_VARS},AGENT_NETWORK_OUTPUT_PATH=${REGISTRY_MOUNT_PATH}/"
else
    echo "ℹ️  No REGISTRY_BUCKET set; generated HOCONs fall back to /tmp (ephemeral)."
fi
echo ""

# Check if we should use Dockerfile.cloudrun or build from source
if [ -f "Dockerfile.cloudrun" ]; then
    echo "📦 Building and deploying from Dockerfile.cloudrun..."
    # Create a temporary cloudbuild.yaml for this build
    cat > /tmp/cloudbuild_temp.yaml <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/$SERVICE_NAME:latest', '-f', 'Dockerfile.cloudrun', '.']
images:
  - 'gcr.io/$PROJECT_ID/$SERVICE_NAME:latest'
EOF
    
    # Build and push image first
    IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
    gcloud builds submit --config=/tmp/cloudbuild_temp.yaml .
    
    # Deploy using the built image
    # Use the service account as the runtime service account
    RUNTIME_SERVICE_ACCOUNT=$(python3 -c "import json; print(json.load(open('$SERVICE_ACCOUNT_KEY'))['client_email'])")
    gcloud run deploy $SERVICE_NAME \
      --image "$IMAGE_NAME" \
      --region $REGION \
      --allow-unauthenticated \
      --port 8080 \
      --memory 2Gi \
      --cpu 2 \
      --timeout 300 \
      --max-instances 10 \
      --platform managed \
      --service-account "$RUNTIME_SERVICE_ACCOUNT" \
      --update-env-vars "$ENV_VARS" \
      "${VOLUME_FLAGS[@]}"

    # Clean up temp file
    rm /tmp/cloudbuild_temp.yaml
else
    echo "📦 Building and deploying from source..."
    # Use the service account as the runtime service account
    RUNTIME_SERVICE_ACCOUNT=$(python3 -c "import json; print(json.load(open('$SERVICE_ACCOUNT_KEY'))['client_email'])")
    gcloud run deploy $SERVICE_NAME \
      --source . \
      --region $REGION \
      --allow-unauthenticated \
      --port 8080 \
      --memory 2Gi \
      --cpu 2 \
      --timeout 300 \
      --max-instances 10 \
      --platform managed \
      --service-account "$RUNTIME_SERVICE_ACCOUNT" \
      --update-env-vars "$ENV_VARS" \
      "${VOLUME_FLAGS[@]}"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your service URL:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'
echo ""
echo "📝 To set environment variables (API keys):"
echo "  gcloud run services update $SERVICE_NAME \\"
echo "    --region $REGION \\"
echo "    --update-env-vars AWS_BEDROCK_API_KEY=your_key_here,OPENAI_API_KEY=your_key_here,GOOGLE_API_KEY=your_key_here"
echo ""

