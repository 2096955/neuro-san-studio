#!/bin/bash

# Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
# All Rights Reserved.
# Issued under the Academic Public License.
#
# You can be released from the terms, and requirements of the Academic Public
# License by purchasing a commercial license.
# Purchase of a commercial license is mandatory for any use of the
# neuro-san SDK Software in commercial settings.
#
# END COPYRIGHT

# Entry point script which manages the transition from
# Docker bash to Python

cat /etc/os-release

PYTHON=python3
echo "Using python ${PYTHON}"

PIP=pip3
echo "Using pip ${PIP}"

echo "Preparing app..."
if [ -z "${PYTHONPATH}" ]
then
    PYTHONPATH=$(pwd)
fi
export PYTHONPATH

echo "Toolchain:"
${PYTHON} --version
${PIP} --version
${PIP} freeze

PACKAGE_INSTALL=${PACKAGE_INSTALL:-.}
echo "PACKAGE_INSTALL is ${PACKAGE_INSTALL}"

echo "Starting service with args '$1'..."
# Launch via the tracing bootstrap (sits next to this script in deploy/). It is a no-op unless
# ARIZE_SPACE_ID+ARIZE_API_KEY are set; otherwise it instruments LangChain BEFORE importing neuro_san
# and then execs the real server entrypoint with the same args.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
${PYTHON} "${SCRIPT_DIR}/otel_bootstrap.py" "$@"

echo "Done."
