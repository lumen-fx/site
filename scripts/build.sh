#!/usr/bin/env bash
# Build the unified site locally: assemble the docs_dir (cloning product docs
# fresh) then run Zensical. Mirrors the CI workflow.
#
#   scripts/build.sh              # build with docs from main
#   CANDELA_REV=v0.2.0 scripts/build.sh   # pin candela docs to a tag/SHA
set -euo pipefail
cd "$(dirname "$0")/.."

uv sync
uv run python scripts/prebuild.py
uv run zensical build --strict
echo "built -> dist/"
