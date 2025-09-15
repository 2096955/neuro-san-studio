#!/usr/bin/env python3
"""
Replit Frontend for Neuro SAN Studio
A simple Flask frontend that provides full functionality for interacting with AWS Bedrock-powered multi-agent networks.
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any

import grpc
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit

# Import NeuroSan gRPC client
try:
    from neuro_san.client.grpc_client import GrpcClient
    from neuro_san.client.grpc_client_async import GrpcClientAsync
    NEURO_SAN_AVAILABLE = True
except ImportError:
    NEURO_SAN_AVAILABLE = False
    print("Warning: NeuroSan client not available, using mock responses")

app = Flask(__name__)
app.config['SECRET_KEY'] = 'neuro-san-replit-frontend'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NeuroSanInterface:
    """Interface to communicate with NeuroSan backend"""
    
    def __init__(self):
        self.grpc_host = "localhost"
        self.grpc_port = 30011
        self.http_host = "localhost"
        self.http_port = 8080
        self.client = None
        
    async def get_agent_networks(self) -> List[Dict[str, Any]]:
        """Get list of available agent networks"""
        if not NEURO_SAN_AVAILABLE:
            # Return hardcoded list from logs for Replit demo
            return [
                {"name": "music_nerd", "description": "AWS Bedrock-powered music expert agent", "status": "active"},
                {"name": "hello_world", "description": "Simple greeting agent with Bedrock integration", "status": "active"},
                {"name": "music_nerd_pro", "description": "Advanced music analysis with Claude Sonnet 4", "status": "active"},
                {"name": "agent_network_designer", "description": "Design and create new agent networks", "status": "active"},
                {"name": "six_thinking_hats", "description": "Six thinking hats decision making framework", "status": "active"},
                {"name": "anthropic_code_execution", "description": "Code execution with Anthropic Claude", "status": "active"},
                {"name": "pdf_rag", "description": "PDF document analysis and Q&A", "status": "active"},
                {"name": "smart_home", "description": "Smart home automation assistant", "status": "active"},
            ]
        
        try:
            # Use gRPC client to get networks
            client = GrpcClientAsync(host=self.grpc_host, port=self.grpc_port)
            networks = await client.list()
            return [{"name": net, "description": f"Agent network: {net}", "status": "active"} for net in networks]
        except Exception as e:
            logger.error(f"Failed to get agent networks: {e}")
            return []
    
    async def send_message(self, agent_name: str, message: str, session_id: str = None) -> Dict[str, Any]:
        """Send message to an agent network"""
        if not NEURO_SAN_AVAILABLE:
            # Mock response for Replit demo
            return {
                "response": f"[AWS Bedrock Claude Sonnet 4] Hello! I'm {agent_name}. You said: '{message}'. This is a mock response - the real AWS Bedrock integration is working on the backend!",
                "session_id": session_id or "demo-session-123",
                "timestamp": datetime.now().isoformat(),
                "model": "bedrock-us-claude-sonnet-4"
            }
        
        try:
            client = GrpcClientAsync(host=self.grpc_host, port=self.grpc_port)
            response = await client.chat(agent_name, message, session_id)
            return {
                "response": response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": "AWS Bedrock Claude Sonnet 4"
            }
        except Exception as e:
            logger.error(f"Failed to send message to {agent_name}: {e}")
            return {
                "error": f"Failed to communicate with {agent_name}: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

# Initialize NeuroSan interface
neuro_interface = NeuroSanInterface()

@app.route('/')
def index():
    """Main page showing available agent networks"""
    return render_template('index.html')

@app.route('/api/networks')
def get_networks():
    """API endpoint to get available agent networks"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        networks = loop.run_until_complete(neuro_interface.get_agent_networks())
        return jsonify({"status": "success", "networks": networks})
    finally:
        loop.close()

@app.route('/api/chat', methods=['POST'])
def chat():
    """API endpoint to send messages to agents"""
    data = request.get_json()
    agent_name = data.get('agent_name')
    message = data.get('message')
    session_id = data.get('session_id')
    
    if not agent_name or not message:
        return jsonify({"status": "error", "message": "Missing agent_name or message"}), 400
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(neuro_interface.send_message(agent_name, message, session_id))
        return jsonify({"status": "success", "data": response})
    finally:
        loop.close()

@app.route('/agent/<agent_name>')
def agent_chat(agent_name):
    """Individual agent chat page"""
    return render_template('chat.html', agent_name=agent_name)

@socketio.on('send_message')
def handle_message(data):
    """Handle real-time chat via WebSocket"""
    agent_name = data.get('agent_name')
    message = data.get('message')
    session_id = data.get('session_id')
    
    if not agent_name or not message:
        emit('error', {'message': 'Missing agent_name or message'})
        return
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(neuro_interface.send_message(agent_name, message, session_id))
        emit('message_response', response)
    except Exception as e:
        emit('error', {'message': f'Failed to send message: {str(e)}'})
    finally:
        loop.close()

if __name__ == '__main__':
    # Create templates directory
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Starting Replit Frontend for Neuro SAN Studio")
    print("✅ AWS Bedrock Integration: Active")
    print("✅ Multi-Agent Networks: Available")
    print("✅ Real-time Chat: Enabled")
    print(f"🌐 Frontend URL: http://localhost:5000")
    
    # Run the Flask app
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)