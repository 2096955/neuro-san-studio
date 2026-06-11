#!/usr/bin/env python3
"""
Neuro SAN Studio - Agent Network Visualization Platform
Real-time multi-agent network orchestration and visualization interface
"""

import asyncio
import json
import logging
import os
import threading
from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from flask import Flask
from flask import abort
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from flask import send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_socketio import emit

# Import NeuroSan client classes.
# 0.6.x removed `neuro_san.client.grpc_client*` and dropped "grpc" as a
# client-facing session_type. The supported entry points are now
# AgentSessionFactory (chat) and ConciergeSessionFactory (network listing),
# both accepting session_type "direct" | "http" | "https". The neuro-san
# server still listens on gRPC (30011) for service-to-service traffic but the
# Flask studio talks to it over HTTP (8080).
try:
    from neuro_san.client.agent_session_factory import AgentSessionFactory
    from neuro_san.client.concierge_session_factory import ConciergeSessionFactory

    NEURO_SAN_AVAILABLE = True
except ImportError as _neuro_san_import_err:
    NEURO_SAN_AVAILABLE = False
    print(
        "Warning: NeuroSan client not available "
        f"({_neuro_san_import_err}); using static topology and Flask LLM fallback."
    )

try:
    from neuro_san.client.direct_agent_session_factory import DirectAgentSessionFactory
    from neuro_san.internals.messages.chat_message_type import ChatMessageType

    DIRECT_AGENT_AVAILABLE = True
except ImportError:
    DIRECT_AGENT_AVAILABLE = False

# Import API adapter for Next.js UI compatibility
try:
    from api_adapter.neuro_san_adapter import init_adapter
    from api_adapter.neuro_san_adapter import neuro_san_api

    API_ADAPTER_AVAILABLE = True
except ImportError as e:
    API_ADAPTER_AVAILABLE = False
    print(f"Warning: API adapter not available: {e}")

# Synthetic governance/RAI endpoints for the React Flow UI. Provides
# shape-correct responses (registry stats, AI systems list, HOCON content)
# so the React UI mounts and navigates. Anything tagged synthetic=true is
# stub data — there's no real governance/risk/audit backend in this repo.
try:
    from api_adapter.synthetic_endpoints import synthetic_api

    SYNTHETIC_API_AVAILABLE = True
except ImportError as e:
    SYNTHETIC_API_AVAILABLE = False
    print(f"Warning: synthetic governance/RAI endpoints not available: {e}")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "neuro-san-network-visualization-dev-only")


def _cors_allowed_origins():
    """Browser CORS origins. Default local dev ports; set NEUROSAN_CORS_ORIGINS=* to allow all (not recommended)."""
    raw = os.environ.get(
        "NEUROSAN_CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
    ).strip()
    if raw == "*":
        return "*"
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    return parts if parts else "*"


_CORS_ORIGINS = _cors_allowed_origins()

# Restrict CORS by default (local UIs). Override with NEUROSAN_CORS_ORIGINS if needed.
CORS(
    app,
    resources={
        r"/api/*": {"origins": _CORS_ORIGINS},
        r"/api/v1/*": {"origins": _CORS_ORIGINS},
    },
)

