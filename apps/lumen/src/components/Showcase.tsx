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
          <span className="eyebrow">One app, three files</span>
          <h2 className="section__title">Markup, CSS, and a script</h2>
          <p className="section__lead">
            Markup declares the widgets, CSS themes them from tokens, and candela owns the
            click handling. This is what <code>lumenc new app counter</code> writes.
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
