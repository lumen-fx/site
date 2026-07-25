# lumenfx.dev site

The marketing site and unified documentation for Lumen and Candela. One
[Zensical](https://zensical.org) project builds a single static site that serves
three host-routed domains.

This is an early scaffold. The apex landing, the Lumen docs slot, and all logo
art are placeholders (see [Placeholders](#placeholders)).

## What is here

- Apex landing (Lumen-focused): `content/index.md`.
- Candela landing (standalone-language pitch): `content/candela/index.md`.
- Lumen docs placeholder: `content/lumen/index.md`.
- Shared theme (palette, features, markdown extensions), carried from the
  Candela docs config: `zensical.toml` and `content/stylesheets/extra.css`.
- The docs assembler: `scripts/prebuild.py`.
- CI build: `.github/workflows/build.yml`.

Product docs are **not** committed here. They are fetched fresh from each
product repo at build time.

## Build model

Zensical builds from a single `docs_dir`. This repo does not keep product docs
in git; instead a prebuild step assembles the `docs_dir` from two sources:

1. `content/` -- the site-owned pages (landings, the Lumen placeholder, theme
   assets), copied verbatim.
2. Candela docs -- cloned fresh from `github.com/lumen-fx/candela` and copied to
   `candela/docs` in the assembled tree.

The assembled tree lands in `build/docs` (the Zensical `docs_dir`) and the built
site in `dist/`. Both are generated and gitignored.

```
content/            docs_dir source (committed)
  index.md          -> /            apex Lumen landing
  candela/index.md  -> /candela/    Candela landing
  lumen/index.md    -> /lumen/      Lumen docs placeholder
build/docs/         assembled docs_dir (generated)
  candela/docs/     -> /candela/docs/   Candela docs, cloned fresh
dist/               static output (generated)
```

## Build locally

Requires [uv](https://docs.astral.sh/uv/) and `git`.

```sh
scripts/build.sh
```

That syncs dependencies, runs the prebuild assembler (which clones the Candela
docs), and runs `zensical build --strict`. The result is in `dist/`.

To iterate on the site-owned pages with live reload after an initial assemble:

```sh
uv run python scripts/prebuild.py
uv run zensical serve
```

Editing files under `content/` is picked up on rebuild. Product docs come from
the clone, so re-run `prebuild.py` to refresh them.

## Pinning a docs revision

The prebuild clones each product repo at a rev, defaulting to `main`. Override
per source with an environment variable:

```sh
CANDELA_REV=v0.2.0 scripts/build.sh     # a tag
CANDELA_REV=<sha>   scripts/build.sh     # a commit
CANDELA_REPO=https://github.com/you/candela-fork scripts/build.sh
```

A docs release is a two-step flow: cut the docs in the product repo, then bump
`CANDELA_REV` (in CI, via the `candela_rev` workflow input or by changing the
default in `.github/workflows/build.yml`) so the site pins that rev.

## Adding Lumen docs later

Lumen docs are an mdbook today and are not migrated to Zensical. The `/lumen/`
slot is a placeholder. When the Lumen docs become Zensical markdown, add a
source entry in `scripts/prebuild.py` (a `git clone lumen-fx/lumen` plus a copy,
templated next to the Candela entry) and add the nav in `zensical.toml`. No
structural change to the site is needed.

## Domains

One static build serves three host-routed subdomains. DNS and hosting are not
configured here; this is the intended routing:

| Domain                 | Serves                          | Path in `dist/`     |
| ---------------------- | ------------------------------- | ------------------- |
| `lumenfx.dev`          | Apex Lumen landing              | `/`                 |
| `candela.lumenfx.dev`  | Candela landing                 | `/candela/`         |
| `docs.lumenfx.dev`     | Unified docs (Lumen + Candela)  | `/lumen/`, `/candela/docs/` |

The host maps each subdomain's root to the path above (for example, a rewrite
from the `candela.lumenfx.dev` root to `/candela/`). Cross-links between
sections use absolute paths within the same tree.

## Deploy

CI builds `dist/` and uploads it as an artifact on every push to `main`. The
deploy target is not chosen yet (Cloudflare Pages or GitHub Pages); wiring the
deploy job and the subdomain routing above is a TODO in
`.github/workflows/build.yml`.

## Placeholders

- Apex landing copy, layout, and structure are a first pass.
- The `/lumen/` docs section is a stub until the Lumen docs move to Zensical.
- Logos are not finalized. The header uses the `Lumen FX` text wordmark and the
  favicon is a placeholder image. Set a real `logo` and `favicon` in
  `zensical.toml` once branding lands.
