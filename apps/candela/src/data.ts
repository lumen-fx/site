// Landing content. Every feature and code sample here is checked against the
// candela repository (README, BENCHMARKS.md, docs, libs/std) so the page does
// not claim anything the language does not ship. Samples whose source is a
// file in that repo are fetched at build time; see scripts/fetch_examples.py.
import { LIST_HOF } from "./generated/examples";

export const REPO_URL = "https://github.com/lumen-fx/candela";
export const DOCS_URL = "https://docs.lumenfx.dev/candela/";
export const RELEASES_URL = "https://github.com/lumen-fx/candela/releases/latest";
export const KEEL_URL = "https://github.com/horacehoff/keel";

// install.sh is served from this site's own root (see the CI packaging step).
export const INSTALL_CMD = "curl -fsSL https://candela.lumenfx.dev/install.sh | sh";

// The Windows installer, attached to every release.
export const MSI_URL = "https://github.com/lumen-fx/candela/releases/latest/download/candela-x86_64-windows.msi";

// The hero sample: structs, methods via impl blocks, and left-to-right method
// chaining. No file in the repo shows all three at hero length, so this one is
// hand-kept; its forms are checked against libs/std/option.cdl (impl blocks)
// and examples/binary-trees/binary-trees.cdl (typed struct fields, literals).
export const HERO_CODE = `struct Point { x: int, y: int }

impl Point {
    fn len(self) { return self.x + self.y; }
    fn scaled(self, f) { return Point { x: self.x * f, y: self.y * f }; }
}

fn main() {
    let p = Point { x: 2, y: 3 };
    print(p.len());            // 5
    print(p.scaled(3).len());  // 15
}`;

export interface Feature {
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Statically typed, zero annotations",
    body: "Full type inference and static checking with no type annotations to write. The checker catches type errors before the program runs.",
  },
  {
    title: "Fast interpreted execution",
    body: "About 10x faster than CPython and competitive with LuaJIT (-joff) across the project's benchmarks, driven by aggressive compile-time optimization.",
  },
  {
    title: "Small standalone runtime",
    body: "candela-vm loads and runs precompiled bytecode with no parser, compiler, or REPL. The goal is to keep it under 1 MiB.",
  },
  {
    title: "AOT compile to bytecode",
    body: "Build a .cdl program to a self-contained .cdlb artifact. Every imported module is linked in, so it runs with no source tree present.",
  },
  {
    title: "Enums and pattern matching",
    body: "Native enums with payload-carrying variants, matched with binding patterns. Enum programs compile and run through the bytecode path.",
  },
  {
    title: "First-class functions",
    body: "Pass named or anonymous functions as values into higher-order helpers like map, filter, reduce, find, any, and all.",
  },
  {
    title: "Collections and JSON",
    body: "Built-in arrays and maps, plus a standard library with sets, list helpers, and a json module to parse and stringify documents.",
  },
  {
    title: "Option and result",
    body: "Standard-library option and result types with the usual helpers (is_some, unwrap, unwrap_or, map) in both free-function and method form.",
  },
  {
    title: "Methods with impl blocks",
    body: "Attach methods to your structs with impl blocks and call them with dot syntax. Methods resolve at compile time from the receiver's static type.",
  },
  {
    title: "C FFI and dynamic libraries",
    body: "Declare a dylib block and call C functions directly with native syntax. FFI call overhead is a fraction of Python's or LuaJIT's.",
  },
  {
    title: "Embeddable host API",
    body: "Drive scripts from a Rust host across a C ABI: register typed host functions, compile once, and call script functions by name.",
  },
  {
    title: "Editor tooling",
    body: "A VS Code extension with syntax highlighting and a language server: live diagnostics, hover, completion, outline, and go-to-definition.",
  },
];

export interface Snippet {
  id: string;
  label: string;
  caption: string;
  code: string;
}

export const SNIPPETS: Snippet[] = [
  {
    id: "enums",
    label: "Enums + match",
    caption: "Payload-carrying variants, matched with binding patterns.",
    // The program compiled by the enum round-trip test. It lives as a Rust
    // string constant, so it is kept in step by hand rather than fetched.
    // Source of truth: tests/cdlb_roundtrip.rs (enum_values_roundtrip_through_cdlb).
    code: `enum Shape { Circle(int), Rect(int, int), Unit }

fn main() {
    let s = Shape::Rect(6, 7);
    let a = 0;
    match s {
        Circle(r) => { a = r; }
        Rect(w, h) => { a = w * h; }
        Unit => { a = -1; }
    }
    print(a);
}`,
  },
  {
    id: "hof",
    label: "Higher-order pipeline",
    caption: "Named and anonymous functions passed to list helpers, with each result checked.",
    // libs/std/tests/test_list_hof.cdl, fetched at build time.
    code: LIST_HOF,
  },
  {
    id: "json",
    label: "Parse JSON",
    caption: "Parse a document and read typed values back out.",
    // Trimmed from libs/std/tests/test_json.cdl, which runs to seventy lines of
    // checks. Kept in step by hand; the full file is the source of truth.
    code: `import "std/json" as json;

fn main() {
    let doc = json::parse("{\\"name\\": \\"candela\\", \\"nums\\": [1, 2, 3]}");
    let obj = as_map(doc);

    print(as_str(obj.get("name")));  // candela

    let nums = as_list(obj.get("nums"));
    print(nums.len());               // 3
    print(as_int(nums[2]));          // 3
}`,
  },
];

export interface Bench {
  name: string;
  candela: string;
  python: string;
  luajit: string;
}

// From BENCHMARKS.md: hyperfine, 2021 M1 Pro. Shown as an illustrative selection.
export const BENCHMARKS: Bench[] = [
  { name: "Iterative fib", candela: "73.4 ms", python: "740 ms", luajit: "72.5 ms" },
  { name: "FizzBuzz x1M", candela: "21.6 ms", python: "149.2 ms", luajit: "84.2 ms" },
  { name: "String / array ops", candela: "5.8 ms", python: "28.2 ms", luajit: "27.6 ms" },
  { name: "C FFI x10M", candela: "185.2 ms", python: "2907 ms", luajit: "535.8 ms" },
];
