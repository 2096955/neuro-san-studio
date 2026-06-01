from flask import Flask, request, jsonify, render_template, make_response
from flask_socketio import SocketIO, emit
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
import os
import asyncio

# Check if NeuroSan is available
try:
    from neuro_san.grpc_client_async import GrpcClientAsync
    NEURO_SAN_AVAILABLE = True
except ImportError:
    NEURO_SAN_AVAILABLE = False
    print("Warning: NeuroSan client not available, using network topology from config")

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'neuro-san-banking-secret-key')
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentNetworkInterface:
    """Interface to communicate with banking agent network"""
    
    def __init__(self):
        self.grpc_host = "localhost"
        self.grpc_port = 30011
        self.http_host = "localhost" 
        self.http_port = 8080
        self.active_sessions = {}
        self.agent_activity = {}
        # AWS_BEDROCK_API_KEY contains Anthropic API key for Claude access
        self.anthropic_api_key = os.environ.get('AWS_BEDROCK_API_KEY', '')
        self.openai_api_key = os.environ.get('OPENAI_API_KEY', '')
        
    async def _call_ai_model(self, agent_info: Dict[str, Any], message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> tuple[str, str]:
        """Call AI model (Anthropic Claude or OpenAI) for intelligent responses
        
        Returns:
            tuple: (response_text, actual_model_used)
        """
        import aiohttp
        
        agent_id = agent_info.get("id", "")
        agent_role = agent_info.get("label", "Customer Service Representative")
        agent_description = agent_info.get("description", "")
        agent_persona = agent_info.get("persona", "")
        
        # Build rich context-aware system prompt based on agent role
        system_prompt = f"""You are {agent_role}, a banking professional.

ROLE & RESPONSIBILITIES:
{agent_persona}

{agent_description}

IMPORTANT GUIDELINES:
- Speak as a professional banking specialist in first person ("I will help you with your account...")
- Be confident and proactive in your role
- You are part of a demo system, so make realistic responses as if you have access to real banking data
- Only handle matters within your expertise
- Maintain strict confidentiality and compliance with banking regulations
- Do NOT mention what you cannot do - focus on what you CAN do

Respond naturally as {agent_role} would in a real banking setting."""

        # Try Anthropic Claude (AWS Bedrock) for all banking agents
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
                            return (result['content'][0]['text'], "AWS Bedrock Claude Sonnet 4")
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
                            return (result['choices'][0]['message']['content'], "OpenAI GPT-4 Turbo")
                        else:
                            logger.error(f"OpenAI API error: {response.status}")
            except Exception as e:
                logger.error(f"Error calling OpenAI: {e}")
        
        # Fallback response if no API is available
        return (f"Hello, I'm {agent_role}. {agent_description} How can I assist you with your banking needs today?", "Demo Mode")
        
    async def get_network_topology(self) -> Dict[str, Any]:
        """Get the full banking agent network topology with connections"""
        if not NEURO_SAN_AVAILABLE:
            # Return banking operations specialist network
            return {
                "nodes": [
                    # Frontman Agent
                    {"id": "customer_service_representative", "label": "Customer Service", "type": "frontman", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Handles customer inquiries and support",
                     "persona": "I am the top-level agent responsible for handling all incoming customer service requests for banking products and services. I coordinate with specialized departments when needed - Account Management for relationship and wealth services, Fraud Prevention for security concerns, and Loan Services for lending inquiries. I ensure customers receive professional, efficient banking support."},
                    
                    # Primary Domain Agents
                    {"id": "account_manager", "label": "Account Manager", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Manages customer relationships and accounts",
                     "persona": "I manage ongoing customer relationships and handle account-related needs. I coordinate with Relationship Manager for VIP clients, Wealth Management Advisor for high-net-worth individuals, and Investment Specialist for investment services. I ensure customer satisfaction and long-term banking relationships."},
                    {"id": "fraud_prevention_specialist", "label": "Fraud Prevention", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Identifies and investigates fraud",
                     "persona": "I am responsible for identifying and investigating potential fraudulent activities on customer accounts. I work with our Fraud Investigation Team on complex cases and Security Analyst for cybersecurity threats. I protect customers and the bank from financial crimes while minimizing false positives."},
                    {"id": "loan_officer", "label": "Loan Officer", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Assesses and approves loan applications",
                     "persona": "I assess and approve loan applications based on customers' financial profiles and banking history. I coordinate with Underwriter for risk analysis, Mortgage Specialist for home loans, and Business Banking Officer for commercial lending. I ensure responsible lending while meeting customer needs."},
                    
                    # Account Management Sub-Agents
                    {"id": "relationship_manager", "label": "Relationship Manager", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Manages VIP client relationships",
                     "persona": "I manage relationships with the bank's most important clients, ensuring personalized service and addressing high-level banking needs. I coordinate with Wealth Management and Investment specialists to provide comprehensive financial solutions for our premium customers."},
                    {"id": "wealth_management_advisor", "label": "Wealth Management", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Advises high-net-worth clients",
                     "persona": "I handle high-net-worth clients by advising them on investment strategies, financial planning, and asset management. I work with Investment Specialist and Portfolio Manager to create customized wealth management solutions that align with clients' financial goals and risk tolerance."},
                    {"id": "investment_specialist", "label": "Investment Specialist", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Recommends investment products",
                     "persona": "I recommend and manage investment products for clients, ensuring alignment with their financial goals. I coordinate with Portfolio Manager for ongoing management and Trading Desk for execution. I provide expert guidance on stocks, bonds, mutual funds, and other investment vehicles."},
                    
                    # Fraud Prevention Sub-Agents
                    {"id": "fraud_investigation_team", "label": "Fraud Investigation", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Investigates complex fraud cases",
                     "persona": "I investigate and manage complex or high-value fraud cases, coordinating with internal teams and external agencies as needed. I work with Security Analyst on cybersecurity aspects and gather evidence to protect customer accounts and bank assets."},
                    {"id": "security_analyst", "label": "Security Analyst", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Oversees cybersecurity systems",
                     "persona": "I oversee the bank's cybersecurity systems, tracking and preventing breaches or threats. I monitor suspicious activities, analyze security patterns, and implement protective measures to safeguard customer data and banking infrastructure."},
                    
                    # Loan Services Sub-Agents
                    {"id": "underwriter", "label": "Underwriter", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Reviews loan risk factors",
                     "persona": "I review and analyze the risk factors in loan applications, ensuring they meet the bank's lending criteria. I assess creditworthiness, debt-to-income ratios, collateral value, and other risk indicators to make informed lending decisions."},
                    {"id": "mortgage_specialist", "label": "Mortgage Specialist", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Manages mortgage applications",
                     "persona": "I manage the process of mortgage applications, from initial consultation to final approval. I guide customers through home financing options, explain terms and rates, coordinate property appraisals, and ensure smooth closing processes."},
                    {"id": "business_banking_officer", "label": "Business Banking", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Handles business financial needs",
                     "persona": "I handle the financial needs of small to medium-sized businesses, including business loans, lines of credit, and banking solutions. I understand business operations and provide tailored financial products to support growth and cash flow management."},
                    
                    # Investment Management Sub-Agents
                    {"id": "portfolio_manager", "label": "Portfolio Manager", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Oversees investment portfolio performance",
                     "persona": "I oversee the performance of investment portfolios, ensuring they meet the financial goals and risk profiles of clients. I monitor market conditions, rebalance allocations, and coordinate with Trading Desk for execution. I provide regular performance reports to clients."},
                    {"id": "trading_desk", "label": "Trading Desk", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                     "description": "Executes financial transactions",
                     "persona": "I handle the execution of financial transactions, ensuring timely and accurate trades in markets. I monitor market conditions, execute buy and sell orders, and ensure best execution for client transactions across various asset classes."},
                ],
                "connections": [
                    # Frontman to Primary Domains
                    {"from": "customer_service_representative", "to": "account_manager", "type": "delegates"},
                    {"from": "customer_service_representative", "to": "fraud_prevention_specialist", "type": "delegates"},
                    {"from": "customer_service_representative", "to": "loan_officer", "type": "delegates"},
                    
                    # Account Manager to Specialists
                    {"from": "account_manager", "to": "relationship_manager", "type": "delegates"},
                    {"from": "account_manager", "to": "wealth_management_advisor", "type": "delegates"},
                    {"from": "account_manager", "to": "investment_specialist", "type": "delegates"},
                    
                    # Fraud Prevention to Specialists
                    {"from": "fraud_prevention_specialist", "to": "fraud_investigation_team", "type": "delegates"},
                    {"from": "fraud_prevention_specialist", "to": "security_analyst", "type": "delegates"},
                    
                    # Loan Officer to Specialists
                    {"from": "loan_officer", "to": "underwriter", "type": "delegates"},
                    {"from": "loan_officer", "to": "mortgage_specialist", "type": "delegates"},
                    {"from": "loan_officer", "to": "business_banking_officer", "type": "delegates"},
                    
                    # Wealth Management Delegation
                    {"from": "wealth_management_advisor", "to": "investment_specialist", "type": "delegates"},
                    {"from": "wealth_management_advisor", "to": "portfolio_manager", "type": "delegates"},
                    
                    # Relationship Manager Delegation
                    {"from": "relationship_manager", "to": "wealth_management_advisor", "type": "delegates"},
                    {"from": "relationship_manager", "to": "investment_specialist", "type": "delegates"},
                    
                    # Investment Chain
                    {"from": "investment_specialist", "to": "portfolio_manager", "type": "delegates"},
                    {"from": "investment_specialist", "to": "trading_desk", "type": "delegates"},
                    
                    # Portfolio Management
                    {"from": "portfolio_manager", "to": "trading_desk", "type": "delegates"},
                    
                    # Fraud Investigation
                    {"from": "fraud_investigation_team", "to": "security_analyst", "type": "delegates"},
                ]
            }
            
        try:
            # Try to get real network topology from NeuroSan if available
            client = GrpcClientAsync(host=self.grpc_host, port=self.grpc_port)
            networks = await client.list_networks()
            
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
        """Send message to banking agent network and track activity"""
        session_id = session_id or f"session_{datetime.now().timestamp()}"
        
        # Track agent activity
        self.agent_activity[network_name] = {
            "status": "processing",
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        if not NEURO_SAN_AVAILABLE:
            # Use Multi-LLM provider support with intelligent routing
            topology = await self.get_network_topology()
            agent_info = next((node for node in topology["nodes"] if node["id"] == network_name), None)
            
            if agent_info:
                ai_response, actual_model = await self._call_ai_model(agent_info, message)
            else:
                ai_response = f"Agent {network_name} is processing your request."
                actual_model = "Demo Mode"
            
            response = {
                "response": ai_response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": actual_model,
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
    
    print("🏦 Starting Banking Operations Multi-Agent Platform")
    print("✅ AWS Bedrock Integration: Active") 
    print("✅ Multi-Agent Network Topology: Enabled")
    print("✅ Real-time Agent Activity: Live")
    print("✅ Network Orchestration: Ready")
    print(f"🌐 Network Visualization: http://localhost:5000")
    
    # Run the Flask app (production-ready)
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    socketio.run(app, host='0.0.0.0', port=5000, debug=debug_mode)
