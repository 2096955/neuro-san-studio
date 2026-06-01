# Insurance Underwriting Multi-Agent System

A comprehensive insurance underwriting and claims processing framework with 12 specialized agents featuring multi-LLM provider support (Azure GPT-5, Google Gemini 2.0 Flash Thinking, AWS Bedrock Claude Sonnet 4).

## Architecture

### Agent Hierarchy

**Frontman**:
- Insurance Agent - Entry point for all insurance inquiries

**Primary Domains** (2):
- Underwriting Decision - New policy inquiries and risk assessment
- Claims Processing - Claims lifecycle management

**Specialists** (9):

*Underwriting Team*:
- Insurance Broker - Broker submissions and communications
- Third Party Data Review - External risk data collection
- Underwriter Analysis - Risk exposure and portfolio alignment
  - Risk Exposure Analyzer - Hazard scoring
- ACORD Handler - Application form validation
- Building Review - Property structure evaluation

*Claims Team*:
- Claims Intake - Initial claim collection
- Claims Investigation - Validity verification
- Claims Adjustment - Settlement finalization

## Multi-LLM Provider Distribution

**Azure GPT-5** (1 agent):
- Claims Adjustment - Settlement processing with GPT-5

**Google Gemini 2.0 Flash Thinking** (1 agent):
- Claims Processing - Claims workflow coordination with advanced reasoning

**AWS Bedrock Claude Sonnet 4** (10 agents):
- Insurance Agent (frontman)
- Underwriting Decision
- Insurance Broker
- Third Party Data Review
- Underwriter Analysis
- Claims Intake
- Claims Investigation
- ACORD Handler
- Risk Exposure Analyzer
- Building Review

## Agent Network Diagram

```
Insurance Agent (frontman)
├── Underwriting Decision
│   ├── Insurance Broker
│   │   └── ACORD Handler
│   ├── Third Party Data Review
│   │   └── Building Review
│   └── Underwriter Analysis
│       └── Risk Exposure Analyzer
└── Claims Processing (Google Gemini 2.0)
    ├── Claims Intake
    ├── Claims Investigation
    └── Claims Adjustment (Azure GPT-5)
```

## Features

- **Multi-LLM Architecture**: Three different LLM providers in one network
- **Intelligent Routing**: Automatic model selection based on agent configuration
- **Automatic Fallback**: Google Gemini with backup API key support
- **Professional UI**: Three-panel interface with zone organization (Front Office, Middle Office, Back Office)
- **D3.js Visualization**: Force-directed graph with color-coded agent types
- **Independent Chat**: Each agent maintains isolated conversation history

## LLM Integration Details

**Azure GPT-5**:
- Endpoint: `https://20969-mgp7xyl6-eastus2.cognitiveservices.azure.com/`
- Deployment: `gpt-5-chat`
- API Version: `2024-12-01-preview`

**Google Gemini**:
- Model: `gemini-2.0-flash-thinking-exp-01-21`
- Primary Key: `GOOGLE_API_KEY` (with automatic fallback)
- Backup Key: `GEMINI_API_KEY_BACKUP_2`

**AWS Bedrock**:
- Model: `claude-sonnet-4-20250514`
- API: Anthropic direct via AWS_BEDROCK_API_KEY

## Environment Setup

Required environment variables:
```bash
AWS_BEDROCK_API_KEY=<your-anthropic-api-key>
AZURE_GPT5_KEY=<your-azure-gpt5-key>
GOOGLE_API_KEY=<your-google-api-key>
GEMINI_API_KEY_BACKUP_2=<your-backup-gemini-key>
OPENAI_API_KEY=<your-openai-key>  # Optional fallback
```

## Running the Application

```bash
# From examples/insurance directory
python app.py

# Or from root directory
cp examples/insurance/app.py app.py
cp -r examples/insurance/templates templates/
python app.py
```

Access the application at: `http://localhost:5000`

## Example Conversations

### Underwriting Inquiry
**User**: "I need a quote for commercial property insurance for a 10,000 sq ft warehouse."

**Agent**: Routes through Insurance Agent → Underwriting Decision → Third Party Data Review → Building Review to assess property characteristics, risk factors, and generate underwriting recommendation.

### Claims Processing
**User**: "I need to file a claim for water damage at my insured property."

**Agent (Google Gemini 2.0)**: Routes through Insurance Agent → Claims Processing → Claims Intake → Claims Investigation → Claims Adjustment (Azure GPT-5) to collect details, verify coverage, investigate validity, and finalize settlement.

### ACORD Validation
**User**: "I have an ACORD 125 application that needs review."

**Agent**: Routes through Insurance Agent → Underwriting Decision → Insurance Broker → ACORD Handler to validate form completeness, data consistency, and compliance with underwriting guidelines.

## Testing Different LLMs

You can chat with specific agents to test each LLM:

- **Azure GPT-5**: Chat with "Claims Adjustment" agent
- **Google Gemini**: Chat with "Claims Processing" agent  
- **AWS Bedrock**: Chat with any other agent (Insurance Agent, Underwriting Decision, etc.)

The API response includes the actual model used in the `"model"` field for verification.

## Technical Details

- **Framework**: Flask with Socket.IO for real-time updates
- **Visualization**: D3.js force-directed graph with three-zone layout
- **Agent Communication**: Individual chat histories per agent via `chatHistories` object
- **API Routing**: Keyword-based routing ("Azure" → Azure GPT-5, "Gemini" → Google, default → Bedrock)
- **Session Management**: Unique session IDs per conversation
- **Error Handling**: Automatic fallback for Google Gemini API failures

## Documentation

For more details, see `docs/examples/insurance_underwriting_agents.md` in the main repository.
