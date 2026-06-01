# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# You can be released from the terms, and requirements of the Academic Public
# License by purchasing a commercial license.
# Purchase of a commercial license is mandatory for any use of the
# neuro-san-studio SDK Software in commercial settings.
#
# END COPYRIGHT

import asyncio
import logging
import os
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Union

import requests
from neuro_san.interfaces.coded_tool import CodedTool
from requests import HTTPError
from requests import JSONDecodeError
from requests import RequestException

TAVILY_URL = "https://api.tavily.com/search"
TAVILY_TIMEOUT = 30.0
# Parameters accepted by the Tavily /search API.
# See https://docs.tavily.com/documentation/api-reference/endpoint/search
TAVILY_QUERY_PARAMS = [
    "query",
    "search_depth",
    "topic",
    "max_results",
    "time_range",
    "days",
    "include_answer",
    "include_raw_content",
    "include_domains",
    "exclude_domains",
]


class TavilySearch(CodedTool):
    """
    CodedTool implementation which provides a way to search the web using the Tavily Search API.

    Tavily is an API-key search service designed for server-side use, so it works from datacenter
    egress (e.g. Cloud Run) where DuckDuckGo (ddgs_search) is rate-limited/blocked. This tool is a
    drop-in replacement for ddgs_search: it accepts the same "search_terms" arg and returns results
    that include the DDGS-compatible keys (title/href/body) in addition to Tavily's native keys.

    For an API key, see https://app.tavily.com/ and set it via the TAVILY_API_KEY environment variable.
    """

    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        if self.tavily_api_key is None:
            logging.error("TAVILY_API_KEY is not set!")

    def invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[List[Dict[str, Any]], str]:
        """
        :param args: An argument dictionary whose keys are the parameters
                to the coded tool and whose values are the values passed for them
                by the calling agent.  This dictionary is to be treated as read-only.

                The argument dictionary expects the following keys:
                    "search_terms"

        :param sly_data: A dictionary whose keys are defined by the agent hierarchy,
                but whose values are meant to be kept out of the chat stream.

                Keys expected for this implementation are:
                    None

        :return:
            In case of successful execution:
                A list of dictionaries of search results.
            otherwise:
                a text string an error message in the format:
                "Error: <error message>"
        """

        # Extract URL and timeout from args, then environment variables, then fall back to defaults
        tavily_url: str = (
            args.get("tavily_url") or os.getenv("TAVILY_URL") or TAVILY_URL
        )
        tavily_timeout: float = float(
            args.get("tavily_timeout") or os.getenv("TAVILY_TIMEOUT") or TAVILY_TIMEOUT
        )

        # Filter user-specified args using the TAVILY_QUERY_PARAMS allow-list. This also makes the
        # tool tolerant of ddgs-specific args (e.g. region/backend) that some networks pass.
        tavily_params: Dict[str, Any] = {
            param: param_value
            for param, param_value in args.items()
            if param in TAVILY_QUERY_PARAMS
        }

        # Use user-specified "query" if available; otherwise fall back to LLM-provided "search_terms"
        tavily_params.setdefault("query", args.get("search_terms"))
        # Default to a basic (cheaper) search unless the caller overrides it. Tavily can otherwise
        # auto-upgrade search depth and consume extra credits.
        tavily_params.setdefault("search_depth", "basic")

        # Ensure a query was provided
        if not tavily_params.get("query"):
            return "Error: No 'search_terms' or 'query' provided."

        if not self.tavily_api_key:
            return "Error: TAVILY_API_KEY is not set."

        logger = logging.getLogger(self.__class__.__name__)
        logger.info(">>>>>>>>>>>>>>>>>>>TavilySearch>>>>>>>>>>>>>>>>>>")
        logger.info("TavilySearch Terms: %s", tavily_params.get("query"))
        logger.info("TavilySearch URL: %s", tavily_url)

        results: Dict[str, Any] = self.tavily_search(
            tavily_params, tavily_url, tavily_timeout
        )

        results_list: List[Dict[str, Any]] = []
        # Tavily returns its hits under the "results" key, each with title/url/content/score.
        for result in results.get("results", []) or []:
            url: Optional[str] = result.get("url")
            content: Optional[str] = result.get("content")
            # Emit BOTH Tavily-native keys and DDGS-compatible aliases (title/href/body) so that
            # networks originally written against ddgs_search keep working when this is swapped in.
            results_list.append(
                {
                    "title": result.get("title"),
                    "url": url,
                    "href": url,
                    "content": content,
                    "body": content,
                    "score": result.get("score"),
                }
            )

        logger.info(">>>>>>>>>>>>>>>>>>>DONE !!!>>>>>>>>>>>>>>>>>>")
        return results_list

    async def async_invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[List[Dict[str, Any]], str]:
        """Run invoke asynchronously."""
        return await asyncio.to_thread(self.invoke, args, sly_data)

    def tavily_search(
        self,
        tavily_params: Dict[str, Any],
        tavily_url: Optional[str] = TAVILY_URL,
        tavily_timeout: Optional[float] = TAVILY_TIMEOUT,
    ) -> Dict[str, Any]:
        """
        Perform a search request to the Tavily Search API.

        :param tavily_params: Dictionary of parameters to include in the JSON request body.
        :param tavily_url: The Tavily Search API endpoint (default: TAVILY_URL).
        :param tavily_timeout: Timeout for the request in seconds (default: TAVILY_TIMEOUT).

        :return: The parsed JSON response from the Tavily Search API as a dictionary (or {} on error).
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.tavily_api_key}",
        }
        results: Dict[str, Any] = {}
        response = None
        try:
            response = requests.post(
                tavily_url, headers=headers, json=tavily_params, timeout=tavily_timeout
            )
            response.raise_for_status()
            results = response.json()
        except HTTPError as http_err:
            status = getattr(response, "status_code", "?")
            logging.error("HTTP error occurred: %s - Status code: %s", http_err, status)
        except JSONDecodeError as json_err:
            logging.error("JSON decode error: %s", json_err)
        except RequestException as req_err:
            logging.error("Request error: %s", req_err)

        return results
