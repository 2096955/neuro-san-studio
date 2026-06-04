# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# You can be released from the terms, and requirements of the Academic Public
# License by purchasing a commercial license.
# Purchase of a commercial license is mandatory for any use of the
# neuro-san-studio SDK Software in commercial settings.
#
import asyncio
import logging
import os
import re
from typing import Any
from typing import Dict
from typing import Union

import aiofiles  # Import for asynchronous file operations
from neuro_san.interfaces.coded_tool import CodedTool

# Serializes manifest read-modify-write within this process so concurrent tool
# invocations don't clobber each other's entries. (Cross-instance writes to a
# shared GCS volume are still racy — see modify_registry docstring.)
_MANIFEST_LOCK = asyncio.Lock()

# Agent network names become filenames and HOCON manifest keys, and the value is
# LLM/user-controlled. Restrict to a safe charset to prevent path traversal
# (e.g. "../../etc") and HOCON injection via quotes/newlines.
_VALID_NAME_RE = re.compile(r"^[A-Za-z0-9_-]+$")


def _env_bool(name: str, default: bool) -> bool:
    """Parse a boolean environment variable with a default."""
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


# These are environment-driven so the same container image works both locally
# (writable repo) and on read-only serverless filesystems such as Cloud Run,
# where only /tmp and explicitly mounted volumes are writable.
#
#   AGENT_NETWORK_WRITE_TO_FILE  "false" -> return-only mode, never touch disk
#   AGENT_NETWORK_OUTPUT_PATH    where to persist (e.g. a GCS volume mount path)
#   AGENT_NETWORK_FALLBACK_PATH  used automatically when OUTPUT_PATH is read-only
WRITE_TO_FILE = _env_bool("AGENT_NETWORK_WRITE_TO_FILE", True)
OUTPUT_PATH = os.getenv("AGENT_NETWORK_OUTPUT_PATH", "registries/")
FALLBACK_OUTPUT_PATH = os.getenv("AGENT_NETWORK_FALLBACK_PATH", "/tmp/registries/")
AGENT_NETWORK_NAME = "AutomaticallyDesignedAgentNetwork"
HOCON_HEADER_START = (
    "{\n"
    "# Importing content from other HOCON files\n"
    "# The include keyword must be unquoted and followed by a quoted URL or file path.\n"
    "# File paths should be absolute or relative to the script's working directory, not the HOCON file location.\n"
    '# This "aaosa.hocon" file contains key-value pairs used for substitution.\n'
    "# Specifically, it provides values for the following keys:\n"
    "#   - aaosa_call\n"
    "#   - aaosa_command\n"
    "#   - aaosa_instructions\n"
    "# IMPORTANT:\n"
    "# Ensure that you run `python -m run` from the top level of the repository.\n"
    "# The path to this substitution file is **relative to the top-level directory**,\n"
    "# so running the script from elsewhere may result in file not found errors.\n"
    'include "registries/aaosa.hocon"\n'
    '    "llm_config": {\n'
    '        "model_name": "gpt-4o",\n'
    "    },\n"
    '    "commondefs": {\n'
    '        "replacement_strings": {\n'
    '            "instructions_prefix": """\n'
    "You are part of a "
)
HOCON_HEADER_REMAINDER = (
    " of assistants.\n"
    "Only answer inquiries that are directly within your area of expertise.\n"
    "Do not try to help for other matters.\n"
    "Do not mention what you can NOT do. Only mention what you can do.\n"
    '            """,\n'
    '            "demo_mode": "You are part of a demo system, so when queried, make up a realistic response as if you '
    'are actually grounded in real data or you are operating a real application API or microservice."\n'
    "        },\n"
    "    }\n"
    '"tools": [\n'
)
TOP_AGENT_TEMPLATE = (
    "        {\n"
    '            "name": "%s",\n'
    '            "function": {\n'
    '                "description": """\n'
    "An assistant that answer inquiries from the user.\n"
    '                """\n'
    "            },\n"
    '            "instructions": """\n'
    "{instructions_prefix}\n"
    "%s\n"
    '            """ ${aaosa_instructions},\n'
    '            "tools": [%s]\n'
    "        },\n"
)
REGULAR_AGENT_TEMPLATE = (
    "        {\n"
    '            "name": "%s",\n'
    '            "function": ${aaosa_call},\n'
    '            "instructions": """\n'
    "{instructions_prefix}\n"
    "%s\n"
    '            """ ${aaosa_instructions},\n'
    '            "command": ${aaosa_command},\n'
    '            "tools": [%s]\n'
    "        },\n"
)
LEAF_NODE_AGENT_TEMPLATE = (
    "        {\n"
    '            "name": "%s",\n'
    '            "function": ${aaosa_call},\n'
    '            "instructions": """\n'
    "{instructions_prefix} {demo_mode}\n"
    "%s\n"
    '            """,\n'
    "        },\n"
)


