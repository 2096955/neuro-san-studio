# AWS Bedrock Setup for Neuro-SAN Studio

This guide explains how to configure Neuro-SAN Studio to use AWS Bedrock instead of OpenAI.

## Overview

The system has been updated to use AWS Bedrock with the Claude 3.7 Sonnet model. The configuration is located in `registries/sdlc_orchestrator.hocon`.

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
    "model_name": "bedrock-us-claude-3-7-sonnet",
    "region_name": "us-east-2"
},
```

### 2. Required Environment Variables

You need to set the following environment variables for AWS Bedrock authentication:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
export AWS_SESSION_TOKEN="your_session_token"  # Only if using temporary credentials
export AWS_REGION="us-east-2"
export AWS_DEFAULT_REGION="us-east-2"
```

## Setup Instructions

### Option 1: Using the Setup Script

1. Run the setup script:
   ```bash
   ./setup_aws_bedrock.sh
   ```

2. Follow the instructions to set your actual AWS credentials.

### Option 2: Manual Setup

1. Set the region:
   ```bash
   export AWS_REGION="us-east-2"
   export AWS_DEFAULT_REGION="us-east-2"
   ```

2. Set your AWS credentials:
   ```bash
   export AWS_ACCESS_KEY_ID="your_access_key_id"
   export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
   export AWS_SESSION_TOKEN="your_session_token"  # Only if using temporary credentials
   ```

3. Make the changes permanent by adding them to your shell configuration:
   ```bash
   echo 'export AWS_REGION="us-east-2"' >> ~/.zshrc
   echo 'export AWS_DEFAULT_REGION="us-east-2"' >> ~/.zshrc
   echo 'export AWS_ACCESS_KEY_ID="your_access_key_id"' >> ~/.zshrc
   echo 'export AWS_SECRET_ACCESS_KEY="your_secret_access_key"' >> ~/.zshrc
   echo 'export AWS_SESSION_TOKEN="your_session_token"' >> ~/.zshrc
   ```

## Testing the Configuration

Run the test script to verify your Bedrock configuration:

```bash
python3 test_bedrock_config.py
```

This script will:
- Check that all required environment variables are set
- Initialize a Bedrock client
- Send a test message to verify connectivity

## AWS Prerequisites

1. **AWS Account**: You need an active AWS account
2. **Bedrock Access**: Ensure you have access to Amazon Bedrock in the us-east-2 region
3. **Model Access**: The Claude 3.7 Sonnet model must be available in your account
4. **IAM Permissions**: Your AWS credentials need the following permissions:
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`

## Troubleshooting

### Common Issues

1. **"Access Denied" Error**:
   - Check your AWS credentials
   - Verify IAM permissions for Bedrock
   - Ensure the model is available in your region

2. **"Model Not Found" Error**:
   - Check that Claude 3.7 Sonnet is available in your AWS account
   - Verify the region is correct (us-east-2)

3. **"Invalid Credentials" Error**:
   - Verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   - Check that your session token is valid (if using temporary credentials)

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
