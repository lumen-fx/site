// The candela runtime, off the main thread.
//
// `run` is synchronous and a candela program may loop forever, so it cannot run
// where the page's own event loop is. Here, a program that will not stop only
// blocks this worker, and the page can terminate it.
//
// The runtime files are fetched from /runtime, put there at build time by
// scripts/fetch_candela_wasm.py. They are loaded at run time rather than
// bundled, so the page ships the same files a release published.

interface Glue {
  default: (init: { module_or_path: string | URL }) => Promise<unknown>;
  run: (code: string) => void;
  get_output: () => string;
}

const GLUE_URL = "/runtime/candela.js";
const WASM_URL = "/runtime/candela_bg.wasm";

let glue: Glue | null = null;

async function load(): Promise<Glue> {
  if (glue) return glue;
  const mod = (await import(/* @vite-ignore */ new URL(GLUE_URL, self.location.origin).href)) as Glue;
  await mod.default({ module_or_path: new URL(WASM_URL, self.location.origin) });
  glue = mod;
  return mod;
}

self.onmessage = async (event: MessageEvent) => {
  const { id, source } = event.data as { id: number; source?: string };

  let runtime: Glue;
  try {
    runtime = await load();
  } catch (error) {
    self.postMessage({ id, failed: true, unavailable: true, output: String(error) });
    return;
  }

  // A warm-up message carries no source: it only pays for loading the runtime.
  if (source === undefined) {
    self.postMessage({ id, ready: true });
    return;
  }

  // A compile or run error arrives as a thrown string; the report itself is in
  // the captured output either way, so read that after catching.
  let failed = false;
  try {
    runtime.run(source);
  } catch {
    failed = true;
  }
  self.postMessage({ id, failed, output: runtime.get_output() });
};
