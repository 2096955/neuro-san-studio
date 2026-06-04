"""
API Adapter for Next.js UI (neuro-san-ui) compatibility

This module provides Flask routes that match the API format expected by the Next.js UI,
transforming between the Next.js UI's expected format and the current Flask backend format.
"""

import asyncio
import json
import logging
import os
from flask import Blueprint, jsonify, request, Response
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Import the neuro_interface from the main app
# This will be set when the blueprint is registered
neuro_interface = None


def _chat_filter() -> Dict[str, str]:
    chat_filter_type = os.environ.get("NEUROSAN_CHAT_FILTER", "MAXIMAL").upper()
    if chat_filter_type not in {"MAXIMAL", "MINIMAL"}:
        logger.warning("Invalid NEUROSAN_CHAT_FILTER=%s; using MAXIMAL", chat_filter_type)
        chat_filter_type = "MAXIMAL"
    return {"chat_filter_type": chat_filter_type}


def _json_default(value):
    if hasattr(value, "value"):
        return value.value
    return str(value)


def set_neuro_interface(interface):
    """Set the neuro interface instance"""
    global neuro_interface
    neuro_interface = interface


def init_adapter(interface):
    """Initialize the adapter with the neuro interface"""
    set_neuro_interface(interface)


# Create the blueprint
neuro_san_api = Blueprint('neuro_san_api', __name__, url_prefix='/api/v1')


