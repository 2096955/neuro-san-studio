# Network Switching Guide

## Dynamic Industry Vertical Switching

The Neuro SAN Studio now supports seamless switching between different industry vertical agent networks without requiring server restart.

## Available Networks

### Insurance Underwriting (12 Agents)
- **Frontman**: Insurance Agent
- **Domain Agents**: Underwriting Decision, Claims Processing  
- **Specialists**: Insurance Broker, Third Party Data Review, Underwriter Analysis, Claims Intake, Claims Investigation, Claims Adjustment, ACORD Handler, Risk Exposure Analyzer, Building Review
- **LLM Providers**: AWS Bedrock Claude Sonnet 4, Google Gemini 2.0 Flash Thinking, Azure GPT-5

### Banking Operations (14 Agents)
- **Frontman**: Customer Service Representative
- **Domain Agents**: Account Manager, Fraud Prevention Specialist, Loan Officer
- **Specialists**: Relationship Manager, Wealth Management Advisor, Investment Specialist, Fraud Investigation Team, Security Analyst, Underwriter, Mortgage Specialist, Business Banking Officer, Portfolio Manager, Trading Desk
- **LLM Providers**: AWS Bedrock Claude Sonnet 4 (all agents)

## How to Switch Networks

### Via UI (Recommended)
1. Locate the **"Industry Vertical"** dropdown in the left sidebar header
2. Click the dropdown to see available options:
   - Insurance Underwriting
   - Banking Operations
3. Select your desired network
4. The system will automatically:
   - Clear the current visualization
   - Reset chat history
   - Load the new network topology
   - Update the agent list and visualization

### Via API (For Development)
```bash
# Get Insurance network
curl http://localhost:5000/api/topology?network=insurance

# Get Banking network  
curl http://localhost:5000/api/topology?network=banking
```

## Technical Implementation

### Backend (`app.py`)
- **Endpoint**: `/api/topology?network={insurance|banking}`
- **Method**: `get_network_topology(network_type: str)`
- **Response**: JSON with nodes and connections for selected network

### Frontend (`templates/network_pro.html`)
- **Dropdown**: `<select id="network-type" onchange="switchNetwork()">`
- **Function**: `async function switchNetwork()` 
- **Behavior**: 
  - Clears visualization canvas
  - Resets chat messages and session state
  - Calls `loadNetworkTopology(selectedNetwork)`
  - Updates UI with new network

### State Management
When switching networks, the system clears:
- Network visualization (D3.js force graph)
- Chat messages display
- Selected agent state
- Current session ID
- All chat histories (`chatHistories` object)

## Examples

Both networks are also available as standalone implementations:

```bash
# Insurance Underwriting example
cd examples/insurance/
python app.py

# Banking Operations example
cd examples/banking/
python app.py
```

Each example directory contains:
- Complete `app.py` with network topology
- `templates/network_pro.html` with visualization
- `README.md` with setup instructions

## Benefits

- **No Server Restart**: Switch networks instantly without downtime
- **Isolated State**: Each network has independent chat histories and agent context
- **Easy Comparison**: Compare different agent network architectures side-by-side
- **Rapid Prototyping**: Test different vertical implementations quickly
- **Production Ready**: Both networks use real LLM providers with intelligent routing
