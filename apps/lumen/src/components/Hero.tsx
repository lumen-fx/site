import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { RenderPreview } from "./RenderPreview";
import { DOCS_URL, HERO_LMN, INSTALL_CMD, REPO_URL, RELEASES_URL } from "../data";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Selectable as a fallback.
    }
  };

  return (
    <header className="hero">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <p className="hero__eyebrow">Rust UI framework for desktop</p>
            <h1 className="hero__title">Lumen</h1>
            <p className="hero__tagline">
              Write the markup and the CSS. Lumen renders it to a native window, and
              reloads as you save.
            </p>

            <div className="hero__cta">
              <a className="btn btn-lit btn-lg" href={DOCS_URL}>
                Get started
              </a>
              <a className="btn btn-outline-soft btn-lg" href={REPO_URL}>
                GitHub
              </a>
            </div>

            <div className="install" aria-label="Install command">
              <code className="install__cmd">
                <span className="install__prompt">$</span> {INSTALL_CMD}
              </code>
              <button
                type="button"
                className="install__copy"
                onClick={copyInstall}
                aria-label="Copy install command"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="install__note">
              macOS and Linux install the prebuilt toolchain. On Windows, grab a build from the{" "}
              <a href={RELEASES_URL}>latest release</a>.
            </p>
          </div>

          <div className="col-lg-6">
            <div className="hero__stack">
              <CodeBlock code={HERO_LMN} lang="lmn" label="main.lmn" />
              <div className="hero__arrow" aria-hidden="true">
                renders to
              </div>
              <RenderPreview />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