async def _update_manifest(output_dir, the_agent_network_name):
    """
    Adds the agent network to manifest.hocon inside output_dir.

    When writing to a fresh writable location (e.g. the /tmp fallback or a
    mounted volume) the manifest is seeded EMPTY. The writable manifest only
    lists networks generated here; bundled networks come from the read-only base
    registries/manifest.hocon, which readers merge separately (see app.py
    list_networks() and the space-separated AGENT_MANIFEST_FILE). Seeding empty
    avoids the writable manifest referencing base files that don't live next to
    it (which the neuro-san restorer resolves relative to the manifest's dir).
    """
    logger = logging.getLogger("modify_registry")
    manifest_path = os.path.join(output_dir, "manifest.hocon")
    manifest_entry = f'    "{the_agent_network_name}.hocon": true,'

    # Serialize the read-modify-write so concurrent invocations in this process
    # don't overwrite each other's entries.
    async with _MANIFEST_LOCK:
        # Seed an empty manifest if it's missing at the target location.
        if not os.path.isfile(manifest_path):
            async with aiofiles.open(manifest_path, "w") as file:
                await file.write("{\n}\n")

        # Read the current manifest content
        async with aiofiles.open(manifest_path, "r") as file:
            manifest_content = await file.read()
        # Check if the entry already exists to avoid duplicates
        if f'"{the_agent_network_name}.hocon"' in manifest_content:
            return
        # Find the position to insert the new entry (before the closing brace)
        insert_position = manifest_content.rfind("}")
        if insert_position == -1:
            # Malformed manifest: don't silently report success. The network
            # file was still written; only its registration failed.
            logger.warning(
                "manifest at %s has no closing brace; network %s written but NOT registered",
                manifest_path,
                the_agent_network_name,
            )
            return
        # Insert the new entry
        updated_content = (
            manifest_content[:insert_position]
            + "\n"
            + manifest_entry
            + manifest_content[insert_position:]
        )
        # Write atomically (temp file + rename) so readers never see a truncated
        # manifest mid-write.
        tmp_path = manifest_path + ".tmp"
        async with aiofiles.open(tmp_path, "w") as file:
            await file.write(updated_content)
        os.replace(tmp_path, manifest_path)


async def _write_network(
    output_dir, the_agent_network_hocon_str, the_agent_network_name
):
    """
    Writes the agent network hocon into output_dir and updates its manifest.
    Returns the path to the written file. Raises OSError if output_dir is not
    writable (caller is responsible for falling back).
    """
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, the_agent_network_name + ".hocon")
    async with aiofiles.open(file_path, "w") as file:
        await file.write(the_agent_network_hocon_str)
    await _update_manifest(output_dir, the_agent_network_name)
    return file_path


async def modify_registry(the_agent_network_hocon_str, the_agent_network_name):
    """
    Persists the agent network to OUTPUT_PATH and updates manifest.hocon.

    If OUTPUT_PATH is not writable (e.g. the read-only image filesystem on
    Cloud Run), automatically falls back to FALLBACK_OUTPUT_PATH (/tmp by
    default). Never raises: returns (written_path, error) so the caller can
    still hand the HOCON back to the user even when persistence fails.

    :param the_agent_network_hocon_str: The agent network hocon string
    :param the_agent_network_name: The file name, without the .hocon extension
    :return: A (written_path, error) tuple. written_path is None on failure.
    """
    logger = logging.getLogger("modify_registry")
    try:
        path = await _write_network(
            OUTPUT_PATH, the_agent_network_hocon_str, the_agent_network_name
        )
        logger.info("Wrote agent network to %s", path)
        return path, None
    except Exception as primary_err:  # noqa: BLE001 - persistence must never crash the tool
        logger.warning(
            "Could not write agent network to %s (%s); falling back to %s",
            OUTPUT_PATH,
            primary_err,
            FALLBACK_OUTPUT_PATH,
        )
    try:
        path = await _write_network(
            FALLBACK_OUTPUT_PATH, the_agent_network_hocon_str, the_agent_network_name
        )
        logger.warning(
            "Wrote agent network to ephemeral fallback path %s (lost on restart)", path
        )
        return path, None
    except Exception as fallback_err:  # noqa: BLE001 - return HOCON even if all writes fail
        logger.error(
            "Failed to persist agent network to fallback %s: %s",
            FALLBACK_OUTPUT_PATH,
            fallback_err,
        )
        return None, fallback_err


