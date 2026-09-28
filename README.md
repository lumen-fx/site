# lumenfx.dev

Source for the Lumen and Candela websites.

- `apps/lumen/` builds the Lumen landing at `lumenfx.dev`.
- `apps/candela/` builds the Candela landing at `candela.lumenfx.dev`.
- The docs build puts the Lumen and Candela docs under one search at
  `docs.lumenfx.dev`: Lumen at the root, Candela under `/candela/`.

The docs describe each product's latest release, the version a visitor can
install, not its `main` branch. A docs change merged to a product repo appears
on the site with that product's next release.

Each product's docs carry a Migration section: one page per release that broke
something, listing each break and what to change when you upgrade. The pages
are built from notes the product repos keep beside their docs, one per
breaking change.

The landings are React (Vite, TypeScript). The docs use
[Zensical](https://zensical.org). Everything builds to static files.

The Candela landing runs candela in the browser: its prompt loads the runtime
compiled to WebAssembly and published as a release asset, so a visitor can try
the language before installing it.

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

Both doc sets live in their product repos, not here. A build clones each
product at its latest release. To build against another rev, set `LUMEN_REV` or
`CANDELA_REV`; to preview docs from a local checkout, set `LUMEN_DOCS_SRC` or
`CANDELA_DOCS_SRC` to its `docs/` directory:

```sh
LUMEN_REV=main scripts/build.sh
LUMEN_DOCS_SRC=~/Lumen/docs scripts/build.sh
```

`scripts/prebuild.py` lists the other source variables. `install.sh` on both
landings is fetched from the matching product repo's `main`, so an installer
fix ships without waiting for a release, and is never committed here.

The candela runtime the prompt loads is fetched the same way, from the `web`
asset of a candela release. Set `CANDELA_WASM_TAG` to take it from a particular
release, or `CANDELA_WASM_DIR` to use a local `wasm-pack build --target web`
output directory instead:

```sh
CANDELA_WASM_DIR=~/candela/pkg scripts/build.sh
```

The Lumen installer behind `curl -fsSL https://lumenfx.dev/install.sh | sh`
queries the GitHub Releases API for `lumen-fx/lumen` directly; there is
nothing about a release to keep in sync here. Cutting a Lumen release is
described in the release checklist in the lumen repo.

## Deploy

Pushing to `main` builds all three sites and deploys them to Cloudflare Pages.
Pull requests build but do not deploy. Custom domains are attached in the
Cloudflare dashboard.

To publish a docs fix before the next release, run the build workflow by hand
with `lumen_rev` or `candela_rev` set to `main`. Left empty, each takes the
latest release.

## Notes

The logo marks are placeholders. The per-target build steps live in `scripts/`
and `.github/workflows/build.yml`.

## License

MIT. The product docs and code examples the build clones in carry their own
licences (Lumen: MPL-2.0, Candela: Apache-2.0).
