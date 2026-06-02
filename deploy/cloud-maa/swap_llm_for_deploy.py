#!/usr/bin/env python3
"""Swap registry llm_config from local Ollama (qwen3.6) to cloud Gemini for Cloud Run deploys.

Cloud Run cannot run the local 23GB Ollama model, so the deployed backend uses Gemini
(neuro-san class "gemini" -> ChatGoogleGenerativeAI, authenticated by GOOGLE_API_KEY).

Run this ONLY on a throwaway build-context copy of the registries, never on the repo's
local-native registries:

    python3 deploy/cloud-maa/swap_llm_for_deploy.py <path-to-registries-dir>

Validation gate (must print nothing):
    grep -rnE '"ollama"|qwen3\\.6' <registries>/*.hocon
"""

import os
import re
import sys
import pathlib

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


def swap(registries_dir: str) -> int:
    d = pathlib.Path(registries_dir)
    n = 0
    for f in d.glob("*.hocon"):
        t = original = f.read_text()
        # provider class ollama -> gemini (quoted JSON + HOCON `=` styles)
        t = re.sub(r'("class"\s*[:=]\s*)"ollama"', r'\1"gemini"', t)
        t = re.sub(r'(\bclass\s*=\s*)"ollama"', r'\1"gemini"', t)
        # any qwen3.6 model -> gemini
        t = re.sub(r'"qwen3\.6:[^"]+"', f'"{GEMINI_MODEL}"', t)
        # Map the Ollama-only `reasoning: false` to Gemini's `thinking_budget: 0` — disabling
        # "thinking" in the same authoritative spot (the registry llm_config the gemini policy reads
        # directly). Measured ~4.1s/call (thinking on) -> ~1.1s/call (budget 0); across a deep
        # multi-agent network this is the difference between ~50s and ~15s per query.
        t = re.sub(r'"reasoning"\s*:\s*(?:true|false)', '"thinking_budget": 0', t)
        t = re.sub(r"\breasoning\s*=\s*(?:true|false)", "thinking_budget = 0", t)
        # NOTE: the cloud web-search provider swap (ddgs -> tavily, because DuckDuckGo blocks
        # datacenter egress) is intentionally NOT done here. web_search.hocon selects its backing
        # toolbox at load time from $WEB_SEARCH_TOOLBOX (default ddgs_search), so the deploy just
        # sets that env var on Cloud Run — no registry rewrite, and callers only reference /web_search.
        if t != original:
            f.write_text(t)
            n += 1
    print(f"rewrote {n} registry files to {GEMINI_MODEL}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(swap(sys.argv[1]))
