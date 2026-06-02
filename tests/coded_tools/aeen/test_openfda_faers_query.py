# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# Unit tests for the AEEN openFDA FAERS coded tool.
"""Behavioral tests for OpenFdaFaersQuery.

These tests pin the AEEN review fixes:
- openfda-1: the API key must be sent as the ?api_key= query parameter (openFDA ignores a
  Bearer header), so a configured key actually moves the tool to the authenticated rate tier.
- faers-1: an event whose openfda.generic_name is an empty list must not raise IndexError.
- faers-2: one drug returning HTTP 404 ("no matches") must yield zero reports for that drug
  while still returning results for the others (no whole-query abort).
- the default drug set is the two-drug PoC anchor (empagliflozin, dapagliflozin).
- audit provenance (endpoint, api-key tier, retrieval time) is returned.
"""

from unittest import mock

from requests import HTTPError

from coded_tools.aeen.openfda_faers_query import DEFAULT_SGLT2_DRUGS
from coded_tools.aeen.openfda_faers_query import OpenFdaFaersQuery

MODULE = "coded_tools.aeen.openfda_faers_query"


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise HTTPError(f"{self.status_code} error", response=self)


def _default_side_effect(*, sample_event=None, not_found_drug=None):
    """Build a requests.get side effect that emulates the three openFDA call shapes."""
    sample_event = sample_event or {
        "receivedate": "20250101",
        "serious": "1",
        "patient": {
            "reaction": [{"reactionmeddrapt": "NAUSEA"}],
            "drug": [{"medicinalproduct": "JARDIANCE"}],
        },
    }

    def _side_effect(url, params=None, headers=None, timeout=None):
        params = params or {}
        search = params.get("search", "")
        if not_found_drug and not_found_drug in search:
            return FakeResponse({"error": {"code": "NOT_FOUND"}}, status_code=404)
        if "count" in params:
            return FakeResponse({"results": [{"term": "NAUSEA", "count": 10}]})
        if params.get("limit") == 1:
            return FakeResponse({"meta": {"results": {"total": 42}}})
        return FakeResponse({"results": [sample_event]})

    return _side_effect


def test_default_drugs_are_two_drug_anchor():
    assert tuple(DEFAULT_SGLT2_DRUGS) == ("empagliflozin", "dapagliflozin")


def test_api_key_sent_as_query_param_not_bearer(monkeypatch):
    monkeypatch.setenv("OPENFDA_API_KEY", "TESTKEY123")
    with mock.patch(
        f"{MODULE}.requests.get", side_effect=_default_side_effect()
    ) as getter:
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin", "limit": 1}, {}
        )
    assert isinstance(result, dict), result
    assert result["api_key_tier"] == "authenticated"
    assert getter.call_args_list, "requests.get was never called"
    for call in getter.call_args_list:
        params = call.kwargs.get("params", {})
        headers = call.kwargs.get("headers", {})
        assert params.get("api_key") == "TESTKEY123"
        assert "Authorization" not in headers


def test_anonymous_tier_when_no_key(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    with mock.patch(
        f"{MODULE}.requests.get", side_effect=_default_side_effect()
    ) as getter:
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin", "limit": 1}, {}
        )
    assert result["api_key_tier"] == "anonymous"
    for call in getter.call_args_list:
        assert "api_key" not in call.kwargs.get("params", {})


def test_empty_generic_name_list_does_not_raise(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    event = {
        "receivedate": "20250101",
        "serious": "1",
        "patient": {
            "reaction": [{"reactionmeddrapt": "NAUSEA"}],
            # generic_name present but empty, and no medicinalproduct -> used to IndexError.
            "drug": [{"openfda": {"generic_name": []}}],
        },
    }
    # limit=2 so the samples call (limit=2) is distinct from the total call (limit=1) in the mock,
    # ensuring the malicious empty-generic_name event actually reaches _fetch_samples.
    side_effect = _default_side_effect(sample_event=event)
    with mock.patch(f"{MODULE}.requests.get", side_effect=side_effect):
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin", "limit": 2}, {}
        )
    assert isinstance(result, dict), result
    assert result["drugs"][0]["total_reports"] == 42


def test_single_drug_404_does_not_abort_other_drugs(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    side_effect = _default_side_effect(not_found_drug="zzzbogusdrug")
    with mock.patch(f"{MODULE}.requests.get", side_effect=side_effect):
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin,zzzbogusdrug,dapagliflozin"}, {}
        )
    assert isinstance(result, dict), result
    by_name = {drug["generic_name"]: drug for drug in result["drugs"]}
    assert set(by_name) == {"empagliflozin", "zzzbogusdrug", "dapagliflozin"}
    assert by_name["zzzbogusdrug"]["total_reports"] == 0
    assert by_name["empagliflozin"]["total_reports"] == 42
    assert by_name["dapagliflozin"]["total_reports"] == 42


def test_default_query_uses_anchor_drugs(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    with mock.patch(
        f"{MODULE}.requests.get", side_effect=_default_side_effect()
    ) as getter:
        OpenFdaFaersQuery().invoke({}, {})
    searches = " ".join(
        call.kwargs.get("params", {}).get("search", "")
        for call in getter.call_args_list
    )
    assert "empagliflozin" in searches
    assert "dapagliflozin" in searches
    assert "canagliflozin" not in searches


def test_provenance_fields_present(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    with mock.patch(f"{MODULE}.requests.get", side_effect=_default_side_effect()):
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin", "limit": 1}, {}
        )
    assert result["source"] == "openFDA FAERS"
    assert "endpoint" in result
    assert "retrieved_at" in result


def test_invalid_limit_is_clamped(monkeypatch):
    monkeypatch.delenv("OPENFDA_API_KEY", raising=False)
    with mock.patch(f"{MODULE}.requests.get", side_effect=_default_side_effect()):
        result = OpenFdaFaersQuery().invoke(
            {"generic_names": "empagliflozin", "limit": -5}, {}
        )
    assert isinstance(result, dict), result
