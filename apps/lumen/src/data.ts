// Landing content for Lumen. The page is laid out as a dispersion experiment:
// white light enters a prism at the top, and each content station after it
// takes one band of the spectrum, violet through red.
import type { Lang } from "./lib/highlight";
import {
  COUNTER_CDL,
  COUNTER_CSS,
  COUNTER_LMN,
  CPP_SDK,
  PYTHON_SDK,
  RUST_SDK,
} from "./generated/examples";

export const REPO_URL = "https://github.com/lumen-fx/lumen";
export const DOCS_URL = "https://docs.lumenfx.dev/";
export const RELEASES_URL = "https://github.com/lumen-fx/lumen/releases/latest";
export const CANDELA_URL = "https://candela.lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/lumen/blob/main/LICENSE";
export const BENCH_URL = "https://github.com/lumen-fx/guibench";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The Windows installers, one per architecture, attached to every release.
export const MSI_URL =
  "https://github.com/lumen-fx/lumen/releases/latest/download/lumen-windows-x86_64.msi";
export const MSI_ARM_URL =
  "https://github.com/lumen-fx/lumen/releases/latest/download/lumen-windows-aarch64.msi";

// Every station in order. `id` is the anchor and the rail label. `nm` is the
// station's band on the spectrum (the source is white light and has none), and
// `hue` is that band rendered as a screen colour, tuned to stay readable on
// the dark ground rather than to be colorimetrically exact.
export interface StationMeta {
  id: string;
  label: string;
  nm?: number;
  hue: string;
}

export const STATIONS: StationMeta[] = [
  { id: "source", label: "source", hue: "#eceef2" },
  { id: "markup", label: "markup", nm: 432, hue: "#8b7bff" },
  { id: "styles", label: "css", nm: 474, hue: "#5aa2ff" },
  { id: "signals", label: "signals", nm: 517, hue: "#58dd8e" },
  { id: "reload", label: "reload", nm: 555, hue: "#a8e05f" },
  { id: "hosts", label: "hosts", nm: 598, hue: "#ffc95f" },
  { id: "measured", label: "measured", nm: 640, hue: "#ff8f5c" },
  { id: "install", label: "install", nm: 682, hue: "#ff6b6b" },
];

// The three files of the `counter` template, split across the markup, css, and
// signals stations. Markup declares the widgets, CSS themes them from tokens,
// and candela owns the click handling. All three are read out of the lumen repo
// at build time, so the page shows what `lumenc new app counter` writes today.
export const MARKUP_LMN = COUNTER_LMN;
export const STYLES_CSS = COUNTER_CSS;
export const SIGNALS_CDL = COUNTER_CDL;

// What a save costs you, station by station. These are properties of how the
// runtime is built, not measurements, so they are stated in words.
export interface Reading {
  key: string;
  value: string;
  body: string;
}

export const RELOAD_READINGS: Reading[] = [
  {
    key: "markup",
    value: "rebuilds",
    body: "The tree is rebuilt from the new markup. An element with an id keeps its state: typed text and cursor, toggle and slider values, scroll position.",
  },
  {
    key: "css",
    value: "restyles",
    body: "The new sheet cascades against the live theme and window size, and every element with an id keeps its state the same way.",
  },
  {
    key: "script",
    value: "rebinds",
    body: "The new source replaces the old one in place. Signal values and handlers carry over, so the counter you were at is the counter you come back to.",
  },
];

// Script hosts. Lumen picks the host from the file extension. candela is the
// supported language; rhai and lua still run existing scripts.
export interface Host {
  name: string;
  ext: string;
  body: string;
  href?: string;
}

export const HOSTS: Host[] = [
  {
    name: "candela",
    ext: ".cdl",
    body: "Statically typed and shipped with the toolchain. Compiled from source with hot reload while you work, shipped as bytecode. Every template uses it.",
    href: CANDELA_URL,
  },
  {
    name: "lua",
    ext: ".lua",
    body: "Deprecated. Existing scripts still run; new apps use candela.",
  },
  {
    name: "rhai",
    ext: ".rhai",
    body: "Deprecated. Existing scripts still run; new apps use candela.",
  },
];

