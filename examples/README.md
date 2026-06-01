# Neuro SAN Studio - Industry Examples

This directory contains complete, working examples of multi-agent systems for different industry verticals. Each example is a self-contained application demonstrating the Neuro SAN Studio capabilities with realistic agent networks.

## Available Examples

### 🏥 Insurance Underwriting (`insurance/`)
**Complete multi-LLM provider insurance underwriting specialist network**

- **Agents**: 12 insurance specialists across Front Office, Middle Office, and Back Office
- **LLM Providers**: 
  - Azure GPT-5 (Claims Adjustment)
  - Google Gemini 2.0 Flash Thinking (Claims Processing)
  - AWS Bedrock Claude Sonnet 4 (10 other agents)
- **Features**:
  - Professional three-panel UI with D3.js force-directed graph
  - Individual agent chat with persona awareness
  - Real-time network visualization with zone organization
  - Multi-provider intelligent routing

**Agents**: Insurance Agent (frontman), Underwriting Decision, Claims Processing, Insurance Broker, Third Party Data Review, Underwriter Analysis, Claims Intake, Claims Investigation, Claims Adjustment, ACORD Handler, Risk Exposure, Building Review

**To Run**:
```bash
cp examples/insurance/app.py app.py
cp -r examples/insurance/templates templates/
python app.py
```

### 🏦 Banking Operations (`banking/`)
**Full-spectrum banking support framework with compliance**

- **Agents**: 11 banking specialists across customer service, fraud, lending, and wealth management
- **LLM Provider**: AWS Bedrock Claude Sonnet 4 (all agents)
- **Features**:
  - Hierarchical delegation across banking departments
  - Account management, fraud prevention, loan processing
  - Wealth management and investment advisory
  - Professional visualization interface

**Agents**: Customer Service Representative (frontman), Account Manager, Fraud Prevention Specialist, Loan Officer, Relationship Manager, Wealth Management Advisor, Investment Specialist, Underwriter, Mortgage Specialist, Business Banking Officer, Fraud Investigation Team, Security Analyst, Trading Desk, Portfolio Manager

**To Run**:
```bash
cp examples/banking/app.py app.py
cp -r examples/banking/templates templates/
python app.py
```

## Structure

Each example directory contains:
- `app.py` - Flask application with agent definitions and API routing
- `templates/` - HTML templates for the web interface
- `static/` - Static assets (if any)
- `README.md` - Example-specific documentation

## Switching Between Examples

To switch between examples, simply copy the desired example's files to the root directory:

```bash
# Switch to Insurance
cp examples/insurance/app.py app.py
cp -r examples/insurance/templates templates/

# Switch to Banking
cp examples/banking/app.py app.py
cp -r examples/banking/templates templates/
```

Then restart the Flask server.

## Environment Variables

All examples require:
- `AWS_BEDROCK_API_KEY` - Anthropic API key for Claude Sonnet 4
- `AZURE_GPT5_KEY` - Azure GPT-5 deployment key (Insurance only)
- `GOOGLE_API_KEY` - Google Gemini primary key (Insurance only)
- `GEMINI_API_KEY_BACKUP_2` - Google Gemini backup key (Insurance only)

## Architecture

All examples follow the same architectural pattern:
1. **Frontman Agent**: Single entry point for all user interactions
2. **Domain Agents**: Mid-level specialists that coordinate workflows
3. **Specialist Agents**: Deep experts in specific areas
4. **Intelligent Routing**: Automatic LLM provider selection based on agent model field
5. **Independent Chat**: Each agent maintains isolated conversation history

## Documentation

For more details on each example, see:
- Insurance: `docs/examples/insurance_underwriting_agents.md`
- Banking: `docs/examples/banking_ops.md`
