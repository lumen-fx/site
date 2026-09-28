#!/usr/bin/env python3
"""Render a product's migration guides into the docs build.

Lumen and candela keep one markdown fragment per breaking change under
docs/migration/ in their repos, outside the product's own docs_dir:

  docs/migration/vA.B.C/<slug>.md   the breaks that shipped in vA.B.C
  docs/migration/unreleased/<slug>.md
                                    the breaks since the last release

In the tree of a release tag, unreleased/ holds that release's breaks; the
product's release job moves them into vA.B.C/ after the tag publishes. So when
the build reads a vX.Y.Z tag, unreleased/ becomes the vX.Y.Z page. When it
reads anything else (main, a branch, a SHA, a local checkout), unreleased/
becomes a page titled as unreleased.

Each fragment starts with `# <the break>`. A version page is `# Migrating to
<version>` followed by every fragment in slug order, headings demoted one
level. migration/index.md lists the versions, newest first. A version with no
fragments gets no page, and a product with no docs/migration/ gets nothing.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

VERSION = re.compile(r"^v(\d+)\.(\d+)\.(\d+)$")
FENCE = re.compile(r"^\s*(```|~~~)")
UNRELEASED = "unreleased"


def _fragments(directory: Path) -> list[Path]:
    return sorted(p for p in directory.glob("*.md") if p.is_file())


def _title(fragment: Path) -> str:
    """The fragment's first-line heading, without the leading '# '."""
    for line in fragment.read_text(encoding="utf-8").splitlines():
        if line.strip():
            return line.lstrip("#").strip()
    return fragment.stem


def _demote(text: str) -> str:
    """Push every ATX heading down one level, leaving code fences alone."""
    out = []
    fence = None
    for line in text.splitlines():
        m = FENCE.match(line)
        if m:
            if fence is None:
                fence = m.group(1)
            elif m.group(1) == fence:
                fence = None
        elif fence is None and re.match(r"^#{1,5}(\s|$)", line):
            line = "#" + line
        out.append(line)
    return "\n".join(out).strip() + "\n"


def _version_key(name: str) -> tuple[int, int, int]:
    m = VERSION.match(name)
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)))


def _page(heading: str, fragments: list[Path]) -> str:
    parts = [f"# {heading}\n"]
    for fragment in fragments:
        parts.append(_demote(fragment.read_text(encoding="utf-8")))
    return "\n".join(parts)


def render(repo_root: Path, rev: str | None, out_dir: Path) -> list[str]:
    """Write the migration pages for one product into out_dir/migration/.

    repo_root is the product checkout (the parent of its docs/ project). rev is
    the tag or branch it was taken from, or None for a local checkout. Returns
    the written pages as paths relative to out_dir, index first, for the nav;
    an empty list when there is nothing to render.
    """
    source = repo_root / "docs" / "migration"
    if not source.is_dir():
        return []

    # (page stem, heading, fragments), newest first once sorted.
    released = []
    for child in source.iterdir():
        if not child.is_dir() or child.name == UNRELEASED:
            continue
        if not VERSION.match(child.name):
            sys.exit(f"error: {child} is not a vX.Y.Z version directory")
        fragments = _fragments(child)
        if fragments:
            released.append((child.name, f"Migrating to {child.name}", fragments))
    released.sort(key=lambda v: _version_key(v[0]), reverse=True)

    pending = _fragments(source / UNRELEASED)
    versions = list(released)
    if pending:
        if rev and VERSION.match(rev):
            if any(stem == rev for stem, _, _ in released):
                sys.exit(
                    f"error: {source} has both unreleased/ fragments and a {rev}/ "
                    f"directory at tag {rev}; the tag's guide is ambiguous"
                )
            versions.insert(0, (rev, f"Migrating to {rev}", pending))
        else:
            versions.insert(
                0, (UNRELEASED, "Migrating to the next release (unreleased)", pending)
            )
    if not versions:
        return []

    dest = out_dir / "migration"
    if dest.exists():
        sys.exit(f"error: {dest} already exists; the product's docs define a migration/ page")
    dest.mkdir(parents=True)

    index = [
        "# Migration guides\n",
        "Each page lists the breaking changes in one release and what to change "
        "in your code when you upgrade to it. Read every page between the version "
        "you use and the one you move to.\n",
    ]
    pages = ["migration/index.md"]
    for stem, heading, fragments in versions:
        (dest / f"{stem}.md").write_text(_page(heading, fragments), encoding="utf-8")
        pages.append(f"migration/{stem}.md")
        label = "Unreleased" if stem == UNRELEASED else stem
        index.append(f"- [{label}]({stem}.md)")
        for fragment in fragments:
            index.append(f"    - {_title(fragment)}")
    (dest / "index.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    return pages
