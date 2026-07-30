# lumenfx.dev

Source for the Lumen and Candela websites.

- `apps/lumen/` builds the Lumen landing at `lumenfx.dev`.
- `apps/candela/` builds the Candela landing at `candela.lumenfx.dev`.
- The docs build puts the Lumen and Candela docs under one search at
  `docs.lumenfx.dev`: Lumen at the root, Candela under `/candela/`.

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

Both doc sets live in their product repos, not here. A local build reads them
from checkouts on disk; setting `LUMEN_REV` or `CANDELA_REV` pulls that product
fresh from its repo instead, which is what CI does. `scripts/prebuild.py` lists
the variables that point at other sources. The `install.sh` on the Candela
landing is fetched from the candela repo the same way.

## Deploy

Pushing to `main` builds all three sites and deploys them to Cloudflare Pages.
Pull requests build but do not deploy. Custom domains are attached in the
Cloudflare dashboard.

## Notes

The logo marks are placeholders. The per-target build steps live in `scripts/`
and `.github/workflows/build.yml`.
