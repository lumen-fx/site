import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The Lumen landing is a fully static, client-rendered SPA. `vite build` emits a
// self-contained static site. Output goes to the repo-root dist/apex so CI
// deploys it to the lumenfx Cloudflare Pages project exactly like the other
// targets.
//
// Anything in public/ is copied verbatim to the dist root. install.sh is placed
// there by scripts/fetch_lumen_install.py (cloned fresh from the lumen repo) so
// it is served at https://lumenfx.dev/install.sh. install.sh queries the
// GitHub Releases API directly, so there is no accompanying manifest to serve.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("../../dist/apex", import.meta.url)),
    emptyOutDir: true,
  },
});
