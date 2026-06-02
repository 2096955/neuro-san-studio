#!/usr/bin/env python3
# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT
"""Launch the neuro-san server with OPTIONAL Arize AX tracing.

This is a thin wrapper around ``neuro_san.service.main_loop.server_main_loop``. Arize's OpenInference
LangChain instrumentor must be installed BEFORE neuro_san (and therefore langchain) is imported, so we
initialize tracing here and only then hand off to the real server entrypoint (run as ``__main__`` with
the original argv forwarded).

Tracing is a NO-OP unless both ARIZE_SPACE_ID and ARIZE_API_KEY are set, and any failure in the tracing
setup is swallowed — observability must never prevent the server from starting. Used by both launch paths:
  - local: run.py -> ``python -u deploy/otel_bootstrap.py --port .. --http_port ..``
  - cloud: deploy/entrypoint.sh -> ``python "$APP_SOURCE/deploy/otel_bootstrap.py" "$@"``

Env vars:
  ARIZE_SPACE_ID, ARIZE_API_KEY   required to enable tracing
  ARIZE_PROJECT_NAME              optional, defaults to "neuro-san-maa"
"""

import importlib.util
import logging
import os
import runpy

_LOG = logging.getLogger("otel_bootstrap")


def _init_arize_tracing() -> bool:
    """Register the Arize tracer provider and instrument LangChain. Returns True if tracing is on."""
    space_id = os.getenv("ARIZE_SPACE_ID")
    api_key = os.getenv("ARIZE_API_KEY")
    if not (space_id and api_key):
        return False  # not configured -> silent no-op
    project_name = os.getenv("ARIZE_PROJECT_NAME", "neuro-san-maa")
    try:
        from arize.otel import register
        from openinference.instrumentation.langchain import LangChainInstrumentor

        tracer_provider = register(
            space_id=space_id, api_key=api_key, project_name=project_name
        )
        # neuro-san drives every LLM/tool/agent call through langchain-core's callback layer, so this
        # one instrumentor captures the whole AAOSA graph (incl. Gemini via langchain-google-genai).
        LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
        _LOG.info("Arize tracing ON (project=%s)", project_name)
        return True
    except Exception as err:  # pylint: disable=broad-except
        # Tracing is best-effort; never block the server on an observability failure.
        _LOG.warning(
            "Arize tracing init failed (%s) -> continuing without tracing", err
        )
        return False


def main() -> None:
    _init_arize_tracing()
    spec = importlib.util.find_spec("neuro_san.service.main_loop.server_main_loop")
    if spec is None or not spec.origin:
        raise SystemExit(
            "otel_bootstrap: cannot locate neuro_san.service.main_loop.server_main_loop"
        )
    # Run the real server entrypoint as __main__; sys.argv[1:] (--port/--http_port/...) is forwarded.
    runpy.run_path(spec.origin, run_name="__main__")


if __name__ == "__main__":
    main()
