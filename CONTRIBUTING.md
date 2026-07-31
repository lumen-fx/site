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

## Pull requests

Build the target you touched before opening the pull request, and say what you
checked. Pull requests build in CI but do not deploy; pushing to `main`
deploys.

Everything ships as static files. A change that needs a server, a redirect
worker, or a runtime API needs an issue first.
