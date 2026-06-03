# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# END COPYRIGHT

import os
from unittest.mock import MagicMock
from unittest.mock import patch

from neuro_san_studio.plugins.arize.tracing import init_arize_tracing


class TestInitArizeTracing:
    def setup_method(self):
        import neuro_san_studio.plugins.arize.tracing as tracing_mod

        tracing_mod._ARIZE_INITIALIZED = False

    def test_no_op_without_credentials(self):
        with patch.dict(os.environ, {}, clear=True):
            assert init_arize_tracing() is False

    def test_registers_when_credentials_present(self):
        env = {
            "ARIZE_SPACE_ID": "space",
            "ARIZE_API_KEY": "key",
            "ARIZE_PROJECT_NAME": "test-project",
        }
        mock_register = MagicMock(return_value="provider")
        mock_instrumentor_cls = MagicMock()
        mock_instrumentor = MagicMock()
        mock_instrumentor_cls.return_value = mock_instrumentor

        with patch.dict(os.environ, env, clear=True):
            with patch("arize.otel.register", mock_register):
                with patch(
                    "openinference.instrumentation.langchain.LangChainInstrumentor",
                    mock_instrumentor_cls,
                ):
                    assert init_arize_tracing() is True
                    mock_register.assert_called_once_with(
                        space_id="space",
                        api_key="key",
                        project_name="test-project",
                    )
                    mock_instrumentor.instrument.assert_called_once_with(tracer_provider="provider")

    def test_idempotent_second_call(self):
        import neuro_san_studio.plugins.arize.tracing as tracing_mod

        tracing_mod._ARIZE_INITIALIZED = True
        assert init_arize_tracing() is True
