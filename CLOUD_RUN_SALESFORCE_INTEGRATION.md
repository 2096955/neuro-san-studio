# Cloud Run Salesforce Agentforce Integration

## Overview

The Automotive Manufacturing network integrates with Salesforce Agentforce agents deployed on Google Cloud Run. This integration provides specialized AI agents for sales, service, and general customer support without requiring direct OAuth configuration.

## Cloud Run Service

**Base URL**: `https://salesforce-agentforce-534348290993.us-central1.run.app`

**Execute Endpoint**: `/execute`

**Health Check**: `/health`

**Region**: us-central1 (Google Cloud Platform)

**Deployment**: Production-ready, highly available

---

## Agent Mapping

The system automatically routes messages from specific automotive agents to the appropriate Salesforce Agentforce specialist:

| Internal Agent | Salesforce Agent ID | Salesforce Agent Type | Display Name | Best For |
|----------------|---------------------|----------------------|--------------|----------|
| **Dealership Support** | `0XxfI0000003NEbSAM` | VWI Sales Agent | VWI Sales Agent (0XxfI0000003NEbSAM) | Vehicle sales, pricing, model information, electric vehicles |
| **Customer Service** | `0XxfI0000003MjxSAE` | Default Service Agent | Default Service Agent (0XxfI0000003MjxSAE) | General inquiries, routing, basic questions |
| **Technical Service Advisor** | `0XxfI0000003NCzSAM` | VWI Service Agent | VWI Service Agent (0XxfI0000003NCzSAM) | Technical repairs, diagnostics, service guidance |
| **Warranty Claims** | `0XxfI0000003NCzSAM` | VWI Service Agent | VWI Service Agent (0XxfI0000003NCzSAM) | Warranty processing, coverage questions |

---

## How It Works

### 1. **Message Routing**
When a user sends a message to an automotive agent that's mapped to Salesforce:

```python
# User selects "Dealership Support" and sends message
User Message → Neuro SAN Platform
             ↓
    Check agent mapping
             ↓
    Route to Cloud Run with agent_id = "0XxfI0000003NEbSAM"
             ↓
    Cloud Run → Salesforce Agentforce API
             ↓
    Response returned to user
```

### 2. **API Payload**
The platform sends the following payload to Cloud Run:

```json
{
  "task_id": "neuro-san-dealership_support_agent-1762362000.123",
  "prompt": "User's message here",
  "context": {
    "agent_id": "0XxfI0000003NEbSAM"
  }
}
```

### 3. **Conversation Continuity**
Cloud Run maintains session state automatically. Each conversation gets a unique session ID that persists across multiple messages for context-aware responses.

---

## Available Salesforce Agents

### 1. VWI Sales Agent (Recommended for Sales) ⭐
**Agent ID**: `0XxfI0000003NEbSAM`

**Use Cases**:
- New vehicle purchases
- Vehicle model information
- Electric vehicle questions (VW ID.4, ID.Buzz, etc.)
- Pricing and financing options
- Feature comparisons

**Example Interactions**:
- "Tell me about VW electric vehicles"
- "What's the price of the VW Tiguan?"
- "Compare VW ID.4 vs. Tesla Model Y"

---

### 2. VWI Service Agent (Recommended for Service) ⭐
**Agent ID**: `0XxfI0000003NCzSAM`

**Use Cases**:
- Service appointments
- Warranty questions
- Maintenance scheduling
- Vehicle service history
- Technical Service Bulletins (TSBs)

**Example Interactions**:
- "I need service for my VW Golf"
- "Check my vehicle's warranty status"
- "What's covered under my warranty?"
- "Schedule a service appointment"

---

### 3. Default Service Agent (General Support)
**Agent ID**: `0XxfI0000003MjxSAE`

**Use Cases**:
- Initial contact
- General questions
- Routing to specialists
- Basic customer support

**Example Interactions**:
- "Hello, I need help"
- "Where can I find information about my vehicle?"
- "Connect me to someone who can help"

---

## Configuration

The integration is configured in `app.py`:

```python
# Salesforce Agentforce Cloud Run Configuration
self.cloud_run_agentforce_url = 'https://salesforce-agentforce-534348290993.us-central1.run.app/execute'

# Agent ID mapping
self.agentforce_agent_mapping = {
    'dealership_support_agent': '0XxfI0000003NEbSAM',      # VWI Sales
    'customer_service_agent': '0XxfI0000003MjxSAE',        # Default Service
    'technical_service_advisor': '0XxfI0000003NCzSAM',     # VWI Service
    'warranty_claims_processor': '0XxfI0000003NCzSAM'      # VWI Service
}
```

### Adding New Agent Mappings

To map additional agents to Salesforce:

