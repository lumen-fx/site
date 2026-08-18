// Landing content for Lumen. The page is laid out as a photometric bench, so
// the content is organised as stations along that bench: each one sits at a
// measured distance from the lamp and is lit by it.
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
export const BENCH_URL = "https://github.com/lumen-fx/lumen-benchmarks";

// The documented one-line install for the prebuilt toolchain.
export const INSTALL_CMD = "curl -fsSL https://lumenfx.dev/install.sh | sh";

// The Windows installer, attached to every release.
export const MSI_URL =
  "https://github.com/lumen-fx/lumen/releases/latest/download/lumen-windows-x86_64.msi";

// The bench is graduated in centimetres and the stations sit 15 cm apart, so a
// station's index is also its mark on the ruler. The readout converts pixels of
// travel back into centimetres with this scale.
export const CM_PER_STATION = 15;

// Every station in order. `id` is the anchor and the ruler label; `caption` is
// what the lamp readout names when that station is the nearest one.
export interface StationMeta {
  id: string;
  label: string;
  caption: string;
}

export const STATIONS: StationMeta[] = [
  { id: "source", label: "source", caption: "the lamp" },
  { id: "markup", label: "markup", caption: "widget tree" },
  { id: "styles", label: "css", caption: "cascade" },
  { id: "signals", label: "signals", caption: "state" },
  { id: "reload", label: "reload", caption: "edit loop" },
  { id: "hosts", label: "hosts", caption: "languages" },
  { id: "measured", label: "measured", caption: "instruments" },
  { id: "install", label: "install", caption: "end of bench" },
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
    value: "tree swaps",
    body: "The widget tree is rebuilt and diffed against the live one. Ids keep their identity, so a button you were hovering stays the same button.",
  },
  {
    key: "css",
    value: "restyles",
    body: "The cascade reruns against the tree already on screen. No relayout of anything the change did not touch.",
  },
  {
    key: "script",
    value: "rebinds",
    body: "Handlers are reregistered against the new source. Signal values survive, so the counter you were at is the counter you come back to.",
  },
];

// Script hosts. Lumen picks the host from the file extension, so an app and a
// plugin can each use the language that fits them.
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
    body: "Statically typed, compiled to bytecode, and shipped with the toolchain. The default for new apps.",
    href: CANDELA_URL,
  },
  {
    name: "lua",
    ext: ".lua",
    body: "The language your users already know how to write plugins in.",
  },
  {
    name: "rhai",
    ext: ".rhai",
    body: "Rust-flavoured and sandboxed, for logic you want close to the host.",
  },
];

// Drive Lumen from a host language instead of scripting it: own the state and
// the event handlers. Each SDK sits on the same C ABI, and each sample is the
// quick start from that SDK's own source, fetched at build time. See
// scripts/fetch_examples.py.
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
export const FRAME_BUDGET = 16.67;

// What runs today, and what is next. Kept apart on purpose.
export const SHIPPING: string[] = [
  "Linux, macOS, and Windows desktop",
  "Hot reload of markup, CSS, and script",
  "candela, lua, and rhai script hosts",
  "C ABI with Rust, C++, and Python SDKs",
  "Accessibility tree, IME, and Unicode BiDi",
  "Virtualized lists and long content",
  "lumenc web: the same source to a real DOM, in early access",
];

export const PLANNED: string[] = [
  "Plugin dependencies declared in lumen.toml",
  "Multi-window apps",
  "Keyframe and spring animation",
  "Built-in in-window devtools",
];
