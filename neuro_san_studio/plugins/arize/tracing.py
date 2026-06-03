# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT

"""Shared Arize AX tracing bootstrap used by the plugin and deploy/otel_bootstrap.py."""

import logging
import os
from typing import Optional

_ARIZE_INITIALIZED = False


def init_arize_tracing(logger: Optional[logging.Logger] = None) -> bool:
    """Register the Arize tracer provider and instrument LangChain.

    Idempotent: safe to call from both ``deploy/otel_bootstrap.py`` and ``ArizePlugin``.
    Returns True when tracing is active.
    """
    global _ARIZE_INITIALIZED  # pylint: disable=global-statement
    log = logger or logging.getLogger("arize_tracing")

    if _ARIZE_INITIALIZED:
        return True

    space_id = os.getenv("ARIZE_SPACE_ID")
    api_key = os.getenv("ARIZE_API_KEY")
    if not (space_id and api_key):
        return False

    project_name = os.getenv("ARIZE_PROJECT_NAME", "neuro-san-maa")
    try:
        from arize.otel import register
        from openinference.instrumentation.langchain import LangChainInstrumentor

        tracer_provider = register(space_id=space_id, api_key=api_key, project_name=project_name)
        LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
        _ARIZE_INITIALIZED = True
        log.info("Arize tracing ON (project=%s)", project_name)
        return True
    except Exception as err:  # pylint: disable=broad-except
        log.warning("Arize tracing init failed (%s) -> continuing without tracing", err)
        return False
