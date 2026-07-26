#!/usr/bin/env bash
# Build all three static targets locally.
#
# Two targets are Zensical (apex, docs): assemble each docs_dir (cloning the
# Candela docs fresh for the docs target), generate each config, then run
# Zensical once per target. The Candela landing is a Vite + React app under
# apps/candela: fetch install.sh fresh from the candela repo, then `vite build`.
# Every target lands in dist/<target>/, matching the CI workflow.
#
#   scripts/build.sh              # build all targets, candela docs + install.sh from main
#   CANDELA_REV=v0.2.0 scripts/build.sh   # pin the candela docs + install.sh to a tag/SHA
set -euo pipefail
cd "$(dirname "$0")/.."

ZENSICAL_TARGETS=(apex docs)

# --- Zensical targets (apex, docs) ---
uv sync
uv run python scripts/prebuild.py
for t in "${ZENSICAL_TARGETS[@]}"; do
  echo "== building ${t} (zensical) =="
  uv run zensical build --strict -f "zensical.${t}.toml"
done

# --- Candela landing (Vite + React) ---
echo "== building candela (vite + react) =="
uv run python scripts/fetch_candela_install.py
npm --prefix apps/candela ci
npm --prefix apps/candela run build

echo "built:"
for t in apex candela docs; do
  echo "  ${t} -> dist/${t}/"
done
