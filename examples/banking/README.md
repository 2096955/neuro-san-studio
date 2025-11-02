# Banking Operations Multi-Agent System

A comprehensive banking support framework with 14 specialized agents organized hierarchically across customer service, account management, fraud prevention, and lending operations.

## Architecture

### Agent Hierarchy

**Frontman**:
- Customer Service Representative - Entry point for all banking inquiries

**Primary Domains** (3):
- Account Manager - Customer relationships and wealth services
- Fraud Prevention Specialist - Security and fraud detection
- Loan Officer - Lending and credit services

**Specialists** (10):

*Account Management Team*:
- Relationship Manager - VIP client services
- Wealth Management Advisor - High-net-worth advisory
- Investment Specialist - Investment products

*Fraud Prevention Team*:
- Fraud Investigation Team - Complex fraud cases
- Security Analyst - Cybersecurity

*Loan Services Team*:
- Underwriter - Risk assessment
- Mortgage Specialist - Home financing
- Business Banking Officer - Commercial lending

*Investment Management Team*:
- Portfolio Manager - Portfolio oversight
- Trading Desk - Transaction execution

## Agent Network Diagram

```
Customer Service Representative (frontman)
├── Account Manager
│   ├── Relationship Manager
│   │   ├── Wealth Management Advisor
│   │   └── Investment Specialist
│   ├── Wealth Management Advisor
│   │   ├── Investment Specialist
│   │   └── Portfolio Manager
│   └── Investment Specialist
│       ├── Portfolio Manager
│       └── Trading Desk
├── Fraud Prevention Specialist
│   ├── Fraud Investigation Team
│   │   └── Security Analyst
│   └── Security Analyst
└── Loan Officer
    ├── Underwriter
    ├── Mortgage Specialist
    └── Business Banking Officer
```

## Features

- **Hierarchical Delegation**: Mimics real banking organizational structure
- **Domain Expertise**: Specialized agents for each banking function
- **Compliance Aware**: Built-in regulatory and confidentiality awareness
- **Interactive Follow-ups**: Agents request additional information when needed
- **Professional UI**: Three-panel interface with D3.js force-directed graph

## LLM Integration

All agents use **AWS Bedrock Claude Sonnet 4** via Anthropic API with fallback to OpenAI GPT-4 Turbo.

## Environment Setup

Required environment variables:
```bash
AWS_BEDROCK_API_KEY=<your-anthropic-api-key>
OPENAI_API_KEY=<your-openai-key>  # Optional fallback
```

## Running the Application

```bash
# From examples/banking directory
python app.py

# Or from root directory
cp examples/banking/app.py app.py
cp -r examples/banking/templates templates/
python app.py
```

Access the application at: `http://localhost:5000`

## Example Conversations

### Investment Advisory
**User**: "I'm planning to invest $5,000 every month for the next 12 months. Can you suggest a strategy for moderate risk profile?"

**Agent**: The system routes through Customer Service → Account Manager → Wealth Management Advisor → Investment Specialist to provide comprehensive investment strategy recommendations with diversification, dollar-cost averaging, and professional guidance.

### Fraud Prevention
**User**: "I noticed unusual charges on my account from a merchant I don't recognize."

**Agent**: Routes through Customer Service → Fraud Prevention Specialist → Fraud Investigation Team to verify transactions, freeze suspicious activity, and coordinate investigation.

### Mortgage Application
**User**: "I want to apply for a mortgage for a $400,000 home purchase."

**Agent**: Routes through Customer Service → Loan Officer → Mortgage Specialist to guide through pre-approval, documentation requirements, rate options, and application process.

## Technical Details

- **Framework**: Flask with Socket.IO for real-time updates
- **Visualization**: D3.js force-directed graph
- **Agent Communication**: Individual chat histories per agent
- **API Routing**: Intelligent LLM provider selection
- **Session Management**: Unique session IDs per conversation

## Documentation

For more details, see `docs/examples/banking_ops.md` in the main repository.
