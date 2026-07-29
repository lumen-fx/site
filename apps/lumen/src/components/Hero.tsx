import { useRef, useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { RenderPreview } from "./RenderPreview";
import { DOCS_URL, HERO_CDL, INSTALL_CMD, REPO_URL, RELEASES_URL } from "../data";

// Readouts are qualitative posture, not drifting figures. The measured numbers
// live in the benchmarks panel below, where they are sourced and reproducible.
const READOUTS = [
  { k: "click", v: "next frame" },
  { k: "idle", v: "0% cpu" },
  { k: "save", v: "no restart" },
];

export function Hero() {
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Selectable as a fallback.
    }
  };

  // Move the light source under the pointer: the hero is lit by one lamp.
  const trackLight = (e: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <header className="hero" ref={heroRef} onPointerMove={trackLight}>
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <p className="hero__eyebrow">Native UI, GPU-rendered</p>
            <h1 className="hero__title">
              Write the markup.
              <br />
              <span className="lit">Lumen renders it.</span>
            </h1>
            <p className="hero__tagline">
              A Rust UI framework for native desktop apps. Real CSS, reactive signals,
              and hot reload that keeps your state.
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

            <div className="hero__readouts">
              {READOUTS.map((r) => (
                <span className="readout" key={r.k}>
                  <span className="readout__k">{r.k}</span>
                  <span className="readout__v">{r.v}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero__stack">
              <CodeBlock code={HERO_CDL} lang="script" label="main.cdl" />
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
