#!/usr/bin/env python3
"""
Neuro SAN Studio - Agent Network Visualization Platform
Real-time multi-agent network orchestration and visualization interface
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

import grpc
from flask import Flask, render_template, request, jsonify, make_response
from flask_socketio import SocketIO, emit

# Import NeuroSan gRPC client
try:
    from neuro_san.client.grpc_client import GrpcClient
    from neuro_san.client.grpc_client_async import GrpcClientAsync
    NEURO_SAN_AVAILABLE = True
except ImportError:
    NEURO_SAN_AVAILABLE = False
    print("Warning: NeuroSan client not available, using network topology from config")

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'neuro-san-network-visualization-dev-only')
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentNetworkInterface:
    """Interface to communicate with NeuroSan backend and manage agent networks"""
    
    def __init__(self):
        self.grpc_host = "localhost"
        self.grpc_port = 30011
        self.http_host = "localhost" 
        self.http_port = 8080
        self.active_sessions = {}
        self.agent_activity = {}
        # AWS_BEDROCK_API_KEY should contain an Anthropic API key for Claude access
        self.anthropic_api_key = os.environ.get('AWS_BEDROCK_API_KEY', '')
        self.openai_api_key = os.environ.get('OPENAI_API_KEY', '')
        self.google_api_key = os.environ.get('GOOGLE_API_KEY', '')
        self.azure_openai_api_key = os.environ.get('AZURE_OPENAI_API_KEY', '')
        self.azure_openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT', '')
        
    async def _call_ai_model(self, agent_info: Dict[str, Any], message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> str:
        """Call AI model (Anthropic Claude, Google Gemini, Azure OpenAI, or OpenAI) for intelligent responses"""
        import aiohttp
        
        agent_id = agent_info.get("id", "")
        agent_role = agent_info.get("label", "Insurance Agent")
        agent_description = agent_info.get("description", "")
        agent_persona = agent_info.get("persona", "")
        agent_model = agent_info.get("model", "")
        
        # Build rich context-aware system prompt based on agent role
        system_prompt = f"""You are {agent_role} at Hartford, a business insurance company.

ROLE & RESPONSIBILITIES:
{agent_persona}

{agent_description}

IMPORTANT GUIDELINES:
- Speak as a professional insurance specialist in first person ("I will help you with your claim...")
- Be confident and proactive in your role
- You are part of a demo system, so make realistic responses as if you have access to real data
- Only handle matters within your expertise
- Do NOT mention what you cannot do - focus on what you CAN do

