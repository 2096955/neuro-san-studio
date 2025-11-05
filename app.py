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
        self.google_api_key_backup = os.environ.get('GEMINI_API_KEY_BACKUP_2', '')
        # Azure GPT-5 Configuration
        self.azure_gpt5_key = os.environ.get('AZURE_GPT5_KEY', '')
        self.azure_gpt5_endpoint = 'https://20969-mgp7xyl6-eastus2.cognitiveservices.azure.com'
        self.azure_gpt5_model = 'gpt-5-chat'
        self.azure_gpt5_api_version = '2024-12-01-preview'
        # Salesforce Agentforce Cloud Run Configuration
        self.cloud_run_agentforce_url = 'https://salesforce-agentforce-534348290993.us-central1.run.app/execute'
        # Agent ID mapping from reference guide
        self.agentforce_agent_mapping = {
            'dealership_support_agent': '0XxfI0000003NEbSAM',  # VWI Sales Agent - for sales inquiries
            'customer_service_agent': '0XxfI0000003MjxSAE',     # Default Service - for general support
            'technical_service_advisor': '0XxfI0000003NCzSAM',  # VWI Service - for technical service
            'warranty_claims_processor': '0XxfI0000003NCzSAM'   # VWI Service - for warranty claims
        }
        
    async def _call_cloud_run_agentforce(self, agent_id: str, message: str, session_id: str = None) -> tuple[str, str]:
        """Call Salesforce Agentforce via Cloud Run deployment
        
        Args:
            agent_id: Internal agent ID (e.g., 'dealership_support_agent')
            message: User message
            session_id: Optional session ID for conversation continuity
        
        Returns:
            tuple: (response_text, actual_model_used)
        """
        import aiohttp
        
        # Get the Salesforce agent ID from mapping
        salesforce_agent_id = self.agentforce_agent_mapping.get(agent_id)
        if not salesforce_agent_id:
            logger.warning(f"No Salesforce agent mapping for {agent_id}")
            return (f"I'm currently unavailable. Please try again later.", "Salesforce Agentforce (Not Configured)")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Call Cloud Run Agentforce endpoint
                payload = {
                    'task_id': f'neuro-san-{agent_id}-{datetime.now().timestamp()}',
                    'prompt': message,
                    'context': {
                        'agent_id': salesforce_agent_id
                    }
                }
                
                # Add session_id if provided for conversation continuity
                if session_id:
                    payload['context']['session_id'] = session_id
                
                logger.info(f"Calling Cloud Run Agentforce: agent={agent_id}, salesforce_id={salesforce_agent_id}")
                
                async with session.post(
                    self.cloud_run_agentforce_url,
                    headers={'Content-Type': 'application/json'},
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        agent_response = result.get('result', result.get('response', 'I can help you with your inquiry.'))
                        
                        # Determine which Salesforce agent was used with explicit IDs
                        agent_names = {
                            '0XxfI0000003MjxSAE': 'Default Service Agent (0XxfI0000003MjxSAE)',
                            '0XxfI0000003N1hSAE': 'VWI Sales Agent (0XxfI0000003N1hSAE)',
                            '0XxfI0000003NEbSAM': 'VWI Sales Agent (0XxfI0000003NEbSAM)',
                            '0XxfI0000003NCzSAM': 'VWI Service Agent (0XxfI0000003NCzSAM)'
                        }
                        model_name = agent_names.get(salesforce_agent_id, f'Salesforce Agentforce ({salesforce_agent_id})')
                        
                        logger.info(f"Cloud Run Agentforce success: {model_name}")
                        return (agent_response, model_name)
                    else:
                        error_text = await response.text()
                        logger.error(f"Cloud Run Agentforce error {response.status}: {error_text[:200]}")
                        return (f"I'm currently unavailable. Please try again later.", "Salesforce Agentforce (Error)")
        except Exception as e:
            logger.error(f"Error calling Cloud Run Agentforce: {e}")
            return (f"I'm currently unavailable. Please try again later.", "Salesforce Agentforce (Error)")
    
    async def _call_ai_model(self, agent_info: Dict[str, Any], message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> tuple[str, str]:
        """Call AI model (Anthropic Claude, Google Gemini, Azure GPT-5, Salesforce Agentforce, or OpenAI) for intelligent responses
        
        Returns:
            tuple: (response_text, actual_model_used)
        """
        import aiohttp
        
        agent_id = agent_info.get("id", "")
        agent_role = agent_info.get("label", "Insurance Agent")
        agent_description = agent_info.get("description", "")
        agent_persona = agent_info.get("persona", "")
        agent_model = agent_info.get("model", "")
        
        # Route to Cloud Run Salesforce Agentforce for mapped automotive agents
        if agent_id in self.agentforce_agent_mapping:
            return await self._call_cloud_run_agentforce(agent_id, message)
        
        # Determine company context based on agent network
        if any(x in agent_id for x in ["automotive", "manufacturing", "dealership", "supply_chain", "production", "factory", "parts_inventory", "supplier_relations", "logistics", "engineering_support", "technical_service", "warranty_claims", "service_scheduling", "recall"]):
            company_context = "an automotive manufacturer (Volkswagen, Ford, or BMW)"
            industry_context = "automotive manufacturing and dealership operations"
            role_context = "automotive professional"
        elif any(x in agent_id for x in ["customer_service_representative", "account_manager", "loan_officer", "fraud_prevention", "relationship_manager", "wealth_management", "investment_specialist", "portfolio_manager", "trading_desk", "mortgage_specialist", "business_banking"]):
            company_context = "a major financial institution"
            industry_context = "banking and financial services"
            role_context = "banking professional"
        else:
            company_context = "Hartford, a business insurance company"
            industry_context = "business insurance"
            role_context = "insurance specialist"
        
        # Build rich context-aware system prompt based on agent role
        system_prompt = f"""You are {agent_role} at {company_context}.

ROLE & RESPONSIBILITIES:
{agent_persona}

{agent_description}

IMPORTANT GUIDELINES:
- Speak as a professional {role_context} in first person ("I will help you with...")
- Be confident and proactive in your role
- You are part of a demo system, so make realistic responses as if you have access to real data
- Only handle matters within your expertise
- Do NOT mention what you cannot do - focus on what you CAN do

Respond naturally as {agent_role} would in a real {industry_context} setting."""

        # Route to appropriate API based on agent's model
        # Azure GPT-5 for Claims Adjustment agent
        if "Azure" in agent_model and self.azure_gpt5_key:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f'{self.azure_gpt5_endpoint}/openai/deployments/{self.azure_gpt5_model}/chat/completions?api-version={self.azure_gpt5_api_version}',
                        headers={
                            'api-key': self.azure_gpt5_key,
                            'Content-Type': 'application/json'
                        },
                        json={
                            'messages': [
                                {'role': 'system', 'content': system_prompt},
                                {'role': 'user', 'content': message}
                            ],
                            'max_tokens': 2048,
                            'temperature': 0.7
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            logger.info(f"Azure GPT-5 API success")
                            return (result['choices'][0]['message']['content'], "Azure GPT-5")
                        else:
                            error_text = await response.text()
                            logger.error(f"Azure GPT-5 API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Azure GPT-5: {e}")
        
        # Google Gemini for Claims Processing agent - try primary then backup key
        if "Gemini" in agent_model:
            # Try primary key first
            api_keys_to_try = []
            if self.google_api_key:
                api_keys_to_try.append(('primary', self.google_api_key))
            if self.google_api_key_backup:
                api_keys_to_try.append(('backup', self.google_api_key_backup))
            
            for key_name, api_key in api_keys_to_try:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.post(
                            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key={api_key}',
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
                                    'maxOutputTokens': 2048
                                }
                            },
                            timeout=aiohttp.ClientTimeout(total=30)
                        ) as response:
                            if response.status == 200:
                                result = await response.json()
                                logger.info(f"Google Gemini API success using {key_name} key")
                                return (result['candidates'][0]['content']['parts'][0]['text'], "Google Gemini 2.0 Flash Thinking")
                            else:
                                error_text = await response.text()
                                logger.error(f"Google Gemini API error {response.status} ({key_name} key): {error_text[:200]}")
                except Exception as e:
                    logger.error(f"Error calling Google Gemini with {key_name} key: {e}")
                    # Continue to next key if available
        
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
        return (f"Hello, I'm {agent_role}. {agent_description} How can I assist you with your insurance needs today?", "Demo Mode")
        
    def _get_automotive_topology(self) -> Dict[str, Any]:
        """Get automotive manufacturing network topology"""
        return {
            "nodes": [
                # Frontman Agent
                {"id": "automotive_operations_coordinator", "label": "Operations Coordinator", "type": "frontman", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Main orchestrator for automotive operations",
                 "persona": "I am the Automotive Operations Coordinator responsible for routing all requests to specialized agents. I handle manufacturing operations, supply chain management, dealership support, customer service, and engineering support. I ensure safety-critical issues get immediate attention and production stoppages are high priority."},
                
                # Domain Agents
                {"id": "manufacturing_operations_agent", "label": "Manufacturing Operations", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Manages automotive production operations",
                 "persona": "I oversee manufacturing operations across all production facilities. I coordinate production planning, quality control, and factory efficiency optimization. I work with plants globally and track key metrics like JPH, FTT, and OEE."},
                {"id": "supply_chain_management_agent", "label": "Supply Chain Management", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Manages supplier network and logistics",
                 "persona": "I manage the complex supply chain supporting automotive manufacturing. I handle just-in-time inventory, supplier relationships, and global logistics. I ensure production continuity and manage critical parts shortages."},
                {"id": "dealership_support_agent", "label": "Dealership Support", "type": "domain", "status": "active", "model": "VWI Sales Agent (0XxfI0000003NEbSAM)",
                 "description": "Supports dealer network operations via Salesforce",
                 "persona": "I support our authorized dealership network with technical service guidance, sales operations support, and warranty claim processing through Salesforce Agentforce. I help dealerships serve customers effectively while maintaining quality standards."},
                {"id": "customer_service_agent", "label": "Customer Service", "type": "domain", "status": "active", "model": "Default Service Agent (0XxfI0000003MjxSAE)",
                 "description": "Direct customer service for vehicle owners",
                 "persona": "I am the voice of the company to customers. I handle service scheduling, recall information, product inquiries, and connected services. I provide empathetic, clear, and solution-focused support."},
                {"id": "engineering_support_agent", "label": "Engineering Support", "type": "domain", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Deep technical expertise and diagnostics",
                 "persona": "I provide deep technical expertise for complex engineering issues. I handle vehicle diagnostics, technical documentation, and recall engineering coordination. I work on root cause analysis and regulatory compliance."},
                
                # Manufacturing Specialists
                {"id": "production_planning_specialist", "label": "Production Planning", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Creates and optimizes production schedules",
                 "persona": "I create and optimize production schedules across multiple facilities. I balance capacity, manage model changeovers, and handle production line rebalancing to maximize efficiency."},
                {"id": "quality_control_agent", "label": "Quality Control", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Monitors quality metrics and defects",
                 "persona": "I monitor quality metrics across production lines, investigate defect patterns, coordinate corrective actions, and track quality KPIs like First Time Through rate and defects per million."},
                {"id": "factory_efficiency_optimizer", "label": "Factory Efficiency", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Analyzes and improves factory efficiency",
                 "persona": "I analyze Overall Equipment Effectiveness, identify bottlenecks, recommend efficiency improvements, and monitor downtime and maintenance schedules to optimize factory performance."},
                
                # Supply Chain Specialists
                {"id": "parts_inventory_specialist", "label": "Parts Inventory", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Tracks inventory and JIT delivery",
                 "persona": "I track inventory levels across warehouses, manage just-in-time delivery schedules, identify potential shortages before they impact production, and coordinate emergency parts procurement."},
                {"id": "supplier_relations_agent", "label": "Supplier Relations", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Manages supplier quality and performance",
                 "persona": "I maintain supplier quality ratings, handle communications and escalations, manage supplier onboarding and qualification, and track delivery performance."},
                {"id": "logistics_coordinator", "label": "Logistics Coordinator", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Optimizes logistics and distribution",
                 "persona": "I optimize inbound and outbound logistics, coordinate vehicle distribution to dealerships, manage cross-border shipping and customs, and resolve delivery delays."},
                
                # Dealership Support Specialists
                {"id": "technical_service_advisor", "label": "Technical Service Advisor", "type": "specialist", "status": "active", "model": "VWI Service Agent (0XxfI0000003NCzSAM)",
                 "description": "Provides technical repair guidance",
                 "persona": "I provide technical guidance for complex repairs, interpret diagnostic codes, recommend repair procedures and parts, and assist with Technical Service Bulletins."},
                {"id": "warranty_claims_processor", "label": "Warranty Claims", "type": "specialist", "status": "active", "model": "VWI Service Agent (0XxfI0000003NCzSAM)",
                 "description": "Processes warranty claims",
                 "persona": "I review and approve warranty claims, identify fraud patterns, provide guidance on warranty coverage, and track warranty cost trends."},
                
                # Customer Service Specialists
                {"id": "service_scheduling_specialist", "label": "Service Scheduling", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Books service appointments",
                 "persona": "I book service appointments, find nearest authorized service centers, provide estimated service times, and manage recall appointment scheduling."},
                {"id": "recall_information_agent", "label": "Recall Information", "type": "specialist", "status": "active", "model": "AWS Bedrock Claude Sonnet 4",
                 "description": "Provides recall information",
                 "persona": "I check if vehicles are affected by recalls, explain recall procedures and timelines, schedule recall service appointments, and provide recall remedy information."},
            ],
            "connections": [
                # Frontman to Domain Agents
                {"from": "automotive_operations_coordinator", "to": "manufacturing_operations_agent", "type": "delegates"},
                {"from": "automotive_operations_coordinator", "to": "supply_chain_management_agent", "type": "delegates"},
                {"from": "automotive_operations_coordinator", "to": "dealership_support_agent", "type": "delegates"},
                {"from": "automotive_operations_coordinator", "to": "customer_service_agent", "type": "delegates"},
                {"from": "automotive_operations_coordinator", "to": "engineering_support_agent", "type": "delegates"},
                
                # Manufacturing Operations to Specialists
                {"from": "manufacturing_operations_agent", "to": "production_planning_specialist", "type": "delegates"},
                {"from": "manufacturing_operations_agent", "to": "quality_control_agent", "type": "delegates"},
                {"from": "manufacturing_operations_agent", "to": "factory_efficiency_optimizer", "type": "delegates"},
                
                # Supply Chain to Specialists
                {"from": "supply_chain_management_agent", "to": "parts_inventory_specialist", "type": "delegates"},
                {"from": "supply_chain_management_agent", "to": "supplier_relations_agent", "type": "delegates"},
                {"from": "supply_chain_management_agent", "to": "logistics_coordinator", "type": "delegates"},
                
                # Dealership Support to Specialists
                {"from": "dealership_support_agent", "to": "technical_service_advisor", "type": "delegates"},
                {"from": "dealership_support_agent", "to": "warranty_claims_processor", "type": "delegates"},
                
                # Customer Service to Specialists
                {"from": "customer_service_agent", "to": "service_scheduling_specialist", "type": "delegates"},
                {"from": "customer_service_agent", "to": "recall_information_agent", "type": "delegates"},
                
                # Cross-domain collaborations
                {"from": "supply_chain_management_agent", "to": "manufacturing_operations_agent", "type": "collaborates"},
                {"from": "quality_control_agent", "to": "supplier_relations_agent", "type": "consults"},
                {"from": "technical_service_advisor", "to": "engineering_support_agent", "type": "consults"},
            ]
        }
    
    def _get_banking_topology(self) -> Dict[str, Any]:
        """Get banking operations network topology"""
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
    
    async def get_network_topology(self, network_type: str = "insurance") -> Dict[str, Any]:
        """Get the full agent network topology with connections
        
        Args:
            network_type: Type of network ("insurance" or "banking")
        """
        if not NEURO_SAN_AVAILABLE:
            # Return banking topology if requested
            if network_type == "banking":
                return self._get_banking_topology()
            elif network_type == "automotive":
                return self._get_automotive_topology()
            
            # Return insurance underwriting specialist network (default)
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
                    {"id": "claims_processing_agent", "label": "Claims Processing", "type": "domain", "status": "active", "model": "Google Gemini 2.0 Flash Thinking", 
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
                    {"id": "claims_adjustment_agent", "label": "Claims Adjustment", "type": "specialist", "status": "active", "model": "Azure GPT-5", 
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
            # Use Multi-LLM provider support with intelligent routing
            # Try to detect network type from agent_id
            if any(x in network_name for x in ["customer_service_representative", "account_manager", "loan_officer", "fraud_prevention"]):
                network_type = "banking"
            elif any(x in network_name for x in ["automotive", "manufacturing", "dealership", "supply_chain"]):
                network_type = "automotive"
            else:
                network_type = "insurance"
            
            topology = await self.get_network_topology(network_type)
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
        # Get network type from query parameter (default: insurance)
        network_type = request.args.get('network', 'insurance')
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        topology = loop.run_until_complete(neuro_interface.get_network_topology(network_type))
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