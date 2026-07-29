// A small, dependency-free syntax highlighter for the three languages that make
// up a Lumen app: .lmn markup, CSS, and script. It scans a snippet into typed
// tokens and renders them as classed <span>s. This is not a full parser; it
// recognises the surface syntax used in the landing's samples. Keeping it tiny
// avoids shipping a heavyweight highlighting library for a handful of static
// snippets.
import type { ReactNode } from "react";

export type Lang = "lmn" | "css" | "script";

type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "fn"
  | "tag"
  | "attr"
  | "prop"
  | "punct";

interface Token {
  text: string;
  type: TokenType;
}

const IDENT = /[A-Za-z0-9_-]/;
const DIGIT = /[0-9]/;
const WS = /\s/;

// ---- .lmn markup -------------------------------------------------------------
function tokenizeLmn(src: string): Token[] {
  const out: Token[] = [];
  const push = (text: string, type: TokenType) => out.push({ text, type });
  let i = 0;
  const n = src.length;
  let inTag = false;

  while (i < n) {
    const c = src[i];

    if (c === "<" && src.startsWith("!--", i + 1)) {
      const end = src.indexOf("-->", i + 4);
      const j = end === -1 ? n : end + 3;
      push(src.slice(i, j), "comment");
      i = j;
      continue;
    }

    if (!inTag) {
      if (c === "<") {
        if (src[i + 1] === "/") {
          push("</", "punct");
          i += 2;
        } else {
          push("<", "punct");
          i += 1;
        }
        let j = i;
        while (j < n && IDENT.test(src[j])) j++;
        if (j > i) push(src.slice(i, j), "tag");
        i = j;
        inTag = true;
        continue;
      }
      let j = i;
      while (j < n && src[j] !== "<") j++;
      push(src.slice(i, j), "plain");
      i = j;
      continue;
    }

    // Inside a tag.
    if (c === ">") {
      push(">", "punct");
      i++;
      inTag = false;
      continue;
    }
    if (c === "/" && src[i + 1] === ">") {
      push("/>", "punct");
      i += 2;
      inTag = false;
      continue;
    }
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
    if (WS.test(c)) {
      let j = i;
      while (j < n && WS.test(src[j])) j++;
      push(src.slice(i, j), "plain");
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && IDENT.test(src[j])) j++;
      push(src.slice(i, j), "attr");
      i = j;
      continue;
    }
    push(c, "punct");
    i++;
  }
  return out;
}

// ---- CSS ---------------------------------------------------------------------
function tokenizeCss(src: string): Token[] {
  const out: Token[] = [];
  const push = (text: string, type: TokenType) => out.push({ text, type });
  let i = 0;
  const n = src.length;
  let depth = 0;
  let inValue = false;

  while (i < n) {
    const c = src[i];

    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? n : end + 2;
      push(src.slice(i, j), "comment");
      i = j;
      continue;
    }
    if (c === "{") {
      push("{", "punct");
      i++;
      depth++;
      inValue = false;
      continue;
    }
    if (c === "}") {
      push("}", "punct");
      i++;
      depth = Math.max(0, depth - 1);
      inValue = false;
      continue;
    }
    if (c === ";") {
      push(";", "punct");
      i++;
      inValue = false;
      continue;
    }
    if (c === ":" && depth > 0 && !inValue) {
      push(":", "punct");
      i++;
      inValue = true;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === q) {
          j++;
          break;
        }
        j++;
      }
      push(src.slice(i, j), "string");
      i = j;
      continue;
    }
    if (c === "#" && depth > 0) {
      let j = i + 1;
      while (j < n && /[0-9A-Fa-f]/.test(src[j])) j++;
      push(src.slice(i, j), "number");
      i = j;
      continue;
    }
    if (WS.test(c)) {
      let j = i;
      while (j < n && WS.test(src[j])) j++;
      push(src.slice(i, j), "plain");
      i = j;
      continue;
    }
    if (DIGIT.test(c)) {
      let j = i + 1;
      while (j < n && /[0-9.]/.test(src[j])) j++;
      push(src.slice(i, j), "number");
      i = j;
      continue;
    }

    if (depth === 0) {
      // Selector context.
      if (/[.#:&A-Za-z]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_\-.#:&]/.test(src[j])) j++;
        push(src.slice(i, j), "tag");
        i = j;
        continue;
      }
      push(c, "punct");
      i++;
      continue;
    }

    // Declaration context.
    if (/[A-Za-z_-]/.test(c)) {
      let j = i;
      while (j < n && IDENT.test(src[j])) j++;
      const word = src.slice(i, j);
      let k = j;
      while (k < n && (src[k] === " " || src[k] === "\t")) k++;
      if (!inValue && src[k] === ":") push(word, "prop");
      else if (src[k] === "(") push(word, "fn");
      else push(word, "plain");
      i = j;
      continue;
    }
    push(c, "punct");
    i++;
  }
  return out;
}

// ---- Script ------------------------------------------------------------------
const KEYWORDS = new Set([
  "fn", "let", "const", "return", "if", "else", "for", "in", "while", "loop",
  "break", "continue", "import", "as", "switch", "match", "struct", "enum",
  "impl", "self",
]);
const LITERALS = new Set(["true", "false"]);

function tokenizeScript(src: string): Token[] {
  const out: Token[] = [];
  const push = (text: string, type: TokenType) => out.push({ text, type });
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];

    if (c === "/" && src[i + 1] === "/") {
      let j = i + 2;
      while (j < n && src[j] !== "\n") j++;
      push(src.slice(i, j), "comment");
      i = j;
      continue;
    }
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
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      let k = j;
      while (k < n && (src[k] === " " || src[k] === "\t")) k++;
      let type: TokenType;
      if (KEYWORDS.has(word)) type = "keyword";
      else if (LITERALS.has(word)) type = "keyword";
      else if (src[k] === "(") type = "fn";
      else type = "plain";
      push(word, type);
      i = j;
      continue;
    }
    push(c, "punct");
    i++;
  }
  return out;
}

function tokenize(code: string, lang: Lang): Token[] {
  if (lang === "lmn") return tokenizeLmn(code);
  if (lang === "css") return tokenizeCss(code);
  return tokenizeScript(code);
}

export function Highlighted({ code, lang }: { code: string; lang: Lang }): ReactNode {
  const tokens = tokenize(code, lang);
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
