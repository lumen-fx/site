import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { SNIPPETS } from "../data";

export function Showcase() {
  const [active, setActive] = useState(SNIPPETS[0].id);
  const snippet = SNIPPETS.find((s) => s.id === active) ?? SNIPPETS[0];

  return (
    <section className="section section--muted" id="showcase">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">The dynamic DOM</span>
          <h2 className="section__title">Query a node in candela, build its children</h2>
          <p className="section__lead">
            Markup declares an empty container; candela queries it on the DOM API and
            appends a row per item. The same app across its files.
          </p>
        </div>

        <div className="showcase" data-reveal>
          <div className="showcase__tabs" role="tablist" aria-label="The files of a Lumen app">
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
          <CodeBlock code={snippet.code} lang={snippet.lang} label={snippet.label} />
        </div>
      </div>
    </section>
  );
}
