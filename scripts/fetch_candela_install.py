#!/usr/bin/env python3
"""Fetch candela's install.sh and place it in the Candela landing's public dir.

The Candela landing hosts the installer itself so `curl -fsSL
https://candela.lumenfx.dev/install.sh | sh` works. install.sh is the source of
truth in the candela repo; it is never committed here. This clones the candela
repo at a rev (branch, tag, or SHA) and copies install.sh to
apps/candela/public/install.sh, from where `vite build` copies it to the dist
root.

Run this before `vite build` (scripts/build.sh and CI both do). Mirrors the
docs prebuild's fresh-clone model.

Environment overrides:
  CANDELA_REPO   git URL for candela        (default: the public GitHub repo)
  CANDELA_REV    branch, tag, or commit SHA (default: main)
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "apps" / "candela" / "public"
REPO = os.environ.get("CANDELA_REPO", "https://github.com/lumen-fx/candela")
REV = os.environ.get("CANDELA_REV", "main")


def run(cmd: list, **kw) -> None:
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        dest = Path(tmp) / "candela"
        dest.mkdir()
        run(["git", "init", "-q", dest])
        run(["git", "-C", dest, "remote", "add", "origin", REPO])
        run(["git", "-C", dest, "fetch", "-q", "--depth", "1", "origin", REV])
        run(["git", "-C", dest, "checkout", "-q", "FETCH_HEAD"])
        src = dest / "install.sh"
        if not src.is_file():
            sys.exit(f"error: install.sh not found in candela repo at rev {REV}")
        out = PUBLIC / "install.sh"
        shutil.copyfile(src, out)
        out.chmod(0o755)
        print(f"packaged install.sh @ {REV} -> {out.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    main()
