# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.

import asyncio
import csv
import logging
import re
from collections import defaultdict
from datetime import datetime
from datetime import timezone
from pathlib import Path
from typing import Any
from typing import Dict
from typing import Iterable
from typing import List
from typing import Optional
from typing import Set
from typing import Union

from neuro_san.interfaces.coded_tool import CodedTool

from coded_tools.aeen.data_paths import aeen_data_root

DEFAULT_STATES = ("TX", "CA", "FL", "NY", "PA", "OH", "IL", "MI", "GA", "NC")
DEFAULT_SPECIALTIES = ("Cardiology", "Internal Medicine", "Family Practice")
DEFAULT_DRUG_PATTERN = r"empagliflozin|dapagliflozin"
PROCESSED_FILENAME = "sglt2i_prescribing_gap.csv"
VALID_GROUP_BY = ("state", "specialty", "drug")
MAX_SAMPLE_ROWS = 10000

# Maps a user-facing specialty concept to the exact CMS Prscrbr_Type controlled-vocabulary
# values that belong to it. Auditable by design: only these labels are matched (case-insensitive),
# rather than fuzzy substring matching that could pull in unintended specialties. The CMS
# "Medicare Part D Prescribers - by Provider and Drug" file uses expanded provider-type labels
# (e.g. "Cardiovascular Disease (Cardiology)"), so the bare concept "Cardiology" must fan out.
SPECIALTY_VOCAB = {
    "cardiology": [
        "Cardiology",
        "Cardiovascular Disease (Cardiology)",
        "Interventional Cardiology",
        "Cardiac Electrophysiology",
        "Advanced Heart Failure and Transplant Cardiology",
    ],
    "internal medicine": ["Internal Medicine"],
    "family practice": ["Family Practice", "Family Medicine"],
    "family medicine": ["Family Practice", "Family Medicine"],
}


