# lumenfx.dev

Source for the Lumen and Candela websites.

- `apps/lumen/` builds the Lumen landing at `lumenfx.dev`.
- `apps/candela/` builds the Candela landing at `candela.lumenfx.dev`.
- The docs build puts the Lumen and Candela docs under one search at
  `docs.lumenfx.dev`.

The landings are React (Vite, TypeScript, Bootstrap). The docs use
[Zensical](https://zensical.org). Everything builds to static files.

## Build

Needs [uv](https://docs.astral.sh/uv/), Node with npm, and git.

```sh
scripts/build.sh
```

Outputs `dist/apex/`, `dist/candela/`, and `dist/docs/`.

Work on one landing with hot reload:

```sh
npm --prefix apps/lumen install && npm --prefix apps/lumen run dev
```

The Candela docs and the `install.sh` on the Candela landing are pulled from the
[candela repo](https://github.com/lumen-fx/candela) at build time, so they are
not committed here. `CANDELA_REV` picks the revision to pull (default `main`).

The Lumen installer behind `curl -fsSL https://lumenfx.dev/install.sh | sh` is
committed here, in `apps/lumen/public/`, along with the release manifest it
reads from `/install/manifest.json`. Cutting a Lumen release means updating that
manifest; the steps are in the release checklist in the lumen repo.

## Deploy

Pushing to `main` builds all three sites and deploys them to Cloudflare Pages.
Pull requests build but do not deploy. Custom domains are attached in the
Cloudflare dashboard.

## Notes

The Lumen docs are still an mdBook, so the `/lumen/` section on the docs site is
a stub. The logo marks are placeholders. The per-target build steps live in
`scripts/` and `.github/workflows/build.yml`.
