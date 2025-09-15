#!/usr/bin/env python3
"""
Custom AWS Bedrock client for API key authentication
"""

import os
import base64
import json
import boto3
from botocore.config import Config
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import Credentials
import requests
from typing import Optional, Dict, Any


class BedrockAPIClient:
    """Custom Bedrock client that uses API key authentication"""
    
    def __init__(self, api_key: str, region: str = "us-east-2", 
                 endpoint: str = "https://bedrock-runtime.us-east-2.amazonaws.com"):
        self.api_key = api_key
        self.region = region
        self.endpoint = endpoint
        self.base_url = f"{endpoint}/model"
        
    def _decode_api_key(self) -> Dict[str, str]:
        """Decode the Base64 encoded API key to extract credentials"""
        try:
            # Decode the Base64 encoded token
            decoded_token = base64.b64decode(self.api_key).decode('utf-8')
            
            # Parse the decoded token (assuming it contains JSON with credentials)
            token_data = json.loads(decoded_token)
            
            return {
                'access_key': token_data.get('access_key_id', ''),
                'secret_key': token_data.get('secret_access_key', ''),
                'session_token': token_data.get('session_token', ''),
                'region': token_data.get('region', self.region)
            }
        except Exception as e:
            raise ValueError(f"Failed to decode API key: {str(e)}")
    
    def _create_aws_request(self, model_id: str, body: Dict[str, Any]) -> AWSRequest:
        """Create an AWS request with proper authentication"""
        credentials_data = self._decode_api_key()
        
        # Create credentials object
        credentials = Credentials(
            access_key=credentials_data['access_key'],
            secret_key=credentials_data['secret_key'],
            token=credentials_data.get('session_token')
        )
        
        # Create the request
        url = f"{self.base_url}/{model_id}/invoke"
        request = AWSRequest(
            method='POST',
            url=url,
            data=json.dumps(body),
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        )
        
        # Sign the request
        SigV4Auth(credentials, 'bedrock', self.region).add_auth(request)
        
        return request
    
    def invoke_model(self, model_id: str, messages: list, temperature: float = 0.1) -> str:
        """Invoke the Bedrock model with the given messages"""
        
        # Convert messages to Claude format
        claude_messages = []
        for msg in messages:
            if hasattr(msg, 'content'):
                claude_messages.append({
                    "role": "user" if hasattr(msg, 'content') else "assistant",
                    "content": msg.content
                })
            else:
                claude_messages.append({
                    "role": "user",
                    "content": str(msg)
                })
        
        # Prepare the request body for Claude
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": temperature,
            "messages": claude_messages
        }
        
        try:
            # Create and sign the request
            request = self._create_aws_request(model_id, body)
            
            # Send the request
            response = requests.post(
                request.url,
                data=request.data,
                headers=dict(request.headers),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['content'][0]['text']
            else:
                raise Exception(f"Bedrock API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            raise Exception(f"Failed to invoke model: {str(e)}")


def test_bedrock_api_key():
    """Test function for Bedrock API key authentication"""
    print("Testing AWS Bedrock API Key authentication...")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv('AWS_BEDROCK_API_KEY')
    if not api_key:
        print("❌ AWS_BEDROCK_API_KEY environment variable not set!")
        print("Please set it with your Base64 encoded API key:")
        print("export AWS_BEDROCK_API_KEY=\"your_base64_encoded_key\"")
        return False
    
    try:
        # Create client
        client = BedrockAPIClient(
            api_key=api_key,
            region="us-east-2",
            endpoint="https://bedrock-runtime.us-east-2.amazonaws.com"
        )
        
        print("✓ Bedrock API client created")
        
        # Test with a simple message
        test_messages = [{"role": "user", "content": "Hello, can you respond with just 'Bedrock API test successful'?"}]
        
        print("Testing model invocation...")
        response = client.invoke_model(
            model_id="anthropic.claude-sonnet-4-20250514-v1:0",
            messages=test_messages,
            temperature=0.1
        )
        
        print(f"✓ Response received: {response}")
        print("\n🎉 AWS Bedrock API Key authentication test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing Bedrock API: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Verify your AWS_BEDROCK_API_KEY is correctly Base64 encoded")
        print("2. Check that the decoded key contains valid AWS credentials")
        print("3. Ensure you have access to Bedrock in the us-east-2 region")
        print("4. Verify the Claude model is available in your account")
        return False


if __name__ == "__main__":
    import sys
    success = test_bedrock_api_key()
    sys.exit(0 if success else 1)
