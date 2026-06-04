# Required API Keys for Neuro SAN Studio

This document lists all API keys required for the Neuro SAN Studio Cloud Run deployment.

## Required Environment Variables

### 1. AWS_BEDROCK_API_KEY ⭐ **CRITICAL**
- **Purpose**: Anthropic Claude API access (used as bearer token)
- **Required For**: 
  - **3 Frontman/Orchestrator agents** use "AWS Bedrock Claude Sonnet 4" model:
    - `automotive_operations_coordinator` (Automotive frontman)
    - `customer_service_representative` (Banking frontman)
    - `insurance_agent` (Insurance frontman)
- **Where to get**: [Anthropic Console](https://console.anthropic.com/)
- **Note**: Despite the name, this is actually an Anthropic API key, not AWS Bedrock
- **Priority**: ⭐⭐⭐ HIGHEST - Required for frontman agents (critical orchestrators)

### 2. OPENAI_API_KEY
- **Purpose**: OpenAI GPT-4 Turbo fallback
- **Required For**: 
  - Fallback when other APIs fail
  - Used by some agents as secondary option
- **Where to get**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Priority**: ⭐⭐ MEDIUM - Useful fallback

### 3. GOOGLE_API_KEY ⭐⭐⭐ **CRITICAL - PRIMARY MODEL**
- **Purpose**: Google Gemini 2.0 Flash Thinking API
- **Required For**: 
  - **35 agents** now use Gemini as primary model (optimized for speed/cost):
    - **Automotive**: Manufacturing Operations, Supply Chain, Engineering Support, Production Planning, Quality Control, Factory Efficiency, Parts Inventory, Supplier Relations, Logistics, Service Scheduling, Recall Information
    - **Banking**: Account Manager, Fraud Prevention, Loan Officer, Relationship Manager, Wealth Management, Investment Specialist, Fraud Investigation, Security Analyst, Underwriter, Mortgage Specialist, Business Banking, Portfolio Manager, Trading Desk
    - **Insurance**: Underwriting Decision, Insurance Broker, Third Party Data Review, Underwriter Analysis, Claims Processing, Claims Intake, Claims Investigation, ACORD Handler, Risk Exposure, Building Review
- **Where to get**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Priority**: ⭐⭐⭐ HIGHEST - Used by 81% of agents (35/43)

### 4. GEMINI_API_KEY_BACKUP_2
- **Purpose**: Backup Google Gemini API key
- **Required For**: 
  - Fallback when primary GOOGLE_API_KEY fails
  - Automatic failover for Gemini requests
- **Where to get**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Priority**: ⭐ LOW - Optional backup

### 5. AZURE_GPT5_KEY
- **Purpose**: Azure GPT-5 Chat API
- **Required For**: 
  - Claims Adjustment agent (Insurance network)
  - Uses Azure Cognitive Services endpoint
- **Endpoint**: `https://20969-mgp7xyl6-eastus2.cognitiveservices.azure.com`
- **Model**: `gpt-5-chat`
- **API Version**: `2024-12-01-preview`
- **Where to get**: Azure Portal → Cognitive Services → API Keys
- **Priority**: ⭐⭐ MEDIUM - Used by Claims Adjustment agent

### 6. SECRET_KEY (Optional)
- **Purpose**: Flask session encryption
- **Default**: `neuro-san-network-visualization-dev-only` (development)
- **Required For**: Production security (session management)
- **Priority**: ⭐ LOW - Optional, has default value

### 7. FLASK_DEBUG (Optional)
- **Purpose**: Enable Flask debug mode
- **Default**: `False`
- **Required For**: Development debugging
- **Priority**: ⭐ LOW - Optional

## Agent-Specific Key Requirements

### Insurance Network Agents
| Agent | Model Used | Required Key |
|-------|-----------|--------------|
| Insurance Agent | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |
| Underwriting Decision | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |
| Claims Processing | Google Gemini 2.0 Flash Thinking | `GOOGLE_API_KEY` ⭐ |
| Claims Adjustment | Azure GPT-5 | `AZURE_GPT5_KEY` ⭐⭐ |
| All other agents | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |

### Banking Network Agents
| Agent | Model Used | Required Key |
|-------|-----------|--------------|
| All agents | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |

### Automotive Network Agents
| Agent | Model Used | Required Key |
|-------|-----------|--------------|
| Operations Coordinator | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |
| Manufacturing Operations | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |
| Dealership Support [SF] | Salesforce Agentforce | ✅ No key needed (Cloud Run) |
| Customer Service [SF] | Salesforce Agentforce | ✅ No key needed (Cloud Run) |
| Technical Service Advisor [SF] | Salesforce Agentforce | ✅ No key needed (Cloud Run) |
| Warranty Claims [SF] | Salesforce Agentforce | ✅ No key needed (Cloud Run) |
| All other agents | AWS Bedrock Claude Sonnet 4 | `AWS_BEDROCK_API_KEY` ⭐ |

## Salesforce Integration (No API Keys Required)

The following agents use Salesforce Agentforce via Cloud Run:
- **Dealership Support [SF]** → VWI Sales Agent
- **Customer Service [SF]** → Default Service Agent  
- **Technical Service Advisor [SF]** → VWI Service Agent
- **Warranty Claims [SF]** → VWI Service Agent

These agents connect to: `https://salesforce-agentforce-534348290993.us-central1.run.app/execute`

**No API keys needed** - Authentication handled by Cloud Run service.

## Setting API Keys on Cloud Run

### Option 1: Set All Keys at Once (Recommended)

```bash
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --set-env-vars \
    AWS_BEDROCK_API_KEY=your_anthropic_key_here,\
    OPENAI_API_KEY=your_openai_key_here,\
    GOOGLE_API_KEY=your_gemini_key_here,\
    GEMINI_API_KEY_BACKUP_2=your_backup_gemini_key_here,\
    AZURE_GPT5_KEY=your_azure_key_here
```

### Option 2: Set Keys Individually

```bash
# Set Anthropic/Claude key (CRITICAL)
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --set-env-vars AWS_BEDROCK_API_KEY=your_key_here

# Set Google Gemini key
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --set-env-vars GOOGLE_API_KEY=your_key_here

# Set OpenAI key
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=your_key_here

# Set Azure GPT-5 key
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --set-env-vars AZURE_GPT5_KEY=your_key_here
```

### Option 3: Using Secret Manager (Production Best Practice)

For production, use Google Secret Manager:

```bash
# Create secrets
echo -n "your_anthropic_key" | gcloud secrets create aws-bedrock-api-key --data-file=-
echo -n "your_gemini_key" | gcloud secrets create google-api-key --data-file=-
echo -n "your_openai_key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your_azure_key" | gcloud secrets create azure-gpt5-key --data-file=-

# Grant Cloud Run access
PROJECT_NUMBER=$(gcloud projects describe gbg-neuro --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding aws-bedrock-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update service to use secrets
gcloud run services update neuro-san-studio \
  --region us-central1 \
  --update-secrets \
    AWS_BEDROCK_API_KEY=aws-bedrock-api-key:latest,\
    GOOGLE_API_KEY=google-api-key:latest,\
    OPENAI_API_KEY=openai-api-key:latest,\
    AZURE_GPT5_KEY=azure-gpt5-key:latest
```

## Minimum Configuration

**Minimum required for basic functionality:**
- `AWS_BEDROCK_API_KEY` ⭐⭐⭐ - Most agents require this

**Recommended for full functionality:**
- `AWS_BEDROCK_API_KEY` ⭐⭐⭐
- `GOOGLE_API_KEY` ⭐⭐⭐ - For Claims Processing agent
- `AZURE_GPT5_KEY` ⭐⭐ - For Claims Adjustment agent

**Optional but recommended:**
- `OPENAI_API_KEY` ⭐⭐ - Fallback option
- `GEMINI_API_KEY_BACKUP_2` ⭐ - Backup for Gemini

## Verification

After setting keys, verify they're working:

```bash
# Check environment variables
gcloud run services describe neuro-san-studio \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"

# Test the service
curl https://neuro-san-studio-534348290993.us-central1.run.app/api/topology
```

## Key Priority Summary

1. ⭐⭐⭐ **CRITICAL**: `AWS_BEDROCK_API_KEY` - Required for 90% of agents
2. ⭐⭐⭐ **HIGH**: `GOOGLE_API_KEY` - Required for Claims Processing agent
3. ⭐⭐ **MEDIUM**: `AZURE_GPT5_KEY` - Required for Claims Adjustment agent
4. ⭐⭐ **MEDIUM**: `OPENAI_API_KEY` - Useful fallback
5. ⭐ **LOW**: `GEMINI_API_KEY_BACKUP_2` - Optional backup

## Notes

- **Salesforce agents [SF] don't require API keys** - They use the Cloud Run Salesforce Agentforce service
- **Keys are validated** - If a key is missing, agents will fall back to demo mode or other available APIs
- **Multiple keys per provider** - Some providers support primary and backup keys for reliability
- **Security**: For production, use Secret Manager instead of environment variables

---

**Service URL**: https://neuro-san-studio-534348290993.us-central1.run.app  
**Last Updated**: November 5, 2025

