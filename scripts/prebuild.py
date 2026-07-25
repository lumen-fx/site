#!/usr/bin/env python3
"""Assemble the Zensical docs_dir for the unified lumenfx.dev site.

Product docs are fetched fresh from each product repo at build time and are
never committed to this repo. Run this before `zensical build`.

The assembled tree lives in `build/docs` (the Zensical `docs_dir`) and is
composed of:

  * `content/`            site-owned pages: landings, the Lumen docs
                          placeholder, theme assets. Copied verbatim.
  * candela docs          cloned fresh from lumen-fx/candela and copied to
                          `build/docs/candela/docs`.

Adding Lumen docs later is a one-line addition: register another SOURCES
entry once the Lumen docs are Zensical markdown (they are an mdbook today).

Environment overrides:
  CANDELA_REPO   git URL for candela        (default: the public GitHub repo)
  CANDELA_REV    branch, tag, or commit SHA (default: main)
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
BUILD = ROOT / "build"
DOCS_OUT = BUILD / "docs"
REPOS = BUILD / "repos"


# Each source clones a product repo at a rev and copies a subdirectory of
# markdown into the assembled docs_dir. To add Lumen once its docs are
# Zensical, append an entry here and add the nav in zensical.toml.
SOURCES = [
    {
        "name": "candela",
        "repo": os.environ.get(
            "CANDELA_REPO", "https://github.com/lumen-fx/candela"
        ),
        "rev": os.environ.get("CANDELA_REV", "main"),
        # Subpath of the cloned repo that holds the markdown docs.
        "src_subdir": Path("docs") / "docs",
        # Destination under the assembled docs_dir.
        "dest_subdir": Path("candela") / "docs",
    },
    # Lumen docs are an mdbook today, not Zensical, so they are not pulled
    # yet. The placeholder at content/lumen/index.md holds the slot. When
    # the docs move to Zensical, add an entry like:
    # {
    #     "name": "lumen",
    #     "repo": os.environ.get("LUMEN_REPO", "https://github.com/lumen-fx/lumen"),
    #     "rev": os.environ.get("LUMEN_REV", "main"),
    #     "src_subdir": Path("docs"),
    #     "dest_subdir": Path("lumen"),
    # },
]


def run(cmd: list[str], **kw) -> None:
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def clone(repo: str, rev: str, dest: Path) -> None:
    """Fetch a single rev (branch, tag, or SHA) shallowly into dest."""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    run(["git", "init", "-q", dest])
    run(["git", "-C", dest, "remote", "add", "origin", repo])
    run(["git", "-C", dest, "fetch", "-q", "--depth", "1", "origin", rev])
    run(["git", "-C", dest, "checkout", "-q", "FETCH_HEAD"])


def assemble() -> None:
    # Start from a clean docs_dir seeded with the site-owned content.
    if DOCS_OUT.exists():
        shutil.rmtree(DOCS_OUT)
    if not CONTENT.is_dir():
        sys.exit(f"error: missing content directory: {CONTENT}")
    shutil.copytree(CONTENT, DOCS_OUT)
    print(f"seeded docs_dir from {CONTENT.relative_to(ROOT)}", flush=True)

    for src in SOURCES:
        clone_dest = REPOS / src["name"]
        clone(src["repo"], src["rev"], clone_dest)
        md_src = clone_dest / src["src_subdir"]
        if not md_src.is_dir():
            sys.exit(f"error: {src['name']} docs not found at {md_src}")
        md_dest = DOCS_OUT / src["dest_subdir"]
        shutil.copytree(md_src, md_dest, dirs_exist_ok=True)
        print(
            f"copied {src['name']} docs @ {src['rev']} "
            f"-> {md_dest.relative_to(ROOT)}",
            flush=True,
        )

    print(f"docs_dir assembled at {DOCS_OUT.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    assemble()