@neuro_san_api.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint expected by Next.js UI
    Returns: {"status": "healthy" | "ok", "versions": {"neuro-san": "version"}}
    """
    return jsonify({
        "status": "healthy",
        "versions": {
            "neuro-san": "1.0.0"  # TODO: Get actual version
        }
    })


@neuro_san_api.route('/concierge/list', methods=['GET'])
def list_agent_networks():
    """
    List all available agent networks
    Next.js UI expects: ConciergeService_List -> /api/v1/concierge/list
    Returns: ConciergeResponse format
    {
        "agents": [
            {"agent_name": "network_name", "display_name": "Display Name"}
        ]
    }
    """
    if not neuro_interface:
        return jsonify({"error": "Neuro interface not initialized"}), 500
    
    try:
        networks = neuro_interface.list_networks()
        
        # Transform to Next.js expected format
        agents = []
        for net in networks:
            if isinstance(net, dict):
                agents.append({
                    "agent_name": net.get("name", net.get("agent_name", "")),
                    "display_name": net.get("display_name", net.get("name", ""))
                })
            else:
                # If it's just a string
                agents.append({
                    "agent_name": str(net),
                    "display_name": str(net)
                })
        
        return jsonify({"agents": agents})
    except Exception as e:
        logger.error(f"Error listing networks: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@neuro_san_api.route('/<agent_name>/connectivity', methods=['GET'])
def get_connectivity(agent_name: str):
    """
    Get connectivity/topology information for an agent network
    Next.js UI expects: AgentService_Connectivity -> /api/v1/{agent_name}/connectivity
    Returns: ConnectivityResponse format
    {
        "connectivity_info": [
            {
                "origin": "agent_name",
                "tools": ["tool1", "tool2"],
                "connections": [...]  # Optional
            }
        ]
    }
    """
    if not neuro_interface:
        return jsonify({"error": "Neuro interface not initialized"}), 500
    
    try:
        # Get topology from existing endpoint logic (async method)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            topology = loop.run_until_complete(
                neuro_interface.get_network_topology(agent_name)
            )
        finally:
            loop.close()
        
        if not topology:
            return jsonify({"error": f"Network {agent_name} not found"}), 404
        
        # Transform topology to ConnectivityResponse format
        nodes = topology.get("nodes", [])
        connections = topology.get("connections", [])
        
        # Build connectivity info
        connectivity_info = []
        agent_map = {}
        
        # Create entries for each node
        for node in nodes:
            node_id = node.get("id", node.get("name", ""))
            agent_info = {
                "origin": node_id,
                "tools": node.get("tools", []),
            }
            connectivity_info.append(agent_info)
            agent_map[node_id] = agent_info
        
        # Add connection information
        for conn in connections:
            from_agent = conn.get("from", conn.get("source", ""))
            to_agent = conn.get("to", conn.get("target", ""))
            
            if from_agent in agent_map:
                if "connections" not in agent_map[from_agent]:
                    agent_map[from_agent]["connections"] = []
                agent_map[from_agent]["connections"].append({
                    "target": to_agent,
                    "type": conn.get("type", "delegation")
                })
        
        return jsonify({"connectivity_info": connectivity_info})
    except Exception as e:
        logger.error(f"Error getting connectivity for {agent_name}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@neuro_san_api.route('/<agent_name>/streaming-chat', methods=['POST'])
def streaming_chat(agent_name: str):
    """
    Streaming chat endpoint for agent network
    Next.js UI expects: AgentService_StreamingChat -> /api/v1/{agent_name}/streaming-chat
    Accepts: ChatRequest format
    {
        "user_message": {"type": "HUMAN", "text": "message"},
        "chat_context": {...},
        "sly_data": {...},
        "chat_filter": {...}
    }
    Returns: Server-Sent Events (SSE) stream of ChatResponse chunks
    """
    if not neuro_interface:
        return jsonify({"error": "Neuro interface not initialized"}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No request data"}), 400
        
        # Extract message from Next.js format
        user_message = data.get("user_message", {})
        message_text = user_message.get("text", "")
        
        if not message_text:
            return jsonify({"error": "No message text provided"}), 400
        
        # Extract session/context info
        chat_context = data.get("chat_context", {})
        session_id = chat_context.get("session_id") if isinstance(chat_context, dict) else None
        
        # Get user_id from headers (Next.js UI sends this)
        user_id = request.headers.get("user_id", "default_user")
        
        # Create SSE response
        def generate():
            try:
                from neuro_san.client.direct_agent_session_factory import DirectAgentSessionFactory
                from neuro_san.internals.messages.chat_message_type import ChatMessageType

                factory = DirectAgentSessionFactory()
                session = factory.create_session(agent_name=agent_name)
                chat_request = {
                    "user_message": {
                        "type": ChatMessageType.HUMAN,
                        "text": message_text,
                    },
                    "chat_filter": _chat_filter(),
                }
                if chat_context:
                    chat_request["chat_context"] = chat_context
                if data.get("sly_data"):
                    chat_request["sly_data"] = data["sly_data"]

                for chunk in session.streaming_chat(chat_request):
                    yield f"data: {json.dumps(chunk, default=_json_default)}\n\n"
            except Exception as e:
                logger.error(f"Error in streaming chat: {e}", exc_info=True)
                error_response = {"error": str(e)}
                yield f"data: {json.dumps(error_response)}\n\n"
        
        return Response(
            generate(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        logger.error(f"Error in streaming chat endpoint: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@neuro_san_api.route('/<agent_name>/function', methods=['GET'])
def get_agent_function(agent_name: str):
    """
    Get agent function/description
    Next.js UI expects: AgentService_Function -> /api/v1/{agent_name}/function
    Returns: FunctionResponse format
    {
        "function": "Agent description/function"
    }
    """
    if not neuro_interface:
        return jsonify({"error": "Neuro interface not initialized"}), 500
    
    try:
        # Get topology to find agent info
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            topology = loop.run_until_complete(
                neuro_interface.get_network_topology(agent_name)
            )
        finally:
            loop.close()

        if not topology:
            return jsonify({"error": f"Network {agent_name} not found"}), 404

        # Try to extract description from topology or network info
        # This is a placeholder - may need to enhance based on actual data structure
        description = f"Agent network: {agent_name}"

        nodes = topology.get("nodes", [])
        if nodes:
            # Try to find a description from the first node or network metadata
            first_node = nodes[0]
            description = first_node.get("description", first_node.get("label", description))

        return jsonify({"function": description})
    except Exception as e:
        logger.error(f"Error getting function for {agent_name}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500
