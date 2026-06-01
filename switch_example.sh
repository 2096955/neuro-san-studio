#!/bin/bash
# Switch between different industry vertical examples

if [ $# -eq 0 ]; then
    echo "Usage: ./switch_example.sh [insurance|banking]"
    echo ""
    echo "Available examples:"
    echo "  insurance - Insurance Underwriting (12 agents, Multi-LLM: Azure GPT-5, Gemini, Bedrock)"
    echo "  banking   - Banking Operations (14 agents, AWS Bedrock Claude Sonnet 4)"
    exit 1
fi

EXAMPLE=$1

if [ "$EXAMPLE" == "insurance" ]; then
    echo "🏥 Switching to Insurance Underwriting example..."
    cp examples/insurance/app.py app.py
    cp -r examples/insurance/templates templates/
    echo "✅ Switched to Insurance Underwriting"
    echo "📝 Features: 12 agents, Multi-LLM (Azure GPT-5, Google Gemini, AWS Bedrock)"
    echo "🔑 Required: AWS_BEDROCK_API_KEY, AZURE_GPT5_KEY, GOOGLE_API_KEY, GEMINI_API_KEY_BACKUP_2"
    echo "🚀 Restart the server to see changes: python app.py"
    
elif [ "$EXAMPLE" == "banking" ]; then
    echo "🏦 Switching to Banking Operations example..."
    cp examples/banking/app.py app.py
    cp -r examples/banking/templates templates/
    echo "✅ Switched to Banking Operations"
    echo "📝 Features: 14 agents, AWS Bedrock Claude Sonnet 4"
    echo "🔑 Required: AWS_BEDROCK_API_KEY"
    echo "🚀 Restart the server to see changes: python app.py"
    
else
    echo "❌ Unknown example: $EXAMPLE"
    echo "Available examples: insurance, banking"
    exit 1
fi
