# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT

"""Arize AX plugin — production tracing for the MAA fork (reconciled with Phoenix/Langfuse)."""

import os

from neuro_san_studio.interfaces.base_plugin import BasePlugin
from neuro_san_studio.plugins.arize.tracing import init_arize_tracing


class ArizePlugin(BasePlugin):
    """Send LangChain / AAOSA traces to Arize AX when ARIZE_* credentials are set."""

    def __init__(self, args: dict = None):
        super().__init__(plugin_name="Arize", args=args)
        self._active = False

    @staticmethod
    def _credentials_present() -> bool:
        return bool(os.getenv("ARIZE_SPACE_ID") and os.getenv("ARIZE_API_KEY"))

    def do_initialize(self) -> None:
        if not self._credentials_present():
            self._logger.info("ARIZE_SPACE_ID / ARIZE_API_KEY not set — skipping (no-op)")
            return
        self._active = init_arize_tracing(self._logger)

    @property
    def is_active(self) -> bool:
        return self._active
