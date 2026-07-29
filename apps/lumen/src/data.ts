// Landing content for the Lumen framework. Messaging is drawn from the Lumen
// site source material and kept to what the framework does today.
import type { Lang } from "./lib/highlight";

export const REPO_URL = "https://github.com/lumen-fx/lumen";
export const DOCS_URL = "https://docs.lumenfx.dev/";
export const RELEASES_URL = "https://github.com/lumen-fx/lumen/releases/latest";
export const CANDELA_URL = "https://candela.lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/lumen/blob/main/LICENSE";
export const BENCH_URL = "https://github.com/lumen-fx/lumen/tree/main/tools/startup-bench";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The hero sample: candela on the dynamic DOM API. on_ready fires after the DOM
// mounts; the script queries a container and builds its children. This is the
// same list the render preview shows.
export const HERO_CDL = `import "com.lumen.cdl";

fn on_ready() {
    let list = node_query("#stack");
    let crates = ["vello", "taffy", "winit", "cosmic-text"];
    for name in crates {
        lm_append(list, "row", "crate", name);
    }
}`;

// The container the script fills. No markup for the rows: candela spawns them.
export const HERO_LMN = `<root padding="22" gap="12">
  <label class="title" text="the stack" />
  <column id="stack" gap="8" />
  <script src="main.cdl" />
</root>`;

// The rows the render preview shows, built by the candela snippet above.
export const STACK_ROWS = ["vello", "taffy", "winit", "cosmic-text"];

export interface Feature {
  tag: string;
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    tag: "markup + css",
    title: "Markup and real CSS",
    body: "Describe an interface as a tree of widgets in .lmn markup, then style it with a CSS cascade you already know: selectors, variables, flexbox, and grid.",
  },
  {
    tag: "signals",
    title: "Reactive signals",
    body: "Name a value, bind it to a widget, and the loop closes. Edits flow back into the signal, and derived values flow out to every widget that reads them.",
  },
  {
    tag: "hot reload",
    title: "Hot reload that keeps state",
    body: "Save any of the three files and the running window updates in place. Focus, scroll position, and signal values survive the swap, so you never lose your place.",
  },
  {
    tag: "gpu paint",
    title: "Rendered on the GPU",
    body: "Every frame is composited as vector paths, crisp at any display scale, with full glyph shaping and flexbox and grid layout underneath.",
  },
  {
    tag: "native desktop",
    title: "Native desktop",
    body: "One codebase runs on Linux, macOS, and Windows. lumenc compiles and runs your app against the platform's own window system and GPU.",
  },
  {
    tag: "script hosts",
    title: "Choose your script language",
    body: "Wire behavior in candela, lua, or rhai. Lumen picks the host from the file extension, so a plugin and your app can each use the language that fits.",
  },
  {
    tag: "ffi + sdks",
    title: "Drive it from your language",
    body: "Own the state and event handlers from Rust, C++, or Python instead. The lumenui package and a C ABI put typed signals and native handlers in your host.",
  },
  {
    tag: "a11y + ime",
    title: "Accessible and global",
    body: "An accessibility tree, IME composition, and Unicode shaping for mixed left-to-right and right-to-left text come with the runtime.",
  },
];

// Scope: what runs now versus what is on the roadmap. Kept honest about the
// edges rather than blurring the two.
export const SHIPPING: string[] = [
  "One-line install of the prebuilt lumenc",
  "Linux, macOS, and Windows desktop",
  "Hot reload of markup, CSS, and script",
  "candela, lua, and rhai script hosts",
  "C ABI with Rust, C++, and Python SDKs",
  "Accessibility tree, IME, and Unicode BiDi",
  "Plugin registry via lumenc add",
  "Light and dark via prefers-color-scheme",
  "Virtualized lists",
];

export const PLANNED: string[] = [
  "Web target: the same source to a real DOM",
  "Multi-window apps",
  "Keyframe and spring animation",
  "Built-in in-window devtools",
];

export interface Snippet {
  id: string;
  label: string;
  lang: Lang;
  caption: string;
  code: string;
}

// One app across its files: markup declares a container, CSS themes the rows,
// and candela queries the container and builds the rows on the dynamic DOM API.
export const SNIPPETS: Snippet[] = [
  {
    id: "markup",
    label: "main.lmn",
    lang: "lmn",
    caption: "An empty container with an id. The script fills it; no rows are hand-written.",
    code: `<root>
  <column padding="22" gap="12">
    <label class="title" text="the stack" />
    <column id="stack" gap="8" />
  </column>
  <script src="main.cdl" />
</root>`,
  },
  {
    id: "styles",
    label: "main.css",
    lang: "css",
    caption: "Tokens on :root, referenced with var(). Familiar selectors and states.",
    code: `:root {
  --accent: #2fd6cf;
  --surface: #12313a;
}

.title { font-size: 22; text-color: #cfeee9; }

.crate {
  bg: var(--surface);
  text-color: #eafcfa;
  padding: 10;
  radius: 8;
  hover-bg: #17414c;
}`,
  },
  {
    id: "script",
    label: "main.cdl",
    lang: "script",
    caption: "on_ready fires once the DOM mounts. Query the container, append a row per item.",
    code: `import "com.lumen.cdl";

fn on_ready() {
    let list = node_query("#stack");
    let crates = ["vello", "taffy", "winit", "cosmic-text"];
    for name in crates {
        lm_append(list, "row", "crate", name);
    }
}`,
  },
];

// Freshly measured on tools/startup-bench: counter app, offscreen, warm median
// of 9 runs; cold is the first (cache-cold) run. Only measured, reproducible
// rows appear here. Peers that render their own scene (Qt Quick) vs. native OS
// widgets (Qt Widgets) are both shown, because they answer different questions.
export interface BenchRow {
  framework: string;
  note?: string;
  cold: string;
  warm: string;
  rss: string;
  self?: boolean;
}

export const BENCH: BenchRow[] = [
  { framework: "Lumen", note: "own GPU scene", cold: "63", warm: "73", rss: "74", self: true },
  { framework: "Qt Quick", note: "own GPU scene", cold: "318", warm: "31", rss: "46" },
  { framework: "Qt Widgets", note: "native OS widgets", cold: "18", warm: "19", rss: "29" },
];

export interface Guarantee {
  value: string;
  label: string;
  body: string;
}

// Qualitative, from the framework's architecture rather than benchmark dumps.
export const GUARANTEES: Guarantee[] = [
  {
    value: "Next frame",
    label: "click to paint",
    body: "An input marks the frame dirty and the very next redraw paints it. Latency is bounded by your display's refresh, with nothing added on top.",
  },
  {
    value: "Idle at rest",
    label: "cpu when nothing changes",
    body: "The event loop parks between events. No polling and no background churn, so a window that is doing nothing costs nothing.",
  },
  {
    value: "No restart",
    label: "save to repaint",
    body: "Hot reload swaps markup, CSS, or script in place while the app keeps running, so the edit-and-see loop stays tight.",
  },
];
