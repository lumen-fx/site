// Landing content for candela. The page runs the language rather than
// describing it, so every sample here is a whole program that compiles, and
// every one is pulled from the language documentation at build time. If a
// sample stops working, the docs are wrong and the build says so.
import {
  TOUR_ENUMS,
  TOUR_FUNCTIONS,
  TOUR_GENERICS,
  TOUR_MAPS,
  TOUR_METHODS,
} from "./generated/examples";

export const REPO_URL = "https://github.com/lumen-fx/candela";
export const DOCS_URL = "https://docs.lumenfx.dev/candela/";
export const RELEASES_URL = "https://github.com/lumen-fx/candela/releases/latest";
export const LUMEN_URL = "https://lumenfx.dev/";
export const LICENSE_URL = "https://github.com/lumen-fx/candela/blob/main/LICENSE";

// install.sh is served from this site's own root (see the CI packaging step).
export const INSTALL_CMD = "curl -fsSL https://candela.lumenfx.dev/install.sh | sh";

// The Windows installer, attached to every release.
export const MSI_URL =
  "https://github.com/lumen-fx/candela/releases/latest/download/candela-x86_64-windows.msi";

// What the prompt holds when the page opens: the smallest program that shows
// the language has types and prints something.
export const OPENING_LINES = ["let xs = [1, 2, 3]", "print(xs.len())"];

// How long a program may run in the browser before the runtime is stopped. A
// prompt is a place to try a loop that never ends, so something has to end it.
export const RUN_TIMEOUT_MS = 5000;

export interface TourEntry {
  id: string;
  title: string;
  body: string;
  code: string;
}

export const TOUR: TourEntry[] = [
  {
    id: "methods",
    title: "Methods on your own types",
    body: "A struct holds typed fields and an impl block hangs methods off it. Calls resolve at compile time from the receiver's type, so dot syntax costs nothing at run time.",
    code: TOUR_METHODS,
  },
  {
    id: "enums",
    title: "Enums that carry payloads",
    body: "Variants hold values, and match binds them by position. The checker knows what every arm can see, so a name that is not there is a compile error.",
    code: TOUR_ENUMS,
  },
  {
    id: "functions",
    title: "Functions are values",
    body: "Pass a named function by name or write one inline. The function receiving it does not care which it got.",
    code: TOUR_FUNCTIONS,
  },
  {
    id: "maps",
    title: "Lists and maps built in",
    body: "Both are literals in the language, not library types. Keys keep their type, so a map of ints is not quietly a map of strings.",
    code: TOUR_MAPS,
  },
  {
    id: "generics",
    title: "Generics, monomorphised",
    body: "A type parameter is instantiated per use and compiled separately, so a generic call runs as fast as the copy you would have written by hand.",
    code: TOUR_GENERICS,
  },
];

export interface RuntimeFact {
  key: string;
  body: string;
}

export const RUNTIME_FACTS: RuntimeFact[] = [
  {
    key: "candela-vm",
    body: "The shipping runtime loads and runs bytecode. No parser, no compiler, no REPL are linked into it; the goal is to keep it under a megabyte.",
  },
  {
    key: ".cdlb",
    body: "candela build compiles a program and everything it imports into one artifact, so it runs with no source tree present.",
  },
  {
    key: "embedding",
    body: "A host program registers typed functions over a C ABI, compiles once, and calls script functions by name.",
  },
  {
    key: "c libraries",
    body: "Declare a dylib block and call C functions with ordinary syntax. The call overhead is a fraction of what a scripting language usually charges.",
  },
];

// From BENCHMARKS.md: hyperfine, 2021 M1 Pro. An illustrative selection.
export interface Bench {
  name: string;
  candela: string;
  python: string;
  luajit: string;
}

export const BENCHMARKS: Bench[] = [
  { name: "Iterative fib", candela: "73.4 ms", python: "740 ms", luajit: "72.5 ms" },
  { name: "FizzBuzz x1M", candela: "21.6 ms", python: "149.2 ms", luajit: "84.2 ms" },
  { name: "String / array ops", candela: "5.8 ms", python: "28.2 ms", luajit: "27.6 ms" },
  { name: "C FFI x10M", candela: "185.2 ms", python: "2907 ms", luajit: "535.8 ms" },
];
