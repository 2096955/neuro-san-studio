# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# Unit tests for the AEEN CMS Medicare Part D coded tool.
"""Behavioral tests for CmsPartDQuery.

These tests pin the AEEN review fixes:
- import-1: the module must import under the runtime package path (coded_tools.aeen.*).
- cms-1: specialty filtering must match the real CMS Prscrbr_Type controlled vocabulary
  ("Cardiovascular Disease (Cardiology)", "Interventional Cardiology", ...) instead of
  exact-matching the bare default labels.
- states must be matched case-insensitively.
- a missing claims column must be surfaced, never silently treated as 1 claim/row.
- an over-restrictive filter that excludes everything must warn and surface what was seen.
- group_by / max_rows / drug_pattern inputs must be validated, not crash or silently misbehave.
- audit provenance (rows scanned, distinct/excluded specialties, retrieval time) must be returned.
"""

import csv
from pathlib import Path

import pytest

# import-1 regression: importing via the full runtime package path must succeed.
from coded_tools.aeen.cms_part_d_query import CmsPartDQuery

# Real CMS "Medicare Part D Prescribers - by Provider and Drug" style headers (TitleCase).
CMS_HEADERS = [
    "Prscrbr_NPI",
    "Prscrbr_Last_Org_Name",
    "Prscrbr_Type",
    "Prscrbr_State_Abrvtn",
    "Gnrc_Name",
    "Brnd_Name",
    "Tot_Clms",
]

CMS_ROWS = [
    # NPI, name, specialty (real CMS labels), state, generic, brand, claims
    [
        "1",
        "A",
        "Cardiovascular Disease (Cardiology)",
        "TX",
        "Empagliflozin",
        "Jardiance",
        "120",
    ],
    ["2", "B", "Interventional Cardiology", "CA", "Dapagliflozin", "Farxiga", "30"],
    ["3", "C", "Cardiology", "FL", "Empagliflozin", "Jardiance", "80"],
    ["4", "D", "Internal Medicine", "NY", "Dapagliflozin", "Farxiga", "1,234"],
    ["5", "E", "Family Medicine", "TX", "Empagliflozin", "Jardiance", "50"],
    [
        "6",
        "F",
        "Endocrinology",
        "TX",
        "Empagliflozin",
        "Jardiance",
        "999",
    ],  # off-target specialty
    ["7", "G", "Cardiology", "TX", "Metformin", "Glucophage", "500"],  # off-target drug
]


def _write_cms_csv(directory: Path, headers=CMS_HEADERS, rows=CMS_ROWS) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / "partd_provider_drug.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)
    return path


@pytest.fixture()
def cms_root(tmp_path, monkeypatch):
    """Point the tool's data root at a temp dir containing a synthetic CMS CSV."""
    _write_cms_csv(tmp_path / "cms_part_d")
    monkeypatch.setenv("AEEN_DATA_ROOT", str(tmp_path))
    return tmp_path


def test_specialty_filter_includes_cms_controlled_vocabulary(cms_root):
    """cms-1: default 'Cardiology' must include CMS subspecialty labels, not drop them."""
    result = CmsPartDQuery().invoke({"group_by": "specialty"}, {})
    assert isinstance(result, dict), result
    # 120 (Cardiovascular Disease (Cardiology)) + 30 (Interventional Cardiology) + 80 (Cardiology)
    # + 1234 (Internal Medicine) + 50 (Family Medicine). Endocrinology(999)/Metformin(500) excluded.
    assert result["summary"]["total_claims"] == 1514
    groups = {row["group"] for row in result["summary"]["breakdown"]}
    assert "Cardiovascular Disease (Cardiology)" in groups
    assert "Interventional Cardiology" in groups
    assert "Endocrinology" not in groups


def test_states_filter_is_case_insensitive(cms_root):
    """Lower-case state inputs must still match upper-case CMS state codes."""
    result = CmsPartDQuery().invoke({"states": "tx", "group_by": "state"}, {})
    assert isinstance(result, dict), result
    # TX in-scope drug+specialty rows: 120 (CVD cardiology) + 50 (family medicine) = 170.
    assert result["summary"]["total_claims"] == 170
    assert [row["group"] for row in result["summary"]["breakdown"]] == ["TX"]


def test_missing_claims_column_is_flagged_not_silently_one(tmp_path, monkeypatch):
    """A CMS extract with no Tot_Clms column must not silently count 1 claim per row."""
    headers = [h for h in CMS_HEADERS if h != "Tot_Clms"]
    rows = [r[:-1] for r in CMS_ROWS]
    _write_cms_csv(tmp_path / "cms_part_d", headers=headers, rows=rows)
    monkeypatch.setenv("AEEN_DATA_ROOT", str(tmp_path))

    result = CmsPartDQuery().invoke({}, {})
    assert isinstance(result, dict), result
    assert result["summary"]["claims_column_found"] is False
    assert result["summary"]["total_claims"] is None
    assert any("claim" in w.lower() for w in result["warnings"])


def test_overrestrictive_specialty_filter_warns_and_surfaces_seen(cms_root):
    """A specialty that matches nothing must warn and list the specialties actually seen."""
    result = CmsPartDQuery().invoke({"specialties": "Pediatric Neurosurgery"}, {})
    assert isinstance(result, dict), result
    assert result["summary"]["matched_rows_returned"] == 0
    assert any(
        "exclud" in w.lower() or "no rows" in w.lower() for w in result["warnings"]
    )
    # The cardiology/IM specialties present in the drug-matching rows should be surfaced.
    assert "Internal Medicine" in result["provenance"]["distinct_specialties_seen"]


def test_invalid_group_by_returns_error(cms_root):
    result = CmsPartDQuery().invoke({"group_by": "zipcode"}, {})
    assert isinstance(result, str)
    assert "group_by" in result.lower()


def test_invalid_drug_pattern_returns_error(cms_root):
    result = CmsPartDQuery().invoke({"drug_pattern": "["}, {})
    assert isinstance(result, str)
    assert "Error" in result


def test_max_rows_caps_samples_but_not_totals(cms_root):
    result = CmsPartDQuery().invoke({"max_rows": 1}, {})
    assert isinstance(result, dict), result
    assert result["summary"]["matched_rows_returned"] == 1
    # Totals still reflect every matching row, not just the capped sample.
    assert result["summary"]["total_claims"] == 1514


def test_provenance_block_present(cms_root):
    result = CmsPartDQuery().invoke({}, {})
    assert isinstance(result, dict), result
    prov = result["provenance"]
    assert prov["rows_scanned"] == len(CMS_ROWS)
    assert "retrieved_at" in prov
    assert "distinct_specialties_seen" in prov
    assert "Endocrinology" in prov["excluded_specialties"]


def test_missing_data_returns_helpful_error(tmp_path, monkeypatch):
    """No CSV present -> graceful Error string with the download path (not a crash)."""
    (tmp_path / "cms_part_d").mkdir(parents=True)
    monkeypatch.setenv("AEEN_DATA_ROOT", str(tmp_path))
    result = CmsPartDQuery().invoke({}, {})
    assert isinstance(result, str)
    assert "No CMS Part D CSV" in result
