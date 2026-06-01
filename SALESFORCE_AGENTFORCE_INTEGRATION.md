# Salesforce Agentforce Integration

## Overview

The Automotive Manufacturing network's **Dealership Support Agent** is powered by Salesforce Agentforce, providing real enterprise-grade dealership support through Salesforce's AI agent platform.

## Integration Details

### Authentication
- **OAuth 2.0 Client Credentials Flow**: Secure token-based authentication
- **Domain**: Configurable Salesforce My Domain URL
- **Client ID/Secret**: Enterprise OAuth credentials

### API Configuration

#### Environment Variables
```bash
AGENTFORCE_MY_DOMAIN_URL=https://epsdc-dev-ed.develop.my.salesforce.com
AGENTFORCE_SERVICE_AGENT_ID=0XxfI0000003MjxSAE
AGENTFORCE_CLIENT_ID=3MVG9BBZP0d0A9KB4Eu_...
AGENTFORCE_CLIENT_SECRET=87D330429545EE23EA15295AC842D76B...
VWI_AGENTFORCE_SERVICE_AGENT_ID=0XxfI0000003NCzSAM  # Optional: VWI-specific agent
```

#### API Endpoints
1. **OAuth Token**: `POST /services/oauth2/token`
   - Grant Type: `client_credentials`
   - Returns: Access token for API calls

2. **Agentforce Runtime**: `POST /services/data/v62.0/agent/runtime`
   - Headers: Bearer token authentication
   - Payload: Agent ID, Session ID, Message
   - Response: AI-generated response from Salesforce Agentforce

### Implementation

#### Flow
1. **User Message** → Dealership Support Agent
2. **OAuth Authentication** → Request access token from Salesforce
3. **API Call** → Send message to Agentforce Runtime API
4. **Response Processing** → Extract agent response
5. **Display** → Show Salesforce Agentforce response in UI

#### Session Management
- Unique session IDs for conversation continuity
- Session preserved across multiple interactions
- Automatic session creation if not provided

#### Error Handling
- OAuth failures: Graceful fallback message
- API errors: Logged with status codes
- Timeout handling: 30-second timeout for API calls
- Fallback to VWI Service Agent ID if primary fails

## Agent Capabilities

The Salesforce Agentforce Dealership Support agent handles:
- **Technical Service Guidance**: Complex repair procedures
- **Warranty Claims**: Claim approval and processing
- **Sales Operations**: Product information and inventory
- **Dealer Communications**: Professional dealer support

## Usage in Network

### Accessing the Agent
1. Switch to "Automotive Manufacturing" network via dropdown
2. Select "Dealership Support" agent from left sidebar
3. Ask questions about dealership operations, technical support, or warranty claims
4. Responses powered by real Salesforce Agentforce AI

### Example Queries
- "How do I process a warranty claim for a 2024 VW Atlas?"
- "What are the current incentives on the ID.4 model?"
- "Customer has code P0171 on a Golf GTI - what's the fix?"
- "How do we handle a goodwill warranty request?"

## Technical Benefits

### Enterprise Integration
- **Real Salesforce Data**: Connects to actual Salesforce org
- **CRM Integration**: Access to customer and dealer records
- **Workflow Automation**: Leverages Salesforce automation
- **Security**: Enterprise-grade OAuth 2.0 authentication

### Scalability
- Session-based conversation tracking
- Automatic token refresh handling
- Configurable agent routing (standard vs VWI)
- Production-ready error handling

## Monitoring

### Logging
All Salesforce Agentforce interactions are logged:
- OAuth authentication attempts
- API call success/failure
- Response times
- Error messages and status codes

Check application logs for debugging:
```bash
# Filter for Agentforce logs
grep -i "agentforce" <log_file>
```

## Future Enhancements

Potential improvements:
- Token caching for improved performance
- Multiple agent routing based on query type
- Conversation history persistence
- Analytics and usage tracking
- Custom error messages based on error types

---

**Status**: ✅ Fully integrated and operational  
**Last Updated**: November 2, 2025  
**LLM Provider**: Salesforce Agentforce (VWI Service Agent)
