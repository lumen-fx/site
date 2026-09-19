#!/usr/bin/env python3
"""Fetch the landing pages' code examples from the product repos.

The landings show code. Hand-copied code goes stale, so every example whose
source is addressable as a file is pulled from the product repo at build time
and written into a generated TypeScript module the landing imports.

Three source shapes are supported:

  whole file      a runnable program, taken verbatim
  fenced block    the first fenced code block under a heading in a markdown
                  file, or the first fenced block in a Rust doc comment
  doc comment     the first fenced block in a Rust `///` comment

An example may come from a repo other than the landing's own: each `lumenc new`
template is its own repo under lumen-fx, and the Lumen landing shows the counter
template as the toolchain writes it. A spec names that with `repo`.

The generated modules are committed so `vite build` works from a fresh clone,
and CI regenerates them before every deploy, so what ships is always current.
Edit the product repo, not the generated file.

A missing source file or a missing fence exits non-zero and fails the build.
That is the point: it is how a moved example gets noticed.

Run this before `vite build` (scripts/build.sh and CI both do).

Environment overrides:
  LUMEN_REPO / LUMEN_REV        git URL and rev for lumen    (default: main)
  CANDELA_REPO / CANDELA_REV    git URL and rev for candela  (default: main)
  TEMPLATE_BASE / TEMPLATE_REV  owner URL and rev for the template repos
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

# One repo per `lumenc new` template, so a template is a real app a visitor can
# clone rather than a string baked into the compiler.
TEMPLATE_BASE = os.environ.get("TEMPLATE_BASE", "https://github.com/lumen-fx")
TEMPLATE_REV = os.environ.get("TEMPLATE_REV", "main")

# What each landing shows, and where it comes from.
#
#   const     the exported name in the generated module
#   path      the source file, relative to that repo's root
#   doc       a documentation page, relative to that product's docs_dir; use
#             this instead of path so a product can move its markdown
#   kind      "file" (verbatim), "fence" (markdown), or "rustdoc"
#   after     for "fence": the heading line the block must follow
#   repo      optional: a template repo to read from instead of the landing's
#             own product repo
LUMEN_EXAMPLES = [
    # The counter template, as `lumenc new app counter` writes it to disk. The
    # landing shows all three of its files, so what a visitor reads is what the
    # toolchain scaffolds.
    {"const": "COUNTER_LMN", "repo": "counter", "path": "src/main.lmn", "kind": "file"},
    {"const": "COUNTER_CSS", "repo": "counter", "path": "src/main.css", "kind": "file"},
    {"const": "COUNTER_CDL", "repo": "counter", "path": "src/main.cdl", "kind": "file"},
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

# The Candela landing runs its samples in the browser, so every one of these has
# to be a whole program that compiles: a `fn main`, and no `import`, because the
# WebAssembly build has no file system to import from. They are the language
# documentation's own examples, so the page and the docs cannot drift apart.
CANDELA_EXAMPLES = [
    {
        "const": "TOUR_METHODS",
        "doc": "language/methods.md",
        "kind": "fence",
        "after": "## impl blocks",
    },
    {
        "const": "TOUR_ENUMS",
        "doc": "language/enums.md",
        "kind": "fence",
        "after": "## Matching",
    },
    {
        "const": "TOUR_FUNCTIONS",
        "doc": "language/functions.md",
        "kind": "fence",
        "after": "## Functions as arguments",
    },
    {
        "const": "TOUR_MAPS",
        "doc": "language/collections.md",
        "kind": "fence",
        "after": "## Maps",
    },
    {
        "const": "TOUR_GENERICS",
        "doc": "language/generics.md",
        "kind": "fence",
        "after": "# Generics",
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


def docs_dir(root: Path, label: str) -> Path:
    """The product's markdown directory, relative to its repo root.

    A product keeps its docs project in docs/ and names the directory holding
    the markdown in docs/zensical.toml, the way Zensical reads it. Lumen and
    candela both set it to src; the Zensical default is docs. Asking the
    product means a rename there needs no change here.
    """
    import tomllib

    config = root / "docs" / "zensical.toml"
    if not config.is_file():
        sys.exit(f"error: {label}: no docs/zensical.toml at {config}")
    with config.open("rb") as fh:
        data = tomllib.load(fh)
    return Path("docs") / data.get("project", {}).get("docs_dir", "docs")


def spec_path(root: Path, spec: dict, label: str) -> Path:
    """The source file for one entry, relative to its repo root."""
    if "doc" in spec:
        return docs_dir(root, label) / spec["doc"]
    return Path(spec["path"])


def source_label(spec: dict, rel: Path) -> str:
    """Where a constant came from, for the comment above it."""
    if "repo" in spec:
        return f"{spec['repo']}: {rel}"
    return str(rel)


def read_source(root: Path, spec: dict, rel: Path, label: str) -> str:
    src = root / rel
    if not src.is_file():
        sys.exit(f"error: {label}: {rel} not found; the example moved or was deleted")
    text = src.read_text(encoding="utf-8")

    if spec["kind"] == "file":
        return text.rstrip("\n")
    if spec["kind"] == "fence":
        return extract_fence(text, spec["after"], str(rel), label)
    if spec["kind"] == "rustdoc":
        return extract_rustdoc(text, str(rel), label)
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
        "// Each example is a file in a product repo, read at build time. The\n",
        "// comment above a constant is where it came from; change it there.\n",
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
        checkouts: dict[str, Path] = {}

        def checkout_of(name: str, repo: str, rev: str) -> Path:
            """Clone once per repo. A template repo can feed more than one
            example, and the landings may come to share one."""
            if name not in checkouts:
                dest = Path(tmp) / name
                clone(repo, rev, dest)
                checkouts[name] = dest
            return checkouts[name]

        for label, repo, rev, specs, out in targets:
            own = checkout_of(label, repo, rev)
            entries = []
            for spec in specs:
                root = own
                if "repo" in spec:
                    root = checkout_of(
                        spec["repo"], f"{TEMPLATE_BASE}/{spec['repo']}", TEMPLATE_REV
                    )
                rel = spec_path(root, spec, label)
                entries.append(
                    (spec["const"], source_label(spec, rel), read_source(root, spec, rel, label))
                )
            emit(ROOT / out, label, rev, entries)


if __name__ == "__main__":
    main()
