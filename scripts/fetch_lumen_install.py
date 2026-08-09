#!/usr/bin/env python3
"""Fetch lumen's install.sh and place it in the Lumen landing's public dir.

The Lumen landing hosts the installer itself so `curl -fsSL
https://lumenfx.dev/install.sh | sh` works. install.sh is the source of
truth in the lumen repo; it is never committed here. This clones the lumen
repo at a rev (branch, tag, or SHA) and copies tools/install.sh to
apps/lumen/public/install.sh, from where `vite build` copies it to the dist
root.

Run this before `vite build` (scripts/build.sh and CI both do). Mirrors the
docs prebuild's fresh-clone model.

Environment overrides:
  LUMEN_REPO   git URL for lumen           (default: the public GitHub repo)
  LUMEN_REV    branch, tag, or commit SHA (default: main)
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "apps" / "lumen" / "public"
REPO = os.environ.get("LUMEN_REPO", "https://github.com/lumen-fx/lumen")
REV = os.environ.get("LUMEN_REV", "main")


def run(cmd: list, **kw) -> None:
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        dest = Path(tmp) / "lumen"
        dest.mkdir()
        # Skip LFS smudge: only tools/install.sh is read, so pointer files
        # are fine and the fetch cannot fail on LFS object availability.
        env = dict(os.environ, GIT_LFS_SKIP_SMUDGE="1")
        run(["git", "init", "-q", dest])
        run(["git", "-C", dest, "remote", "add", "origin", REPO])
        run(["git", "-C", dest, "fetch", "-q", "--depth", "1", "origin", REV], env=env)
        run(["git", "-C", dest, "checkout", "-q", "FETCH_HEAD"], env=env)
        src = dest / "tools" / "install.sh"
        if not src.is_file():
            sys.exit(f"error: tools/install.sh not found in lumen repo at rev {REV}")
        out = PUBLIC / "install.sh"
        shutil.copyfile(src, out)
        out.chmod(0o755)
        print(f"packaged install.sh @ {REV} -> {out.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    main()