// Drive Lumen from a host language instead of scripting it: own the state and
// the event handlers. The Python and C++ SDKs sit on the C ABI; the Rust SDK
// links the engine directly. Each sample is the quick start from that SDK's
// own source, fetched at build time. See scripts/fetch_examples.py.
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
    install: "lumenc new my-app rust",
    blurb: "The build script compiles the UI in src/ into the executable. Signals and handlers chain off the app, with bevy_ecs systems where they fit.",
    lang: "script",
    code: RUST_SDK,
  },
  {
    name: "Python",
    install: "pip install lumenui",
    blurb: "Declare a model and every field becomes a signal. Imported as lumen; it loads the runtime the toolchain installs.",
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

// The same app built in nine frameworks and measured the same way, from the
// guibench suite (hello: startup floor + idle memory + binary), sorted by
// startup. Medians from one run of the suite's defaults (20 launches for
// startup, 3 for memory) under a nested headless weston on an Intel Core
// i9-12900K under Arch Linux, with Lumen 0.0.12 from its release installer.
// Startup is exec to first frame in ms. Memory is idle PSS in MiB. Binary is
// the stripped on-disk size in MiB; for Lumen it is lumenc plus the engine
// library, the standard library, and the script host the app loads. The
// toolkit frameworks link tens of MiB of shared libraries not counted here.
export interface BenchRow {
  framework: string;
  note?: string;
  startup: string;
  mem: string;
  binary: string;
  self?: boolean;
}

export const BENCH: BenchRow[] = [
  { framework: "Qt Widgets", note: "native", startup: "29", mem: "25", binary: "0.0 + toolkit" },
  { framework: "GTK4", note: "native", startup: "60", mem: "45", binary: "0.0 + toolkit" },
  { framework: "Slint", startup: "70", mem: "60", binary: "19.4" },
  { framework: "egui", startup: "74", mem: "59", binary: "18.6" },
  { framework: "Qt Quick", note: "own scene graph", startup: "76", mem: "90", binary: "0.0 + toolkit" },
  { framework: "Lumen", note: "own renderer", startup: "86", mem: "105", binary: "97.8", self: true },
  { framework: "iced", startup: "87", mem: "67", binary: "14.2" },
  { framework: "Flutter", note: "own engine", startup: "121", mem: "94", binary: "5.1 + engine" },
  { framework: "Tauri", note: "webview", startup: "150", mem: "87", binary: "5.3 + webkit" },
];

// Lumen's frame time while scrolling a 10,000-row list at 1000 px/s: it holds a
// single 60 Hz frame. Percentiles in ms, the median of the suite's 3 passes, from
// the same run.
export const FRAME = { p50: "16.6", p95: "17.5", p99: "18.5" };
export const FRAME_BUDGET = 16.67;

// What runs today, and what is next. Kept apart on purpose.
export const SHIPPING: string[] = [
  "Linux, macOS, and Windows, on x86_64 and Arm64",
  "GPU rendering, or a CPU renderer",
  "Hot reload of markup, CSS, and script",
  "candela scripts; rhai and lua deprecated",
  "Rust, C++, and Python SDKs, and a C ABI",
  "Transitions, keyframes, and springs",
  "Docks, with panels popped out to windows",
  "Commands, rebindable shortcuts, a palette",
  "Popovers, menus, dialogs, and tooltips",
  "Virtualized lists and grids",
  "Another renderer's GPU frames in a surface",
  "Accessibility tree, IME, and Unicode BiDi",
  "In-window devtools on F12",
  "Modules and packages declared in lumen.toml",
  "lumenc web: real HTML and CSS, static or server-rendered",
];

export const PLANNED: string[] = [
  "Dragging dock panels between windows",
  "iOS and Android",
];