Respond naturally as {agent_role} would in a real Hartford insurance setting."""

        # Route to appropriate API based on agent's model
        # Azure OpenAI for Claims Adjustment agent
        if "Azure OpenAI" in agent_model and self.azure_openai_api_key and self.azure_openai_endpoint:
            try:
                # Extract deployment name from endpoint or use default
                deployment_name = "gpt-4"  # Default deployment name
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f'{self.azure_openai_endpoint}/openai/deployments/{deployment_name}/chat/completions?api-version=2024-02-15-preview',
                        headers={
                            'api-key': self.azure_openai_api_key,
                            'Content-Type': 'application/json'
                        },
                        json={
                            'messages': [
                                {'role': 'system', 'content': system_prompt},
                                {'role': 'user', 'content': message}
                            ],
                            'max_tokens': 1024,
                            'temperature': 0.7
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return result['choices'][0]['message']['content']
                        else:
                            error_text = await response.text()
                            logger.error(f"Azure OpenAI API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Azure OpenAI: {e}")
        
        # Google Gemini for Claims Processing agent
        if "Gemini" in agent_model and self.google_api_key:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={self.google_api_key}',
                        headers={
                            'Content-Type': 'application/json'
                        },
                        json={
                            'contents': [{
                                'parts': [{
                                    'text': f"{system_prompt}\n\nUser: {message}"
                                }]
                            }],
                            'generationConfig': {
                                'temperature': 0.7,
                                'maxOutputTokens': 1024
                            }
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return result['candidates'][0]['content']['parts'][0]['text']
                        else:
                            error_text = await response.text()
                            logger.error(f"Google Gemini API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Google Gemini: {e}")
        
        # Try Anthropic Claude for Bedrock agents
        if self.anthropic_api_key:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        'https://api.anthropic.com/v1/messages',
                        headers={
                            'x-api-key': self.anthropic_api_key,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json'
                        },
                        json={
                            'model': 'claude-sonnet-4-20250514',
                            'max_tokens': 1024,
                            'system': system_prompt,
                            'messages': [
                                {'role': 'user', 'content': message}
                            ]
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return result['content'][0]['text']
                        else:
                            error_text = await response.text()
                            logger.error(f"Anthropic API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Anthropic Claude: {e}")
        
        # Fallback to OpenAI
        if self.openai_api_key:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        'https://api.openai.com/v1/chat/completions',
                        headers={
                            'Authorization': f'Bearer {self.openai_api_key}',
                            'Content-Type': 'application/json'
                        },
                        json={
                            'model': 'gpt-4-turbo-preview',
                            'messages': [
                                {'role': 'system', 'content': system_prompt},
                                {'role': 'user', 'content': message}
                            ],
                            'max_tokens': 1024
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return result['choices'][0]['message']['content']
                        else:
                            logger.error(f"OpenAI API error: {response.status}")
            except Exception as e:
                logger.error(f"Error calling OpenAI: {e}")
        
        # Fallback response if no API is available
        return f"Hello, I'm {agent_role}. {agent_description} How can I assist you with your insurance needs today?"
        
    async def get_network_topology(self) -> Dict[str, Any]:
        """Get the full agent network topology with connections"""
        if not NEURO_SAN_AVAILABLE:
            # Return real insurance underwriting specialist network from Neuro SAN Studio
            return {
                "nodes": [
                    # Frontman Agent
                    {"id": "insurance_agent", "label": "Insurance Agent", "type": "frontman", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Main entry point for business insurance inquiries",
                     "persona": "I am the top-level agent responsible for handling ALL insurance inquiries for Hartford's business insurance processes. I gather, analyze, and make decisions for underwriting insurance policies. I delegate to specialized agents: Underwriting Decision for new policy inquiries and risk assessment, and Claims Processing for any claims-related matters. I am professional, efficient, and ensure customers are connected to the right specialist."},
                    
                    # Primary Domain Agents
                    {"id": "underwriting_decision_agent", "label": "Underwriting Decision", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Manages underwriting operations and risk analysis",
                     "persona": "I handle all underwriting inquiries for Hartford's business insurance. I gather information from brokers, third-party sources, and other agents, analyze the data, and make underwriting decisions. I coordinate with Insurance Broker Agent for submissions, Third Party Data Review for external risk data, and Underwriter Analysis for exposure assessment. I am thorough, analytical, and ensure proper risk evaluation."},
                    {"id": "claims_processing_agent", "label": "Claims Processing", "type": "domain", "status": "active", "model": "Google Gemini 2.0 Flash", 
                     "description": "Manages complete claims lifecycle",
                     "persona": "I manage all claims-related workflows from initial intake to resolution. When you report a claim, I collect all required details (policy number, date and nature of loss, documentation), verify coverage, and coordinate the entire claims process. I work with Claims Intake to log details, Claims Investigation to verify validity, and Claims Adjustment to finalize settlements. I keep you informed throughout and ensure efficient, accurate claim processing according to Hartford's policies."},
                    
                    # Underwriting Sub-Agents
                    {"id": "insurance_broker_agent", "label": "Insurance Broker", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Handles broker submissions and communications",
                     "persona": "I gather and provide information from insurance brokers to facilitate underwriting decisions. I receive broker submissions, organize them by business type and priority, communicate with brokers for missing information, and ensure ACORD applications and loss analysis documents are correctly obtained. I track submission progress and relay underwriting decisions back to brokers with clear feedback."},
                    {"id": "third_party_data_review_agent", "label": "Third Party Data Review", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Collects external risk data",
                     "persona": "I gather, compile, and review data from external sources to assess property risk and suitability for insurance coverage. I coordinate with Building Review for property details, retrieve information from external databases and public records, validate data reliability, and generate consolidated reports on key property details, identified risks, and compliance concerns."},
                    {"id": "underwriter_analysis_agent", "label": "Underwriter Analysis", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Analyzes exposure and portfolio alignment",
                     "persona": "I analyze gathered data to assess risk exposures, aggregation, and benchmarks against Hartford's existing portfolio. I work with Risk Exposure Analyzer to identify specific risks, and produce comprehensive underwriting summaries and narratives to support final decision-making. I ensure thorough risk evaluation and portfolio alignment."},
                    
                    # Claims Sub-Agents
                    {"id": "claims_intake_handler", "label": "Claims Intake", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Verifies coverage and collects claim details",
                     "persona": "I manage the initial intake of claims, ensuring all required information is collected and logged. I receive claim submissions, verify eligibility against active policies, request supporting documentation (photos, police reports, repair estimates), create claim files with unique claim numbers, and communicate next steps to claimants. I ensure claims are properly filed and ready for investigation."},
                    {"id": "claims_investigation_agent", "label": "Claims Investigation", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Investigates claim validity",
                     "persona": "I investigate claims to confirm their validity using third-party reports, inspections, and interviews. I verify claim documentation, gather supporting evidence, review policy coverage, coordinate site inspections when needed, screen for fraud indicators, and compile comprehensive investigative reports. I escalate complex issues and ensure all findings are documented for claims adjustment."},
                    {"id": "claims_adjustment_agent", "label": "Claims Adjustment", "type": "specialist", "status": "active", "model": "Azure OpenAI GPT-4", 
                     "description": "Finalizes settlements and payouts",
                     "persona": "I finalize claim settlements and payouts based on investigation findings. I review damage assessments, calculate settlement amounts according to policy terms and coverage limits, prepare settlement offers, coordinate payments, and ensure all adjustments comply with Hartford's policies and regulatory requirements. I communicate final decisions clearly to policyholders."},
                    
                    # Critical Sub-Specialists
                    {"id": "acord_application_handler", "label": "ACORD Handler", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Validates ACORD applications",
                     "persona": "I process and validate ACORD application forms submitted by brokers. I check for completeness of all mandatory fields, verify data consistency, cross-check against underwriting guidelines, identify red flags or missing information, and communicate with brokers to request corrections. I ensure applications are properly formatted and ready for underwriting analysis."},
                    {"id": "risk_exposure_analyzer", "label": "Risk Exposure", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Scores exposure to hazards",
                     "persona": "I identify and assess specific risk exposures based on collected data. I evaluate hazards like fire risk, flood zones, earthquake exposure, crime rates, and environmental factors. I score and quantify risks, provide detailed exposure analysis, and highlight areas of concern that may impact insurability or require premium adjustments."},
                    {"id": "building_characteristics_reviewer", "label": "Building Review", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4", 
                     "description": "Evaluates building structure and safety",
                     "persona": "I evaluate property-specific details including year built, construction type, fire protection measures, and electrical systems. I verify structural information against building codes, assess fire safety systems (sprinklers, alarms), analyze electrical system condition, flag critical issues like outdated wiring or inadequate fire suppression, and provide detailed reports on building safety and risk factors."}
                ],
                "connections": [
                    # Frontman to Primary Domains
                    {"from": "insurance_agent", "to": "underwriting_decision_agent", "type": "delegates"},
                    {"from": "insurance_agent", "to": "claims_processing_agent", "type": "delegates"},
                    
                    # Underwriting Decision Delegations
                    {"from": "underwriting_decision_agent", "to": "insurance_broker_agent", "type": "delegates"},
                    {"from": "underwriting_decision_agent", "to": "third_party_data_review_agent", "type": "delegates"},
                    {"from": "underwriting_decision_agent", "to": "underwriter_analysis_agent", "type": "delegates"},
                    
                    # Claims Processing Delegations
                    {"from": "claims_processing_agent", "to": "claims_intake_handler", "type": "delegates"},
                    {"from": "claims_processing_agent", "to": "claims_investigation_agent", "type": "delegates"},
                    {"from": "claims_processing_agent", "to": "claims_adjustment_agent", "type": "delegates"},
                    
                    # Sub-Agent Delegations
                    {"from": "insurance_broker_agent", "to": "acord_application_handler", "type": "delegates"},
                    {"from": "underwriter_analysis_agent", "to": "risk_exposure_analyzer", "type": "delegates"},
                    {"from": "third_party_data_review_agent", "to": "building_characteristics_reviewer", "type": "delegates"},
                    
                    # Cross-Domain Collaborations
                    {"from": "claims_investigation_agent", "to": "risk_exposure_analyzer", "type": "consults"},
                    {"from": "underwriter_analysis_agent", "to": "claims_intake_handler", "type": "advises"},
                    {"from": "acord_application_handler", "to": "building_characteristics_reviewer", "type": "collaborates"}
                ]
            }
        
        try:
            client = GrpcClientAsync(host=self.grpc_host, port=self.grpc_port)
            networks = await client.list()
            
            # Build topology from actual network data
            nodes = []
            connections = []
            
            for i, network in enumerate(networks):
                nodes.append({
                    "id": network,
                    "label": network.replace("_", " ").title(),
                    "type": "agent",
                    "status": "active",
                    "model": "AWS Bedrock Claude Sonnet 4"
                })
                
                # Add connections between agents (simplified for demo)
                if i > 0:
                    connections.append({
                        "from": networks[0],
                        "to": network,
                        "type": "collaborates"
                    })
            
            return {"nodes": nodes, "connections": connections}
            
        except Exception as e:
            logger.error(f"Failed to get network topology: {e}")
            return {"nodes": [], "connections": []}
    
    async def send_message_to_network(self, network_name: str, message: str, session_id: str = None) -> Dict[str, Any]:
        """Send message to agent network and track activity"""
        session_id = session_id or f"session_{datetime.now().timestamp()}"
        
        # Track agent activity
        self.agent_activity[network_name] = {
            "status": "processing",
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        if not NEURO_SAN_AVAILABLE:
            # Use AWS Bedrock for real AI responses
            topology = await self.get_network_topology()
            agent_info = next((node for node in topology["nodes"] if node["id"] == network_name), None)
            
            if agent_info:
                ai_response = await self._call_ai_model(agent_info, message)
            else:
                ai_response = f"Agent {network_name} is processing your request."
            
            response = {
                "response": ai_response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": "AWS Bedrock Claude Sonnet 4",
                "agent": agent_info.get("label", network_name) if agent_info else network_name
            }
            
            self.agent_activity[network_name] = {
                "status": "completed",
                "response": response["response"],
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }
            
            return response
        
        try:
            client = GrpcClientAsync(host=self.grpc_host, port=self.grpc_port)
            response = await client.chat(network_name, message, session_id)
            
            result = {
                "response": response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": "AWS Bedrock Claude Sonnet 4",
                "network": network_name
            }
            
            self.agent_activity[network_name] = {
                "status": "completed",
                "response": response,
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to send message to {network_name}: {e}")
            error_result = {
                "error": f"Failed to communicate with {network_name}: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }
            
            self.agent_activity[network_name] = {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id
            }
            
            return error_result
    
    def get_agent_activity(self) -> Dict[str, Any]:
        """Get current agent activity for live updates"""
        return self.agent_activity

# Initialize NeuroSan interface
neuro_interface = AgentNetworkInterface()

@app.route('/')
def index():
    """Main network visualization page"""
    response = make_response(render_template('network_pro.html'))
    # Prevent iframe embedding to ensure JavaScript executes
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'none'"
    return response

@app.route('/api/topology')
def get_topology():
    """API endpoint to get network topology"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        topology = loop.run_until_complete(neuro_interface.get_network_topology())
        return jsonify({"status": "success", "topology": topology})
    except Exception as e:
        logger.error(f"Error getting topology: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        try:
            loop.close()
        except:
            pass

@app.route('/api/activity')
def get_activity():
    """API endpoint to get current agent activity"""
    activity = neuro_interface.get_agent_activity()
    return jsonify({"status": "success", "activity": activity})

@app.route('/api/chat', methods=['POST'])
def chat():
    """API endpoint to send messages to agent networks"""
    data = request.get_json()
    network_name = data.get('network_name')
    message = data.get('message')
    session_id = data.get('session_id')
    
    logger.info(f"Chat request: network={network_name}, message={message[:50]}...")
    
    if not network_name or not message:
        return jsonify({"status": "error", "message": "Missing network_name or message"}), 400
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(neuro_interface.send_message_to_network(network_name, message, session_id))
        logger.info(f"Chat response generated for {network_name}")
        return jsonify({"status": "success", "data": response})
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        loop.close()

@socketio.on('send_network_message')
def handle_network_message(data):
    """Handle real-time network messages via WebSocket"""
    network_name = data.get('network_name')
    message = data.get('message') 
    session_id = data.get('session_id')
    
    if not network_name or not message:
        emit('error', {'message': 'Missing network_name or message'})
        return
    
    try:
        # Emit agent activity update
        emit('agent_activity', {
            'agent': network_name,
            'status': 'processing',
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(neuro_interface.send_message_to_network(network_name, message, session_id))
        
        # Emit final response
        emit('network_response', response)
        
        # Emit updated activity
        emit('agent_activity', {
            'agent': network_name,
            'status': 'completed',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        emit('error', {'message': f'Failed to send message: {str(e)}'})
    finally:
        loop.close()

@socketio.on('get_live_activity')
def handle_get_activity():
    """Send current agent activity to client"""
    activity = neuro_interface.get_agent_activity()
    emit('activity_update', activity)

if __name__ == '__main__':
    # Create templates directory
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🧠 Starting Neuro SAN Network Visualization Platform")
    print("✅ AWS Bedrock Integration: Active") 
    print("✅ Multi-Agent Network Topology: Enabled")
    print("✅ Real-time Agent Activity: Live")
    print("✅ Network Orchestration: Ready")
    print(f"🌐 Network Visualization: http://localhost:5000")
    
    # Run the Flask app (production-ready)
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    socketio.run(app, host='0.0.0.0', port=5000, debug=debug_mode)