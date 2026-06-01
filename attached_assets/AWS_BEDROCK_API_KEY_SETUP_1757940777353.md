# AWS Bedrock API Key Setup for Neuro-SAN Studio

This guide explains how to configure Neuro-SAN Studio to use AWS Bedrock with API Key authentication instead of traditional AWS credentials.

## Overview

The system has been updated to use AWS Bedrock with the Claude Sonnet 4 model using API Key authentication. The configuration is located in `registries/sdlc_orchestrator.hocon`.

## Configuration Changes Made

### 1. Updated LLM Configuration

The `llm_config` in `registries/sdlc_orchestrator.hocon` has been changed from:

```hocon
"llm_config": {
    "model_name": "gpt-4o",
},
```

To:

```hocon
"llm_config": {
    "model_name": "bedrock-us-claude-sonnet-4",
    "region_name": "us-east-2",
    "endpoint_url": "https://bedrock-runtime.us-east-2.amazonaws.com",
    "aws_bedrock_api_key": "${AWS_BEDROCK_API_KEY}"
},
```

### 2. Required Environment Variables

You need to set the following environment variables for AWS Bedrock API Key authentication:

```bash
export AWS_BEDROCK_API_KEY="your_base64_encoded_api_key"
export AWS_REGION="us-east-2"
export AWS_DEFAULT_REGION="us-east-2"
```

### 3. API Key Format

The `AWS_BEDROCK_API_KEY` should be a Base64 encoded JSON object containing your AWS credentials:

```json
{
  "access_key_id": "your_access_key_id",
  "secret_access_key": "your_secret_access_key", 
  "session_token": "your_session_token",
  "region": "us-east-2"
}
```

## Setup Instructions

### Option 1: Using the Setup Script

1. Run the setup script:
   ```bash
   ./setup_aws_bedrock.sh
   ```

2. Follow the instructions to set your Base64 encoded API key.

### Option 2: Manual Setup

1. Set the region and endpoint:
   ```bash
   export AWS_REGION="us-east-2"
   export AWS_DEFAULT_REGION="us-east-2"
   export BEDROCK_ENDPOINT="https://bedrock-runtime.us-east-2.amazonaws.com"
   ```

2. Create your Base64 encoded API key:
   ```bash
   # Create a JSON file with your credentials
   echo '{
     "access_key_id": "your_access_key_id",
     "secret_access_key": "your_secret_access_key",
     "session_token": "your_session_token",
     "region": "us-east-2"
   }' > credentials.json
   
   # Encode it to Base64
   export AWS_BEDROCK_API_KEY=$(base64 -i credentials.json)
   
   # Clean up the temporary file
   rm credentials.json
   ```

3. Make the changes permanent by adding them to your shell configuration:
   ```bash
   echo 'export AWS_REGION="us-east-2"' >> ~/.zshrc
   echo 'export AWS_DEFAULT_REGION="us-east-2"' >> ~/.zshrc
   echo 'export BEDROCK_ENDPOINT="https://bedrock-runtime.us-east-2.amazonaws.com"' >> ~/.zshrc
   echo 'export AWS_BEDROCK_API_KEY="your_base64_encoded_api_key"' >> ~/.zshrc
   ```

## Testing the Configuration

Run the test script to verify your Bedrock API Key configuration:

```bash
python3 test_bedrock_config.py
```

This script will:
- Check that the AWS_BEDROCK_API_KEY environment variable is set
- Decode and validate the API key format
- Initialize a Bedrock API client
- Send a test message to verify connectivity

## AWS Prerequisites

1. **AWS Account**: You need an active AWS account
2. **Bedrock Access**: Ensure you have access to Amazon Bedrock in the us-east-2 region
3. **Model Access**: The Claude Sonnet 4 model must be available in your account
4. **IAM Permissions**: Your AWS credentials need the following permissions:
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`

## Troubleshooting

### Common Issues

1. **"Invalid API Key Format" Error**:
   - Check that your API key is properly Base64 encoded
   - Verify the JSON structure contains all required fields
   - Ensure the region matches us-east-2

2. **"Access Denied" Error**:
   - Check your AWS credentials within the API key
   - Verify IAM permissions for Bedrock
   - Ensure the model is available in your region

3. **"Model Not Found" Error**:
   - Check that Claude Sonnet 4 is available in your AWS account
   - Verify the model ID is correct

4. **"Decode Error" Error**:
   - Ensure your API key is valid Base64
   - Check that the JSON structure is correct

### Getting AWS Credentials

1. **AWS Console**:
   - Go to AWS Console → IAM → Users → Your User → Security Credentials
   - Create Access Key

2. **AWS CLI**:
   ```bash
   aws configure
   ```

3. **Temporary Credentials** (if using STS):
   ```bash
   aws sts get-session-token
   ```

## Model Information

- **Model Name**: `bedrock-us-claude-sonnet-4`
- **Region**: `us-east-2`
- **Provider**: Amazon Bedrock
- **Model ID**: `anthropic.claude-sonnet-4-20250514-v1:0`
- **Endpoint**: `https://bedrock-runtime.us-east-2.amazonaws.com`

## Custom Bedrock Client

The system includes a custom Bedrock client (`custom_bedrock_client.py`) that handles:
- Base64 decoding of the API key
- AWS request signing with the decoded credentials
- Direct API calls to the Bedrock endpoint
- Proper error handling and troubleshooting

## Reverting to OpenAI

If you need to revert back to OpenAI, change the `llm_config` in `registries/sdlc_orchestrator.hocon` back to:

```hocon
"llm_config": {
    "model_name": "gpt-4o",
},
```

And set your OpenAI API key:

```bash
export OPENAI_API_KEY="your_openai_api_key"
```
