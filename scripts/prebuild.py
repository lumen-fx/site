#!/usr/bin/env python3
"""Assemble the docs_dir and generate the Zensical config for each Zensical target.

The site has three static builds. One is Zensical, docs (the unified docs), and
this script prepares it. The other two, the Lumen landing (apps/lumen, served at
the apex) and the Candela landing (apps/candela), are Vite + React apps built
with npm, not Zensical, so they are not handled here.

The docs target carries both products under one search: the Lumen docs at the
site root and the Candela docs at /candela/. Product docs come from outside this
repo and are never committed here.

For each target this script:

  1. Assembles build/<target>/docs (the Zensical docs_dir) from:
       * content/shared/    theme assets (stylesheets, favicon), copied to
                            every target.
       * content/<target>/  the target's own pages, if it has any.
       * each product's docs, copied to its subpath in the tree.
  2. Writes zensical.<target>.toml at the repo root by concatenating the
     target's [project] block (config/<target>.toml) in front of the shared
     theme (config/theme.toml). The config is written at the repo root so
     Zensical resolves docs_dir and site_dir relative to the repo root.

Product docs resolve one of two ways. By default each product is read from a
local checkout, which is what you want when you edit the docs and the site side
by side. Setting either the repo or the rev variable for a product switches it
to a fresh shallow clone, which is what CI does.

Environment overrides, per product (LUMEN and CANDELA):
  <PRODUCT>_DOCS_SRC   local path to the docs project (the directory holding
                       docs/); used when neither variable below is set
  <PRODUCT>_REPO       git URL to clone instead of reading the local path
  <PRODUCT>_REV        branch, tag, or commit SHA to clone (default: main);
                       setting this alone clones the product's public repo
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SHARED = CONTENT / "shared"
CONFIG = ROOT / "config"
THEME_FRAGMENT = CONFIG / "theme.toml"
BUILD = ROOT / "build"
REPOS = BUILD / "repos"

def _source(name: str, default_src: str, default_repo: str, dest_subdir: str) -> dict:
    """Describe where one product's markdown comes from and where it lands.

    src_subdir is the path inside the product's docs project that holds the
    markdown; both products keep it at docs/. dest_subdir is the path inside the
    assembled docs_dir, so "." serves the product at the site root.
    """
    key = name.upper()
    repo = os.environ.get(f"{key}_REPO")
    rev = os.environ.get(f"{key}_REV")
    return {
        "name": name,
        "src": Path(os.environ.get(f"{key}_DOCS_SRC", default_src)),
        # A repo or a rev in the environment means "clone this fresh"; with
        # neither, the local checkout wins.
        "clone": bool(repo or rev),
        "repo": repo or default_repo,
        "rev": rev or "main",
        "src_subdir": Path("docs"),
        "dest_subdir": Path(dest_subdir),
    }


# The Zensical build targets. Each becomes its own static site rooted at "/".
# Only docs is Zensical; the apex (Lumen) and candela landings are Vite + React
# apps under apps/, built with npm, and are not handled here.
TARGETS = [
    {
        # Unified docs at the root of docs.lumenfx.dev.
        "name": "docs",
        "content_dir": CONTENT / "docs",
        "sources": [
            _source(
                "lumen",
                "/home/artur/lumen-docs-zensical/docs",
                "https://github.com/lumen-fx/lumen",
                ".",
            ),
            _source(
                "candela",
                "/home/artur/keel-work/docs",
                "https://github.com/lumen-fx/candela",
                "candela",
            ),
        ],
    },
]


def run(cmd: list, **kw) -> None:
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


def resolve_source(target: str, src: dict) -> tuple[Path, str]:
    """Return the docs project root for a product, plus a label for the log.

    Both products keep their docs project in a top-level docs/ directory, so a
    clone of the product repo is one level above the project root.
    """
    key = src["name"].upper()
    if src["clone"]:
        dest = REPOS / f"{target}-{src['name']}"
        clone(src["repo"], src["rev"], dest)
        return dest / "docs", f"{src['repo']} @ {src['rev']}"
    path = src["src"]
    if not path.is_dir():
        sys.exit(
            f"error: {src['name']} docs not found at {path}. Point "
            f"{key}_DOCS_SRC at a local checkout, or set {key}_REPO to clone it."
        )
    return path, str(path)


def generate_config(target: str) -> Path:
    """Write zensical.<target>.toml at the repo root: per-target block + theme."""
    part = CONFIG / f"{target}.toml"
    if not part.is_file():
        sys.exit(f"error: missing target config: {part}")
    if not THEME_FRAGMENT.is_file():
        sys.exit(f"error: missing theme fragment: {THEME_FRAGMENT}")
    out = ROOT / f"zensical.{target}.toml"
    header = (
        f"# GENERATED by scripts/prebuild.py from config/{target}.toml and\n"
        f"# config/theme.toml. Do not edit; edit those sources instead.\n\n"
    )
    body = (
        part.read_text(encoding="utf-8").rstrip()
        + "\n\n"
        + THEME_FRAGMENT.read_text(encoding="utf-8")
    )
    out.write_text(header + body, encoding="utf-8")
    print(f"generated config -> {out.relative_to(ROOT)}", flush=True)
    return out


def assemble_target(target: dict) -> None:
    name = target["name"]
    docs_out = BUILD / name / "docs"
    if docs_out.exists():
        shutil.rmtree(docs_out)
    docs_out.mkdir(parents=True)

    # Shared theme assets first (stylesheets, favicon), then the target's own
    # pages, then the product docs on top.
    if not SHARED.is_dir():
        sys.exit(f"error: missing shared assets directory: {SHARED}")
    shutil.copytree(SHARED, docs_out, dirs_exist_ok=True)
    seeded = [SHARED]

    content_dir = target.get("content_dir")
    if content_dir and content_dir.is_dir():
        shutil.copytree(content_dir, docs_out, dirs_exist_ok=True)
        seeded.append(content_dir)
    print(
        f"[{name}] seeded docs_dir from "
        + " + ".join(str(p.relative_to(ROOT)) for p in seeded),
        flush=True,
    )

    for src in target["sources"]:
        project_root, label = resolve_source(name, src)
        md_src = project_root / src["src_subdir"]
        if not md_src.is_dir():
            sys.exit(f"error: {src['name']} markdown not found at {md_src}")
        md_dest = docs_out / src["dest_subdir"]
        shutil.copytree(md_src, md_dest, dirs_exist_ok=True)
        print(
            f"[{name}] copied {src['name']} docs from {label} -> "
            f"{md_dest.resolve().relative_to(ROOT)}",
            flush=True,
        )

    generate_config(name)
    print(f"[{name}] docs_dir assembled at {docs_out.relative_to(ROOT)}", flush=True)


def main() -> None:
    if not CONTENT.is_dir():
        sys.exit(f"error: missing content directory: {CONTENT}")
    for target in TARGETS:
        assemble_target(target)


if __name__ == "__main__":
    main()
