# lumenfx.dev site

The web presence for Lumen and Candela: two product landings and a unified
documentation site.

- `apps/lumen/` serves the Lumen landing at `lumenfx.dev`.
- `apps/candela/` serves the Candela landing at `candela.lumenfx.dev`.
- The docs build serves both products at `docs.lumenfx.dev`, with one search
  across them.

The landings are React apps (Vite, TypeScript, Bootstrap) and can look however
they should. The docs are built with [Zensical](https://zensical.org). Each of
the three is a self-contained static site; there is no server, no Pages
Function, and no Worker.

## Build

Requires [uv](https://docs.astral.sh/uv/), Node.js with npm, and git.

```sh
scripts/build.sh
```

This builds all three sites into `dist/apex/`, `dist/candela/`, and
`dist/docs/`.

To work on one landing with hot reload:

```sh
npm --prefix apps/lumen install && npm --prefix apps/lumen run dev
```

The Candela docs and the `install.sh` served from the Candela landing are
pulled from the [candela repo](https://github.com/lumen-fx/candela) at build
time, so they are never committed here. `CANDELA_REV` selects the revision to
pull (defaults to `main`).

## Deploy

A push to `main` builds all three sites and deploys each to its Cloudflare Pages
project. Pull requests build to validate but do not deploy. Custom domains are
attached per project in the Cloudflare dashboard.

## Limitations

The Lumen docs are still an mdBook and are not on the docs site yet, so the
`/lumen/` docs section is a stub. The landing copy and the logo marks are a
first pass.

## Deeper detail

The per-target build steps live in `scripts/` and `.github/workflows/build.yml`.
