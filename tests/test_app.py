import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime
from app import app as flask_app, AgentNetworkInterface


@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    flask_app.config.update(
        {
            "TESTING": True,
        }
    )
    yield flask_app


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def agent_interface():
    """Provides an instance of AgentNetworkInterface for testing."""
    return AgentNetworkInterface()


def test_index_route(client):
    """
    Tests the main index route to ensure it returns a 200 OK status
    and contains the expected title.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert b"Neuro AI - Multi Agent Accelerator Client" in response.data


def test_list_networks_manifest_filter(agent_interface):
    """Enabled networks come from manifest.hocon; OpenAI built-in demos stay off by default."""
    names = agent_interface.list_networks()
    assert "openai_web_search" not in names
    assert "music_nerd_pro_local" in names


def test_topology_api(client):
    """
    Tests the /api/topology endpoint to ensure it returns a 200 OK status
    and a valid JSON response with the expected structure.
    """
    response = client.get("/api/topology?network=automotive")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "success"
    assert "topology" in json_data
    assert "nodes" in json_data["topology"]
    assert "connections" in json_data["topology"]


@pytest.mark.asyncio
async def test_recursion_prevention_top_level_guard(agent_interface):
    """
    Tests that send_message_to_network prevents an agent from processing a message
    if it has already processed it in the current turn (top-level guard clause).
    """
    session_id = "test_session_top_level_recursion"
    agent_id = "agent_a"
    initial_message = "Hello agent a."

    # Manually set up the session to simulate that agent_id has already processed this message in the current turn
    agent_interface.active_sessions[session_id] = {
        "history": [],
        "system_override": None,
        "brand": None,
        "agent_id": agent_id,
        "created_at": datetime.now().isoformat(),
        "processed_agents_for_turn": {
            agent_id
        },  # Simulate agent_id already processed this turn
    }

    # Call send_message_to_network for agent_id with the pre-configured session
    response = await agent_interface.send_message_to_network(
        agent_id,
        initial_message,
        session_id=session_id,
        context={"network_type": "test_network"},
    )

    assert response["model"] == "Error"
    assert "internal loop" in response["response"]
    assert agent_id in response["response"]
    assert agent_interface.active_sessions[session_id]["processed_agents_for_turn"] == {
        agent_id
    }


@pytest.mark.asyncio
async def test_recursion_prevention_delegation_guard(agent_interface):
    """
    Tests that send_message_to_network prevents recursive delegation to an agent
    that has already processed the message in the current turn (delegation guard clause).
    """
    session_id = "test_session_delegation_recursion"
    agent_a_id = "account_manager"
    agent_b_id = "agent_b"
    initial_message = "Please check account details for Agent A."
    agent_a_info = {
        "id": agent_a_id,
        "label": "Account Manager",
        "type": "domain",
        "model": "Demo Mode",
        "description": "",
        "persona": "",
    }
    agent_b_info = {
        "id": agent_b_id,
        "label": "Agent B",
        "type": "specialist",
        "model": "Demo Mode",
        "description": "",
        "persona": "",
    }

    # Topology: Agent B delegates to Agent A (to trigger the guard when agent_b tries to delegate)
    agent_interface.topology_cache["test_network"] = {
        "nodes": [agent_a_info, agent_b_info],
        "connections": [{"from": agent_b_id, "to": agent_a_id, "type": "delegates"}],
    }

    # Manually initialize the session data to simulate agent_a already processing this message in the current turn.
    agent_interface.active_sessions[session_id] = {
        "history": [],
        "system_override": None,
        "brand": None,
        "agent_id": agent_b_id,
        "created_at": datetime.now().isoformat(),
        "processed_agents_for_turn": {
            agent_a_id
        },  # Simulate agent_a has already processed for this turn
    }

    # Mock _call_ai_model to return a dummy response for any actual LLM call.
    # The recursion guard in send_message_to_network should fire *before* _call_ai_model for agent_a is invoked again.
    mock_call_ai_model = AsyncMock(return_value=("Some LLM response", "Mock Model"))

    with patch.object(agent_interface, "_call_ai_model", new=mock_call_ai_model):
        # Call send_message_to_network for agent_b with a message that triggers delegation to agent_a (keyword 'account')
        response = await agent_interface.send_message_to_network(
            agent_b_id,
            initial_message,
            session_id=session_id,
            context={"network_type": "test_network"},
        )

    # Expect that the response indicates an internal loop because agent_b tried to delegate to agent_a,
    # but agent_a was already in the processed_agents_for_turn set.
    assert response["model"] == "Error"
    assert "internal loop" in response["response"]
    assert (
        agent_a_id in response["response"]
    )  # The error message should mention agent_a as the target of recursion

    # Verify that both agents are in the processed set for the session turn
    assert (
        agent_a_id
        in agent_interface.active_sessions[session_id]["processed_agents_for_turn"]
    )
    assert (
        agent_b_id
        in agent_interface.active_sessions[session_id]["processed_agents_for_turn"]
    )
