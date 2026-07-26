// Landing content. Every feature and code sample here is checked against the
// candela repository (README, BENCHMARKS.md, docs/docs, libs/std tests) so the
// page does not claim anything the language does not ship.

export const REPO_URL = "https://github.com/lumen-fx/candela";
export const DOCS_URL = "https://docs.lumenfx.dev/candela/";
export const RELEASES_URL = "https://github.com/lumen-fx/candela/releases/latest";
export const KEEL_URL = "https://github.com/horacehoff/keel";

// install.sh is served from this site's own root (see the CI packaging step).
export const INSTALL_CMD = "curl -fsSL https://candela.lumenfx.dev/install.sh | sh";

// The hero sample: structs, methods via impl blocks, and left-to-right method
// chaining. Verified against docs/docs/language-tour/data-types.md.
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

// Each snippet is adapted from verified sources in the candela repo: the enum
// example from tests/cdlb_roundtrip.rs, the higher-order pipeline from
// libs/std/tests/test_list_hof.cdl, and the JSON example from
// libs/std/tests/test_json.cdl.
export const SNIPPETS: Snippet[] = [
  {
    id: "enums",
    label: "Enums + match",
    caption: "Payload-carrying variants, matched with binding patterns.",
    code: `enum Shape { Circle(int), Rect(int, int), Unit }

fn area(s) {
    let a = 0;
    match s {
        Circle(r) => { a = r * r * 3; }
        Rect(w, h) => { a = w * h; }
        Unit => { a = 0; }
    }
    return a;
}

fn main() {
    print(area(Shape::Rect(6, 7)));  // 42
    print(area(Shape::Circle(3)));   // 27
}`,
  },
  {
    id: "hof",
    label: "Higher-order pipeline",
    caption: "Named and anonymous functions passed to list helpers.",
    code: `import std::list;

fn is_even(x) { return x % 2 == 0; }

fn main() {
    let xs = [1, 2, 3, 4, 5, 6];

    let evens = list::filter(xs, is_even);
    let squared = list::map(evens, fn(x) { return x * x; });
    let total = list::reduce(squared, 0, fn(a, b) { return a + b; });

    print(squared);  // [4, 16, 36]
    print(total);    // 56
}`,
  },
  {
    id: "json",
    label: "Parse JSON",
    caption: "Parse a document and read typed values back out.",
    code: `import std::json;

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
