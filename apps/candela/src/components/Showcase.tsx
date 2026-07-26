import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { SNIPPETS } from "../data";

export function Showcase() {
  const [active, setActive] = useState(SNIPPETS[0].id);
  const snippet = SNIPPETS.find((s) => s.id === active) ?? SNIPPETS[0];

  return (
    <section className="section section--muted" id="showcase">
      <div className="container">
        <div className="section__head">
          <h2 className="section__title">Read it and it reads clearly</h2>
          <p className="section__lead">Real Candela, straight from the language's own tests.</p>
        </div>

        <div className="showcase">
          <div className="showcase__tabs" role="tablist" aria-label="Code examples">
            {SNIPPETS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === active}
                className={`showcase__tab${s.id === active ? " is-active" : ""}`}
                onClick={() => setActive(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="showcase__caption">{snippet.caption}</p>
          <CodeBlock code={snippet.code} />
        </div>
      </div>
    </section>
  );
}
