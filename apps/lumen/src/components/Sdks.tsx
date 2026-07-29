import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { SDKS } from "../data";

// Drive Lumen from a host language instead of a script: own the state and the
// event handlers in Rust, Python, or C/C++, all on the same C ABI.
export function Sdks() {
  const [active, setActive] = useState(SDKS[0].name);
  const sdk = SDKS.find((s) => s.name === active) ?? SDKS[0];

  return (
    <section className="section" id="sdks">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">SDKs</span>
          <h2 className="section__title">Drive it from your language</h2>
          <p className="section__lead">
            Own the state and event handlers from Rust, Python, or C and C++ instead of a
            script. Every SDK sits on the same C ABI.
          </p>
        </div>

        <div className="showcase" data-reveal>
          <div className="showcase__tabs" role="tablist" aria-label="SDK languages">
            {SDKS.map((s) => (
              <button
                key={s.name}
                type="button"
                role="tab"
                aria-selected={s.name === active}
                className={`showcase__tab${s.name === active ? " is-active" : ""}`}
                onClick={() => setActive(s.name)}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="sdk__meta">
            <code className="sdk__install">{sdk.install}</code>
            <span className="sdk__blurb">{sdk.blurb}</span>
          </div>
          <CodeBlock code={sdk.code} lang={sdk.lang} label={sdk.name} />
        </div>
      </div>
    </section>
  );
}
