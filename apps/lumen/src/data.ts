// Landing content for the Lumen framework. Messaging is drawn from the Lumen
// site source material and kept to what the framework does today.
import type { Lang } from "./lib/highlight";

export const REPO_URL = "https://github.com/lumen-fx/lumen";
export const DOCS_URL = "https://docs.lumenfx.dev/";
export const RELEASES_URL = "https://github.com/lumen-fx/lumen/releases/latest";
export const CANDELA_URL = "https://candela.lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/lumen/blob/main/LICENSE";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The hero markup: a small counter, the same app the render preview shows.
export const HERO_LMN = `<root padding="28" gap="18" align="center">
  <label id="count" class="display" text="0" />
  <row gap="12">
    <button id="bump" class="primary" text="+1" />
    <button id="reset" text="reset" />
  </row>
</root>`;

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

// The three files of a Lumen app, shown as one coherent counter: markup names
// the widgets, CSS themes them, and the script wires the reactive loop.
export const SNIPPETS: Snippet[] = [
  {
    id: "markup",
    label: "main.lmn",
    lang: "lmn",
    caption: "A tree of widgets. Every id is a handle the script and styles can reach.",
    code: `<root>
  <column padding="24" gap="12" align="center">
    <label id="count" class="display" text="0" bind-text="clicks" />
    <row gap="12">
      <button id="bump" class="primary" text="Click me" />
      <button id="reset" text="Reset" />
    </row>
  </column>
  <script src="main.rhai" />
</root>`,
  },
  {
    id: "styles",
    label: "main.css",
    lang: "css",
    caption: "Tokens on :root, referenced with var(). Familiar selectors and states.",
    code: `:root {
  --accent: #5fd9e0;
  --surface: #163459;
}

.display { font-size: 72; text-align: center; }

.primary {
  bg: var(--surface);
  text-color: #ffffff;
  radius: 22;
  hover-bg: #1d4477;
}
.primary:focus { outline: 2 var(--accent); }`,
  },
  {
    id: "script",
    label: "main.rhai",
    lang: "script",
    caption: "on_start runs once. A click writes the signal; the bound label re-renders.",
    code: `fn on_start() {
    signal("clicks", 0);
    on("click", "bump", "handle_bump");
    on("click", "reset", "handle_reset");
}

fn handle_bump(id) {
    let n = signal("clicks", 0);
    n.set(n.get() + 1);
}

fn handle_reset(id) {
    signal("clicks", 0).set(0);
}`,
  },
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
