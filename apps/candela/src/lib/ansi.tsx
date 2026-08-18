// candela reports errors the way it does at a terminal: coloured with ANSI
// escapes, underlining the span that went wrong. The page shows that report as
// it is, so the escapes are turned into spans rather than stripped.
import type { ReactNode } from "react";

const CLASS_BY_CODE: Record<string, string> = {
  "1": "ansi-b",
  "31": "ansi-red",
  "32": "ansi-green",
  "33": "ansi-yellow",
  "34": "ansi-blue",
  "36": "ansi-cyan",
  "90": "ansi-dim",
  "91": "ansi-red",
  "92": "ansi-green",
  "94": "ansi-blue",
};

/** The classes an SGR parameter list turns on, given what is already on. */
function apply(current: string[], params: string): string[] {
  const codes = params.split(";").filter(Boolean);
  if (codes.length === 0 || codes[0] === "0") return [];

  // 256-colour selects: candela uses the greys for its frame and gutters.
  if (codes[0] === "38" && codes[1] === "5") {
    const shade = Number(codes[2]);
    return [...current.filter((c) => !c.startsWith("ansi-")), shade >= 240 ? "ansi-dim" : "ansi-fg"];
  }

  let next = [...current];
  for (const code of codes) {
    if (code === "0") next = [];
    else if (code === "39" || code === "22") next = next.filter((c) => c !== CLASS_BY_CODE[code]);
    else {
      const cls = CLASS_BY_CODE[code];
      if (cls) next = [...next.filter((c) => c !== cls), cls];
    }
  }
  return next;
}

const SGR = /\u001b\[([0-9;]*)m/g;

export function Ansi({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let classes: string[] = [];
  let last = 0;
  let key = 0;

  SGR.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SGR.exec(text)) !== null) {
    if (match.index > last) {
      const chunk = text.slice(last, match.index);
      out.push(
        classes.length ? (
          <span key={key++} className={classes.join(" ")}>
            {chunk}
          </span>
        ) : (
          <span key={key++}>{chunk}</span>
        ),
      );
    }
    classes = apply(classes, match[1]);
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    const chunk = text.slice(last);
    out.push(
      classes.length ? (
        <span key={key++} className={classes.join(" ")}>
          {chunk}
        </span>
      ) : (
        <span key={key++}>{chunk}</span>
      ),
    );
  }
  return <>{out}</>;
}
