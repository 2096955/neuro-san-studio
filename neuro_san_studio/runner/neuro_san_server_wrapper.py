# Copyright © 2025-2026 Cognizant Technology Solutions Corp, www.cognizant.com.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# END COPYRIGHT
"""
Wrapper module that initializes plugins before starting the server.

Plugins run (and may instrument LangChain) before neuro-san is imported, so
OpenInference / Langfuse hooks apply to the full AAOSA graph.
"""

import logging
import os
import signal
import sys

from neuro_san_studio.plugins.plugin_loader import PluginLoader


class NeuroSanServerWrapper:  # pylint: disable=too-few-public-methods
    """Wrapper that initializes plugins before starting the Neuro SAN server."""

    def __init__(self):
        """Load plugins from config/plugins.hocon or the bundled template."""
        self._logger = logging.getLogger(self.__class__.__name__)
        self.root_dir = os.getcwd()

        plugins_file = PluginLoader.resolve_plugins_file(self.root_dir)
        self.plugin_classes = PluginLoader.load_plugin_classes(plugins_file)

        self.args = {}
        self.plugins = [cls(self.args) for cls in self.plugin_classes]
        for plugin in self.plugins:
            self._logger.info("Loaded plugin: %s", plugin)

    def run(self):
        """Initialize observability plugins, then run the server main loop."""
        for plugin in self.plugins:
            self._logger.info("Initializing plugin: %s", plugin)
            plugin.initialize()

        # Import only after plugins may have instrumented LangChain / OTEL.
        from neuro_san.service.main_loop.server_main_loop import ServerMainLoop

        signal.signal(signal.SIGTERM, lambda _signum, _frame: sys.exit(0))

        try:
            ServerMainLoop().main_loop()
        finally:
            for plugin in self.plugins:
                self._logger.info("Cleaning up plugin: %s", plugin)
                plugin.cleanup()


if __name__ == "__main__":
    wrapper = NeuroSanServerWrapper()
    wrapper.run()
