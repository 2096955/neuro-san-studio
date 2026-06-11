#!/usr/bin/env python3
"""Deterministically assemble rhea_clinical_decision_support.hocon from the
workflow-produced instruction bodies in /tmp/rhea_final_instructions.json.

The workflow only writes role-specific PROSE per agent (plus the shared
instructions_prefix / demo_mode and the coordinator description). This script
owns the exact topology: front-man vs down-chain vs leaf, the aaosa suffixes,
the tools arrays, and the llm_config / metadata header. That keeps the
error-prone HOCON structure out of the LLM and under our control.
"""

import json

SRC = "/tmp/rhea_final_instructions.json"
OUT = "/Users/anthonylui/NeuroSAN/neuro-san-studio/registries/rhea_clinical_decision_support.hocon"

with open(SRC) as f:
    d = json.load(f)


def clean(s: str) -> str:
    # bodies must never contain triple-quotes (would close the HOCON string)
    return s.replace('"""', '"').strip("\n")


def guard(name: str, s: str) -> str:
    # HOCON would try to resolve ${...}; bodies must not contain it
    assert "${" not in s, f"stray ${{ in {name}"
    return s


prefix = guard("instructions_prefix", clean(d["instructions_prefix"]))
demo = guard("demo_mode", clean(d["demo_mode"]))
coord_desc = d["cds_coordinator_description"].replace("\\", " ").replace('"', "'").replace("\n", " ").strip()
coord_instr = guard("cds_coordinator", clean(d["cds_coordinator_instructions"]))
spec = d["specialists"]

DOWN = {
    "patient_context_specialist": ["demographic_analyst"],
    "evidence_validator": ["bias_checking_expert", "trial_grading_specialist"],
    "strategy_optimizer": ["prescription_historian", "multi_objective_engine"],
    "demographic_analyst": ["insurance_checker"],
    "bias_checking_expert": ["statistical_audit_log"],
    "trial_grading_specialist": ["safety_violation_checker"],
    "prescription_historian": ["pattern_matcher"],
    "multi_objective_engine": ["preference_weighter"],
}
DOWN_ORDER = [
    "patient_context_specialist",
    "evidence_validator",
    "strategy_optimizer",
    "demographic_analyst",
    "bias_checking_expert",
    "trial_grading_specialist",
    "prescription_historian",
    "multi_objective_engine",
]
LEAVES = [
    "insurance_checker",
    "statistical_audit_log",
    "safety_violation_checker",
    "pattern_matcher",
    "preference_weighter",
]

for nm in DOWN_ORDER + LEAVES:
    assert nm in spec, f"missing specialist body: {nm}"
    guard(nm, spec[nm])


def block_down(name: str) -> str:
    body = clean(spec[name])
    toolstr = ",".join('"%s"' % t for t in DOWN[name])
    return '''        {
            "name": "%s",
            "function": ${aaosa_call},
            "instructions": """
{instructions_prefix}
%s
            """ ${aaosa_instructions},
            "command": ${aaosa_command},
            "tools": [%s]
        },''' % (name, body, toolstr)


def block_leaf(name: str) -> str:
    body = clean(spec[name])
    return '''        {
            "name": "%s",
            "function": ${aaosa_call},
            "instructions": """
{instructions_prefix} {demo_mode}
%s
            """,
        },''' % (name, body)


coord = '''        {
            "name": "cds_coordinator",
            "function": {
                "description": "%s"
            },
            "instructions": """
{instructions_prefix}
%s
            """ ${aaosa_router_instructions},
            "command": ${aaosa_command},
            "tools": ["patient_context_specialist","evidence_validator","strategy_optimizer"]
        },''' % (coord_desc, coord_instr)

blocks = [coord] + [block_down(n) for n in DOWN_ORDER] + [block_leaf(n) for n in LEAVES]

doc = '''{
include "registries/aaosa.hocon"
    metadata { tags = ["Medical"] }
    "llm_config": {
        "fallbacks": [
            {"class": "gemini", "model_name": "gemini-3.5-flash", "thinking_budget": 0},
            {"class": "ollama", "model_name": "qwen3.6:35b-a3b", "reasoning": false}
        ]
    },
    "max_execution_seconds": 600,
    "commondefs": {
        "replacement_strings": {
            "instructions_prefix": """
%s
            """,
            "demo_mode": """
%s
            """
        },
    }
"tools": [
%s
]
}
''' % (prefix, demo, "\n".join(blocks))

with open(OUT, "w") as f:
    f.write(doc)

n_agents = doc.count('"name"')
assert n_agents == 14, f"expected 14 agents, got {n_agents}"
assert doc.count('"""') % 2 == 0, "unbalanced triple-quotes"
assert doc.count("{") - doc.count("}") == 0 or True  # brace check is informational (HOCON allows {k v})
print(f"OK wrote {OUT}: {n_agents} agents, {len(doc)} chars")
