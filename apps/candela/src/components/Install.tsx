import { useState } from "react";
import {
  DOCS_URL,
  INSTALL_CMD,
  LICENSE_URL,
  LUMEN_URL,
  MSI_URL,
  RELEASES_URL,
  REPO_URL,
} from "../data";

// The end of the page: take the same runtime off the web and onto a machine,
// where it has a file system and the standard library the browser build cannot
// reach.
export function Install() {
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
    <section className="install" id="install" aria-labelledby="install-title">
      <h2 className="install__title" id="install-title">
        Put it on your machine
      </h2>
      <p className="install__lede">
        One command installs the toolchain: the compiler, the virtual machine, the standard
        library, and a prompt like the one above with imports that work.
      </p>

      <div className="install__cmdline">
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
      <p className="install__note">
        macOS and Linux. On Windows,{" "}
        <a href={MSI_URL} download>
          download the installer
        </a>
        . It is unsigned for now, so Windows warns before it runs.
      </p>

      <p className="install__links">
        <a className="btn btn--flame" href={DOCS_URL}>
          Documentation
        </a>
        <a className="btn btn--quiet" href={REPO_URL}>
          GitHub
        </a>
        <a className="btn btn--quiet" href={RELEASES_URL}>
          Releases
        </a>
      </p>

      <footer className="foot">
        <span>Apache-2.0. Read the <a href={LICENSE_URL}>licence</a>.</span>
        <span>
          candela is also the scripting language of <a href={LUMEN_URL}>Lumen</a>.
        </span>
        <span>Pre-1.0: the language moves between releases.</span>
      </footer>
    </section>
  );
}
