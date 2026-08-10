#!/usr/bin/env python3
"""Fetch the landing pages' code examples from the product repos.

The landings show code. Hand-copied code goes stale, so every example whose
source is addressable as a file is pulled from the product repo at build time
and written into a generated TypeScript module the landing imports.

Two source shapes are supported:

  whole file      a runnable program, taken verbatim
  fenced block    the first fenced code block under a heading in a markdown
                  file, or the first fenced block in a Rust doc comment

The generated modules are committed so `vite build` works from a fresh clone,
and CI regenerates them before every deploy, so what ships is always current.
Edit the product repo, not the generated file.

A missing source file or a missing fence exits non-zero and fails the build.
That is the point: it is how a moved example gets noticed.

Run this before `vite build` (scripts/build.sh and CI both do).

Environment overrides:
  LUMEN_REPO / LUMEN_REV        git URL and rev for lumen   (default: main)
  CANDELA_REPO / CANDELA_REV    git URL and rev for candela (default: main)
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LUMEN_REPO = os.environ.get("LUMEN_REPO", "https://github.com/lumen-fx/lumen")
LUMEN_REV = os.environ.get("LUMEN_REV", "main")
CANDELA_REPO = os.environ.get("CANDELA_REPO", "https://github.com/lumen-fx/candela")
CANDELA_REV = os.environ.get("CANDELA_REV", "main")

# What each landing shows, and where it comes from.
#
#   const   the exported name in the generated module
#   path    the source file, relative to the product repo root
#   kind    "file" (verbatim), "fence" (markdown), or "rustdoc"
#   after   for "fence": the heading line the block must follow
LUMEN_EXAMPLES = [
    {
        "const": "RUST_SDK",
        "path": "sdk/rust/src/lib.rs",
        "kind": "rustdoc",
    },
    {
        "const": "PYTHON_SDK",
        "path": "sdk/python/README.md",
        "kind": "fence",
        "after": "## Quickstart",
    },
    {
        "const": "CPP_SDK",
        "path": "sdk/cpp/README.md",
        "kind": "fence",
        "after": "## Quickstart",
    },
]

CANDELA_EXAMPLES = [
    {
        "const": "LIST_HOF",
        "path": "libs/std/tests/test_list_hof.cdl",
        "kind": "file",
    },
]


def run(cmd: list, **kw) -> None:
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def clone(repo: str, rev: str, dest: Path) -> None:
    """Shallow-fetch `repo` at `rev` into `dest`, mirroring the install fetchers."""
    dest.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, GIT_LFS_SKIP_SMUDGE="1")
    run(["git", "init", "-q", dest])
    run(["git", "-C", dest, "remote", "add", "origin", repo])
    run(["git", "-C", dest, "fetch", "-q", "--depth", "1", "origin", rev], env=env)
    run(["git", "-C", dest, "checkout", "-q", "FETCH_HEAD"], env=env)


def read_source(root: Path, spec: dict, label: str) -> str:
    src = root / spec["path"]
    if not src.is_file():
        sys.exit(f"error: {label}: {spec['path']} not found; the example moved or was deleted")
    text = src.read_text(encoding="utf-8")

    if spec["kind"] == "file":
        return text.rstrip("\n")
    if spec["kind"] == "fence":
        return extract_fence(text, spec["after"], spec["path"], label)
    if spec["kind"] == "rustdoc":
        return extract_rustdoc(text, spec["path"], label)
    sys.exit(f"error: {label}: unknown source kind {spec['kind']!r}")


def extract_fence(text: str, after: str, path: str, label: str) -> str:
    """The first fenced block following the `after` heading."""
    lines = text.splitlines()
    try:
        start = next(i for i, ln in enumerate(lines) if ln.strip() == after)
    except StopIteration:
        sys.exit(f"error: {label}: heading {after!r} not found in {path}")

    body: list[str] = []
    inside = False
    for line in lines[start + 1 :]:
        if line.startswith("```"):
            if inside:
                return "\n".join(body).rstrip("\n")
            inside = True
            continue
        if inside:
            body.append(line)
    sys.exit(f"error: {label}: no closing code fence after {after!r} in {path}")


def extract_rustdoc(text: str, path: str, label: str) -> str:
    """The first fenced block inside a `///` doc comment.

    Doc-comment markers and the hidden `#` lines rustdoc strips from rendered
    output are removed, leaving the code a reader sees on docs.rs.
    """
    body: list[str] = []
    inside = False
    for raw in text.splitlines():
        stripped = raw.strip()
        if not stripped.startswith("///"):
            continue
        line = re.sub(r"^\s*///\s?", "", raw)
        if line.lstrip().startswith("```"):
            if inside:
                return "\n".join(body).rstrip("\n")
            inside = True
            continue
        if inside and not line.lstrip().startswith("# "):
            body.append(line)
    sys.exit(f"error: {label}: no doc-comment code fence found in {path}")


def emit(out: Path, label: str, rev: str, entries: list[tuple[str, str, str]]) -> None:
    """Write the generated module. `entries` is (const, path, code)."""
    parts = [
        "// Generated by scripts/fetch_examples.py. Do not edit.\n",
        f"// Each example is a file in the {label} repo, read at build time. The\n",
        "// comment above a constant is its path there; change it in that repo.\n",
        "\n",
    ]
    for const, path, code in entries:
        parts.append(f"// {path}\n")
        parts.append(f"export const {const} = {json.dumps(code)};\n\n")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("".join(parts).rstrip("\n") + "\n", encoding="utf-8")
    names = ", ".join(c for c, _, _ in entries)
    print(f"{label} examples @ {rev} -> {out.relative_to(ROOT)} ({names})", flush=True)


def main() -> None:
    targets = [
        ("lumen", LUMEN_REPO, LUMEN_REV, LUMEN_EXAMPLES, "apps/lumen/src/generated/examples.ts"),
        ("candela", CANDELA_REPO, CANDELA_REV, CANDELA_EXAMPLES, "apps/candela/src/generated/examples.ts"),
    ]
    with tempfile.TemporaryDirectory() as tmp:
        for label, repo, rev, specs, out in targets:
            checkout = Path(tmp) / label
            clone(repo, rev, checkout)
            entries = [(s["const"], s["path"], read_source(checkout, s, label)) for s in specs]
            emit(ROOT / out, label, rev, entries)


if __name__ == "__main__":
    main()
