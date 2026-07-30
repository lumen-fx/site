// Landing content for the Lumen framework. Messaging is drawn from the Lumen
// site source material and kept to what the framework does today.
import type { Lang } from "./lib/highlight";

export const REPO_URL = "https://github.com/lumen-fx/lumen";
export const DOCS_URL = "https://docs.lumenfx.dev/";
export const RELEASES_URL = "https://github.com/lumen-fx/lumen/releases/latest";
export const CANDELA_URL = "https://candela.lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/lumen/blob/main/LICENSE";
export const BENCH_URL = "https://github.com/lumen-fx/lumen-benchmarks";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The hero sample: candela on the dynamic DOM API. on_ready fires after the DOM
// mounts; the script queries a container and builds one row per item. The render
// preview shows the menu it produces.
export const HERO_CDL = `import "lumen.cdl";

fn on_ready() {
    let menu = node_query("#menu");
    for item in ["Account", "Display", "Privacy"] {
        lm_append(menu, "row", "item", item);
    }
}`;

// The container the script fills. The rows are not hand-written: candela spawns
// them from the data.
export const HERO_LMN = `<root padding="22" gap="12">
  <label class="title" text="Settings" />
  <column id="menu" gap="8" />
  <script src="main.cdl" />
</root>`;

// The rows the render preview shows, built by the candela snippet above.
export const MENU_ROWS = ["Account", "Display", "Privacy"];

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
    body: "Own the state and event handlers from Rust, C++, or Python instead. The lumenui package and a C ABI put typed signals and native handlers in your host.",
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
  "Plugin registry via lumenc add",
  "Light and dark via prefers-color-scheme",
  "Virtualized lists and long content",
];

export const PLANNED: string[] = [
  "Web target: the same source to a real DOM",
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

export const SDKS: Sdk[] = [
  {
    name: "Rust",
    install: "cargo add lumenui",
    blurb: "Typed signals and native handlers from Rust, no script host in between.",
    lang: "script",
    code: `use lumenui::App;

fn main() {
    App::new("app/main.lmn")
        .on("save", |ui| ui.signal("count").add(1))
        .run();
}`,
  },
  {
    name: "Python",
    install: "pip install lumenui",
    blurb: "Bind signals and handlers from Python; the runtime stays native.",
    lang: "script",
    code: `import lumenui

app = lumenui.App("app/main.lmn")

@app.on("save")
def save(ui):
    ui.signal("count").add(1)

app.run()`,
  },
  {
    name: "C / C++",
    install: "#include <lumen.h>",
    blurb: "The C ABI with shipped headers. Drive the window from C or C++.",
    lang: "script",
    code: `#include <lumen.h>

int main(void) {
    LumenApp *app = lumen_app_new("app/main.lmn");
    lumen_on(app, "save", on_save, NULL);
    return lumen_run(app);
}`,
  },
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
    <label class="title" text="Settings" />
    <column id="menu" gap="8" />
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

.item {
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
    code: `import "lumen.cdl";

fn on_ready() {
    let menu = node_query("#menu");
    for item in ["Account", "Display", "Privacy"] {
        lm_append(menu, "row", "item", item);
    }
}`,
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
