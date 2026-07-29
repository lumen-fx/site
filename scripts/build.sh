#!/usr/bin/env bash
# Build all three static targets locally.
#
# The docs target is Zensical: assemble its docs_dir (cloning the Candela docs
# fresh), generate its config, then run Zensical. The Lumen landing (apps/lumen,
# served at the apex) and the Candela landing (apps/candela) are Vite + React
# apps; the Candela one also fetches install.sh fresh from the candela repo
# before `vite build`. Every target lands in dist/<target>/, matching the CI
# workflow.
#
#   scripts/build.sh              # build all targets, candela docs + install.sh from main
#   CANDELA_REV=v0.2.0 scripts/build.sh   # pin the candela docs + install.sh to a tag/SHA
set -euo pipefail
cd "$(dirname "$0")/.."

# --- Docs (Zensical) ---
uv sync
uv run python scripts/prebuild.py
echo "== building docs (zensical) =="
uv run zensical build --strict -f zensical.docs.toml

# --- Lumen landing (Vite + React) -> dist/apex ---
echo "== building apex / lumen (vite + react) =="
npm --prefix apps/lumen ci
npm --prefix apps/lumen run build

# --- Candela landing (Vite + React) ---
echo "== building candela (vite + react) =="
uv run python scripts/fetch_candela_install.py
npm --prefix apps/candela ci
npm --prefix apps/candela run build

echo "built:"
for t in apex candela docs; do
  echo "  ${t} -> dist/${t}/"
done
