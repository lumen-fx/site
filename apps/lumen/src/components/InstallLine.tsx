import { useState } from "react";
import { INSTALL_CMD } from "../data";

// The one-line install, with a copy control. It appears at both ends of the
// page: at the source, where someone decides, and past red, where someone
// who read the whole thing decides.
export function InstallLine() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the command is still selectable.
    }
  };

  return (
    <div className="install" aria-label="Install command">
      <code className="install__cmd">
        <span className="install__prompt">$</span> {INSTALL_CMD}
      </code>
      <button
        type="button"
        className="install__copy"
        onClick={copy}
        aria-label="Copy the install command"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
