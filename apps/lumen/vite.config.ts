import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The Lumen landing is a fully static, client-rendered SPA. `vite build` emits a
// self-contained static site. Output goes to the repo-root dist/apex so CI
// deploys it to the lumenfx Cloudflare Pages project exactly like the other
// targets. Anything in public/ is copied verbatim to the dist root, which is how
// public/install.sh and public/install/ land at https://lumenfx.dev/install.sh
// and https://lumenfx.dev/install/manifest.json.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("../../dist/apex", import.meta.url)),
    emptyOutDir: true,
  },
});
