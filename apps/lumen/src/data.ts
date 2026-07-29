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
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Markup and real CSS",
    body: "Describe an interface as a tree of widgets in .lmn markup, then style it with a CSS cascade you already know: selectors, variables, flexbox, and grid.",
  },
  {
    title: "Reactive signals",
    body: "Name a value, bind it to a widget, and the loop closes. Edits flow back into the signal, and derived values flow out to every widget that reads them.",
  },
  {
    title: "Hot reload that keeps state",
    body: "Save any of the three files and the running window updates in place. Focus, scroll position, and signal values survive the swap, so you never lose your place.",
  },
  {
    title: "Rendered on the GPU",
    body: "Every frame is composited as vector paths, crisp at any display scale, with full glyph shaping and flexbox and grid layout underneath.",
  },
  {
    title: "Native desktop",
    body: "One codebase runs on Linux, macOS, and Windows. lumenc compiles and runs your app against the platform's own window system and GPU.",
  },
  {
    title: "Choose your script language",
    body: "Wire behavior in candela, lua, or rhai. Lumen picks the host from the file extension, so a plugin and your app can each use the language that fits.",
  },
  {
    title: "Drive it from your language",
    body: "Own the state and event handlers from Rust, C++, or Python instead. The lumenui package and a C ABI put typed signals and native handlers in your host.",
  },
  {
    title: "The web, from the same source",
    body: "Transpile the same app to a real DOM for the browser: elements and CSS, not a pixel buffer on a canvas.",
  },
  {
    title: "Accessible and global",
    body: "An accessibility tree, IME composition, and Unicode shaping for mixed left-to-right and right-to-left text come with the runtime.",
  },
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
  --accent: #35d0d8;
  --surface: #0f1d38;
}

.display { font-size: 72; text-align: center; }

.primary {
  bg: var(--accent);
  text-color: var(--surface);
  radius: 10;
  hover-bg: #63e2e6;
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
