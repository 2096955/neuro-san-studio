# Industry Examples - Complete Guide

## Overview

You now have **two complete, working multi-agent systems** saved as reusable examples:

1. **Insurance Underwriting** (currently active) - 12 agents with multi-LLM providers
2. **Banking Operations** - 14 agents with AWS Bedrock Claude Sonnet 4

Both examples are self-contained in the `examples/` directory and can be easily switched between.

## What You Have

### File Structure

```
examples/
├── README.md                           # Main examples documentation
├── QUICKSTART.md                       # Quick start guide
├── insurance/                          # Insurance example (CURRENT)
│   ├── app.py                          # Flask app with 12 insurance agents
│   ├── templates/network_pro.html      # Professional 3-panel UI
│   └── README.md                       # Insurance-specific documentation
└── banking/                            # Banking example
    ├── app.py                          # Flask app with 14 banking agents
    ├── templates/network_pro.html      # Professional 3-panel UI
    └── README.md                       # Banking-specific documentation

switch_example.sh                       # Easy switching script
EXAMPLES_GUIDE.md                       # This file
```

## Currently Active: Insurance Underwriting

You're currently running the **Insurance Underwriting** example with:

✅ **12 Specialist Agents**:
- Insurance Agent (frontman) - AWS Bedrock Claude Sonnet 4
- Underwriting Decision - AWS Bedrock Claude Sonnet 4
- Claims Processing - **Google Gemini 2.0 Flash Thinking**
- Claims Adjustment - **Azure GPT-5**
- Plus 8 more specialists (Insurance Broker, Third Party Data Review, etc.)

✅ **Multi-LLM Providers**:
- **Azure GPT-5**: Claims Adjustment agent
- **Google Gemini 2.0 Flash Thinking**: Claims Processing agent
- **AWS Bedrock Claude Sonnet 4**: 10 other agents

✅ **Professional Interface**:
- Three-panel layout (Agent Cards | Network Graph | Chat)
- D3.js force-directed visualization
- Zone organization (Front Office, Middle Office, Back Office)
- Individual agent chat with persona awareness

## Switching to Banking

To switch to the banking example:

```bash
# Option 1: Use the switch script
./switch_example.sh banking

# Option 2: Manual copy
cp examples/banking/app.py app.py
cp -r examples/banking/templates templates/

# Restart the server in Replit (workflows will auto-restart)
```

### Banking Features

🏦 **14 Banking Agents**:
- Customer Service Representative (frontman)
- Account Manager, Fraud Prevention Specialist, Loan Officer (domains)
- Plus 10 specialists: Relationship Manager, Wealth Management Advisor, Investment Specialist, Underwriter, Mortgage Specialist, Business Banking Officer, Fraud Investigation Team, Security Analyst, Portfolio Manager, Trading Desk

🏦 **All agents use AWS Bedrock Claude Sonnet 4**

🏦 **Same professional UI as insurance**

## Quick Test Commands

### Test Insurance (Current)

```bash
# Test Azure GPT-5
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "claims_adjustment_agent", "message": "What is the settlement process?"}'

# Test Google Gemini
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "claims_processing_agent", "message": "I need to file a claim"}'

# Test AWS Bedrock
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "insurance_agent", "message": "I need a quote"}'
```

### Test Banking (After Switching)

```bash
# Test Customer Service
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "customer_service_representative", "message": "I want to open a savings account"}'

# Test Wealth Management
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "wealth_management_advisor", "message": "I want to invest $10,000"}'
```

## Environment Variables

### Insurance (Active)
```bash
AWS_BEDROCK_API_KEY=<your-anthropic-api-key>
AZURE_GPT5_KEY=<your-azure-gpt5-key>
GOOGLE_API_KEY=<your-google-api-key>
GEMINI_API_KEY_BACKUP_2=<your-backup-gemini-key>
OPENAI_API_KEY=<your-openai-key>  # Optional fallback
```

### Banking
```bash
AWS_BEDROCK_API_KEY=<your-anthropic-api-key>
OPENAI_API_KEY=<your-openai-key>  # Optional fallback
```

## Key Features of Both Examples

✨ **Shared Features**:
- Professional light theme UI
- D3.js force-directed network visualization
- Individual agent chat with independent conversation histories
- Real-time WebSocket updates
- Seven functional buttons (Deploy, Analytics, Explicate, Expert, Reset, Export, Settings)
- Hierarchical agent delegation patterns
- Persona-aware responses

🎯 **Unique to Insurance**:
- Multi-LLM provider integration (3 different models in one network)
- Automatic Google Gemini fallback (primary → backup key)
- Azure GPT-5 integration
- Three-zone organization (Front/Middle/Back Office)

🎯 **Unique to Banking**:
- 14-agent network (largest example)
- Complex wealth management delegation chains
- Fraud detection and security workflows
- Business banking capabilities

## Next Steps

1. **Explore the current insurance example** at `http://localhost:5000`
2. **Try chatting with different agents** to test the multi-LLM providers
3. **Switch to banking** when ready: `./switch_example.sh banking`
4. **Review the documentation**:
   - `examples/README.md` - Main overview
   - `examples/QUICKSTART.md` - Quick start guide
   - `examples/insurance/README.md` - Insurance details
   - `examples/banking/README.md` - Banking details

## Documentation References

For deeper technical details:
- Main project docs: `docs/examples/`
- Insurance: `docs/examples/insurance_underwriting_agents.md`
- Banking: `docs/examples/banking_ops.md`
- Config files: `registries/insurance_underwriting_agents.hocon`, `registries/banking_ops.hocon`

## Creating New Examples

You can use these as templates for other industries:
1. Copy one of the example directories: `cp -r examples/insurance examples/retail`
2. Update the agent definitions in `app.py`
3. Modify personas and descriptions
4. Add to the switch script
5. Create industry-specific documentation

## Summary

You now have a complete, production-ready multi-agent framework with:
- ✅ Two working industry examples (Insurance + Banking)
- ✅ Easy switching between examples
- ✅ Multi-LLM provider support
- ✅ Professional UI with network visualization
- ✅ Complete documentation
- ✅ All code organized and saved in `examples/`

The insurance example is currently running at `http://localhost:5000` with Azure GPT-5, Google Gemini 2.0 Flash Thinking, and AWS Bedrock Claude Sonnet 4 all working together! 🎉
