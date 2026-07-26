import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The Candela landing is a fully static, client-rendered SPA. `vite build`
// emits a self-contained static site (no server, no Workers, no Pages
// Functions). Output goes to the repo-root dist/candela so CI deploys it to the
// lumenfx-candela Cloudflare Pages project exactly like the other targets.
//
// Anything in public/ is copied verbatim to the dist root. install.sh is placed
// there by scripts/fetch_candela_install.py (cloned fresh from the candela repo)
// so it is served at https://candela.lumenfx.dev/install.sh.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("../../dist/candela", import.meta.url)),
    emptyOutDir: true,
  },
});
