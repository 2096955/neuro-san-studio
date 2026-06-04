# API Adapter Implementation Summary

## Overview

The API adapter has been implemented to provide compatibility between the Next.js UI (`neuro-san-ui`) and the Flask backend (`neuro-san-studio`). This allows both UIs to connect to the same backend.

## Implementation Details

### Files Created

1. **`api_adapter/__init__.py`** - Package initialization
2. **`api_adapter/neuro_san_adapter.py`** - Main adapter implementation with Flask routes

### Endpoints Implemented

The adapter provides the following endpoints at `/api/v1/*`:

#### 1. Health Check
- **Endpoint**: `GET /api/v1/health`
- **Purpose**: Health check endpoint expected by Next.js UI
- **Response**: `{"status": "healthy", "versions": {"neuro-san": "1.0.0"}}`

#### 2. List Agent Networks
- **Endpoint**: `GET /api/v1/concierge/list`
- **Purpose**: List all available agent networks
- **Next.js Path**: `ApiPaths.ConciergeService_List`
- **Response Format**:
  ```json
  {
    "agents": [
      {"agent_name": "network_name", "display_name": "Display Name"}
    ]
  }
  ```
- **Transformation**: Converts Flask `list_networks()` response to ConciergeResponse format

#### 3. Get Connectivity/Topology
- **Endpoint**: `GET /api/v1/{agent_name}/connectivity`
- **Purpose**: Get network topology/connectivity information
- **Next.js Path**: `ApiPaths.AgentService_Connectivity` (with agent name substitution)
- **Response Format**:
  ```json
  {
    "connectivity_info": [
      {
        "origin": "agent_name",
        "tools": ["tool1", "tool2"],
        "connections": [{"target": "other_agent", "type": "delegation"}]
      }
    ]
  }
  ```
- **Transformation**: Converts Flask topology format (nodes/connections) to ConnectivityResponse format

#### 4. Streaming Chat
- **Endpoint**: `POST /api/v1/{agent_name}/streaming-chat`
- **Purpose**: Send messages to agent network with streaming response
- **Next.js Path**: `ApiPaths.AgentService_StreamingChat` (with agent name substitution)
- **Request Format**:
  ```json
  {
    "user_message": {"type": "HUMAN", "text": "message"},
    "chat_context": {...},
    "sly_data": {...},
    "chat_filter": {...}
  }
  ```
- **Response**: Server-Sent Events (SSE) stream
- **Transformation**: Extracts message from Next.js format, calls Flask backend, returns SSE stream

#### 5. Get Agent Function
- **Endpoint**: `GET /api/v1/{agent_name}/function`
- **Purpose**: Get agent description/function
- **Next.js Path**: `ApiPaths.AgentService_Function` (with agent name substitution)
- **Response Format**:
  ```json
  {
    "function": "Agent description/function"
  }
  ```

### Integration

The adapter is automatically registered in `app.py`:

```python
# Import API adapter
try:
    from api_adapter.neuro_san_adapter import neuro_san_api, init_adapter
    API_ADAPTER_AVAILABLE = True
except ImportError:
    API_ADAPTER_AVAILABLE = False

# Register blueprint
if API_ADAPTER_AVAILABLE:
    app.register_blueprint(neuro_san_api)
    init_adapter(neuro_interface)
```

### CORS Configuration

CORS is already configured to allow both UIs:

```python
CORS(app, resources={
    r"/api/*": {"origins": "*"},
    r"/api/v1/*": {"origins": "*"}
})
```

This allows:
- React UI on `http://localhost:5173`
- Next.js UI on `http://localhost:3000`

## Data Transformations

### Network List
- **Flask Format**: `{"status": "success", "networks": [{"name": "...", "display_name": "..."}]}`
- **Next.js Format**: `{"agents": [{"agent_name": "...", "display_name": "..."}]}`

### Topology
- **Flask Format**: `{"nodes": [...], "connections": [...]}`
- **Next.js Format**: `{"connectivity_info": [{"origin": "...", "tools": [...], "connections": [...]}]}`

### Chat Messages
- **Next.js Request**: `{"user_message": {"type": "HUMAN", "text": "..."}, "chat_context": {...}}`
- **Flask Request**: `{"network_name": "...", "message": "...", "session_id": "..."}`
- **Response**: SSE stream with ChatResponse format

## Testing

To test the adapter:

1. **Start Flask backend**:
   ```bash
   cd neuro-san-studio
   python -m run
   ```

2. **Test endpoints with curl**:
   ```bash
   # Health check
   curl http://localhost:8080/api/v1/health
   
   # List networks
   curl http://localhost:8080/api/v1/concierge/list
   
   # Get connectivity
   curl http://localhost:8080/api/v1/insurance/connectivity
   ```

3. **Start Next.js UI**:
   ```bash
   cd neuro-san-ui-reference
   yarn install
   yarn generate  # Generate OpenAPI types
   yarn run dev
   ```

4. **Configure Next.js UI**:
   - Set `NEURO_SAN_SERVER_URL=http://localhost:8080` in `.env`

## Known Limitations

1. **Streaming Chat**: The current implementation sends the full response as a single SSE chunk. True streaming (token-by-token) would require modifications to the Flask backend's `send_message_to_network` method.

2. **OpenAPI Types**: The Next.js UI expects generated OpenAPI types. These need to be generated from the backend's OpenAPI spec. Currently, the adapter implements the expected format based on code analysis.

3. **Authentication**: The Next.js UI may require authentication (NextAuth). For local development, this can be bypassed or mocked.

4. **Session Management**: The adapter extracts `session_id` from `chat_context`, but the Next.js UI may use a different session management approach.

## Next Steps

1. **Generate OpenAPI Types**: Run `yarn generate` in the Next.js UI to get exact type definitions
2. **Test Integration**: Start both UIs and verify connectivity
3. **Refine Transformations**: Adjust data transformations based on actual API responses
4. **Implement True Streaming**: If needed, modify backend to support token-by-token streaming
5. **Handle Authentication**: Implement or mock NextAuth for local development

## Files Modified

- `app.py`: Added API adapter import and registration
- CORS configuration already supports both UIs

## Status

✅ **Adapter Created**: All endpoints implemented
✅ **Blueprint Registered**: Adapter is registered in Flask app
✅ **CORS Configured**: Both UIs can access the backend
⏳ **Testing Pending**: Needs verification with actual Next.js UI
⏳ **OpenAPI Types**: Need to generate types for exact format verification






