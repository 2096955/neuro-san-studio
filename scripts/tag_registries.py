#!/usr/bin/env python3
"""Idempotently inject metadata.tags=["<Category>"] into enabled registries.

Structure-aware: insert after the root '{' for brace-wrapped files, append for implicit-root.
"""

import sys
from pathlib import Path

REG = Path(__file__).resolve().parent.parent / "registries"
MARKER = "# >>> category-tag (managed by tag_registries.py) <<<"
CATEGORY_MAP = {
    "Basic": [
        "hello_world",
        "coffee_finder",
        "smart_home",
        "six_thinking_hats",
        "music_nerd",
        "music_nerd_local",
        "music_nerd_pro",
        "music_nerd_pro_local",
        "music_nerd_pro_sly",
        "music_nerd_pro_sly_local",
        "music_nerd_llm_fallbacks",
    ],
    "Industry": [
        "banking_ops",
        "insurance_underwriting_agents",
        "cpg_agents",
        "retail_ops_and_customer_service",
        "telco_network_support",
        "carmax",
        "macys",
        "consumer_decision_assistant",
        "LinkedInJobSeekerSupportNetwork",
        "therapy_vignette_supervisors",
        "now_agents",
        "intranet_agents_with_tools",
    ],
    "Tools": [
        "agent_network_designer",
        "agent_network_html_creator",
        "pdf_rag",
        "ddgs_search",
    ],
    "Experimental": [
        "airbnb",
        "booking",
        "expedia",
        "airline_policy",
    ],
}
stem_to_cat = {s: c for c, stems in CATEGORY_MAP.items() for s in stems}


def first_significant_index(text):
    """Index of first non-comment, non-blank char."""
    i = 0
    for line in text.splitlines(keepends=True):
        if line.strip() and not line.lstrip().startswith("#"):
            return i + (len(line) - len(line.lstrip()))
        i += len(line)
    return len(text)


def inject(path, cat):
    text = path.read_text()
    if MARKER in text:
        return "skip(already-tagged)"
    block = f'{MARKER}\nmetadata {{ tags = ["{cat}"] }}\n'
    idx = first_significant_index(text)
    if text[idx : idx + 1] == "{":
        new = (
            text[: idx + 1]
            + "\n    "
            + block.replace("\n", "\n    ").rstrip()
            + "\n"
            + text[idx + 1 :]
        )
    else:
        new = text.rstrip() + "\n\n" + block
    path.write_text(new)
    return "tagged"


def main():
    for stem, cat in stem_to_cat.items():
        p = REG / f"{stem}.hocon"
        if not p.exists():
            print(f"  MISSING {stem}.hocon")
            continue
        print(f"  {inject(p, cat):24s} {stem} -> {cat}")


if __name__ == "__main__":
    sys.exit(main())
