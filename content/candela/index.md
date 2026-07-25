---
hide:
  - navigation
  - toc
---

<div class="lx-hero" markdown>

# Candela

## A fast, statically-typed interpreted scripting language.

Candela combines Rust-like syntax with Python's ease of use. It aims to be a
faster alternative to Python that sits closer to low-level languages while
staying approachable.

[Get started](docs/){ .md-button .md-button--primary }
[Browse the docs](docs/){ .md-button }

</div>

## Why Candela

- Fast: about 10x faster than Python and competitive with LuaJIT in the project's benchmarks.
- Statically typed with zero annotations: full type inference, static checking, and polymorphism.
- FFI support: call C and dynamic libraries directly with a native, easy syntax.
- Embeddable: register typed host functions and drive scripts from a Rust host through a C ABI.
- Built-in REPL.

Candela is the embedded scripting language for the Lumen UI framework, and it
also runs standalone as a general-purpose language.

## A quick taste

```rust
struct Point { x: int, y: int }

fn add(a, b) {
    return a + b;
}

fn main() {
    let p = Point { x: 3, y: 4 };
    print(add(p.x, p.y));        // 7
    print(add("Hello, ", "world!")); // Hello, world!

    let nums = [4, 2, 6, 1, 7];
    if nums[0] == 4 {
        nums.sort();
        print(if nums[0] == 1 { nums[0..3] } else { -1 }); // [1,2,4]
    } else {
        throw("Error!");
    }
}
```

## Install

On macOS or Linux, run:

```sh
curl -fsSL https://raw.githubusercontent.com/lumen-fx/candela/main/install.sh | sh
```

On Windows, download the latest build from the
[GitHub releases](https://github.com/lumen-fx/candela/releases/latest).

Then run a source file, build bytecode, or start the REPL:

```sh
candela program.cdl           # run a file
candela build program.cdl     # compile to program.cdlb bytecode
candela                       # start the REPL
```

[Read the documentation](docs/){ .md-button .md-button--primary }
[Source on GitHub](https://github.com/lumen-fx/candela){ .md-button }

!!! info "Attribution"

    Candela is a fork of [keel](https://github.com/horacehoff/keel) by Horace
    Hoff, licensed under Apache 2.0. It renames the language and extends it with
    a host embedding API for use inside Lumen.
