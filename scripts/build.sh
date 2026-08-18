#!/usr/bin/env bash
# Build all three static targets locally.
#
# The docs target is Zensical: assemble its docs_dir from the Lumen and Candela
# docs, generate its config, then run Zensical. The Lumen landing (apps/lumen,
# served at the apex) and the Candela landing (apps/candela) are Vite + React
# apps; each also fetches its install.sh fresh from its own product repo
# before `vite build`. Every target lands in dist/<target>/, matching the CI
# workflow.
#
# The docs build reads each product from a local checkout by default. Set
# LUMEN_REPO or CANDELA_REPO to clone that product fresh instead; see
# scripts/prebuild.py for the full list of source variables.
#
#   scripts/build.sh                      # local product checkouts, install.sh from main
#   LUMEN_DOCS_SRC=~/lumen/docs scripts/build.sh   # point the Lumen docs elsewhere
#   LUMEN_REV=v0.2.0 scripts/build.sh     # pin the lumen docs + install.sh to a tag/SHA
#   CANDELA_REV=v0.2.0 scripts/build.sh   # pin the candela docs + install.sh to a tag/SHA
#   CANDELA_WASM_DIR=~/candela/pkg scripts/build.sh   # local candela runtime
set -euo pipefail
cd "$(dirname "$0")/.."

# --- Docs (Zensical) ---
uv sync
uv run python scripts/prebuild.py
echo "== building docs (zensical) =="
uv run zensical build --strict -f zensical.docs.toml

# --- Code examples for both landings ---
# Pulled from the product repos so the pages cannot drift from what they ship.
echo "== fetching code examples =="
uv run python scripts/fetch_examples.py

# --- Lumen landing (Vite + React) -> dist/apex ---
echo "== building apex / lumen (vite + react) =="
uv run python scripts/fetch_lumen_install.py
npm --prefix apps/lumen ci
npm --prefix apps/lumen run build

# --- Candela landing (Vite + React) ---
# The landing runs candela in the browser, so it also needs the WebAssembly
# runtime from a candela release. Before a release carries that asset, point
# CANDELA_WASM_DIR at a local `wasm-pack build --target web` output directory.
echo "== building candela (vite + react) =="
uv run python scripts/fetch_candela_install.py
uv run python scripts/fetch_candela_wasm.py
npm --prefix apps/candela ci
npm --prefix apps/candela run build

echo "built:"
for t in apex candela docs; do
  echo "  ${t} -> dist/${t}/"
done