class GetAgentNetworkHocon(CodedTool):
    """
    CodedTool implementation which provides a way to get a full hocon of a designed agent network from the sly data
    """

    def __init__(self):
        self.agents = None

    async def async_invoke(
        self, args: Dict[str, Any], sly_data: Dict[str, Any]
    ) -> Union[Dict[str, Any], str]:
        """
        :param args: An argument dictionary whose keys are the parameters
                to the coded tool and whose values are the values passed for them
                by the calling agent.  This dictionary is to be treated as read-only.

                The argument dictionary expects the following keys:
                    "app_name" the name of the One Cognizant app for which the URL is needed.

        :param sly_data: A dictionary whose keys are defined by the agent hierarchy,
                but whose values are meant to be kept out of the chat stream.

                This dictionary is largely to be treated as read-only.
                It is possible to add key/value pairs to this dict that do not
                yet exist as a bulletin board, as long as the responsibility
                for which coded_tool publishes new entries is well understood
                by the agent chain implementation and the coded_tool implementation
                adding the data is not invoke()-ed more than once.

                Keys expected for this implementation are:
                    None

        :return:
            In case of successful execution:
                The full agent network hocon as a string.
            otherwise:
                a text string an error message in the format:
                "Error: <error message>"
        """
        self.agents = sly_data.get(AGENT_NETWORK_NAME, None)
        if not self.agents:
            return "Error: No network in sly data!"

        the_agent_network_name: str = args.get("agent_network_name", "")
        if the_agent_network_name == "":
            return "Error: No agent_name provided."
        # The name becomes a filename and a HOCON manifest key, and is
        # LLM/user-controlled. Reject path separators, traversal, quotes and
        # newlines to prevent writing outside the registry or injecting HOCON.
        if not _VALID_NAME_RE.match(the_agent_network_name):
            return (
                "Error: Invalid agent_network_name "
                f"'{the_agent_network_name}'. Use only letters, digits, '_' and '-'."
            )
        # A generated network with the same name as a bundled (built-in) one
        # would shadow it once readers merge the writable registry with the base
        # registry. The write only stays in the base registry when OUTPUT_PATH IS
        # the base dir AND that dir is actually writable; otherwise it lands in a
        # separate merged dir (an explicit OUTPUT_PATH, or the /tmp fallback when
        # the base image is read-only on Cloud Run). Reject the collision unless
        # the effective write target is the base dir itself (local-dev
        # regeneration).
        base_registry_dir = os.path.join(
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ),
            "registries",
        )
        base_abs = os.path.abspath(base_registry_dir)
        effective_is_base = os.path.abspath(OUTPUT_PATH) == base_abs and os.access(
            base_abs, os.W_OK
        )
        if (
            os.path.isfile(os.path.join(base_abs, f"{the_agent_network_name}.hocon"))
            and not effective_is_base
        ):
            return (
                f"Error: '{the_agent_network_name}' conflicts with a built-in agent network. "
                "Choose a different agent_network_name."
            )
        # Add the agent network name into sly data.
        sly_data["agent_name"] = the_agent_network_name

        logger = logging.getLogger(self.__class__.__name__)
        logger.info(">>>>>>>>>>>>>>>>>>>GetAgentNetworkHocon>>>>>>>>>>>>>>>>>>")
        logger.info("Agent Network Name: %s", str(the_agent_network_name))
        the_agent_network_hocon_str = self.get_agent_network_hocon(
            the_agent_network_name
        )
        logger.info(
            "The resulting agent network: \n %s", str(the_agent_network_hocon_str)
        )
        if WRITE_TO_FILE:
            written_path, write_err = await modify_registry(
                the_agent_network_hocon_str, the_agent_network_name
            )
            if write_err is not None:
                # Persistence failed everywhere (even /tmp). Don't fail the tool:
                # the user still receives the generated HOCON below.
                logger.warning(
                    "Returning agent network HOCON without persisting it: %s", write_err
                )
        else:
            logger.info(
                "AGENT_NETWORK_WRITE_TO_FILE is disabled; returning HOCON only."
            )
        logger.info(">>>>>>>>>>>>>>>>>>>DONE !!!>>>>>>>>>>>>>>>>>>")
        return the_agent_network_hocon_str

    def get_agent_network_hocon(self, agent_network_name):
        """
        Returns a full agent network hocon.
        """
        has_top_agent = False
        for agent_name, agent in self.agents.items():
            if agent["top_agent"] == "true":
                has_top_agent = True
        if not has_top_agent:
            self.agents[0]["top_agent"] = "true"

        agent_network_hocon = (
            HOCON_HEADER_START + agent_network_name + HOCON_HEADER_REMAINDER
        )
        for agent_name, agent in self.agents.items():
            tools = ""
            if agent["down_chains"]:
                for j, down_chain in enumerate(agent["down_chains"]):
                    tools = tools + '"' + down_chain + '"'
                    if j < len(agent["down_chains"]) - 1:
                        tools = tools + ","
            if agent["top_agent"] == "true":  # top agent
                an_agent = TOP_AGENT_TEMPLATE % (
                    agent_name,
                    agent["instructions"],
                    tools,
                )
            elif agent["down_chains"]:
                an_agent = REGULAR_AGENT_TEMPLATE % (
                    agent_name,
                    agent["instructions"],
                    tools,
                )
            else:  # leaf node agent
                an_agent = LEAF_NODE_AGENT_TEMPLATE % (
                    agent_name,
                    agent["instructions"],
                )
            agent_network_hocon = agent_network_hocon + an_agent
        agent_network_hocon = agent_network_hocon + "]\n}\n"
        return agent_network_hocon
