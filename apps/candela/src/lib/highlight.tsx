// A small, dependency-free syntax highlighter for Candela source. It scans a
// snippet into typed tokens and renders them as classed <span>s. This is not a
// full parser; it recognises the surface syntax used in the landing's code
// samples (keywords, types, strings, comments, numbers, call names). Keeping it
// tiny avoids shipping a heavyweight highlighting library for a handful of
// static snippets.
import type { ReactNode } from "react";

type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "literal"
  | "type"
  | "fn"
  | "punct";

interface Token {
  text: string;
  type: TokenType;
}

const KEYWORDS = new Set([
  "fn", "let", "return", "if", "else", "match", "for", "in", "while", "loop",
  "break", "continue", "struct", "enum", "impl", "import", "as", "host",
  "dylib", "try", "catch", "throw", "self",
]);

const LITERALS = new Set(["true", "false", "None", "Some"]);

const TYPES = new Set(["int", "float", "bool", "string", "any", "void"]);

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;

  const push = (text: string, type: TokenType) => tokens.push({ text, type });

  while (i < n) {
    const c = src[i];

    // Line comment.
    if (c === "/" && src[i + 1] === "/") {
      let j = i + 2;
      while (j < n && src[j] !== "\n") j++;
      push(src.slice(i, j), "comment");
      i = j;
      continue;
    }

    // String literal with backslash escapes.
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      push(src.slice(i, j), "string");
      i = j;
      continue;
    }

    // Number (int or float). Does not swallow the `..` range operator.
    if (DIGIT.test(c)) {
      let j = i + 1;
      while (j < n && DIGIT.test(src[j])) j++;
      if (src[j] === "." && DIGIT.test(src[j + 1] ?? "")) {
        j++;
        while (j < n && DIGIT.test(src[j])) j++;
      }
      push(src.slice(i, j), "number");
      i = j;
      continue;
    }

    // Identifier / keyword / type / call name.
    if (IDENT_START.test(c)) {
      let j = i + 1;
      while (j < n && IDENT_PART.test(src[j])) j++;
      const word = src.slice(i, j);
      let k = j;
      while (k < n && (src[k] === " " || src[k] === "\t")) k++;
      let type: TokenType;
      if (KEYWORDS.has(word)) type = "keyword";
      else if (LITERALS.has(word)) type = "literal";
      else if (TYPES.has(word)) type = "type";
      else if (src[k] === "(") type = "fn";
      else if (/^[A-Z]/.test(word)) type = "type";
      else type = "plain";
      push(word, type);
      i = j;
      continue;
    }

    // Everything else: group runs of the same punctuation-ish char class as
    // plain so whitespace and operators pass through untouched.
    push(c, "punct");
    i++;
  }

  return tokens;
}

export function Highlighted({ code }: { code: string }): ReactNode {
  const tokens = tokenize(code);
  return (
    <>
      {tokens.map((t, idx) =>
        t.type === "plain" || t.type === "punct" ? (
          <span key={idx}>{t.text}</span>
        ) : (
          <span key={idx} className={`tok-${t.type}`}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}