class CmsPartDQuery(CodedTool):
    """Query CMS Medicare Part D prescriber data for SGLT2i prescribing patterns.

    Reports SGLT2 inhibitor prescribing *volume* (claims / prescriber counts) filtered to a
    provider specialty and state. This is a prescribing-volume signal, NOT a measure of post-MI
    underuse - it has no MI-linked denominator.
    """

    def invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[Dict[str, Any], str]:
        states = {
            state.upper()
            for state in self._parse_list(args.get("states"), DEFAULT_STATES)
        }
        requested_specialties = self._parse_list(
            args.get("specialties"), DEFAULT_SPECIALTIES
        )
        allowed_specialties = self._expand_specialties(requested_specialties)

        group_by = (str(args.get("group_by") or "state")).strip().lower()
        if group_by not in VALID_GROUP_BY:
            return f"Error: invalid group_by '{group_by}'. Choose one of: {', '.join(VALID_GROUP_BY)}."

        try:
            drug_pattern = re.compile(
                args.get("drug_pattern") or DEFAULT_DRUG_PATTERN, re.IGNORECASE
            )
        except re.error as err:
            return f"Error: invalid drug_pattern regular expression: {err}."

        max_rows = self._clamp_int(
            args.get("max_rows", 500), low=0, high=MAX_SAMPLE_ROWS, default=500
        )

        data_file = self._resolve_data_file()
        if data_file is None:
            root = aeen_data_root()
            return (
                "Error: No CMS Part D CSV found. Download 'Medicare Part D Prescribers - by Provider "
                "and Drug' from https://data.cms.gov/provider-summary-by-type-of-service/"
                "medicare-part-d-prescribers into "
                f"{root / 'cms_part_d'}/ or place a pre-filtered file at "
                f"{root / 'processed' / PROCESSED_FILENAME}."
            )

        logger = logging.getLogger(self.__class__.__name__)
        logger.info("CmsPartDQuery file=%s group_by=%s", data_file, group_by)

        try:
            scan = self._scan_file(
                data_file,
                drug_pattern=drug_pattern,
                states=states,
                allowed_specialties=allowed_specialties,
                max_rows=max_rows,
                group_by=group_by,
            )
        except ValueError as err:
            return f"Error: {err}"

        warnings: List[str] = []
        if not scan["claims_present"]:
            warnings.append(
                "No claims column (e.g. Tot_Clms) found in the CSV; claim totals are unavailable - "
                "results reflect matched rows and prescriber counts only."
            )
        if scan["matched_rows_total"] == 0:
            warnings.append(
                "The specialty/state/drug filter excluded all rows. "
                "See provenance.distinct_specialties_seen to adjust the filter."
            )

        return {
            "source": "CMS Medicare Part D Prescriber (by Provider and Drug)",
            "metric": "SGLT2i prescribing volume (proxy signal; no MI-linked denominator)",
            "data_file": str(data_file),
            "filters": {
                "states": sorted(states),
                "specialties": list(requested_specialties),
                "drug_pattern": drug_pattern.pattern,
                "group_by": group_by,
            },
            "summary": {
                "matched_rows_returned": len(scan["matches"]),
                "matched_rows_total": scan["matched_rows_total"],
                "total_claims": scan["total_claims"]
                if scan["claims_present"]
                else None,
                "claims_column_found": scan["claims_present"],
                "unique_prescribers": scan["unique_prescribers"],
                "breakdown": scan["breakdown"],
            },
            "provenance": {
                "rows_scanned": scan["rows_scanned"],
                "drug_matching_rows": scan["drug_matching_rows"],
                "distinct_specialties_seen": scan["distinct_specialties_seen"],
                "excluded_specialties": scan["excluded_specialties"],
                "data_file": str(data_file),
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
            },
            "warnings": warnings,
            "rows": scan["matches"],
        }

    async def async_invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[Dict[str, Any], str]:
        return await asyncio.to_thread(self.invoke, args, sly_data)

    def _parse_list(self, value: Any, default: Iterable[str]) -> List[str]:
        if not value:
            return list(default)
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return list(value)

    def _expand_specialties(self, requested: Iterable[str]) -> Set[str]:
        """Expand user-facing specialty concepts to the CMS controlled vocabulary (lowercased)."""
        allowed: Set[str] = set()
        for spec in requested:
            key = spec.strip().lower()
            if key in SPECIALTY_VOCAB:
                allowed.update(label.lower() for label in SPECIALTY_VOCAB[key])
            elif key:
                allowed.add(key)
        return allowed

    def _clamp_int(self, value: Any, low: int, high: int, default: int) -> int:
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default
        return max(low, min(high, parsed))

    def _resolve_data_file(self) -> Optional[Path]:
        root = aeen_data_root()
        processed = root / "processed" / PROCESSED_FILENAME
        if processed.is_file():
            return processed

        cms_dir = root / "cms_part_d"
        if not cms_dir.is_dir():
            return None

        csv_files = sorted(
            cms_dir.glob("*.csv"), key=lambda path: path.stat().st_mtime, reverse=True
        )
        return csv_files[0] if csv_files else None

    def _scan_file(
        self,
        data_file: Path,
        drug_pattern: "re.Pattern[str]",
        states: Set[str],
        allowed_specialties: Set[str],
        max_rows: int,
        group_by: str,
    ) -> Dict[str, Any]:
        matches: List[Dict[str, Any]] = []
        grouped_claims: Dict[str, int] = defaultdict(int)
        grouped_rows: Dict[str, int] = defaultdict(int)
        grouped_prescribers: Dict[str, Set[str]] = defaultdict(set)
        total_claims = 0
        total_prescribers: Set[str] = set()
        distinct_specialties: Set[str] = set()
        excluded_specialties: Set[str] = set()
        rows_scanned = 0
        drug_matching_rows = 0
        matched_rows_total = 0

        with data_file.open(newline="", encoding="utf-8", errors="replace") as handle:
            reader = csv.DictReader(handle)
            fieldnames = {name.lower(): name for name in (reader.fieldnames or [])}

            generic_col = self._pick_column(fieldnames, ("gnrc_name", "generic_name"))
            specialty_col = self._pick_column(
                fieldnames, ("prscrbr_type", "provider_type", "specialty")
            )
            state_col = self._pick_column(
                fieldnames, ("prscrbr_state_abrvtn", "state", "prscrbr_state")
            )
            npi_col = self._pick_column(fieldnames, ("prscrbr_npi", "npi"))
            claims_col = self._pick_column(
                fieldnames, ("tot_clms", "total_claims", "claims")
            )
            claims_present = claims_col is not None

            if not generic_col:
                raise ValueError(
                    "CSV missing generic drug column (expected Gnrc_Name)."
                )

            for row in reader:
                rows_scanned += 1
                generic_name = row.get(generic_col, "")
                if not drug_pattern.search(generic_name or ""):
                    continue
                drug_matching_rows += 1

                state = (row.get(state_col, "") if state_col else "").strip().upper()
                specialty = (
                    row.get(specialty_col, "") if specialty_col else ""
                ).strip()
                if specialty:
                    distinct_specialties.add(specialty)

                # State filter: when a state filter is active, a row must carry a matching state.
                if states and state not in states:
                    continue
                # Specialty filter: when active, the row's specialty must be in the allowed vocabulary.
                if allowed_specialties and specialty.lower() not in allowed_specialties:
                    if specialty:
                        excluded_specialties.add(specialty)
                    continue

                matched_rows_total += 1
                claims = self._to_int(row.get(claims_col, "0")) if claims_present else 0
                npi = row.get(npi_col, "") if npi_col else ""
                total_claims += claims
                if npi:
                    total_prescribers.add(npi)

                group_key = self._group_key(
                    row, group_by, generic_col, state, specialty
                )
                grouped_claims[group_key] += claims
                grouped_rows[group_key] += 1
                if npi:
                    grouped_prescribers[group_key].add(npi)

                if len(matches) < max_rows:
                    matches.append(
                        {
                            "npi": npi,
                            "state": state,
                            "specialty": specialty,
                            "generic_name": generic_name,
                            "claims": claims if claims_present else None,
                        }
                    )

        breakdown = [
            {
                "group": key,
                "total_claims": grouped_claims[key] if claims_present else None,
                "matched_rows": grouped_rows[key],
                "unique_prescribers": len(grouped_prescribers[key]),
            }
            for key in sorted(grouped_rows)
        ]

        return {
            "matches": matches,
            "matched_rows_total": matched_rows_total,
            "total_claims": total_claims,
            "claims_present": claims_present,
            "unique_prescribers": len(total_prescribers),
            "breakdown": breakdown,
            "rows_scanned": rows_scanned,
            "drug_matching_rows": drug_matching_rows,
            "distinct_specialties_seen": sorted(distinct_specialties),
            "excluded_specialties": sorted(excluded_specialties),
        }

    def _pick_column(
        self, fieldnames: Dict[str, str], candidates: tuple
    ) -> Optional[str]:
        for candidate in candidates:
            if candidate in fieldnames:
                return fieldnames[candidate]
        return None

    def _to_int(self, value: Any) -> int:
        try:
            return int(float(str(value).replace(",", "").strip() or 0))
        except ValueError:
            return 0

    def _group_key(
        self,
        row: Dict[str, str],
        group_by: str,
        generic_col: str,
        state: str,
        specialty: str,
    ) -> str:
        if group_by == "specialty":
            return specialty or "Unknown specialty"
        if group_by == "drug":
            return row.get(generic_col, "") or "Unknown drug"
        return state or "Unknown state"