1. Add the agent ID to `agentforce_agent_mapping` dictionary
2. Update the agent's `model` field in the topology to show the Salesforce agent type
3. Restart the workflow

Example:
```python
self.agentforce_agent_mapping = {
    'new_agent_id': '0XxfI0000003N1hSAE',  # Sales Agent
    # ... existing mappings
}
```

---

## Error Handling

The integration includes comprehensive error handling:

### Connection Errors
If Cloud Run is unavailable:
```
Response: "I'm currently unavailable. Please try again later."
Model: "Salesforce Agentforce (Error)"
```

### HTTP Errors
Logged with status codes and error messages for debugging.

### Timeout Handling
Requests timeout after 30 seconds to prevent hanging connections.

---

## Testing the Integration

### Test Automotive Network Agents

1. **Switch to Automotive Manufacturing Network**
   - Select "Automotive Manufacturing" from dropdown

2. **Test Dealership Support (VWI Sales)**
   - Click on "Dealership Support" agent
   - Send message: "Tell me about VW electric vehicles"
   - Expected: Response about VW EVs with sales information

3. **Test Customer Service (Default Service)**
   - Click on "Customer Service" agent
   - Send message: "Hello, I need help"
   - Expected: General support response

4. **Test Technical Service Advisor (VWI Service)**
   - Click on "Technical Service Advisor" agent
   - Send message: "I need service for my VW Golf"
   - Expected: Service-focused response with warranty/maintenance info

5. **Test Warranty Claims (VWI Service)**
   - Click on "Warranty Claims" agent
   - Send message: "Check my warranty coverage"
   - Expected: Warranty-specific response

---

## Performance

- **Response Time**: ~6-18 seconds (Salesforce API processing time)
- **Availability**: 99.9% uptime (Cloud Run SLA)
- **Scalability**: Auto-scales up to 10 instances
- **Timeout**: 30 seconds per request

---

## Logs and Debugging

### Successful Requests
```
INFO: Calling Cloud Run Agentforce: agent=dealership_support_agent, salesforce_id=0XxfI0000003NEbSAM
INFO: Cloud Run Agentforce success: Salesforce Agentforce (VWI Sales)
```

### Failed Requests
```
ERROR: Cloud Run Agentforce error 500: Internal server error
ERROR: Error calling Cloud Run Agentforce: Connection timeout
```

### Viewing Logs
```bash
# Check workflow logs for Salesforce integration
grep -i "agentforce" /tmp/logs/Replit_Frontend_*.log

# Check for errors
grep -i "error.*agentforce" /tmp/logs/Replit_Frontend_*.log
```

---

## Benefits of Cloud Run Integration

### ✅ No OAuth Management
- Cloud Run handles OAuth 2.0 authentication
- No need to manage client credentials in application
- Automatic token refresh

### ✅ Simplified Configuration
- Single endpoint URL
- Agent ID mapping in code
- No complex Salesforce API integration

### ✅ High Availability
- Cloud Run auto-scaling
- Multiple instances for reliability
- Regional deployment for low latency

### ✅ Consistent Interface
- Same API for all Salesforce agents
- Standardized request/response format
- Session management built-in

### ✅ Production Ready
- Deployed on Google Cloud infrastructure
- Monitoring and logging included
- SLA-backed service

---

## Comparison: Cloud Run vs. Direct Salesforce API

| Feature | Cloud Run Integration | Direct Salesforce API |
|---------|----------------------|----------------------|
| **OAuth** | Handled by Cloud Run | Manual implementation required |
| **Configuration** | 1 URL + agent mapping | Domain, client ID, client secret, agent IDs |
| **Token Management** | Automatic | Manual refresh logic |
| **Error Handling** | Centralized in Cloud Run | Application-level handling |
| **Scalability** | Cloud Run auto-scaling | Limited by connection pool |
| **Maintenance** | Cloud Run handles updates | Application updates needed |
| **Deployment** | No credentials in code | Credentials must be secured |

---

## Future Enhancements

### Potential Additions:

1. **Sales Agent Integration**
   - Agent ID: `0XxfI0000003N1hSAE`
   - For basic vehicle sales inquiries

2. **Custom Agent Configuration**
   - UI-based agent mapping
   - Dynamic agent selection based on user intent

3. **Session Analytics**
   - Track conversation flows
   - Monitor agent performance
   - User satisfaction metrics

4. **Multi-Turn Optimization**
   - Context retention across sessions
   - Better follow-up question handling

---

## Support and Resources

- **Cloud Run Service**: Production-ready
- **Salesforce Agents**: 4 specialized agents available
- **Documentation**: This file + reference guide
- **Status Page**: Check `/health` endpoint for service status

---

**Last Updated**: November 5, 2025  
**Integration Status**: ✅ Production Active  
**Agents Integrated**: 4 automotive agents → 3 Salesforce agents
