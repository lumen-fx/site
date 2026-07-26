import { useState } from "react";
import { Highlighted } from "../lib/highlight";

// A syntax-highlighted code block with a copy button. `label` names the language
// for screen readers; the copy control is keyboard focusable.
export function CodeBlock({ code, label = "candela" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the code is still selectable.
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{label}</span>
        <button
          type="button"
          className="code-block__copy"
          onClick={copy}
          aria-label="Copy code to clipboard"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="code-block__pre" tabIndex={0}>
        <code>
          <Highlighted code={code} />
        </code>
      </pre>
    </div>
  );
}
