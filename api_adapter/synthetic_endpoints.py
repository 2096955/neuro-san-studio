# Copyright (C) 2023-2026 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
# END COPYRIGHT
"""Stubbed governance/RAI endpoints for the React Flow UI.

The Vite/React frontend (originally built against a separate Replit-era backend
that no longer exists in this repo) calls a wide governance/RAI surface:
``/api/registry/*``, ``/api/systems/*``, ``/api/trust/*``, ``/api/guardrails``,
``/api/policies``, ``/api/history/*``. None of those have a real
implementation in this repo — there's no governance data model, no audit log,
no risk taxonomy.

This module returns shape-correct responses so the UI mounts and navigates
without 404 errors:

* For endpoints where we CAN derive real data from the registries
  (``/api/systems/allSystem``, ``/api/systems/hocon/<name>``,
  ``/api/registry/statistics`` partial), we use ``RegistryManifestRestorer``
  + filesystem reads.
* For the governance/RAI endpoints (trust scores, PII history, etc.) we
  return empty/zero shapes — honest about having no data.

Every response includes ``synthetic: true`` (or a wrapper that exposes it)
so anyone looking at the wire knows this is stub data, not real signal.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any
from typing import Dict
from typing import List

from flask import Blueprint
from flask import jsonify
from flask import request

logger = logging.getLogger(__name__)

synthetic_api = Blueprint("synthetic_api", __name__)

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTRIES_DIR = REPO_ROOT / "registries"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _public_networks() -> List[str]:
    try:
        from neuro_san_studio.utils.manifest_loader import load_public_networks
    except Exception as exc:
        logger.error("manifest_loader unavailable: %s", exc)
        return []
    return load_public_networks()


def _category_for(network_name: str) -> str:
    """Map subdir-prefixed network name -> sidebar category.

    Mirrors the categorization in ``scripts/tag_registries.py`` so the React
    UI's sidebar groupings stay consistent with the legacy template.
    """
    if "/" in network_name:
        prefix = network_name.split("/", 1)[0]
        return {
            "basic": "Basic",
            "tools": "Tools",
            "industry": "Industry",
            "experimental": "Experimental",
            "generated": "Generated",
        }.get(prefix, "Other")
    return "Designer"


def _registry_path_for(network_name: str) -> Path:
    """Resolve a network name back to the .hocon file path on disk."""
    return REGISTRIES_DIR / f"{network_name}.hocon"


def _synthesize_system(network_name: str) -> Dict[str, Any]:
    """Build an AISystem-shape dict for a given network from real registry data
    where possible, defaulting to safe zeros/empties for governance fields."""
    category = _category_for(network_name)
    bare = network_name.split("/")[-1]
    pretty = bare.replace("_", " ").title()
    hocon_path = _registry_path_for(network_name)
    description = ""
    if hocon_path.exists():
        try:
            text = hocon_path.read_text()
            for line in text.splitlines():
                stripped = line.strip().strip(",").strip(";")
                if "metadata.description" in stripped or stripped.startswith("description"):
                    if "=" in stripped or ":" in stripped:
                        sep = "=" if "=" in stripped else ":"
                        description = stripped.split(sep, 1)[1].strip().strip('"').strip(",")
                        break
        except OSError:
            pass

    return {
        "id": network_name,
        "name": pretty,
        "hocon_file_name": f"{bare}.hocon",
        "business_domain": category,
        "organisational_role": "agent_network",
        "region": "[]",
        "function": "[]",
        "industry": f'["{category}"]',
        "system_type": "Multi-Agent Network",
        "autonomy_level": "Supervised",
        "business_impact": "Unspecified",
        "external_dependencies": "[]",
        "data_access": "Internal",
        "risk_level": "Unspecified",
        "status": "Active",
        "description": description or f"{pretty} agent network",
        "registration_date": "2026-01-01T00:00:00Z",
        "last_updated": "2026-01-01T00:00:00Z",
        "created_at": "2026-01-01T00:00:00Z",
        "synthetic": True,
    }


# ---------------------------------------------------------------------------
# /api/registry/*
# ---------------------------------------------------------------------------


@synthetic_api.route("/api/registry/statistics", methods=["GET"])
def registry_statistics():
    networks = _public_networks()
    by_category: Dict[str, int] = {}
    for n in networks:
        by_category[_category_for(n)] = by_category.get(_category_for(n), 0) + 1
    total = len(networks) or 1
    by_department = [
        {"name": cat, "domain": cat, "count": cnt, "percentage": round(100 * cnt / total, 1)}
        for cat, cnt in sorted(by_category.items())
    ]
    return jsonify(
        {
            "totalRegistries": len(networks),
            "activeRegistries": len(networks),
            "pendingApproval": 0,
            "multiAgentSystems": len(networks),
            "riskCategories": {"high": 0, "medium": 0, "low": 0, "minimal": len(networks)},
            "systemTypes": {"Multi-Agent Network": {"count": len(networks), "percentage": 100.0}},
            "byDepartment": by_department,
            "recentActivity": [],
            "synthetic": True,
        }
    )


@synthetic_api.route("/api/registry/systems", methods=["GET"])
def registry_systems():
    status_filter = request.args.get("status")
    items = [_synthesize_system(n) for n in _public_networks()]
    if status_filter:
        items = [s for s in items if s["status"].lower() == status_filter.lower()]
    return jsonify(items)


@synthetic_api.route("/api/registry/systems/<path:system_id>", methods=["GET"])
def registry_system_detail(system_id: str):
    if system_id not in _public_networks():
        return jsonify({"error": "system not found", "synthetic": True}), 404
    return jsonify(_synthesize_system(system_id))


@synthetic_api.route("/api/registry/activity", methods=["GET"])
def registry_activity():
    return jsonify([])


@synthetic_api.route("/api/registry/systems/<path:system_id>/activity", methods=["GET"])
def registry_system_activity(system_id: str):
    return jsonify([])


@synthetic_api.route("/api/registry/departments", methods=["GET"])
def registry_departments():
    networks = _public_networks()
    by_category: Dict[str, int] = {}
    for n in networks:
        by_category[_category_for(n)] = by_category.get(_category_for(n), 0) + 1
    total = len(networks) or 1
    return jsonify(
        [
            {"name": cat, "domain": cat, "count": cnt, "percentage": round(100 * cnt / total, 1)}
            for cat, cnt in sorted(by_category.items())
        ]
    )


# ---------------------------------------------------------------------------
# /api/systems/*
# ---------------------------------------------------------------------------


@synthetic_api.route("/api/systems/allSystem", methods=["GET"])
def systems_all():
    networks = _public_networks()
    agents = []
    for n in networks:
        bare = n.split("/")[-1]
        agents.append(
            {
                "agent_id": n,
                "system_name": bare,
                "system_description": f"{bare.replace('_', ' ').title()} agent network",
                "model_name": "gemini-2.5-flash",
                "file_name": f"{bare}.hocon",
                "file_path": f"registries/{n}.hocon",
            }
        )
    return jsonify({"agents": agents, "total_count": len(agents), "synthetic": True})


@synthetic_api.route("/api/systems/allSystem/<path:filename>", methods=["GET"])
def systems_all_file(filename: str):
    if filename.endswith(".hocon"):
        filename = filename[:-6]
    matches = [n for n in _public_networks() if n.split("/")[-1] == filename or n == filename]
    if not matches:
        return jsonify({"error": "file not found", "synthetic": True}), 404
    n = matches[0]
    return jsonify(
        {
            "agent_id": n,
            "system_name": n.split("/")[-1],
            "model_name": "gemini-2.5-flash",
            "file_name": f"{n.split('/')[-1]}.hocon",
            "file_path": f"registries/{n}.hocon",
            "synthetic": True,
        }
    )


@synthetic_api.route("/api/systems/system/<path:system_name>", methods=["GET"])
def systems_system(system_name: str):
    if system_name not in _public_networks():
        return jsonify({"error": "system not found", "synthetic": True}), 404
    return jsonify(_synthesize_system(system_name))


@synthetic_api.route("/api/systems/hocon/<path:system_name>", methods=["GET"])
def systems_hocon(system_name: str):
    """Return the raw HOCON text for a network. Path-resolves either a full
    subdir-prefixed name (``industry/banking_ops``) or a bare stem
    (``banking_ops``)."""
    candidates = []
    if "/" in system_name:
        candidates.append(REGISTRIES_DIR / f"{system_name}.hocon")
    else:
        candidates.extend(REGISTRIES_DIR.rglob(f"{system_name}.hocon"))
    candidates = [c for c in candidates if c.exists()]
    if not candidates:
        return jsonify({"error": "hocon not found", "synthetic": True}), 404
    target = candidates[0]
    try:
        text = target.read_text()
    except OSError as exc:
        return jsonify({"error": f"read failed: {exc}", "synthetic": True}), 500
    return jsonify({"filename": target.name, "content": text, "synthetic": True})


@synthetic_api.route("/api/systems/rai-agents", methods=["GET"])
def systems_rai_agents():
    return jsonify({"agents": [], "total_count": 0, "synthetic": True})


# ---------------------------------------------------------------------------
# /api/trust/*  (governance — no real data; honest empties)
# ---------------------------------------------------------------------------


@synthetic_api.route("/api/trust/score", methods=["GET"])
def trust_score():
    return jsonify(
        {
            "overall": 0,
            "dimensions": {
                "fairness": 0,
                "safety": 0,
                "robustness": 0,
                "privacy": 0,
                "transparency": 0,
            },
            "synthetic": True,
        }
    )


@synthetic_api.route("/api/trust/evidence-pack", methods=["POST"])
def trust_evidence_pack():
    return jsonify({"id": "synthetic-0", "items": [], "synthetic": True})


# ---------------------------------------------------------------------------
# /api/guardrails  /  /api/policies
# ---------------------------------------------------------------------------


@synthetic_api.route("/api/guardrails", methods=["GET"])
def guardrails_list():
    return jsonify({"guardrails": [], "total_count": 0, "synthetic": True})


@synthetic_api.route("/api/policies", methods=["GET"])
def policies_list():
    return jsonify({"policies": [], "total_count": 0, "synthetic": True})


# ---------------------------------------------------------------------------
# /api/history/*  (PII / bias / toxicity history — no real data)
# ---------------------------------------------------------------------------


def _empty_history() -> Any:
    return jsonify({"items": [], "total_count": 0, "synthetic": True})


@synthetic_api.route("/api/history/pii-leakage", methods=["GET"])
def history_pii():
    return _empty_history()


@synthetic_api.route("/api/history/bias-detection", methods=["GET"])
def history_bias():
    return _empty_history()


@synthetic_api.route("/api/history/toxicity-detection", methods=["GET"])
def history_toxicity():
    return _empty_history()


# ---------------------------------------------------------------------------
# /api/chat/prompts/<id>  (single-prompt fetch the existing /api/chat/prompts
# list endpoint doesn't cover)
# ---------------------------------------------------------------------------


@synthetic_api.route("/api/chat/prompts/<prompt_id>", methods=["GET"])
def chat_prompt_by_id(prompt_id: str):
    return jsonify({"id": prompt_id, "title": prompt_id, "prompt": "", "synthetic": True})
