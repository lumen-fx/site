# lumenfx.dev site

The marketing landings and documentation for Lumen and Candela. Three
independent [Zensical](https://zensical.org) static builds, each served at a
domain root, sharing one theme.

This is an early scaffold. The apex landing copy, the Lumen docs slot, and all
logo art are placeholders (see [Placeholders](#placeholders)).

## The three targets

Each target is a self-contained static site rooted at `/`, with its own
`site_url`, built independently and deployed to its own Cloudflare Pages project.

| Target    | Domain                | Pages project     | Serves                                     |
| --------- | --------------------- | ----------------- | ------------------------------------------ |
| `apex`    | `lumenfx.dev`         | `lumenfx`         | The Lumen landing                          |
| `candela` | `candela.lumenfx.dev` | `lumenfx-candela` | The Candela landing                        |
| `docs`    | `docs.lumenfx.dev`    | `lumenfx-docs`    | Unified docs (Candela + Lumen), one search |

Cross-links between targets are absolute URLs (for example the apex "Explore
Candela" button points at `https://candela.lumenfx.dev/`), because each target
is a separate site.

The `docs` target is the single build that carries both products' docs so search
is unified across them:

- `/candela/...` -- the Candela docs, cloned fresh from `lumen-fx/candela` at
  build time.
- `/lumen/...` -- a placeholder stub. The Lumen docs are an mdbook today and are
  not migrated yet.

## What is here

- `content/shared/` -- theme assets (stylesheets, favicon) copied into every
  target.
- `content/apex/index.md` -- the Lumen landing.
- `content/candela/index.md` -- the Candela landing.
- `content/docs/` -- the docs home (`index.md`) and the Lumen docs stub
  (`lumen/index.md`).
- `config/theme.toml` -- the shared theme (palette, features, Markdown
  extensions), defined once.
- `config/{apex,candela,docs}.toml` -- each target's `[project]` block
  (`site_url`, `docs_dir`, `site_dir`, nav).
- `scripts/prebuild.py` -- assembles each target's docs_dir and generates its
  config.
- `.github/workflows/build.yml` -- CI build and deploy.

Product docs are **not** committed here. They are fetched fresh from each
product repo at build time.

## Build model

Zensical builds one site per config file. This repo keeps the theme in one
place and generates a full config per target:

1. `scripts/prebuild.py` assembles each target's docs_dir under
   `build/<target>/docs` from `content/shared/` plus the target's own
   `content/<target>/`, and for the `docs` target it clones the Candela docs
   into `build/docs/docs/candela`.
2. For each target it writes `zensical.<target>.toml` at the repo root by
   concatenating `config/<target>.toml` in front of `config/theme.toml`. These
   generated files are gitignored.
3. `zensical build -f zensical.<target>.toml` builds each target into
   `dist/<target>/`.

```
content/
  shared/           theme assets, copied into every target
  apex/index.md     -> apex   /            Lumen landing
  candela/index.md  -> candela/            Candela landing
  docs/index.md     -> docs   /            docs home
  docs/lumen/       -> docs   /lumen/      Lumen docs stub
config/
  theme.toml        shared theme (defined once)
  apex.toml         apex [project] block + nav
  candela.toml      candela [project] block + nav
  docs.toml         docs [project] block + nav
build/<target>/docs assembled docs_dir (generated)
  docs/candela/     -> docs /candela/      Candela docs, cloned fresh
dist/<target>/      static output (generated)
```

## Build locally

Requires [uv](https://docs.astral.sh/uv/) and `git`.

```sh
scripts/build.sh
```

That syncs dependencies, runs the prebuild (which clones the Candela docs and
generates the three configs), and builds all three targets. The results are in
`dist/apex/`, `dist/candela/`, and `dist/docs/`.

To build or serve a single target after an initial prebuild:

```sh
uv run python scripts/prebuild.py
uv run zensical build --strict -f zensical.docs.toml   # build just docs
uv run zensical serve -f zensical.apex.toml            # serve just apex
```

Editing files under `content/` or `config/` is picked up by re-running the
prebuild. Product docs come from the clone, so re-run `prebuild.py` to refresh
them.

## Pinning the Candela docs revision

The `docs` build clones the Candela docs at a rev, defaulting to `main`.
Override it with an environment variable:

```sh
CANDELA_REV=v0.2.0 scripts/build.sh     # a tag
CANDELA_REV=<sha>   scripts/build.sh     # a commit
CANDELA_REPO=https://github.com/you/candela-fork scripts/build.sh
```

A docs release is a two-step flow: cut the docs in `lumen-fx/candela`, then bump
`CANDELA_REV` -- in CI via the `candela_rev` workflow_dispatch input, or by
changing the default in `.github/workflows/build.yml` so every push pins that
rev.

## Adding Lumen docs later

The Lumen docs are an mdbook today and are not migrated to Zensical, so the
`/lumen/` slot on the `docs` target is a placeholder. When they become Zensical
markdown, add one clone entry to the `docs` target's `clones` list in
`scripts/prebuild.py` (a `git clone lumen-fx/lumen` plus a copy, templated next
to the Candela entry) and add the nav in `config/docs.toml`. No other structural
change is needed.

## Deploy

CI builds all three targets and deploys each to its Cloudflare Pages project on
push to `main` and on manual dispatch. Pull requests only build to validate;
they do not deploy. The projects are pure static -- no Pages Functions, no
`_middleware`, no Workers.

The deploy uses org-level secrets: `CLOUDFLARE_ACCOUNT` (account id) and
`CLOUDFLARE_API_KEY` (an API token with Account > Cloudflare Pages > Edit).
Each project is created on first deploy if it does not exist.

The custom domains (`lumenfx.dev`, `candela.lumenfx.dev`, `docs.lumenfx.dev`)
are attached to their Pages projects in the Cloudflare dashboard by the owner;
CI does not manage domains.

## Placeholders

- The apex landing copy, layout, and structure are a first pass.
- The `/lumen/` docs section is a stub until the Lumen docs move to Zensical.
- Logos are not finalized. The header uses the site_name text wordmark and the
  favicon is a placeholder image. Set a real `logo` and `favicon` in
  `config/theme.toml` once branding lands.
