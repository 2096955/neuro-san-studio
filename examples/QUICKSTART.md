# Quick Start Guide - Industry Examples

## Available Examples

1. **Insurance Underwriting** - 12 agents with multi-LLM providers
2. **Banking Operations** - 14 agents with AWS Bedrock Claude Sonnet 4

## Switching Between Examples

### Using the Switch Script (Recommended)

```bash
# Switch to Insurance
./switch_example.sh insurance

# Switch to Banking
./switch_example.sh banking

# Then restart the server
pkill -f "python app.py"
python app.py
```

### Manual Method

```bash
# Switch to Insurance
cp examples/insurance/app.py app.py
cp -r examples/insurance/templates templates/

# Switch to Banking  
cp examples/banking/app.py app.py
cp -r examples/banking/templates templates/

# Restart server
python app.py
```

## Testing Each Example

### Insurance Example Test

```bash
# Test Azure GPT-5 (Claims Adjustment)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "claims_adjustment_agent", "message": "What is the settlement process?"}'

# Test Google Gemini (Claims Processing)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "claims_processing_agent", "message": "I need to file a claim"}'

# Test AWS Bedrock (Insurance Agent)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "insurance_agent", "message": "I need a quote for property insurance"}'
```

### Banking Example Test

```bash
# Test Customer Service (Frontman)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "customer_service_representative", "message": "I want to open a savings account"}'

# Test Wealth Management
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "wealth_management_advisor", "message": "I want to invest $10,000"}'

# Test Fraud Prevention
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"network_name": "fraud_prevention_specialist", "message": "I see suspicious charges"}'
```

## Environment Variables by Example

### Insurance
```bash
export AWS_BEDROCK_API_KEY="your-anthropic-api-key"
export AZURE_GPT5_KEY="your-azure-gpt5-key"
export GOOGLE_API_KEY="your-google-api-key"
export GEMINI_API_KEY_BACKUP_2="your-backup-gemini-key"
export OPENAI_API_KEY="your-openai-key"  # Optional fallback
```

### Banking
```bash
export AWS_BEDROCK_API_KEY="your-anthropic-api-key"
export OPENAI_API_KEY="your-openai-key"  # Optional fallback
```

## Web Interface

After starting the server, access the web interface at:
```
http://localhost:5000
```

Features:
- **Agent Cards** (left panel): Click to select and chat with individual agents
- **Network Visualization** (center): D3.js force-directed graph showing agent relationships
- **Chat Interface** (right panel): Interactive chat with selected agent
- **Top Buttons**: Deploy, Analytics, Explicate, Expert, Reset, Export, Settings

## File Structure

```
examples/
├── README.md                    # Main examples documentation
├── QUICKSTART.md               # This file
├── insurance/                  # Insurance example
│   ├── app.py                  # Flask app with insurance agents
│   ├── templates/              # HTML templates
│   └── README.md               # Insurance-specific docs
└── banking/                    # Banking example
    ├── app.py                  # Flask app with banking agents
    ├── templates/              # HTML templates
    └── README.md               # Banking-specific docs
```

## Troubleshooting

**Server won't start:**
- Check if port 5000 is already in use: `lsof -i :5000`
- Kill existing process: `pkill -f "python app.py"`

**No API responses:**
- Verify environment variables are set correctly
- Check logs for API errors
- Verify API keys are valid

**Wrong example showing:**
- Run the switch script again
- Manually copy the correct app.py and templates/
- Restart the server

## Next Steps

- Read the detailed documentation: `examples/README.md`
- Read example-specific guides:
  - Insurance: `examples/insurance/README.md`
  - Banking: `examples/banking/README.md`
- Explore the agent network visualizations
- Test individual agent chats
- Review the multi-LLM provider routing code

## Support

For more information:
- Main documentation: `docs/examples/`
- Insurance example: `docs/examples/insurance_underwriting_agents.md`
- Banking example: `docs/examples/banking_ops.md`
