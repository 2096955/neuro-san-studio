# Copyright (C) 2023-2026 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
# END COPYRIGHT
"""Single source of truth for loading agent network names from the manifest.

Multiple entrypoints (apps/cruse, Cloud Run app.py, ad-hoc scripts) historically
each rolled their own manifest loader. After Phase 4 introduced grouped
sub-manifests via `include`, the legacy HOCON-parser path's relative-path
resolution diverged from neuro-san's, so any caller still using it on the
root manifest silently saw an incomplete and incorrect list (only the root-level
entries that aren't behind broken includes).

This helper wraps `RegistryManifestRestorer` (the same loader the neuro-san
server uses) so every consumer sees the same view of the manifest.
"""

from __future__ import annotations

import logging
import os
from typing import Iterable
from typing import List
from typing import Optional

logger = logging.getLogger(__name__)


def load_public_networks(
    manifest_files: Optional[str] = None,
    excluded: Optional[Iterable[str]] = None,
) -> List[str]:
    """Return public agent network names from the manifest, sorted.

    :param manifest_files: Optional manifest path override. Defaults to the
        ``AGENT_MANIFEST_FILE`` env var (which neuro-san itself reads).
    :param excluded: Optional iterable of network names to omit. Compared
        against the *registered* name (e.g. ``basic/music_nerd``) and against
        the bare stem (e.g. ``music_nerd``) for backward compatibility with
        callers that pre-date the Phase 4 subdir layout.
    :return: Sorted list of public network names. Empty list on any failure
        (logged at error level — never raises).
    """
    try:
        from neuro_san.internals.graph.persistence.registry_manifest_restorer import RegistryManifestRestorer
    except Exception as exc:
        logger.error("RegistryManifestRestorer unavailable: %s", exc)
        return []

    files = manifest_files or os.environ.get("AGENT_MANIFEST_FILE", "")
    if not files:
        logger.error("AGENT_MANIFEST_FILE is not set and no manifest_files arg given")
        return []

    try:
        result = RegistryManifestRestorer(manifest_files=files).restore()
    except Exception as exc:
        logger.error("Failed to restore manifest %s: %s", files, exc)
        return []

    names = sorted(result.get("public", {}).keys())
    if excluded:
        excluded_set = set(excluded)
        names = [n for n in names if n not in excluded_set and n.split("/")[-1] not in excluded_set]
    return names


def load_all_networks(
    manifest_files: Optional[str] = None,
) -> List[str]:
    """Return public + protected network names from the manifest, sorted.

    Useful for tooling that needs every served network (e.g. authorization
    scripts), rather than just the publicly-visible ones.
    """
    try:
        from neuro_san.internals.graph.persistence.registry_manifest_restorer import RegistryManifestRestorer
    except Exception as exc:
        logger.error("RegistryManifestRestorer unavailable: %s", exc)
        return []

    files = manifest_files or os.environ.get("AGENT_MANIFEST_FILE", "")
    if not files:
        logger.error("AGENT_MANIFEST_FILE is not set and no manifest_files arg given")
        return []

    try:
        storages = RegistryManifestRestorer(manifest_files=files).restore()
    except Exception as exc:
        logger.error("Failed to restore manifest %s: %s", files, exc)
        return []

    names: List[str] = []
    for storage in storages.values():
        names.extend(storage.keys())
    return sorted(names)
