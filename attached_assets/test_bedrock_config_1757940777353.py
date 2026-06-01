#!/usr/bin/env python3
"""
Test script to verify AWS Bedrock API Key configuration for Neuro-SAN Studio
"""

import os
import sys
from custom_bedrock_client import BedrockAPIClient

def test_bedrock_config():
    """Test AWS Bedrock API Key configuration"""
    
    print("Testing AWS Bedrock API Key configuration...")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv('AWS_BEDROCK_API_KEY')
    if not api_key:
        print("❌ AWS_BEDROCK_API_KEY environment variable not set!")
        print("Please set it with your Base64 encoded API key:")
        print("export AWS_BEDROCK_API_KEY=\"your_base64_encoded_key\"")
        return False
    
    print(f"✓ AWS_BEDROCK_API_KEY: {'*' * min(len(api_key), 16)}...")
    print(f"✓ Region: us-east-2")
    print(f"✓ Endpoint: https://bedrock-runtime.us-east-2.amazonaws.com")
    print()
    
    try:
        # Create Bedrock API client
        print("Initializing Bedrock API client...")
        client = BedrockAPIClient(
            api_key=api_key,
            region="us-east-2",
            endpoint="https://bedrock-runtime.us-east-2.amazonaws.com"
        )
        
        print("✓ Bedrock API client initialized")
        
        # Test with a simple message
        print("Testing with a simple message...")
        test_messages = [{"role": "user", "content": "Hello, can you respond with just 'Bedrock API test successful'?"}]
        
        response = client.invoke_model(
            model_id="anthropic.claude-sonnet-4-20250514-v1:0",
            messages=test_messages,
            temperature=0.1
        )
        
        print(f"✓ Response received: {response}")
        print("\n🎉 AWS Bedrock API Key configuration test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing Bedrock configuration: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Verify your AWS_BEDROCK_API_KEY is correctly Base64 encoded")
        print("2. Check that the decoded key contains valid AWS credentials")
        print("3. Ensure you have access to Bedrock in the us-east-2 region")
        print("4. Verify the Claude model is available in your account")
        return False

if __name__ == "__main__":
    success = test_bedrock_config()
    sys.exit(0 if success else 1)
