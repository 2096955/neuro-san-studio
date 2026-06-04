# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.

import asyncio
import logging
import os
from datetime import datetime
from datetime import timezone
from typing import Any
from typing import Dict
from typing import List
from typing import Union

import requests
from neuro_san.interfaces.coded_tool import CodedTool
from requests import HTTPError
from requests import RequestException

OPENFDA_EVENT_URL = "https://api.fda.gov/drug/event.json"
OPENFDA_TIMEOUT = 30.0
DEFAULT_COUNT_FIELD = "patient.reaction.reactionmeddrapt.exact"
# Two-drug PoC anchor (empagliflozin/dapagliflozin). Callers may pass a broader SGLT2i list
# (e.g. add canagliflozin) explicitly via generic_names.
DEFAULT_SGLT2_DRUGS = ("empagliflozin", "dapagliflozin")
MAX_SAMPLE_LIMIT = 50


class OpenFdaFaersQuery(CodedTool):
    """Query openFDA FAERS for SGLT2 inhibitor adverse-event counts and sample reports.

    Reports unvalidated FAERS adverse-event counts - reporting signals, NOT causal evidence.
    """

    def invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[Dict[str, Any], str]:
        generic_names = args.get("generic_names") or DEFAULT_SGLT2_DRUGS
        if isinstance(generic_names, str):
            generic_names = [
                name.strip() for name in generic_names.split(",") if name.strip()
            ]

        limit = self._clamp_int(
            args.get("limit", 3), low=1, high=MAX_SAMPLE_LIMIT, default=3
        )
        count_field = args.get("count_field") or DEFAULT_COUNT_FIELD

        logger = logging.getLogger(self.__class__.__name__)
        logger.info("OpenFdaFaersQuery drugs=%s", generic_names)

        api_key = os.getenv("OPENFDA_API_KEY")
        # openFDA authenticates via the ?api_key= query parameter, NOT an Authorization header.
        self._auth_params: Dict[str, str] = {"api_key": api_key} if api_key else {}

        drug_results: List[Dict[str, Any]] = []
        for drug in generic_names:
            search = f'patient.drug.openfda.generic_name:"{drug}"'
            try:
                total = self._fetch_total(search)
                top_reactions = self._fetch_count(search, count_field, limit=10)
                samples = self._fetch_samples(search, limit=limit)
                drug_results.append(
                    {
                        "generic_name": drug,
                        "total_reports": total,
                        "top_reactions": top_reactions,
                        "sample_reports": samples,
                    }
                )
            except HTTPError as err:
                status = getattr(err.response, "status_code", None)
                if status == 404:
                    # openFDA returns 404 when a search matches nothing -> zero reports for this drug.
                    drug_results.append(
                        {
                            "generic_name": drug,
                            "total_reports": 0,
                            "top_reactions": [],
                            "sample_reports": [],
                            "note": "No FAERS matches found for this drug.",
                        }
                    )
                else:
                    drug_results.append(
                        {
                            "generic_name": drug,
                            "error": f"OpenFDA request failed (HTTP {status}).",
                        }
                    )
            except RequestException as err:
                drug_results.append(
                    {"generic_name": drug, "error": f"OpenFDA request failed: {err}"}
                )

        return {
            "source": "openFDA FAERS",
            "disclaimer": "Unvalidated FAERS reports; reporting signals, not causal evidence.",
            "endpoint": OPENFDA_EVENT_URL,
            "api_key_tier": "authenticated" if api_key else "anonymous",
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "drugs": drug_results,
        }

    async def async_invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[Dict[str, Any], str]:
        return await asyncio.to_thread(self.invoke, args, sly_data)

    def _clamp_int(self, value: Any, low: int, high: int, default: int) -> int:
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default
        return max(low, min(high, parsed))

    def _get(self, params: Dict[str, Any]) -> Dict[str, Any]:
        merged = {**params, **self._auth_params}
        response = requests.get(
            OPENFDA_EVENT_URL,
            params=merged,
            headers={"Accept": "application/json"},
            timeout=OPENFDA_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()

    def _fetch_total(self, search: str) -> int:
        payload = self._get({"search": search, "limit": 1})
        return int(payload.get("meta", {}).get("results", {}).get("total", 0))

    def _fetch_count(
        self, search: str, count_field: str, limit: int
    ) -> List[Dict[str, Any]]:
        payload = self._get({"search": search, "count": count_field, "limit": limit})
        results = payload.get("results", [])
        if not isinstance(results, list):
            return []
        return [
            {"reaction": row.get("term"), "count": row.get("count")}
            for row in results[:limit]
        ]

    def _fetch_samples(self, search: str, limit: int) -> List[Dict[str, Any]]:
        payload = self._get({"search": search, "limit": limit})
        samples: List[Dict[str, Any]] = []
        for event in payload.get("results", [])[:limit]:
            patient = event.get("patient", {})
            reactions = [
                reaction.get("reactionmeddrapt")
                for reaction in patient.get("reaction", [])
                if reaction.get("reactionmeddrapt")
            ]
            drugs = [
                drug.get("medicinalproduct")
                or (drug.get("openfda", {}).get("generic_name") or [None])[0]
                for drug in patient.get("drug", [])
            ]
            samples.append(
                {
                    "receive_date": event.get("receivedate"),
                    "serious": event.get("serious"),
                    "reactions": reactions[:5],
                    "drugs": [drug for drug in drugs if drug][:5],
                }
            )
        return samples
