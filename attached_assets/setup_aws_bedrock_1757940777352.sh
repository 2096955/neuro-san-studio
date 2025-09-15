#!/bin/bash

# AWS Bedrock API Key Setup Script for Neuro-SAN Studio
# This script sets up the environment variables needed for AWS Bedrock API Key authentication

echo "Setting up AWS Bedrock API Key environment variables..."

# Set the region and endpoint
export AWS_REGION="us-east-2"
export AWS_DEFAULT_REGION="us-east-2"
export BEDROCK_ENDPOINT="https://bedrock-runtime.us-east-2.amazonaws.com"

echo "Environment variables set:"
echo "AWS_REGION: $AWS_REGION"
echo "AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION"
echo "BEDROCK_ENDPOINT: $BEDROCK_ENDPOINT"
echo ""
echo "IMPORTANT: You need to set your Base64 encoded AWS Bedrock API key:"
echo "export AWS_BEDROCK_API_KEY=\"your_base64_encoded_api_key\""
echo ""
echo "The API key should be a Base64 encoded JSON object containing:"
echo "{"
echo "  \"access_key_id\": \"your_access_key_id\","
echo "  \"secret_access_key\": \"your_secret_access_key\","
echo "  \"session_token\": \"your_session_token\","
echo "  \"region\": \"us-east-2\""
echo "}"
echo ""
echo "To make these permanent, add them to your ~/.zshrc file:"
echo "echo 'export AWS_REGION=\"us-east-2\"' >> ~/.zshrc"
echo "echo 'export AWS_DEFAULT_REGION=\"us-east-2\"' >> ~/.zshrc"
echo "echo 'export BEDROCK_ENDPOINT=\"https://bedrock-runtime.us-east-2.amazonaws.com\"' >> ~/.zshrc"
echo "echo 'export AWS_BEDROCK_API_KEY=\"your_base64_encoded_api_key\"' >> ~/.zshrc"
