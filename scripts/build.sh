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
# The docs and the landing code samples come from each product's latest
# release, like the deployed site: LUMEN_REV and CANDELA_REV default to the
# tag GitHub reports as the latest release. Set a rev to build another tag,
# a branch, or a SHA, or set <PRODUCT>_DOCS_SRC to read the docs from a local
# checkout instead. The installers come from main either way. See
# scripts/prebuild.py for the full list of source variables.
#
#   scripts/build.sh                      # latest releases, install.sh from main
#   LUMEN_REV=main scripts/build.sh       # the lumen docs as they are on main
#   CANDELA_REV=v0.2.0 scripts/build.sh   # the candela docs at a tag or SHA
#   LUMEN_DOCS_SRC=~/Lumen/docs scripts/build.sh   # the lumen docs from disk
#   CANDELA_WASM_DIR=~/candela/pkg scripts/build.sh   # local candela runtime
set -euo pipefail
cd "$(dirname "$0")/.."

# Print the tag of a lumen-fx product's latest release, or fail loudly.
latest_release() {
  local repo="$1" tag=""
  if command -v gh >/dev/null 2>&1; then
    tag=$(gh api "repos/lumen-fx/$repo/releases/latest" -q .tag_name 2>/dev/null || true)
  fi
  if [ -z "$tag" ]; then
    tag=$(curl -fsSL "https://api.github.com/repos/lumen-fx/$repo/releases/latest" 2>/dev/null |
      sed -n 's/^ *"tag_name": *"\([^"]*\)".*/\1/p' || true)
  fi
  if [ -z "$tag" ]; then
    echo "error: could not resolve the latest release of lumen-fx/$repo;" \
      "set ${repo^^}_REV or ${repo^^}_DOCS_SRC" >&2
    return 1
  fi
  echo "$tag"
}

if [ -z "${LUMEN_REV:-}" ] && [ -z "${LUMEN_DOCS_SRC:-}" ]; then
  LUMEN_REV=$(latest_release lumen)
  export LUMEN_REV
fi
if [ -z "${CANDELA_REV:-}" ] && [ -z "${CANDELA_DOCS_SRC:-}" ]; then
  CANDELA_REV=$(latest_release candela)
  export CANDELA_REV
fi
echo "lumen docs @ ${LUMEN_REV:-$LUMEN_DOCS_SRC}, candela docs @ ${CANDELA_REV:-$CANDELA_DOCS_SRC}"

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
