// Landing content for the Lumen framework. Messaging is drawn from the Lumen
// site source material and kept to what the framework does today.
import type { Lang } from "./lib/highlight";
import { CPP_SDK, PYTHON_SDK, RUST_SDK } from "./generated/examples";

export const REPO_URL = "https://github.com/lumen-fx/lumen";
export const DOCS_URL = "https://docs.lumenfx.dev/";
export const RELEASES_URL = "https://github.com/lumen-fx/lumen/releases/latest";
export const CANDELA_URL = "https://candela.lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/lumen/blob/main/LICENSE";
export const BENCH_URL = "https://github.com/lumen-fx/lumen-benchmarks";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The Windows installer, attached to every release.
export const MSI_URL = "https://github.com/lumen-fx/lumen/releases/latest/download/lumen-windows-x86_64.msi";

// The hero sample and the three showcase files below are the `counter`
// template verbatim, so what the page shows is what `lumenc new app counter`
// writes to disk. The templates live as Rust string constants rather than as
// files, so they cannot be fetched at build time like the other examples.
// Source of truth: lumenc/src/scaffold.rs (the COUNTER constant).
export const HERO_CDL = `import "lumen.cdl";

fn on_ready() {
    lumen::signal_set_int("clicks", 0);

    get_by_id("bump").on("click", "on_bump");
    get_by_id("reset").on("click", "on_reset");
}

fn on_bump(ev) {
    let n = lumen::signal_get_int("clicks");
    lumen::signal_set_int("clicks", n + 1);
}

fn on_reset(ev) {
    lumen::signal_set_int("clicks", 0);
}

fn main() {}`;

export interface Feature {
  tag: string;
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    tag: "markup + css",
    title: "Markup and CSS",
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
    body: "Own the state and event handlers from Rust, C++, or Python instead. A C ABI and a shipped SDK per language put typed signals and native handlers in your host.",
  },
  {
    tag: "a11y + ime",
    title: "Accessible and global",
    body: "An accessibility tree, IME composition, and Unicode shaping for mixed left-to-right and right-to-left text come with the runtime.",
  },
];

// Scope: what runs now versus what is on the roadmap, kept separate.
export const SHIPPING: string[] = [
  "One-line install of the prebuilt lumenc",
  "Linux, macOS, and Windows desktop",
  "Hot reload of markup, CSS, and script",
  "candela, lua, and rhai script hosts",
  "C ABI with Rust, C++, and Python SDKs",
  "Accessibility tree, IME, and Unicode BiDi",
  "Light and dark via prefers-color-scheme",
  "Virtualized lists and long content",
];

export const PLANNED: string[] = [
  "Web target: the same source to a real DOM",
  "Plugin dependencies declared in lumen.toml",
  "Multi-window apps",
  "Keyframe and spring animation",
  "Built-in in-window devtools",
];

// Drive Lumen from a host language: own the state and event handlers instead of
// scripting them. Each SDK sits on the same C ABI.
export interface Sdk {
  name: string;
  install: string;
  blurb: string;
  lang: Lang;
  code: string;
}

// Each sample is the quick start from the SDK's own source, fetched at build
// time; see scripts/fetch_examples.py.
export const SDKS: Sdk[] = [
  {
    name: "Rust",
    install: "cargo add lumen",
    blurb: "The builder surface: markup, properties, and click handlers in one chain.",
    lang: "script",
    code: RUST_SDK,
  },
  {
    name: "Python",
    install: "pip install lumenui",
    blurb: "Declare a model and every field becomes a signal. Imported as lumen.",
    lang: "script",
    code: PYTHON_SDK,
  },
  {
    name: "C++",
    install: "#include <lumen.hpp>",
    blurb: "Typed signals with native operators, over the same C ABI.",
    lang: "script",
    code: CPP_SDK,
  },
];

export interface Snippet {
  id: string;
  label: string;
  lang: Lang;
  caption: string;
  code: string;
}

// The three files of the `counter` template, verbatim. Markup declares the
// widgets, CSS themes them from tokens, and candela owns the click handling.
// Source of truth: lumenc/src/scaffold.rs (the COUNTER constant).
export const SNIPPETS: Snippet[] = [
  {
    id: "markup",
    label: "main.lmn",
    lang: "lmn",
    caption: "Widgets carry ids and classes. bind-text points the label at a signal.",
    code: `<root bg="#0c1c30" padding="32" gap="20" align="center" justify="center">
  <label class="display" id="counter" width="100%" height="120px" text="0"
         bind-text="clicks" />
  <row gap="14" justify="center">
    <button class="primary" id="bump"  width="120px" height="48px" text="+1" />
    <button class="primary" id="reset" width="120px" height="48px" text="reset" />
  </row>
  <script src="main.cdl" />
</root>`,
  },
  {
    id: "styles",
    label: "main.css",
    lang: "css",
    caption: "Tokens on :root, referenced with var(). Familiar selectors and states.",
    code: `:root {
  --color-accent:  #5fd9e0;
  --color-bg:      #163459;
  --color-hover:   #1d4477;
  --color-active:  #0e2c52;
  --color-on-bg:   #ffffff;
  --radius-pill:   24;
}

.display { text-align: center; font-size: 96; text-color: var(--color-on-bg); }

.primary {
  bg:        var(--color-bg);
  hover-bg:  var(--color-hover);
  press-bg:  var(--color-active);
  text-color: var(--color-on-bg);
  radius:    var(--radius-pill);
  text-align: center;
  font-size: 18;
}
.primary:focus { outline: 2 var(--color-accent); }`,
  },
  {
    id: "script",
    label: "main.cdl",
    lang: "script",
    caption: "on_ready looks the buttons up and binds their clicks. The label follows the signal.",
    code: HERO_CDL,
  },
];

// The same app built in eight frameworks and measured the same way; from the
// lumen-benchmarks suite (hello: startup floor + idle memory + binary), sorted
// by startup. Startup is exec to first frame. Memory is idle PSS in MiB. Binary
// is the stripped on-disk size; the toolkit frameworks link tens of MiB of
// shared libraries not counted here.
export interface BenchRow {
  framework: string;
  note?: string;
  startup: string;
  mem: string;
  binary: string;
  self?: boolean;
}

export const BENCH: BenchRow[] = [
  { framework: "Slint", startup: "51", mem: "47", binary: "19.4" },
  { framework: "Qt Widgets", note: "native", startup: "55", mem: "24", binary: "0.2 + toolkit" },
  { framework: "GTK4", note: "native", startup: "55", mem: "38", binary: "0.0 + toolkit" },
  { framework: "egui", startup: "59", mem: "48", binary: "18.8" },
  { framework: "iced", startup: "92", mem: "58", binary: "14.3" },
  { framework: "Lumen", note: "own renderer", startup: "104", mem: "63", binary: "22.4", self: true },
  { framework: "Flutter", note: "own engine", startup: "127", mem: "78", binary: "5.1 + engine" },
  { framework: "Tauri", note: "webview", startup: "164", mem: "59", binary: "5.3 + webkit" },
];

// Lumen's frame time while scrolling a 10,000-row list at 1000 px/s: it holds a
// single 60 Hz frame. Percentiles in ms, from the same suite.
export const FRAME = { p50: "16.5", p95: "17.0", p99: "17.0" };

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
