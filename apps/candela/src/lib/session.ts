// A candela session, assembled the way candela's own REPL assembles one.
//
// The runtime compiles and runs whole programs; there is no incremental
// evaluator. So a session keeps everything typed so far, rebuilds one program
// from it on every submission, runs that, and prints only the output the
// previous run did not produce. Bindings persist because they are re-created
// each time, which is exactly what `candela` does at a terminal prompt
// (src/repl.rs).
//
// One difference from the terminal REPL, forced by the browser: there is no
// file to edit, so declarations have to be typeable at the prompt. A `fn`,
// `struct`, `enum` or `impl` block is lifted out to the top of the program
// instead of being wrapped inside `fn main`, where candela rejects it.

const ITEM_KEYWORDS = ["fn ", "struct ", "enum ", "impl "];

export interface Split {
  items: string[];
  statements: string[];
  /** Imports are dropped: the WebAssembly build has no file system to read. */
  imports: string[];
}

/** Where a balanced `{ ... }` run starting at `from` ends, or -1. */
function endOfBlock(lines: string[], from: number): number {
  let depth = 0;
  let seen = false;
  for (let i = from; i < lines.length; i++) {
    let inString = false;
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (inString) {
        if (ch === "\\") c++;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") {
        depth++;
        seen = true;
      } else if (ch === "}") depth--;
    }
    if (seen && depth <= 0) return i;
  }
  return -1;
}

/** Split a pasted chunk into declarations, statements, and rejected imports. */
export function split(chunk: string): Split {
  const lines = chunk.replace(/\r\n/g, "\n").split("\n");
  const out: Split = { items: [], statements: [], imports: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = line.trim();
    if (text === "") continue;

    if (text.startsWith("import")) {
      out.imports.push(text);
      continue;
    }

    if (ITEM_KEYWORDS.some((k) => text.startsWith(k))) {
      const end = endOfBlock(lines, i);
      const block = lines.slice(i, end === -1 ? lines.length : end + 1);
      // `fn main` is the program's body, not a declaration: keep its contents
      // as statements so a whole program pastes in as though it were typed.
      // Cut between the braces rather than dropping the first and last lines,
      // because `fn main() { print(1); }` is a whole program on one line.
      if (/^fn\s+main\s*\(/.test(text)) {
        const whole = block.join("\n");
        const opens = whole.indexOf("{");
        const closes = whole.lastIndexOf("}");
        const inner = opens === -1 || closes < opens ? "" : whole.slice(opens + 1, closes);
        out.statements.push(...inner.split("\n").map((l) => l.trim()).filter(Boolean));
      } else {
        out.items.push(block.join("\n"));
      }
      i = end === -1 ? lines.length : end;
      continue;
    }

    out.statements.push(text);
  }
  return out;
}

/** A statement candela would accept: it wants the semicolon. */
function terminate(statement: string): string {
  return statement.endsWith(";") || statement.endsWith("}") ? statement : `${statement};`;
}

export class Session {
  private items: string[] = [];
  private statements: string[] = [];
  private produced = 0;
  private staged = { items: 0, statements: 0 };

  /** The whole program as it stands. */
  program(): string {
    const body = this.statements.map(terminate).join("\n");
    return [...this.items, `fn main() {\n${body}\n}`].join("\n\n");
  }

  /** Add a chunk and return the program to run, plus anything refused. */
  stage(chunk: string): { program: string; imports: string[]; added: boolean } {
    const parts = split(chunk);
    if (parts.items.length === 0 && parts.statements.length === 0) {
      return { program: this.program(), imports: parts.imports, added: false };
    }
    this.items.push(...parts.items);
    this.statements.push(...parts.statements);
    this.staged = { items: parts.items.length, statements: parts.statements.length };
    return { program: this.program(), imports: parts.imports, added: true };
  }

  /** Take back the last staged chunk, after the program failed to run. */
  rollback(): void {
    this.items.length -= this.staged.items;
    this.statements.length -= this.staged.statements;
    this.staged = { items: 0, statements: 0 };
  }

  /** The part of a run's output that the previous run did not already print. */
  fresh(output: string): string {
    if (output.length <= this.produced) return "";
    return output.slice(this.produced);
  }

  /** Remember how much has been printed, once a run has succeeded. */
  commit(output: string): void {
    this.produced = output.length;
    this.staged = { items: 0, statements: 0 };
  }

  reset(): void {
    this.items = [];
    this.statements = [];
    this.produced = 0;
    this.staged = { items: 0, statements: 0 };
  }

  get empty(): boolean {
    return this.items.length === 0 && this.statements.length === 0;
  }
}