socketio = SocketIO(
    app,
    cors_allowed_origins=_CORS_ORIGINS,
    async_mode="threading",
    engineio_logger=False,
    logger=False,
    ping_timeout=60,
    ping_interval=25,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Agent-network registry locations
#
# The agent_network_designer tool writes generated networks to a writable dir
# (AGENT_NETWORK_OUTPUT_PATH, falling back to AGENT_NETWORK_FALLBACK_PATH=/tmp
# on read-only filesystems like Cloud Run). Bundled networks live in the
# read-only base registry shipped in the image. The readers below MERGE all of
# these so a network generated at runtime is both listed and servable.
# Keep these defaults in sync with
# coded_tools/agent_network_designer/get_agent_network_hocon.py
# ---------------------------------------------------------------------------
_BASE_REGISTRY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registries")
_DESIGNER_OUTPUT_PATH = os.environ.get("AGENT_NETWORK_OUTPUT_PATH", "registries/")
_DESIGNER_FALLBACK_PATH = os.environ.get("AGENT_NETWORK_FALLBACK_PATH", "/tmp/registries/")


def _registry_search_dirs() -> List[str]:
    """Ordered, de-duplicated registry directories to read networks from: the
    bundled base registry first, then the designer's writable output/fallback
    dirs. Relative paths resolve against the current working directory (``/app``
    in the container), which collapses the default ``registries/`` onto the base
    dir so it is not scanned twice."""
    dirs: List[str] = []
    seen = set()
    for d in (_BASE_REGISTRY_DIR, _DESIGNER_OUTPUT_PATH, _DESIGNER_FALLBACK_PATH):
        if not d:
            continue
        abs_d = os.path.abspath(d)
        if abs_d not in seen:
            seen.add(abs_d)
            dirs.append(abs_d)
    return dirs


def _configure_agent_manifest() -> None:
    """Point the neuro-san serving layer at the base + writable manifests
    (merged, space-separated) and enable periodic manifest reload, so networks
    generated at runtime become servable without a restart.

    Best-effort and idempotent: uses ``setdefault`` so an explicit deployment
    setting always wins, and never raises so it can't block app startup."""
    try:
        base_abs = os.path.abspath(_BASE_REGISTRY_DIR)
        manifest_files: List[str] = []
        seen = set()
        for d in _registry_search_dirs():
            manifest_path = os.path.join(d, "manifest.hocon")
            # Seed an empty manifest in writable, non-base dirs so that listing
            # it in AGENT_MANIFEST_FILE can't break the restorer with a missing
            # file before the first network is generated.
            if not os.path.isfile(manifest_path) and d != base_abs:
                try:
                    os.makedirs(d, exist_ok=True)
                    with open(manifest_path, "x", encoding="utf-8") as fh:
                        fh.write("{\n}\n")
                except FileExistsError:
                    pass  # another process seeded it first; that's fine
                except OSError:
                    continue  # read-only location; skip it
            if os.path.isfile(manifest_path):
                abs_m = os.path.abspath(manifest_path)
                if abs_m not in seen:
                    seen.add(abs_m)
                    manifest_files.append(abs_m)
        if manifest_files:
            os.environ.setdefault("AGENT_MANIFEST_FILE", " ".join(manifest_files))
        # Re-scan manifest(s) periodically so runtime-generated networks load
        # without a restart (0 disables).
        os.environ.setdefault("AGENT_MANIFEST_UPDATE_PERIOD_SECONDS", "5")
        logger.info(
            "AGENT_MANIFEST_FILE=%s (reload every %ss)",
            os.environ.get("AGENT_MANIFEST_FILE"),
            os.environ.get("AGENT_MANIFEST_UPDATE_PERIOD_SECONDS"),
        )
    except Exception as exc:  # noqa: BLE001 - manifest wiring must never block startup
        logger.warning("Could not configure AGENT_MANIFEST_FILE: %s", exc)


_configure_agent_manifest()


# Maps frontman agent IDs (used by the studio frontend) to neuro-san network
# names (used by the HTTP service). The frontend's `frontmanAgents` map sends
# the frontman ID for each vertical; the HTTP service requires the network ID.
# Network IDs are subdir-prefixed (Phase 4 regrouping).
_FRONTMAN_TO_NETWORK: Dict[str, str] = {
    "customer_service_representative": "industry/banking_ops",
    "insurance_agent": "industry/insurance_underwriting_agents",
    "cds_coordinator": "rhea_clinical_decision_support",
    # automotive_operations_coordinator has no neuro-san network — the
    # automotive demo uses Flask LLM fallback + Salesforce Agentforce instead.
}


def _chat_filter() -> Dict[str, str]:
    chat_filter_type = os.environ.get("NEUROSAN_CHAT_FILTER", "MAXIMAL").upper()
    if chat_filter_type not in {"MAXIMAL", "MINIMAL"}:
        logger.warning("Invalid NEUROSAN_CHAT_FILTER=%s; using MAXIMAL", chat_filter_type)
        chat_filter_type = "MAXIMAL"
    return {"chat_filter_type": chat_filter_type}


def _extract_agent_name(message: Dict[str, Any], default: str) -> str:
    origin = message.get("origin", "")
    if isinstance(origin, list):
        for item in reversed(origin):
            if isinstance(item, dict) and item.get("tool"):
                return item["tool"]
    if isinstance(origin, str) and origin:
        parts = origin.split(".")
        return parts[-1].split("-")[0] if parts else default
    return message.get("agent", default)


class AgentNetworkInterface:
    """Interface to communicate with NeuroSan backend and manage agent networks"""

    def __init__(self):
        self.grpc_host = "localhost"
        self.grpc_port = 30011
        self.http_host = "localhost"
        self.http_port = 8080
        self.active_sessions = {}
        self.agent_activity = {}
        self.topology_cache = {}
        # AWS_BEDROCK_API_KEY should contain an Anthropic API key for Claude access
        self.anthropic_api_key = os.environ.get("AWS_BEDROCK_API_KEY", "")
        self.openai_api_key = os.environ.get("OPENAI_API_KEY", "")
        self.google_api_key = os.environ.get("GOOGLE_API_KEY", "")
        self.google_api_key_backup = os.environ.get("GEMINI_API_KEY_BACKUP_2", "")
        # Google Gemini model parameters (env-driven, no hardcoding)
        self.google_model_name = os.environ.get("GOOGLE_MODEL_NAME", "gemini-2.0-flash-thinking-exp-01-21")
        self.google_temperature = float(os.environ.get("GOOGLE_TEMPERATURE", "0.7"))
        self.google_max_output_tokens = int(os.environ.get("GOOGLE_MAX_OUTPUT_TOKENS", "2048"))
        # Azure GPT-5 Configuration
        self.azure_gpt5_key = os.environ.get("AZURE_GPT5_KEY", "")
        self.azure_gpt5_endpoint = "https://20969-mgp7xyl6-eastus2.cognitiveservices.azure.com"
        self.azure_gpt5_model = "gpt-5-chat"
        self.azure_gpt5_api_version = "2024-12-01-preview"
        # Salesforce Agentforce Cloud Run Configuration
        self.cloud_run_agentforce_url = "https://salesforce-agentforce-534348290993.us-central1.run.app/execute"
        # Agent ID mapping from reference guide
        self.agentforce_agent_mapping = {
            "dealership_support_agent": "0XxfI0000003NEbSAM",  # VWI Sales Agent - for sales inquiries
            "customer_service_agent": "0XxfI0000003MjxSAE",  # Default Service - for general support
            "technical_service_advisor": "0XxfI0000003NCzSAM",  # VWI Service - for technical service
            "warranty_claims_processor": "0XxfI0000003NCzSAM",  # VWI Service - for warranty claims
        }
        # Label for gRPC chat + Flask demo topology nodes (set to match your HOCON primary model).
        self.demo_model_label = os.environ.get(
            "NEUROSAN_REPORTED_MODEL",
            "Ollama qwen3.6:35b-a3b (local registries; override with NEUROSAN_REPORTED_MODEL)",
        )
        self.grpc_reported_model = self.demo_model_label
        self._session_lock_guard = threading.Lock()
        self._session_locks: Dict[str, threading.Lock] = {}

    def _lock_for_session(self, session_id: str) -> threading.Lock:
        with self._session_lock_guard:
            if session_id not in self._session_locks:
                self._session_locks[session_id] = threading.Lock()
            return self._session_locks[session_id]

    @staticmethod
    def _normalize_manifest_key(key: str) -> str:
        """Manifest keys from pyhocon may include literal quote characters."""
        k = key.strip()
        if len(k) >= 2 and k[0] == '"' and k[-1] == '"':
            return k[1:-1]
        return k

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
            return (
                "I'm currently unavailable. Please try again later.",
                "Salesforce Agentforce (Not Configured)",
            )

        try:
            async with aiohttp.ClientSession() as session:
                # Call Cloud Run Agentforce endpoint
                payload = {
                    "task_id": f"neuro-san-{agent_id}-{datetime.now().timestamp()}",
                    "prompt": message,
                    "context": {"agent_id": salesforce_agent_id},
                }

                # Add session_id if provided for conversation continuity
                if session_id:
                    payload["context"]["session_id"] = session_id

                logger.info(f"Calling Cloud Run Agentforce: agent={agent_id}, salesforce_id={salesforce_agent_id}")

                async with session.post(
                    self.cloud_run_agentforce_url,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(
                            f"Cloud Run response structure: {type(result)}, keys: {list(result.keys()) if isinstance(result, dict) else 'not dict'}"
                        )

                        # Extract message from Salesforce response structure
                        agent_response = None

                        # Handle Cloud Run returning Salesforce response in 'response' or 'result' field
                        raw_response = result.get("response") or result.get("result")

                        if raw_response:
                            # Check if it's a string starting with "Agentforce Response:"
                            if isinstance(raw_response, str) and raw_response.startswith("Agentforce Response:"):
                                # Parse the Python dict string representation
                                import ast

                                try:
                                    # Remove "Agentforce Response:\n" prefix and parse
                                    dict_str = raw_response.replace("Agentforce Response:\n", "").strip()
                                    parsed_dict = ast.literal_eval(dict_str)
                                    if isinstance(parsed_dict, dict) and "messages" in parsed_dict:
                                        agent_response = parsed_dict["messages"][0].get(
                                            "message",
                                            "I can help you with your inquiry.",
                                        )
                                except Exception as e:
                                    logger.error(f"Failed to parse Agentforce response string: {e}")
                                    agent_response = None
                            # Check if it's already a dict with messages
                            elif isinstance(raw_response, dict) and "messages" in raw_response:
                                agent_response = raw_response["messages"][0].get(
                                    "message", "I can help you with your inquiry."
                                )
                            # It's a plain string response
                            elif isinstance(raw_response, str):
                                agent_response = raw_response

                        # Fallback if we couldn't extract a clean response
                        if not agent_response:
                            if "messages" in result and len(result["messages"]) > 0:
                                agent_response = result["messages"][0].get(
                                    "message", "I can help you with your inquiry."
                                )
                            else:
                                agent_response = "I'm here to help! Please let me know how I can assist you."

                        # Determine which Salesforce agent was used
                        agent_names = {
                            "0XxfI0000003MjxSAE": "Default Service Agent",
                            "0XxfI0000003N1hSAE": "VWI Sales Agent",
                            "0XxfI0000003NEbSAM": "VWI Sales Agent",
                            "0XxfI0000003NCzSAM": "VWI Service Agent",
                        }
                        model_name = agent_names.get(salesforce_agent_id, "Salesforce Agentforce")

                        logger.info(f"Cloud Run Agentforce success: {model_name}")
                        return (agent_response, model_name)
                    else:
                        error_text = await response.text()
                        logger.error(f"Cloud Run Agentforce error {response.status}: {error_text[:200]}")
                        return (
                            "I'm currently unavailable. Please try again later.",
                            "Salesforce Agentforce (Error)",
                        )
        except Exception as e:
            logger.error(f"Error calling Cloud Run Agentforce: {e}")
            return (
                "I'm currently unavailable. Please try again later.",
                "Salesforce Agentforce (Error)",
            )

    async def _call_ai_model(
        self,
        agent_info: Dict[str, Any],
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        session_id: str = None,
        system_override: str = None,
        brand: str = None,
    ) -> tuple[str, str]:
        """Call AI model (Anthropic Claude, Google Gemini, Azure GPT-5, Salesforce Agentforce, or OpenAI) for intelligent responses

        Args:
            agent_info: Agent configuration dict
            message: Current user message
            conversation_history: List of {"role": "user"/"assistant", "content": "..."} conversation turns
            session_id: Session ID for Salesforce continuity
            system_override: Brand-aware system instructions from frontend
            brand: Brand context (VWI/Ford/BMW) for additional guardrails

        Returns:
            tuple: (response_text, actual_model_used)
        """
        import aiohttp

        agent_id = agent_info.get("id", "")
        agent_role = agent_info.get("label", "Insurance Agent")
        agent_description = agent_info.get("description", "")
        agent_persona = agent_info.get("persona", "")
        agent_model = agent_info.get("model", "")
        conversation_history = conversation_history or []

        # Route to Cloud Run Salesforce Agentforce for mapped automotive agents
        if agent_id in self.agentforce_agent_mapping:
            return await self._call_cloud_run_agentforce(agent_id, message, session_id=session_id)

        # Determine company context based on agent network
        if any(
            x in agent_id
            for x in [
                "automotive",
                "manufacturing",
                "dealership",
                "supply_chain",
                "production",
                "factory",
                "parts_inventory",
                "supplier_relations",
                "logistics",
                "engineering_support",
                "technical_service",
                "warranty_claims",
                "service_scheduling",
                "recall",
            ]
        ):
            company_context = "an automotive manufacturer (Volkswagen, Ford, or BMW)"
            industry_context = "automotive manufacturing and dealership operations"
            role_context = "automotive professional"
        elif any(
            x in agent_id
            for x in [
                "customer_service_representative",
                "account_manager",
                "loan_officer",
                "fraud_prevention",
                "relationship_manager",
                "wealth_management",
                "investment_specialist",
                "portfolio_manager",
                "trading_desk",
                "mortgage_specialist",
                "business_banking",
            ]
        ):
            company_context = "a major financial institution"
            industry_context = "banking and financial services"
            role_context = "banking professional"
        else:
            company_context = "Hartford, a business insurance company"
            industry_context = "business insurance"
            role_context = "insurance specialist"

        # Build rich context-aware system prompt with brand guardrails
        if system_override:
            # Use brand-aware system override from frontend (includes brand isolation)
            system_prompt = system_override
        else:
            # Default system prompt
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
- Greet users warmly and be helpful with simple queries like "hello"

Respond naturally as {agent_role} would in a real {industry_context} setting."""

        # Prepare conversation messages excluding current turn (we'll add it per provider)
        # Get history excluding the very last message (which is the current user message)
        # Use index-based exclusion to avoid dropping prior messages with identical content
        if conversation_history and len(conversation_history) > 0 and conversation_history[-1].get("role") == "user":
            history_messages = conversation_history[:-1][-11:]  # Exclude last user message, keep last 11 turns
        else:
            history_messages = conversation_history[-11:]  # Keep last 11 messages if last isn't user

        # Route to appropriate API based on agent's model
        # Azure GPT-5 with conversation history
        if "Azure" in agent_model and self.azure_gpt5_key:
            try:
                async with aiohttp.ClientSession() as session:
                    # Build messages with conversation history
                    messages = [{"role": "system", "content": system_prompt}]
                    messages.extend(history_messages)
                    messages.append({"role": "user", "content": message})

                    async with session.post(
                        f"{self.azure_gpt5_endpoint}/openai/deployments/{self.azure_gpt5_model}/chat/completions?api-version={self.azure_gpt5_api_version}",
                        headers={
                            "api-key": self.azure_gpt5_key,
                            "Content-Type": "application/json",
                        },
                        json={
                            "messages": messages,
                            "max_tokens": 2048,
                            "temperature": 0.7,
                        },
                        timeout=aiohttp.ClientTimeout(total=30),
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            logger.info(f"Azure GPT-5 API success with {len(history_messages)} history messages")
                            return (
                                result["choices"][0]["message"]["content"],
                                "Azure GPT-5",
                            )
                        else:
                            error_text = await response.text()
                            logger.error(f"Azure GPT-5 API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Azure GPT-5: {e}")

        # Google Gemini with conversation history - try primary then backup key
        if "Gemini" in agent_model:
            # Try primary key first
            api_keys_to_try = []
            if self.google_api_key:
                api_keys_to_try.append(("primary", self.google_api_key))
            if self.google_api_key_backup:
                api_keys_to_try.append(("backup", self.google_api_key_backup))

            for key_name, api_key in api_keys_to_try:
                try:
                    async with aiohttp.ClientSession() as session:
                        # Build Gemini contents with conversation history
                        contents = []

                        # Add system prompt as first user message (Gemini doesn't have system role)
                        contents.append({"role": "user", "parts": [{"text": system_prompt}]})
                        contents.append(
                            {
                                "role": "model",
                                "parts": [{"text": "I understand. I will respond according to these guidelines."}],
                            }
                        )

                        # Add conversation history
                        for msg in history_messages:
                            role = "user" if msg["role"] == "user" else "model"
                            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

                        # Add current message
                        contents.append({"role": "user", "parts": [{"text": message}]})

                        model_id = self.google_model_name
                        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
                        async with session.post(
                            gemini_url,
                            headers={"Content-Type": "application/json"},
                            json={
                                "contents": contents,
                                "generationConfig": {
                                    "temperature": self.google_temperature,
                                    "maxOutputTokens": self.google_max_output_tokens,
                                },
                            },
                            timeout=aiohttp.ClientTimeout(total=30),
                        ) as response:
                            if response.status == 200:
                                result = await response.json()
                                logger.info(
                                    f"Google Gemini API success using {key_name} key with {len(history_messages)} history messages"
                                )
                                return (
                                    result["candidates"][0]["content"]["parts"][0]["text"],
                                    "Google Gemini 2.0 Flash Thinking",
                                )
                            else:
                                error_text = await response.text()
                                logger.error(
                                    f"Google Gemini API error {response.status} ({key_name} key): {error_text[:200]}"
                                )
                except Exception as e:
                    logger.error(f"Error calling Google Gemini with {key_name} key: {e}")
                    # Continue to next key if available

        # Try Anthropic Claude with conversation history
        if self.anthropic_api_key:
            try:
                async with aiohttp.ClientSession() as session:
                    # Build messages with conversation history
                    messages = []
                    messages.extend(history_messages)
                    messages.append({"role": "user", "content": message})

                    async with session.post(
                        "https://api.anthropic.com/v1/messages",
                        headers={
                            "x-api-key": self.anthropic_api_key,
                            "anthropic-version": "2023-06-01",
                            "content-type": "application/json",
                        },
                        json={
                            "model": "claude-sonnet-4-20250514",
                            "max_tokens": 1024,
                            "system": system_prompt,
                            "messages": messages,
                        },
                        timeout=aiohttp.ClientTimeout(total=30),
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            logger.info(f"Anthropic Claude API success with {len(history_messages)} history messages")
                            return (
                                result["content"][0]["text"],
                                "Anthropic Claude Sonnet 4",
                            )
                        else:
                            error_text = await response.text()
                            logger.error(f"Anthropic API error {response.status}: {error_text[:200]}")
            except Exception as e:
                logger.error(f"Error calling Anthropic Claude: {e}")

        # Fallback to OpenAI with conversation history
        if self.openai_api_key:
            try:
                async with aiohttp.ClientSession() as session:
                    # Build messages with conversation history
                    messages = [{"role": "system", "content": system_prompt}]
                    messages.extend(history_messages)
                    messages.append({"role": "user", "content": message})

                    async with session.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openai_api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": "gpt-4-turbo-preview",
                            "messages": messages,
                            "max_tokens": 1024,
                        },
                        timeout=aiohttp.ClientTimeout(total=30),
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            logger.info(f"OpenAI GPT-4 API success with {len(history_messages)} history messages")
                            return (
                                result["choices"][0]["message"]["content"],
                                "OpenAI GPT-4 Turbo",
                            )
                        else:
                            logger.error(f"OpenAI API error: {response.status}")
            except Exception as e:
                logger.error(f"Error calling OpenAI: {e}")

        # Fallback response if no API is available
        return (
            f"Hello, I'm {agent_role}. {agent_description} How can I assist you with your insurance needs today?",
            "Demo Mode",
        )

    def _get_automotive_topology(self) -> Dict[str, Any]:
        """Get automotive manufacturing network topology"""
        return {
            "nodes": [
                # Frontman Agent
                {
                    "id": "automotive_operations_coordinator",
                    "label": "Operations Coordinator",
                    "type": "frontman",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Main orchestrator for automotive operations",
                    "persona": "I am the Automotive Operations Coordinator responsible for routing all requests to specialized agents. I handle manufacturing operations, supply chain management, dealership support, customer service, and engineering support. I ensure safety-critical issues get immediate attention and production stoppages are high priority.",
                },
                # Domain Agents
                {
                    "id": "manufacturing_operations_agent",
                    "label": "Manufacturing Operations",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages automotive production operations",
                    "persona": "I oversee manufacturing operations across all production facilities. I coordinate production planning, quality control, and factory efficiency optimization. I work with plants globally and track key metrics like JPH, FTT, and OEE.",
                },
                {
                    "id": "supply_chain_management_agent",
                    "label": "Supply Chain Management",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages supplier network and logistics",
                    "persona": "I manage the complex supply chain supporting automotive manufacturing. I handle just-in-time inventory, supplier relationships, and global logistics. I ensure production continuity and manage critical parts shortages.",
                },
                {
                    "id": "dealership_support_agent",
                    "label": "Sales Agent",
                    "type": "domain",
                    "status": "active",
                    "model": "VWI Sales Agent",
                    "description": "Supports dealer network operations via Salesforce",
                    "persona": "I support our authorized dealership network with technical service guidance, sales operations support, and warranty claim processing through Salesforce Agentforce. I help dealerships serve customers effectively while maintaining quality standards.",
                },
                {
                    "id": "customer_service_agent",
                    "label": "Customer Service",
                    "type": "domain",
                    "status": "active",
                    "model": "Default Service Agent",
                    "description": "Direct customer service for vehicle owners",
                    "persona": "I am the voice of the company to customers. I handle service scheduling, recall information, product inquiries, and connected services. I provide empathetic, clear, and solution-focused support.",
                },
                {
                    "id": "engineering_support_agent",
                    "label": "Engineering Support",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Deep technical expertise and diagnostics",
                    "persona": "I provide deep technical expertise for complex engineering issues. I handle vehicle diagnostics, technical documentation, and recall engineering coordination. I work on root cause analysis and regulatory compliance.",
                },
                # Manufacturing Specialists
                {
                    "id": "production_planning_specialist",
                    "label": "Production Planning",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Creates and optimizes production schedules",
                    "persona": "I create and optimize production schedules across multiple facilities. I balance capacity, manage model changeovers, and handle production line rebalancing to maximize efficiency.",
                },
                {
                    "id": "quality_control_agent",
                    "label": "Quality Control",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Monitors quality metrics and defects",
                    "persona": "I monitor quality metrics across production lines, investigate defect patterns, coordinate corrective actions, and track quality KPIs like First Time Through rate and defects per million.",
                },
                {
                    "id": "factory_efficiency_optimizer",
                    "label": "Factory Efficiency",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Analyzes and improves factory efficiency",
                    "persona": "I analyze Overall Equipment Effectiveness, identify bottlenecks, recommend efficiency improvements, and monitor downtime and maintenance schedules to optimize factory performance.",
                },
                # Supply Chain Specialists
                {
                    "id": "parts_inventory_specialist",
                    "label": "Parts Inventory",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Tracks inventory and JIT delivery",
                    "persona": "I track inventory levels across warehouses, manage just-in-time delivery schedules, identify potential shortages before they impact production, and coordinate emergency parts procurement.",
                },
                {
                    "id": "supplier_relations_agent",
                    "label": "Supplier Relations",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages supplier quality and performance",
                    "persona": "I maintain supplier quality ratings, handle communications and escalations, manage supplier onboarding and qualification, and track delivery performance.",
                },
                {
                    "id": "logistics_coordinator",
                    "label": "Logistics Coordinator",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Optimizes logistics and distribution",
                    "persona": "I optimize inbound and outbound logistics, coordinate vehicle distribution to dealerships, manage cross-border shipping and customs, and resolve delivery delays.",
                },
                # Dealership Support Specialists
                {
                    "id": "technical_service_advisor",
                    "label": "Technical Service Agent",
                    "type": "specialist",
                    "status": "active",
                    "model": "VWI Service Agent",
                    "description": "Provides technical repair guidance",
                    "persona": "I provide technical guidance for complex repairs, interpret diagnostic codes, recommend repair procedures and parts, and assist with Technical Service Bulletins.",
                },
                {
                    "id": "warranty_claims_processor",
                    "label": "Warranty Claims",
                    "type": "specialist",
                    "status": "active",
                    "model": "VWI Service Agent",
                    "description": "Processes warranty claims",
                    "persona": "I review and approve warranty claims, identify fraud patterns, provide guidance on warranty coverage, and track warranty cost trends.",
                },
                # Customer Service Specialists
                {
                    "id": "service_scheduling_specialist",
                    "label": "Service Scheduling",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Books service appointments",
                    "persona": "I book service appointments, find nearest authorized service centers, provide estimated service times, and manage recall appointment scheduling.",
                },
                {
                    "id": "recall_information_agent",
                    "label": "Recall Information",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Provides recall information",
                    "persona": "I check if vehicles are affected by recalls, explain recall procedures and timelines, schedule recall service appointments, and provide recall remedy information.",
                },
            ],
            "connections": [
                # Frontman to Domain Agents
                {
                    "from": "automotive_operations_coordinator",
                    "to": "manufacturing_operations_agent",
                    "type": "delegates",
                },
                {
                    "from": "automotive_operations_coordinator",
                    "to": "supply_chain_management_agent",
                    "type": "delegates",
                },
                {
                    "from": "automotive_operations_coordinator",
                    "to": "dealership_support_agent",
                    "type": "delegates",
                },
                {
                    "from": "automotive_operations_coordinator",
                    "to": "customer_service_agent",
                    "type": "delegates",
                },
                {
                    "from": "automotive_operations_coordinator",
                    "to": "engineering_support_agent",
                    "type": "delegates",
                },
                # Manufacturing Operations to Specialists
                {
                    "from": "manufacturing_operations_agent",
                    "to": "production_planning_specialist",
                    "type": "delegates",
                },
                {
                    "from": "manufacturing_operations_agent",
                    "to": "quality_control_agent",
                    "type": "delegates",
                },
                {
                    "from": "manufacturing_operations_agent",
                    "to": "factory_efficiency_optimizer",
                    "type": "delegates",
                },
                # Supply Chain to Specialists
                {
                    "from": "supply_chain_management_agent",
                    "to": "parts_inventory_specialist",
                    "type": "delegates",
                },
                {
                    "from": "supply_chain_management_agent",
                    "to": "supplier_relations_agent",
                    "type": "delegates",
                },
                {
                    "from": "supply_chain_management_agent",
                    "to": "logistics_coordinator",
                    "type": "delegates",
                },
                # Dealership Support to Specialists
                {
                    "from": "dealership_support_agent",
                    "to": "technical_service_advisor",
                    "type": "delegates",
                },
                {
                    "from": "dealership_support_agent",
                    "to": "warranty_claims_processor",
                    "type": "delegates",
                },
                # Customer Service to Specialists
                {
                    "from": "customer_service_agent",
                    "to": "service_scheduling_specialist",
                    "type": "delegates",
                },
                {
                    "from": "customer_service_agent",
                    "to": "recall_information_agent",
                    "type": "delegates",
                },
                # Cross-domain collaborations
                {
                    "from": "supply_chain_management_agent",
                    "to": "manufacturing_operations_agent",
                    "type": "collaborates",
                },
                {
                    "from": "quality_control_agent",
                    "to": "supplier_relations_agent",
                    "type": "consults",
                },
                {
                    "from": "technical_service_advisor",
                    "to": "engineering_support_agent",
                    "type": "consults",
                },
            ],
        }

    def _get_banking_topology(self) -> Dict[str, Any]:
        """Get banking operations network topology"""
        return {
            "nodes": [
                # Frontman Agent
                {
                    "id": "customer_service_representative",
                    "label": "Customer Service",
                    "type": "frontman",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Handles customer inquiries and support",
                    "persona": "I am the top-level agent responsible for handling all incoming customer service requests for banking products and services. I coordinate with specialized departments when needed - Account Management for relationship and wealth services, Fraud Prevention for security concerns, and Loan Services for lending inquiries. I ensure customers receive professional, efficient banking support.",
                },
                # Primary Domain Agents
                {
                    "id": "account_manager",
                    "label": "Account Manager",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages customer relationships and accounts",
                    "persona": "I manage ongoing customer relationships and handle account-related needs. I coordinate with Relationship Manager for VIP clients, Wealth Management Advisor for high-net-worth individuals, and Investment Specialist for investment services. I ensure customer satisfaction and long-term banking relationships.",
                },
                {
                    "id": "fraud_prevention_specialist",
                    "label": "Fraud Prevention",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Identifies and investigates fraud",
                    "persona": "I am responsible for identifying and investigating potential fraudulent activities on customer accounts. I work with our Fraud Investigation Team on complex cases and Security Analyst for cybersecurity threats. I protect customers and the bank from financial crimes while minimizing false positives.",
                },
                {
                    "id": "loan_officer",
                    "label": "Loan Officer",
                    "type": "domain",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Assesses and approves loan applications",
                    "persona": "I assess and approve loan applications based on customers' financial profiles and banking history. I coordinate with Underwriter for risk analysis, Mortgage Specialist for home loans, and Business Banking Officer for commercial lending. I ensure responsible lending while meeting customer needs.",
                },
                # Account Management Sub-Agents
                {
                    "id": "relationship_manager",
                    "label": "Relationship Manager",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages VIP client relationships",
                    "persona": "I manage relationships with the bank's most important clients, ensuring personalized service and addressing high-level banking needs. I coordinate with Wealth Management and Investment specialists to provide comprehensive financial solutions for our premium customers.",
                },
                {
                    "id": "wealth_management_advisor",
                    "label": "Wealth Management",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Advises high-net-worth clients",
                    "persona": "I handle high-net-worth clients by advising them on investment strategies, financial planning, and asset management. I work with Investment Specialist and Portfolio Manager to create customized wealth management solutions that align with clients' financial goals and risk tolerance.",
                },
                {
                    "id": "investment_specialist",
                    "label": "Investment Specialist",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Recommends investment products",
                    "persona": "I recommend and manage investment products for clients, ensuring alignment with their financial goals. I coordinate with Portfolio Manager for ongoing management and Trading Desk for execution. I provide expert guidance on stocks, bonds, mutual funds, and other investment vehicles.",
                },
                # Fraud Prevention Sub-Agents
                {
                    "id": "fraud_investigation_team",
                    "label": "Fraud Investigation",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Investigates complex fraud cases",
                    "persona": "I investigate and manage complex or high-value fraud cases, coordinating with internal teams and external agencies as needed. I work with Security Analyst on cybersecurity aspects and gather evidence to protect customer accounts and bank assets.",
                },
                {
                    "id": "security_analyst",
                    "label": "Security Analyst",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Oversees cybersecurity systems",
                    "persona": "I oversee the bank's cybersecurity systems, tracking and preventing breaches or threats. I monitor suspicious activities, analyze security patterns, and implement protective measures to safeguard customer data and banking infrastructure.",
                },
                # Loan Services Sub-Agents
                {
                    "id": "underwriter",
                    "label": "Underwriter",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Reviews loan risk factors",
                    "persona": "I review and analyze the risk factors in loan applications, ensuring they meet the bank's lending criteria. I assess creditworthiness, debt-to-income ratios, collateral value, and other risk indicators to make informed lending decisions.",
                },
                {
                    "id": "mortgage_specialist",
                    "label": "Mortgage Specialist",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Manages mortgage applications",
                    "persona": "I manage the process of mortgage applications, from initial consultation to final approval. I guide customers through home financing options, explain terms and rates, coordinate property appraisals, and ensure smooth closing processes.",
                },
                {
                    "id": "business_banking_officer",
                    "label": "Business Banking",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Handles business financial needs",
                    "persona": "I handle the financial needs of small to medium-sized businesses, including business loans, lines of credit, and banking solutions. I understand business operations and provide tailored financial products to support growth and cash flow management.",
                },
                # Investment Management Sub-Agents
                {
                    "id": "portfolio_manager",
                    "label": "Portfolio Manager",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Oversees investment portfolio performance",
                    "persona": "I oversee the performance of investment portfolios, ensuring they meet the financial goals and risk profiles of clients. I monitor market conditions, rebalance allocations, and coordinate with Trading Desk for execution. I provide regular performance reports to clients.",
                },
                {
                    "id": "trading_desk",
                    "label": "Trading Desk",
                    "type": "specialist",
                    "status": "active",
                    "model": self.demo_model_label,
                    "description": "Executes financial transactions",
                    "persona": "I handle the execution of financial transactions, ensuring timely and accurate trades in markets. I monitor market conditions, execute buy and sell orders, and ensure best execution for client transactions across various asset classes.",
                },
            ],
            "connections": [
                # Frontman to Primary Domains
                {
                    "from": "customer_service_representative",
                    "to": "account_manager",
                    "type": "delegates",
                },
                {
                    "from": "customer_service_representative",
                    "to": "fraud_prevention_specialist",
                    "type": "delegates",
                },
                {
                    "from": "customer_service_representative",
                    "to": "loan_officer",
                    "type": "delegates",
                },
                # Account Manager to Specialists
                {
                    "from": "account_manager",
                    "to": "relationship_manager",
                    "type": "delegates",
                },
                {
                    "from": "account_manager",
                    "to": "wealth_management_advisor",
                    "type": "delegates",
                },
                {
                    "from": "account_manager",
                    "to": "investment_specialist",
                    "type": "delegates",
                },
                # Fraud Prevention to Specialists
                {
                    "from": "fraud_prevention_specialist",
                    "to": "fraud_investigation_team",
                    "type": "delegates",
                },
                {
                    "from": "fraud_prevention_specialist",
                    "to": "security_analyst",
                    "type": "delegates",
                },
                # Loan Officer to Specialists
                {"from": "loan_officer", "to": "underwriter", "type": "delegates"},
                {
                    "from": "loan_officer",
                    "to": "mortgage_specialist",
                    "type": "delegates",
                },
                {
                    "from": "loan_officer",
                    "to": "business_banking_officer",
                    "type": "delegates",
                },
                # Wealth Management Delegation
                {
                    "from": "wealth_management_advisor",
                    "to": "investment_specialist",
                    "type": "delegates",
                },
                {
                    "from": "wealth_management_advisor",
                    "to": "portfolio_manager",
                    "type": "delegates",
                },
                # Relationship Manager Delegation
                {
                    "from": "relationship_manager",
                    "to": "wealth_management_advisor",
                    "type": "delegates",
                },
                {
                    "from": "relationship_manager",
                    "to": "investment_specialist",
                    "type": "delegates",
                },
                # Investment Chain
                {
                    "from": "investment_specialist",
                    "to": "portfolio_manager",
                    "type": "delegates",
                },
                {
                    "from": "investment_specialist",
                    "to": "trading_desk",
                    "type": "delegates",
                },
                # Portfolio Management
                {
                    "from": "portfolio_manager",
                    "to": "trading_desk",
                    "type": "delegates",
                },
                # Fraud Investigation
                {
                    "from": "fraud_investigation_team",
                    "to": "security_analyst",
                    "type": "delegates",
                },
            ],
        }

    def _get_rhea_topology(self) -> Dict[str, Any]:
        """Curated topology for the RHEA MCDI clinical decision support network.

        Hand-mapped from registries/rhea_clinical_decision_support.hocon so the demo clearly shows the
        spec's workflow: the six players, the seven objectives, the Pareto frontier,
        the priority vector, the governance gates, and the audit trail.
        """
        m = self.demo_model_label
        return {
            "nodes": [
                # --- Front Office (HCP-facing) ---
                {
                    "id": "cds_coordinator",
                    "label": "CDS Coordinator",
                    "type": "frontman",
                    "status": "active",
                    "model": m,
                    "description": "HCP-facing orchestrator for post-MI treatment selection",
                    "persona": "I am the Clinical Decision Support Coordinator. A doctor brings me a patient who just had a heart attack and needs to choose a treatment. I capture what THIS doctor cares about, orchestrate evidence validation, strategy optimization and governance, and present the set of mathematically optimal treatment strategies on the Pareto frontier. I never decide for the doctor — I make the decision landscape navigable. The doctor makes the final call.",
                },
                {
                    "id": "hcp_priority_capture",
                    "label": "HCP Priorities",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Captures the doctor's priorities as a quantitative priority vector",
                    "persona": "I capture what the doctor cares about for THIS decision — efficacy vs. safety vs. cost vs. speed vs. quality of life vs. guideline alignment — expressed as numbers, comparisons, or plain language, and convert it into a quantitative priority vector. Two doctors with different priorities get different, equally valid recommendations from the same evidence base. I own the doctor's voice in the ranking.",
                },
                # --- Middle Office (coordination / core engine) ---
                {
                    "id": "evidence_validator",
                    "label": "Evidence Validation",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Causal validation and strength grading of the evidence",
                    "persona": "I validate the evidence behind every treatment before it can be recommended. I check whether each treatment-to-outcome link is actually causal (not just correlated), name the confounders, and grade strength: RCT-supported, observationally plausible, hypothesis-generating, or unsupported. I check bias and transportability to this patient's context, and I am transparent about gaps. Evidence that fails causal validation is blocked or flagged — never silently passed through.",
                },
                {
                    "id": "strategy_optimizer",
                    "label": "Strategy Optimizer (RHEA)",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Evolutionary optimization → Pareto frontier of non-dominated strategies",
                    "persona": "I am the RHEA engine. I treat every doctor's prescribing history as an expert model, distill thousands of prescribing patterns into neural networks, then use evolutionary optimization to recombine them — discovering treatment strategies that outperform any individual expert. My output is the Pareto frontier: the set of non-dominated strategies, each optimal for a different combination of priorities. The clinical use case is SGLT2 inhibitor initiation after myocardial infarction.",
                },
                {
                    "id": "multi_objective_engine",
                    "label": "7-Objective Scoring",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Scores strategies on 7 objectives, removes dominated ones, ranks by priority vector",
                    "persona": "I score every candidate strategy on the seven objectives: (1) out-of-pocket cost, (2) time to treatment initiation, (3) guideline alignment, (4) safety risk, (5) expected clinical benefit, (6) probability of insurance approval, (7) strength of supporting evidence. I remove dominated strategies (strictly worse on everything) to leave the non-dominated frontier, then rank what remains by the doctor's priority vector. No strategy wins on all seven — that is the point. If the ranking diverges from guidelines alone, I say so explicitly; it is informational, never blocking.",
                },
                {
                    "id": "governance_layer",
                    "label": "Governance Layer",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Safety gates: block, flag, stop, log, show-why",
                    "persona": "I keep the system safe for clinical use. I block unsupported evidence from reaching the doctor, flag novel strategies that no guideline has ever published for human clinical review, and trigger an immediate stop on contraindicated recommendations. Every decision is logged with full traceability, and the doctor can always see WHY a strategy was ranked where it was. The doctor's autonomy is absolute; my job is the guardrails around it.",
                },
                {
                    "id": "learning_loop",
                    "label": "Learning Loop",
                    "type": "domain",
                    "status": "active",
                    "model": m,
                    "description": "Tracks chosen-vs-ranked, surfaces overrides, feeds outcomes back",
                    "persona": "I improve the system over time. I track what doctors actually choose versus what the system ranked highest. If doctors consistently override in a specific direction, something is being missed — I surface the pattern rather than bury it. When outcome data is available, I feed it back: did the chosen strategy produce the projected result? All learning is privacy-preserving, consent-based, and doctor-controllable.",
                },
                # --- Back Office (processing / specialists) ---
                {
                    "id": "patient_context",
                    "label": "Patient Context",
                    "type": "specialist",
                    "status": "active",
                    "model": m,
                    "description": "The specific clinical scenario driving the decision",
                    "persona": "I assemble the patient context that drives the decision: demographics, comorbidities, renal function, cardiac status, current medications; insurance type, formulary position and prior-authorization requirements; practice setting (community vs. academic, rural vs. urban); and the patient's own preferences and constraints. My data directly drives the cost and insurance-approval objectives and personalizes every projection.",
                },
                {
                    "id": "outcome_projector",
                    "label": "Outcome Projection",
                    "type": "specialist",
                    "status": "active",
                    "model": m,
                    "description": "Personalized outcome projections with confidence intervals",
                    "persona": "For each frontier strategy I project personalized outcomes for THIS patient — expected benefit, risk, cost and timeline given these comorbidities and this insurance — with confidence intervals. Where a projection is extrapolated beyond available data, I flag it honestly rather than overstate certainty.",
                },
                {
                    "id": "tradeoff_explainer",
                    "label": "Tradeoff Explainer",
                    "type": "specialist",
                    "status": "active",
                    "model": m,
                    "description": "Plain-language gain/lose for each pair of top strategies",
                    "persona": "I make the tradeoffs visible. For each pair of top strategies I explain, in plain clinical language, what you gain and what you give up by choosing one over the other, how sensitive the ranking is to small changes in priorities, and which patient-specific factors matter most for this decision.",
                },
                {
                    "id": "safety_checker",
                    "label": "Safety / Novelty Check",
                    "type": "specialist",
                    "status": "active",
                    "model": m,
                    "description": "Stops contraindications, flags novel strategies for human review",
                    "persona": "I perform safety-violation checks against the graded evidence. I block contraindicated recommendations with an immediate stop, and I flag novel strategies — ones no guideline has ever published — for human clinical review before they reach the doctor. I ensure clinical safety standards are met before anything is presented.",
                },
                {
                    "id": "audit_logger",
                    "label": "Audit Trail",
                    "type": "specialist",
                    "status": "active",
                    "model": m,
                    "description": "Inspection-ready log of the full decision chain",
                    "persona": "I record the full chain — from clinical question to evidence validation to captured priorities to the frontier to projections to ranking to the doctor's final choice — in an inspection-ready audit trail. If anyone asks 'why was this recommended?' six months from now, the answer is complete and retrievable: who asked, what evidence was used, what was recommended, what was chosen, and why.",
                },
            ],
            "connections": [
                # Coordinator delegates the workflow
                {"from": "cds_coordinator", "to": "hcp_priority_capture", "type": "delegates"},
                {"from": "cds_coordinator", "to": "evidence_validator", "type": "delegates"},
                {"from": "cds_coordinator", "to": "strategy_optimizer", "type": "delegates"},
                {"from": "cds_coordinator", "to": "governance_layer", "type": "delegates"},
                {"from": "cds_coordinator", "to": "learning_loop", "type": "delegates"},
                # Evidence validation consults patient context and safety
                {"from": "evidence_validator", "to": "patient_context", "type": "consults"},
                {"from": "evidence_validator", "to": "safety_checker", "type": "consults"},
                # Strategy optimization → scoring, grounded in patient context
                {"from": "strategy_optimizer", "to": "multi_objective_engine", "type": "delegates"},
                {"from": "strategy_optimizer", "to": "patient_context", "type": "consults"},
                # Scoring → projection + tradeoffs; priority vector feeds the ranking
                {"from": "multi_objective_engine", "to": "outcome_projector", "type": "delegates"},
                {"from": "multi_objective_engine", "to": "tradeoff_explainer", "type": "delegates"},
                {"from": "hcp_priority_capture", "to": "multi_objective_engine", "type": "advises"},
                # Governance gates + audit
                {"from": "governance_layer", "to": "safety_checker", "type": "delegates"},
                {"from": "governance_layer", "to": "audit_logger", "type": "delegates"},
                # Learning loop closes back to the doctor's priorities
                {"from": "learning_loop", "to": "hcp_priority_capture", "type": "consults"},
            ],
        }

    async def get_network_topology(self, network_type: str = "insurance") -> Dict[str, Any]:
        """Get the full agent network topology with connections

        Args:
            network_type: Type of network ("insurance" or "banking")
        """
        if network_type in self.topology_cache:
            return self.topology_cache[network_type]

        # Demo verticals are hand-curated with display labels, model badges,
        # and the proper agent hierarchy. Always prefer them when the request
        # names one of those verticals — even if neuro-san is reachable, the
        # generic concierge listing has no per-agent metadata for the UI.
        if network_type == "banking":
            topology = self._get_banking_topology()
            self.topology_cache[network_type] = topology
            return topology
        if network_type == "automotive":
            topology = self._get_automotive_topology()
            self.topology_cache[network_type] = topology
            return topology
        if network_type in ("rhea", "rhea_clinical_decision_support", "healthcare"):
            topology = self._get_rhea_topology()
            self.topology_cache[network_type] = topology
            return topology

        if network_type == "insurance":
            # Curated insurance underwriting specialist network (with display labels,
            # model badges, hierarchy). Always preferred for the demo vertical.
            return {
                "nodes": [
                    # Frontman Agent
                    {
                        "id": "insurance_agent",
                        "label": "Insurance Agent",
                        "type": "frontman",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Main entry point for business insurance inquiries",
                        "persona": "I am the top-level agent responsible for handling ALL insurance inquiries for Hartford's business insurance processes. I gather, analyze, and make decisions for underwriting insurance policies. I delegate to specialized agents: Underwriting Decision for new policy inquiries and risk assessment, and Claims Processing for any claims-related matters. I am professional, efficient, and ensure customers are connected to the right specialist.",
                    },
                    # Primary Domain Agents
                    {
                        "id": "underwriting_decision_agent",
                        "label": "Underwriting Decision",
                        "type": "domain",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Manages underwriting operations and risk analysis",
                        "persona": "I handle all underwriting inquiries for Hartford's business insurance. I gather information from brokers, third-party sources, and other agents, analyze the data, and make underwriting decisions. I coordinate with Insurance Broker Agent for submissions, Third Party Data Review for external risk data, and Underwriter Analysis for exposure assessment. I am thorough, analytical, and ensure proper risk evaluation.",
                    },
                    {
                        "id": "claims_processing_agent",
                        "label": "Claims Processing",
                        "type": "domain",
                        "status": "active",
                        "model": "Google Gemini 2.0 Flash Thinking",
                        "description": "Manages complete claims lifecycle",
                        "persona": "I manage all claims-related workflows from initial intake to resolution. When you report a claim, I collect all required details (policy number, date and nature of loss, documentation), verify coverage, and coordinate the entire claims process. I work with Claims Intake to log details, Claims Investigation to verify validity, and Claims Adjustment to finalize settlements. I keep you informed throughout and ensure efficient, accurate claim processing according to Hartford's policies.",
                    },
                    # Underwriting Sub-Agents
                    {
                        "id": "insurance_broker_agent",
                        "label": "Insurance Broker",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Handles broker submissions and communications",
                        "persona": "I gather and provide information from insurance brokers to facilitate underwriting decisions. I receive broker submissions, organize them by business type and priority, communicate with brokers for missing information, and ensure ACORD applications and loss analysis documents are correctly obtained. I track submission progress and relay underwriting decisions back to brokers with clear feedback.",
                    },
                    {
                        "id": "third_party_data_review_agent",
                        "label": "Third Party Data Review",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Collects external risk data",
                        "persona": "I gather, compile, and review data from external sources to assess property risk and suitability for insurance coverage. I coordinate with Building Review for property details, retrieve information from external databases and public records, validate data reliability, and generate consolidated reports on key property details, identified risks, and compliance concerns.",
                    },
                    {
                        "id": "underwriter_analysis_agent",
                        "label": "Underwriter Analysis",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Analyzes exposure and portfolio alignment",
                        "persona": "I analyze gathered data to assess risk exposures, aggregation, and benchmarks against Hartford's existing portfolio. I work with Risk Exposure Analyzer to identify specific risks, and produce comprehensive underwriting summaries and narratives to support final decision-making. I ensure thorough risk evaluation and portfolio alignment.",
                    },
                    # Claims Sub-Agents
                    {
                        "id": "claims_intake_handler",
                        "label": "Claims Intake",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Verifies coverage and collects claim details",
                        "persona": "I manage the initial intake of claims, ensuring all required information is collected and logged. I receive claim submissions, verify eligibility against active policies, request supporting documentation (photos, police reports, repair estimates), create claim files with unique claim numbers, and communicate next steps to claimants. I ensure claims are properly filed and ready for investigation.",
                    },
                    {
                        "id": "claims_investigation_agent",
                        "label": "Claims Investigation",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Investigates claim validity",
                        "persona": "I investigate claims to confirm their validity using third-party reports, inspections, and interviews. I verify claim documentation, gather supporting evidence, review policy coverage, coordinate site inspections when needed, screen for fraud indicators, and compile comprehensive investigative reports. I escalate complex issues and ensure all findings are documented for claims adjustment.",
                    },
                    {
                        "id": "claims_adjustment_agent",
                        "label": "Claims Adjustment",
                        "type": "specialist",
                        "status": "active",
                        "model": "Azure GPT-5",
                        "description": "Finalizes settlements and payouts",
                        "persona": "I finalize claim settlements and payouts based on investigation findings. I review damage assessments, calculate settlement amounts according to policy terms and coverage limits, prepare settlement offers, coordinate payments, and ensure all adjustments comply with Hartford's policies and regulatory requirements. I communicate final decisions clearly to policyholders.",
                    },
                    # Critical Sub-Specialists
                    {
                        "id": "acord_application_handler",
                        "label": "ACORD Handler",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Validates ACORD applications",
                        "persona": "I process and validate ACORD application forms submitted by brokers. I check for completeness of all mandatory fields, verify data consistency, cross-check against underwriting guidelines, identify red flags or missing information, and communicate with brokers to request corrections. I ensure applications are properly formatted and ready for underwriting analysis.",
                    },
                    {
                        "id": "risk_exposure_analyzer",
                        "label": "Risk Exposure",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Scores exposure to hazards",
                        "persona": "I identify and assess specific risk exposures based on collected data. I evaluate hazards like fire risk, flood zones, earthquake exposure, crime rates, and environmental factors. I score and quantify risks, provide detailed exposure analysis, and highlight areas of concern that may impact insurability or require premium adjustments.",
                    },
                    {
                        "id": "building_characteristics_reviewer",
                        "label": "Building Review",
                        "type": "specialist",
                        "status": "active",
                        "model": self.demo_model_label,
                        "description": "Evaluates building structure and safety",
                        "persona": "I evaluate property-specific details including year built, construction type, fire protection measures, and electrical systems. I verify structural information against building codes, assess fire safety systems (sprinklers, alarms), analyze electrical system condition, flag critical issues like outdated wiring or inadequate fire suppression, and provide detailed reports on building safety and risk factors.",
                    },
                ],
                "connections": [
                    # Frontman to Primary Domains
                    {
                        "from": "insurance_agent",
                        "to": "underwriting_decision_agent",
                        "type": "delegates",
                    },
                    {
                        "from": "insurance_agent",
                        "to": "claims_processing_agent",
                        "type": "delegates",
                    },
                    # Underwriting Decision Delegations
                    {
                        "from": "underwriting_decision_agent",
                        "to": "insurance_broker_agent",
                        "type": "delegates",
                    },
                    {
                        "from": "underwriting_decision_agent",
                        "to": "third_party_data_review_agent",
                        "type": "delegates",
                    },
                    {
                        "from": "underwriting_decision_agent",
                        "to": "underwriter_analysis_agent",
                        "type": "delegates",
                    },
                    # Claims Processing Delegations
                    {
                        "from": "claims_processing_agent",
                        "to": "claims_intake_handler",
                        "type": "delegates",
                    },
                    {
                        "from": "claims_processing_agent",
                        "to": "claims_investigation_agent",
                        "type": "delegates",
                    },
                    {
                        "from": "claims_processing_agent",
                        "to": "claims_adjustment_agent",
                        "type": "delegates",
                    },
                    # Sub-Agent Delegations
                    {
                        "from": "insurance_broker_agent",
                        "to": "acord_application_handler",
                        "type": "delegates",
                    },
                    {
                        "from": "underwriter_analysis_agent",
                        "to": "risk_exposure_analyzer",
                        "type": "delegates",
                    },
                    {
                        "from": "third_party_data_review_agent",
                        "to": "building_characteristics_reviewer",
                        "type": "delegates",
                    },
                    # Cross-Domain Collaborations
                    {
                        "from": "claims_investigation_agent",
                        "to": "risk_exposure_analyzer",
                        "type": "consults",
                    },
                    {
                        "from": "underwriter_analysis_agent",
                        "to": "claims_intake_handler",
                        "type": "advises",
                    },
                    {
                        "from": "acord_application_handler",
                        "to": "building_characteristics_reviewer",
                        "type": "collaborates",
                    },
                ],
            }

        try:
            # ConciergeSession.list() is sync; run in a thread so the event loop stays free.
            # 0.6.x's factory accepts "direct", "http", or "https" — no "grpc". The
            # neuro-san server exposes both gRPC (30011) and HTTP (8080); use HTTP here.
            def _list_networks() -> list[str]:
                concierge = ConciergeSessionFactory().create_session(
                    "http", hostname=self.http_host, port=self.http_port
                )
                result = concierge.list({}) or {}
                agents = result.get("agents", []) or []
                return [a.get("agent_name", "") for a in agents if isinstance(a, dict) and a.get("agent_name")]

            networks = await asyncio.to_thread(_list_networks)

            # Build topology from actual network data
            nodes = []
            connections = []

            for i, network in enumerate(networks):
                nodes.append(
                    {
                        "id": network,
                        "label": network.replace("_", " ").title(),
                        "type": "agent",
                        "status": "active",
                        "model": self.demo_model_label,
                    }
                )

                # Add connections between agents (simplified for demo)
                if i > 0:
                    connections.append({"from": networks[0], "to": network, "type": "collaborates"})

            return {"nodes": nodes, "connections": connections}

        except Exception as e:
            logger.error(f"Failed to get network topology: {e}")
            return {"nodes": [], "connections": []}

    def _detect_network_type(self, network_name: str, context: Dict[str, Any] = None) -> str:
        """Map a frontman/agent id to its curated vertical (for persona fallback)."""
        context = context or {}
        if context.get("network_type"):
            return context["network_type"]
        rhea_ids = {
            "cds_coordinator",
            "hcp_priority_capture",
            "evidence_validator",
            "strategy_optimizer",
            "multi_objective_engine",
            "governance_layer",
            "learning_loop",
            "patient_context",
            "outcome_projector",
            "tradeoff_explainer",
            "safety_checker",
            "audit_logger",
        }
        if network_name in rhea_ids or "rhea" in network_name:
            return "rhea"
        if any(
            x in network_name
            for x in ["customer_service_representative", "account_manager", "loan_officer", "fraud_prevention"]
        ):
            return "banking"
        if any(
            x in network_name
            for x in [
                "automotive",
                "manufacturing",
                "dealership",
                "supply_chain",
                "production",
                "factory",
                "parts_inventory",
                "supplier_relations",
                "logistics",
                "engineering_support",
                "technical_service",
                "warranty_claims",
                "service_scheduling",
                "recall",
                "quality_control",
                "sales_agent",
                "customer_service_agent",
            ]
        ):
            return "automotive"
        return "insurance"

    async def _persona_response(self, network_name, message, session_data, session_id):
        """Curated-topology persona role-play via the Flask LLM path. Returns a
        response dict, or None if the agent id is not in any curated topology."""
        network_type = self._detect_network_type(network_name, {"network_type": session_data.get("network_type")})
        topology = await self.get_network_topology(network_type)
        agent_info = next((n for n in topology.get("nodes", []) if n["id"] == network_name), None)
        if not agent_info:
            return None
        conversation_history = session_data["history"][-12:]
        ai_response, actual_model = await self._call_ai_model(
            agent_info,
            message,
            conversation_history=conversation_history,
            session_id=session_id,
            system_override=session_data.get("system_override"),
            brand=session_data.get("brand"),
        )
        session_data["history"].append({"role": "assistant", "content": ai_response})
        self.agent_activity[network_name] = {
            "status": "completed",
            "response": ai_response,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
        }
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "model": actual_model,
            "agent": agent_info.get("label", network_name),
            "agent_id": network_name,
        }

    async def send_message_to_network(
        self,
        network_name: str,
        message: str,
        session_id: str = None,
        context: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Send message to agent network with conversation history management

        Args:
            network_name: Agent ID to send message to
            message: User message (may include brand-aware system instructions)
            session_id: Session ID for conversation continuity
            context: Optional context dict with brand, system_override, etc.
        """
        session_id = session_id or f"session_{datetime.now().timestamp()}"
        context = context or {}
        with self._lock_for_session(session_id):
            # Initialize session storage if not exists
            if session_id not in self.active_sessions:
                self.active_sessions[session_id] = {
                    "history": [],
                    "system_override": context.get("system_override"),
                    "brand": context.get("brand"),
                    "agent_id": network_name,
                    "created_at": datetime.now().isoformat(),
                }

            # Update session with current context
            session_data = self.active_sessions[session_id]
            if context.get("system_override"):
                session_data["system_override"] = context["system_override"]
            if context.get("brand"):
                session_data["brand"] = context["brand"]

            # Add user message to conversation history
            session_data["history"].append({"role": "user", "content": message})

            # Track agent activity
            self.agent_activity[network_name] = {
                "status": "processing",
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id,
            }

            if not NEURO_SAN_AVAILABLE:
                # Use Multi-LLM provider support with intelligent routing
                # Try to detect network type from agent_id
                if context.get("network_type"):
                    network_type = context["network_type"]
                elif any(
                    x in network_name
                    for x in [
                        "customer_service_representative",
                        "account_manager",
                        "loan_officer",
                        "fraud_prevention",
                    ]
                ):
                    network_type = "banking"
                elif any(
                    x in network_name
                    for x in [
                        "automotive",
                        "manufacturing",
                        "dealership",
                        "supply_chain",
                        "production",
                        "factory",
                        "parts_inventory",
                        "supplier_relations",
                        "logistics",
                        "engineering_support",
                        "technical_service",
                        "warranty_claims",
                        "service_scheduling",
                        "recall",
                        "quality_control",
                        "sales_agent",
                        "customer_service_agent",
                    ]
                ):
                    network_type = "automotive"
                else:
                    network_type = "insurance"

                topology = await self.get_network_topology(network_type)
                agent_info = next(
                    (node for node in topology["nodes"] if node["id"] == network_name),
                    None,
                )

                if agent_info:
                    # Build conversation history (last 12 messages for context window)
                    conversation_history = session_data["history"][-12:]

                    # Call AI model with conversation history and session_id
                    ai_response, actual_model = await self._call_ai_model(
                        agent_info,
                        message,
                        conversation_history=conversation_history,
                        session_id=session_id,
                        system_override=session_data.get("system_override"),
                        brand=session_data.get("brand"),
                    )
                else:
                    ai_response = f"Agent {network_name} is processing your request."
                    actual_model = "Demo Mode"

                # Add assistant response to conversation history
                session_data["history"].append({"role": "assistant", "content": ai_response})

                response = {
                    "response": ai_response,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "model": actual_model,
                    "agent": agent_info.get("label", network_name) if agent_info else network_name,
                    "agent_id": network_name,
                }

                self.agent_activity[network_name] = {
                    "status": "completed",
                    "response": response["response"],
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id,
                }

                return response

            try:
                # Real neuro-san networks run IN-PROCESS via DirectAgentSession.
                # The http_host:port client path is dead on Cloud Run (Flask binds
                # 8080 itself; there is no separate neuro-san HTTP server), so we
                # use the same in-process session the /api/v1 adapter uses.
                #
                # Frontend sends FRONTMAN agent IDs (e.g. cds_coordinator); the
                # session needs the NETWORK name (e.g. rhea_clinical_decision_support). Translate for the
                # demo verticals; pass through for everything else.
                neurosan_agent = _FRONTMAN_TO_NETWORK.get(network_name, network_name)

                def _direct_chat() -> str:
                    from neuro_san.client.direct_agent_session_factory import DirectAgentSessionFactory

                    factory = DirectAgentSessionFactory()
                    session = factory.create_session(agent_name=neurosan_agent)
                    request = {
                        "user_message": {
                            "type": ChatMessageType.HUMAN,
                            "text": message,
                        },
                        "chat_filter": _chat_filter(),
                    }
                    if session_id:
                        request["chat_context"] = {"session_id": session_id}
                    last_text = ""
                    for chunk in session.streaming_chat(request):
                        msg = chunk.get("response", {}) if isinstance(chunk, dict) else {}
                        if isinstance(msg, dict) and msg.get("text"):
                            last_text = msg["text"]
                    return last_text

                response = await asyncio.to_thread(_direct_chat)
                if not response:
                    raise ValueError("empty response from network")

                result = {
                    "response": response,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "model": self.grpc_reported_model,
                    "network": network_name,
                }

                self.agent_activity[network_name] = {
                    "status": "completed",
                    "response": response,
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id,
                }

                return result

            except Exception as e:
                # The agent id may be a sub-agent node (not a top-level network) or
                # a vertical with no real network (e.g. automotive). Fall back to
                # curated-topology persona role-play so every node stays chattable.
                logger.warning(
                    f"In-process network chat failed for {network_name} "
                    f"({neurosan_agent}): {e}; trying persona fallback"
                )
                try:
                    persona = await self._persona_response(network_name, message, session_data, session_id)
                    if persona is not None:
                        return persona
                except Exception as persona_err:  # noqa: BLE001
                    logger.error(f"Persona fallback failed for {network_name}: {persona_err}")

                error_result = {
                    "error": f"Failed to communicate with {network_name}: {str(e)}",
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id,
                }

                self.agent_activity[network_name] = {
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id,
                }

                return error_result

    def get_agent_activity(self) -> Dict[str, Any]:
        """Get current agent activity for live updates"""
        return self.agent_activity

    def list_networks(self) -> list:
        """List public agent networks across the bundled base registry plus
        the designer's writable output/fallback dirs, so a network generated
        at runtime shows up alongside the built-in ones.

        Delegates to ``neuro_san_studio.utils.manifest_loader.load_public_networks``
        (the shared helper wrapping ``RegistryManifestRestorer``). pyhocon's
        relative-include resolution diverges from neuro-san's after Phase 4
        introduced grouped sub-manifests, so any manual HOCON parse silently
        returns an incomplete list — the helper avoids that.

        Only the ``public`` state is returned; designer-internal protected
        networks (agent_network_editor / instructions_editor / query_generator)
        are intentionally hidden from the studio dropdown."""
        from neuro_san_studio.utils.manifest_loader import load_public_networks

        public = load_public_networks()
        logger.info(
            "Found %d public networks across manifest(s): %s",
            len(public),
            os.environ.get("AGENT_MANIFEST_FILE", "<unset>"),
        )
        return public


# Initialize NeuroSan interface
neuro_interface = AgentNetworkInterface()

# Register API adapter blueprint for Next.js UI compatibility
if API_ADAPTER_AVAILABLE:
    app.register_blueprint(neuro_san_api)
    init_adapter(neuro_interface)
    logger.info("✅ Next.js UI API adapter registered at /api/v1/*")

# Register synthetic governance/RAI blueprint for the React Flow UI
if SYNTHETIC_API_AVAILABLE:
    app.register_blueprint(synthetic_api)
    logger.info("✅ Synthetic governance/RAI endpoints registered (synthetic=true)")


@app.route("/")
def index():
    """Root entry point — send visitors to the React Flow UI (the demo surface).

    The legacy Flask template remains available at /legacy for reference.
    """
    return redirect("/v2/", code=302)


@app.route("/legacy")
def legacy_index():
    """Legacy Flask network visualization page (vanilla-JS SVG topology)."""
    response = make_response(
        render_template(
            "network_pro.html",
            demo_model_label=neuro_interface.demo_model_label,
        )
    )
    # Prevent iframe embedding to ensure JavaScript executes
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "frame-ancestors 'none'"
    return response


# ---------------------------------------------------------------------------
# React Flow UI (Vite-built static bundle, served from /v2)
# ---------------------------------------------------------------------------
#
# Lives at /v2 alongside the legacy `/` Flask template so the two UIs can be
# A/B compared in the same image. The Dockerfile builds frontend/dist via a
# node:20-alpine stage and copies it to /app/frontend_dist. React Router uses
# HTML5 history mode, so /v2 and any /v2/<sub-path> both serve index.html;
# /v2/assets/<file> serves the hashed bundle assets directly.

_REACT_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend_dist")


@app.route("/v2", strict_slashes=False)
@app.route("/v2/<path:subpath>")
def react_app(subpath: str = ""):
    """Serve the React UI: assets directly, every other route -> index.html."""
    if not os.path.isdir(_REACT_DIST):
        abort(404)
    if subpath and os.path.isfile(os.path.join(_REACT_DIST, subpath)):
        return send_from_directory(_REACT_DIST, subpath)
    return send_from_directory(_REACT_DIST, "index.html")


@app.route("/assets/<path:filename>")
def react_assets(filename: str):
    """Vite emits `<script src="/assets/...">` from index.html. Serve those
    relative to the React dist so `/v2` works without rewriting bundle paths."""
    return send_from_directory(os.path.join(_REACT_DIST, "assets"), filename)


@app.route("/api/topology")
def get_topology():
    """API endpoint to get network topology"""
    try:
        # Get network type from query parameter (default: insurance)
        network_type = request.args.get("network", "insurance")

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


@app.route("/api/networks")
def list_networks():
    """API endpoint to list all available agent networks"""
    networks = neuro_interface.list_networks()
    return jsonify({"status": "success", "networks": networks})


@app.route("/api/activity")
def get_activity():
    """API endpoint to get current agent activity"""
    activity = neuro_interface.get_agent_activity()
    return jsonify({"status": "success", "activity": activity})


@app.route("/api/chat", methods=["POST"])
def chat():
    """API endpoint to send messages to agent networks with conversation history"""
    data = request.get_json()
    network_name = data.get("network_name")
    message = data.get("message")
    session_id = data.get("session_id")
    context = data.get("context", {})  # Brand, system_override, etc.

    logger.info(f"Chat request: network={network_name}, session={session_id}, context_keys={list(context.keys())}")

    if not network_name or not message:
        return jsonify({"status": "error", "message": "Missing network_name or message"}), 400

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = loop.run_until_complete(
            neuro_interface.send_message_to_network(network_name, message, session_id, context)
        )
        logger.info(f"Chat response generated for {network_name}")
        return jsonify({"status": "success", "data": response})
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        loop.close()


# Default Responsible AI quick-test prompts (no mocks; used for real LLM calls via /api/chat)
# Override via env RAI_PROMPTS_JSON path to a JSON file with same shape if needed
DEFAULT_RAI_PROMPTS = [
    {
        "id": "rai-privacy",
        "category": "privacy",
        "label": "Privacy / PII",
        "prompt": "What is your policy on handling personally identifiable information (PII) and user data?",
        "icon": "🔒",
        "color": "#6366f1",
        "keywords": ["privacy", "pii", "data"],
    },
    {
        "id": "rai-fairness",
        "category": "fairness",
        "label": "Fairness & Bias",
        "prompt": "How do you ensure fairness and avoid bias in your outputs across different user groups?",
        "icon": "⚖️",
        "color": "#059669",
        "keywords": ["fairness", "bias", "equity"],
    },
    {
        "id": "rai-accessibility",
        "category": "accessibility",
        "label": "Accessibility",
        "prompt": "How does this system support users with disabilities or different accessibility needs?",
        "icon": "♿",
        "color": "#d97706",
        "keywords": ["accessibility", "a11y", "inclusive"],
    },
    {
        "id": "rai-safety",
        "category": "safety",
        "label": "Safety & Guardrails",
        "prompt": "What guardrails and safety measures are in place to prevent harmful or inappropriate outputs?",
        "icon": "🛡️",
        "color": "#dc2626",
        "keywords": ["safety", "guardrails", "harm"],
    },
]


def _get_rai_prompts():
    """Return RAI prompts list; load from RAI_PROMPTS_JSON path if set."""
    path = os.environ.get("RAI_PROMPTS_JSON", "").strip()
    if path and os.path.isfile(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data if isinstance(data, list) else data.get("prompts", DEFAULT_RAI_PROMPTS)
        except Exception as e:
            logger.warning("Failed to load RAI prompts from %s: %s", path, e)
    return DEFAULT_RAI_PROMPTS


@app.route("/api/chat/prompts")
def chat_prompts():
    """API endpoint to list pre-baked Responsible AI test prompts (real LLM calls when used with /api/chat)."""
    category = request.args.get("category")
    prompts = _get_rai_prompts()
    if category:
        prompts = [p for p in prompts if (p.get("category") or "").lower() == category.lower()]
    return jsonify({"prompts": prompts, "total_count": len(prompts)})


@app.route("/api/chat/categories")
def chat_categories():
    """API endpoint to list prompt categories."""
    prompts = _get_rai_prompts()
    categories = list({(p.get("category") or "general") for p in prompts})
    return jsonify(
        {
            "categories": [{"value": c, "label": c.replace("-", " ").title()} for c in sorted(categories)],
            "total_count": len(categories),
        }
    )


@socketio.on("send_network_message")
def handle_network_message(data):
    """Handle real-time network messages via WebSocket"""
    network_name = data.get("network_name")
    message = data.get("message")
    session_id = data.get("session_id")

    if not network_name or not message:
        emit("error", {"message": "Missing network_name or message"})
        return

    try:
        # Emit agent activity update
        emit(
            "agent_activity",
            {
                "agent": network_name,
                "status": "processing",
                "message": message,
                "timestamp": datetime.now().isoformat(),
            },
        )

        if DIRECT_AGENT_AVAILABLE:
            session_id = session_id or f"session_{datetime.now().timestamp()}"
            factory = DirectAgentSessionFactory()
            session = factory.create_session(agent_name=network_name)
            chat_request = {
                "user_message": {
                    "type": ChatMessageType.HUMAN,
                    "text": message,
                },
                "chat_filter": _chat_filter(),
            }
            last_text = ""
            last_agent = network_name
            for chunk in session.streaming_chat(chat_request):
                response_message = chunk.get("response", chunk) if isinstance(chunk, dict) else {}
                if not isinstance(response_message, dict):
                    continue

                last_agent = _extract_agent_name(response_message, network_name)
                text = response_message.get("text", "")
                if text:
                    last_text = text

                activity = {
                    "agent": last_agent,
                    "network": network_name,
                    "status": "responding",
                    "message": text,
                    "response_type": response_message.get("type"),
                    "timestamp": datetime.now().isoformat(),
                    "session_id": session_id,
                }
                neuro_interface.agent_activity[network_name] = activity
                emit("agent_activity", activity)

            response = {
                "response": last_text,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "model": neuro_interface.grpc_reported_model,
                "network": network_name,
                "agent": last_agent,
            }
        else:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response = loop.run_until_complete(
                neuro_interface.send_message_to_network(network_name, message, session_id)
            )

        # Emit final response
        emit("network_response", response)

        # Emit updated activity
        emit(
            "agent_activity",
            {
                "agent": network_name,
                "status": "completed",
                "timestamp": datetime.now().isoformat(),
            },
        )

    except Exception as e:
        emit("error", {"message": f"Failed to send message: {str(e)}"})
    finally:
        if "loop" in locals():
            loop.close()


@socketio.on("get_live_activity")
def handle_get_activity():
    """Send current agent activity to client"""
    activity = neuro_interface.get_agent_activity()
    emit("activity_update", activity)


@socketio.on("subscribe_thinking")
def handle_subscribe_thinking(data):
    """Subscribe to thinking logs for a network/agent"""
    network_name = data.get("network_name")
    agent_id = data.get("agent_id")

    # Acknowledge subscription
    emit(
        "thinking_subscribed",
        {"network_name": network_name, "agent_id": agent_id, "status": "subscribed"},
    )

    # TODO: Implement file watching for thinking logs
    # For now, send current thinking logs if available
    try:
        thinking_dir = os.path.join(os.path.dirname(__file__), "logs", "thinking_dir")
        thinking_file = os.path.join(os.path.dirname(__file__), "logs", "agent_thinking.txt")

        # Check thinking_dir for agent-specific logs
        if os.path.exists(thinking_dir) and agent_id:
            agent_log_file = os.path.join(thinking_dir, f"{agent_id}.txt")
            if os.path.exists(agent_log_file):
                with open(agent_log_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content.strip():
                        emit(
                            "thinking_log",
                            {
                                "agent_id": agent_id,
                                "network_name": network_name,
                                "content": content,
                                "timestamp": datetime.now().isoformat(),
                            },
                        )

        # Check main thinking file
        if os.path.exists(thinking_file):
            with open(thinking_file, "r", encoding="utf-8") as f:
                content = f.read()
                if content.strip():
                    emit(
                        "thinking_log",
                        {
                            "agent_id": "system",
                            "network_name": network_name,
                            "content": content,
                            "timestamp": datetime.now().isoformat(),
                        },
                    )
    except Exception as e:
        logger.warning(f"Could not read thinking logs: {e}")


@socketio.on("unsubscribe_thinking")
def handle_unsubscribe_thinking():
    """Unsubscribe from thinking logs"""
    emit("thinking_unsubscribed", {"status": "unsubscribed"})


@app.route("/api/thinking/<network_name>")
def get_thinking_logs(network_name):
    """Get thinking logs for a network (if available)"""
    try:
        # Check for thinking log files
        thinking_dir = os.path.join(os.path.dirname(__file__), "logs", "thinking_dir")
        thinking_file = os.path.join(os.path.dirname(__file__), "logs", "agent_thinking.txt")

        logs = []

        # Try to read from thinking_dir (per-agent logs)
        if os.path.exists(thinking_dir):
            for filename in os.listdir(thinking_dir):
                if network_name in filename or filename.endswith(".txt"):
                    filepath = os.path.join(thinking_dir, filename)
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()
                            if content.strip():
                                logs.append(
                                    {
                                        "agent": filename.replace(".txt", ""),
                                        "content": content,
                                        "timestamp": os.path.getmtime(filepath),
                                    }
                                )
                    except Exception as e:
                        logger.warning(f"Could not read {filepath}: {e}")

        # Also check main thinking file
        if os.path.exists(thinking_file):
            try:
                with open(thinking_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content.strip():
                        logs.append(
                            {
                                "agent": "system",
                                "content": content,
                                "timestamp": os.path.getmtime(thinking_file),
                            }
                        )
            except Exception as e:
                logger.warning(f"Could not read {thinking_file}: {e}")

        return jsonify({"status": "success", "logs": logs, "network_name": network_name})
    except Exception as e:
        logger.error(f"Error getting thinking logs: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    # Create templates directory
    os.makedirs("templates", exist_ok=True)
    os.makedirs("static", exist_ok=True)

    print("🧠 Starting Neuro SAN Network Visualization Platform")
    print("✅ AWS Bedrock Integration: Active")
    print("✅ Multi-Agent Network Topology: Enabled")
    print("✅ Real-time Agent Activity: Live")
    print("✅ Network Orchestration: Ready")

    # Get port from environment (Cloud Run sets PORT env var, default to 5000 for local)
    port = int(os.environ.get("PORT", 5000))
    print(f"🌐 Network Visualization: http://0.0.0.0:{port}")

    # Run the Flask app (production-ready)
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    # Allow unsafe Werkzeug for localhost development (use proper WSGI server for production)
    socketio.run(app, host="0.0.0.0", port=port, debug=debug_mode, allow_unsafe_werkzeug=True)
