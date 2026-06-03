#!/usr/bin/env python3
# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT
"""Launch the neuro-san server with OPTIONAL Arize AX tracing.

Delegates to ``neuro_san_studio.plugins.arize.tracing.init_arize_tracing`` then runs
``neuro_san.service.main_loop.server_main_loop`` as __main__.

Used by Cloud Run ``deploy/entrypoint.sh`` and legacy ``run.py`` (grpc/Replit path).
For plugin-based observability (Phoenix, Langfuse, LogBridge), use::

    ns run
    python -m neuro_san_studio.runner.neuro_san_server_wrapper ...

See docs/OBSERVABILITY.md.
"""

import importlib.util
import logging
import runpy

from neuro_san_studio.plugins.arize.tracing import init_arize_tracing

_LOG = logging.getLogger("otel_bootstrap")


def main() -> None:
    init_arize_tracing(_LOG)
    spec = importlib.util.find_spec("neuro_san.service.main_loop.server_main_loop")
    if spec is None or not spec.origin:
        raise SystemExit("otel_bootstrap: cannot locate neuro_san.service.main_loop.server_main_loop")
    runpy.run_path(spec.origin, run_name="__main__")


if __name__ == "__main__":
    main()
