#!/usr/bin/env bash
# Build all three static targets locally: assemble each docs_dir (cloning the
# Candela docs fresh for the docs target), generate each config, then run
# Zensical once per target. Mirrors the CI workflow.
#
#   scripts/build.sh              # build all targets, docs from main
#   CANDELA_REV=v0.2.0 scripts/build.sh   # pin the Candela docs to a tag/SHA
set -euo pipefail
cd "$(dirname "$0")/.."

TARGETS=(apex candela docs)

uv sync
uv run python scripts/prebuild.py

for t in "${TARGETS[@]}"; do
  echo "== building ${t} =="
  uv run zensical build --strict -f "zensical.${t}.toml"
done

echo "built:"
for t in "${TARGETS[@]}"; do
  echo "  ${t} -> dist/${t}/"
done
