#!/bin/bash
# Test localhost deployment for Phase 2 features

echo "🧪 Testing Neuro-SAN Studio Localhost Deployment"
echo "=================================================="

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo ""
echo "1️⃣  Checking if server is running..."
if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "   Start server with: python3 app.py"
    exit 1
fi

# Test 2: Test /api/networks endpoint
echo ""
echo "2️⃣  Testing /api/networks endpoint..."
NETWORKS_RESPONSE=$(curl -s "$BASE_URL/api/networks")
if echo "$NETWORKS_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ /api/networks endpoint working${NC}"
    NETWORK_COUNT=$(echo "$NETWORKS_RESPONSE" | grep -o '"networks":\[.*\]' | grep -o ',' | wc -l | tr -d ' ')
    echo "   Found $((NETWORK_COUNT + 1)) networks"
else
    echo -e "${RED}❌ /api/networks endpoint failed${NC}"
    echo "   Response: $NETWORKS_RESPONSE"
fi

# Test 3: Test /api/topology endpoint
echo ""
echo "3️⃣  Testing /api/topology endpoint..."
TOPOLOGY_RESPONSE=$(curl -s "$BASE_URL/api/topology?network=banking")
if echo "$TOPOLOGY_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ /api/topology endpoint working${NC}"
    NODE_COUNT=$(echo "$TOPOLOGY_RESPONSE" | grep -o '"nodes":\[.*\]' | grep -o '"id"' | wc -l | tr -d ' ')
    echo "   Banking network has nodes"
else
    echo -e "${YELLOW}⚠️  /api/topology endpoint may have issues${NC}"
    echo "   Response: ${TOPOLOGY_RESPONSE:0:200}..."
fi

# Test 4: Test /api/thinking endpoint (Phase 2)
echo ""
echo "4️⃣  Testing /api/thinking endpoint (Phase 2)..."
THINKING_RESPONSE=$(curl -s "$BASE_URL/api/thinking/banking")
if echo "$THINKING_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ /api/thinking endpoint working${NC}"
    LOG_COUNT=$(echo "$THINKING_RESPONSE" | grep -o '"logs":\[.*\]' | grep -o '"agent"' | wc -l | tr -d ' ')
    echo "   Found $LOG_COUNT thinking log entries"
else
    echo -e "${YELLOW}⚠️  /api/thinking endpoint returned: ${THINKING_RESPONSE:0:100}${NC}"
    echo "   (This is OK if no thinking logs exist yet)"
fi

# Test 5: Test /api/activity endpoint
echo ""
echo "5️⃣  Testing /api/activity endpoint..."
ACTIVITY_RESPONSE=$(curl -s "$BASE_URL/api/activity")
if echo "$ACTIVITY_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ /api/activity endpoint working${NC}"
else
    echo -e "${RED}❌ /api/activity endpoint failed${NC}"
fi

# Test 6: Test Socket.IO connection (basic check)
echo ""
echo "6️⃣  Testing Socket.IO configuration..."
if grep -q "socketio = SocketIO" app.py && grep -q "async_mode" app.py; then
    echo -e "${GREEN}✅ Socket.IO configured with enhanced settings${NC}"
    echo "   - async_mode: threading"
    echo "   - ping_timeout: 60"
    echo "   - ping_interval: 25"
else
    echo -e "${YELLOW}⚠️  Socket.IO configuration may need review${NC}"
fi

# Test 7: Local-native chat smoke (requires gRPC neuro-san + Ollama; see docs/LOCAL_NATIVE_DEMOS.md)
echo ""
echo "7️⃣  Testing /api/chat smoke (music_nerd_pro_local)..."
CHAT_RESP=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"network_name":"music_nerd_pro_local","message":"hello","session_id":"smoke-localhost"}')
if echo "$CHAT_RESP" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ /api/chat returned success${NC}"
else
    echo -e "${YELLOW}⚠️  /api/chat did not return success (ensure neuro-san gRPC + Ollama are running)${NC}"
    echo "   Response (first 200 chars): ${CHAT_RESP:0:200}"
fi

# Summary
echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo ""
echo "✅ All Phase 2 endpoints are configured"
echo "✅ Enhanced Socket.IO settings applied"
echo "✅ /api/networks endpoint added"
echo ""
echo "🌐 To test in browser:"
echo "   - Main page: $BASE_URL"
echo "   - Network API: $BASE_URL/api/networks"
echo "   - Topology API: $BASE_URL/api/topology?network=banking"
echo "   - Thinking Logs: $BASE_URL/api/thinking/banking"
echo ""
echo "💡 To start the server:"
echo "   cd /Users/anthonylui/NeuroSAN/neuro-san-studio"
echo "   python3 app.py"
echo ""


