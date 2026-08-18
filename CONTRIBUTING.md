# Contributing

Issues and pull requests are welcome.

Doc content is not here. The Lumen and Candela docs live in their product
repos and are pulled in at build time, so a wording, example, or page fix goes
to that repo. This repo holds the two landings, the docs build, and the
deploy.

## Building

Needs [uv](https://docs.astral.sh/uv/), Node with npm, and git.

```sh
scripts/build.sh
```

That writes `dist/apex/`, `dist/candela/`, and `dist/docs/`. To work on one
landing with hot reload:

```sh
npm --prefix apps/lumen install && npm --prefix apps/lumen run dev
```

The docs build reads each product from a checkout on disk by default; setting
`LUMEN_REV` or `CANDELA_REV` clones it fresh instead, which is what CI does.
`scripts/prebuild.py` lists the variables that point at sources.

The Candela landing also needs candela compiled to WebAssembly, which its
prompt runs. `scripts/fetch_candela_wasm.py` takes it from a candela release;
to build against a local candela instead, run `wasm-pack build --target web` in
that checkout and point the site at the result:

```sh
CANDELA_WASM_DIR=~/candela/pkg scripts/build.sh
```

Code samples on both landings are read out of the product repos by
`scripts/fetch_examples.py`, and every Candela sample has to be a whole program
that compiles with no `import`, because the browser build has no file system.
Edit the sample where it lives; the generated modules here are outputs.

## Pull requests

Build the target you touched before opening the pull request, and say what you
checked. Pull requests build in CI but do not deploy; pushing to `main`
deploys.

Everything ships as static files. A change that needs a server, a redirect
worker, or a runtime API needs an issue first.
