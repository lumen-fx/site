# lumenfx.dev site

The marketing landings and documentation for Lumen and Candela. Three
independent static builds, each served at a domain root and deployed to its own
Cloudflare Pages project.

Two build styles live here:

- The **landings** are bespoke custom static sites, free to look however they
  should. Both are Vite + React + TypeScript apps styled with Bootstrap: the
  Lumen landing at the apex (`apps/lumen/`) and the Candela landing
  (`apps/candela/`).
- The **docs** are [Zensical](https://zensical.org): one unified build carrying
  both products' docs so search spans them.

This is an early scaffold. The Lumen docs slot is a placeholder, and the logo art
is a placeholder (see [Placeholders](#placeholders)).

## The three targets

| Target    | Domain                | Pages project     | Build          | Serves                     |
| --------- | --------------------- | ----------------- | -------------- | -------------------------- |
| `apex`    | `lumenfx.dev`         | `lumenfx`         | Vite + React   | The Lumen landing          |
| `candela` | `candela.lumenfx.dev` | `lumenfx-candela` | Vite + React   | The Candela landing        |
| `docs`    | `docs.lumenfx.dev`    | `lumenfx-docs`    | Zensical       | Unified docs, one search   |

Each target is a self-contained static site rooted at `/`, built independently
into `dist/<target>/`. Cross-links between targets are absolute URLs (for
example the Candela landing's "Get started" button points at
`https://docs.lumenfx.dev/candela/`), because each target is a separate site.

The `docs` target carries both products' docs so search is unified:

- `/candela/...` -- the Candela docs, cloned fresh from `lumen-fx/candela` at
  build time.
- `/lumen/...` -- a placeholder stub. The Lumen docs are an mdbook today and are
  not migrated yet.

## What is here

- `apps/lumen/` -- the Lumen landing at the apex: a Vite + React + TypeScript app
  styled with Bootstrap, built to `dist/apex/`. `public/favicon.svg` is the Lumen
  placeholder mark.
- `apps/candela/` -- the Candela landing: a Vite + React + TypeScript app styled
  with Bootstrap. `public/favicon.svg` is the Candela placeholder mark;
  `public/install.sh` is fetched fresh, not committed.
- `content/shared/` -- Zensical theme assets (stylesheets, favicon) copied into
  the docs target.
- `content/docs/` -- the docs home (`index.md`) and the Lumen docs stub
  (`lumen/index.md`).
- `config/theme.toml` -- the shared Zensical theme, defined once.
- `config/docs.toml` -- the docs target's `[project]` block.
- `scripts/prebuild.py` -- assembles the docs docs_dir and generates its config
  (clones the Candela docs).
- `scripts/fetch_candela_install.py` -- clones the candela repo and copies its
  `install.sh` into the Candela landing so it is served at
  `candela.lumenfx.dev/install.sh`.
- `scripts/build.sh` -- builds all three targets locally.
- `.github/workflows/build.yml` -- CI build and deploy.

Product docs and the installer are **not** committed here. They are fetched
fresh from the candela repo at build time.

## Build model

Each target builds into `dist/<target>/`, ready for `wrangler pages deploy`.

**docs (Zensical).** `scripts/prebuild.py` assembles the docs docs_dir under
`build/docs/docs` from `content/shared/` plus `content/docs/`, cloning the
Candela docs into `build/docs/docs/candela`. It then writes `zensical.docs.toml`
at the repo root (the `config/docs.toml` block in front of `config/theme.toml`).
`zensical build -f zensical.docs.toml` builds it into `dist/docs/`.

**apex / lumen (Vite + React).** `vite build` in `apps/lumen` produces a fully
static, client-rendered SPA into `dist/apex/`, copying everything in `public/`
(the favicon) to the output root.

**candela (Vite + React).** `scripts/fetch_candela_install.py` clones the
candela repo and drops its `install.sh` into `apps/candela/public/`. `vite build`
then produces a fully static, client-rendered SPA into `dist/candela/`, copying
everything in `public/` (the installer and the favicon) to the output root.

## Build locally

Requires [uv](https://docs.astral.sh/uv/), Node.js (with npm), and `git`.

```sh
scripts/build.sh
```

That builds all three targets into `dist/apex/`, `dist/candela/`, and
`dist/docs/`.

To work on just the Lumen landing with hot reload:

```sh
npm --prefix apps/lumen install
npm --prefix apps/lumen run dev
```

The Candela landing works the same way, once its installer is fetched:

```sh
uv run python scripts/fetch_candela_install.py   # once, to get install.sh
npm --prefix apps/candela install
npm --prefix apps/candela run dev
```

To build or serve the docs target after a prebuild:

```sh
uv run python scripts/prebuild.py
uv run zensical build --strict -f zensical.docs.toml   # build docs
uv run zensical serve -f zensical.docs.toml            # serve docs
```

## Pinning the Candela revision

Both the Candela docs (docs target) and the packaged `install.sh` (candela
target) are fetched from the candela repo at a rev, defaulting to `main`.
Override it with an environment variable:

```sh
CANDELA_REV=v0.2.0 scripts/build.sh     # a tag
CANDELA_REV=<sha>   scripts/build.sh     # a commit
CANDELA_REPO=https://github.com/you/candela-fork scripts/build.sh
```

In CI the same rev flows through the `candela_rev` workflow_dispatch input, or by
changing the default in `.github/workflows/build.yml`.

## Adding Lumen docs later

The Lumen docs are an mdbook today and are not migrated to Zensical, so the
`/lumen/` slot on the `docs` target is a placeholder. When they become Zensical
markdown, add one clone entry to the docs target's `clones` list in
`scripts/prebuild.py` and add the nav in `config/docs.toml`.

## Deploy

CI builds all three targets and deploys each to its Cloudflare Pages project on
push to `main` and on manual dispatch. Pull requests only build to validate;
they do not deploy. The projects are pure static -- no Pages Functions, no
`_middleware`, no Workers.

The deploy uses org-level secrets: `CLOUDFLARE_ACCOUNT` (account id) and
`CLOUDFLARE_API_KEY` (an API token with Account > Cloudflare Pages > Edit). Each
project is created on first deploy if it does not exist. Custom domains are
attached per project in the Cloudflare dashboard by the owner; CI does not manage
domains.

## Placeholders

- The Candela landing favicon (`apps/candela/public/favicon.svg`) is a placeholder
  flame mark, not the final logo. The candela repo already ships a finished flame
  logo (`assets/colored-logo.svg`) that can replace it once branding is settled.
- The Lumen landing favicon (`apps/lumen/public/favicon.svg`) is a placeholder
  aperture mark, not the final logo.
- The docs target still uses the old shared favicon
  (`content/shared/images/favicon.png`), which is keel branding. Replace it when
  the docs get their own mark.
- The Lumen landing copy and layout are a first pass.
- The `/lumen/` docs section is a stub until the Lumen docs move to Zensical.
