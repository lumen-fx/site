import { useState } from "react";
import { CodeBlock } from "../components/CodeBlock";
import { Station } from "../components/Station";
import { HOSTS, SDKS } from "../data";

// Two ways to hold the app: script it in a language Lumen hosts, or own it from
// your own program through the C ABI. The tabs show the second, because that is
// the part people assume is not there.
export function Hosts() {
  const [active, setActive] = useState(0);
  const sdk = SDKS[active];

  return (
    <Station
      index={5}
      title="Bring your own language."
      lede="Lumen picks a script host from the file extension, so an app and a plugin can each use what suits them. Or skip scripting: own the state and the handlers from your own program over the C ABI."
      wide
    >
      <div className="hosts">
        <ul className="hosts__list">
          {HOSTS.map((host) => (
            <li className="hosts__item" key={host.name}>
              <p className="hosts__head">
                <span className="hosts__name">
                  {host.href ? <a href={host.href}>{host.name}</a> : host.name}
                </span>
                <span className="hosts__ext">{host.ext}</span>
              </p>
              <p className="hosts__body">{host.body}</p>
            </li>
          ))}
        </ul>

        <div className="sdks">
          <div className="sdks__tabs" role="tablist" aria-label="SDK">
            {SDKS.map((entry, i) => (
              <button
                key={entry.name}
                type="button"
                role="tab"
                id={`sdk-tab-${entry.name}`}
                aria-selected={i === active}
                aria-controls={`sdk-panel-${entry.name}`}
                className={i === active ? "sdks__tab sdks__tab--on" : "sdks__tab"}
                onClick={() => setActive(i)}
              >
                {entry.name}
              </button>
            ))}
          </div>
          <div
            className="sdks__panel"
            role="tabpanel"
            id={`sdk-panel-${sdk.name}`}
            aria-labelledby={`sdk-tab-${sdk.name}`}
          >
            <p className="sdks__blurb">{sdk.blurb}</p>
            <code className="sdks__install">{sdk.install}</code>
            <CodeBlock code={sdk.code} lang={sdk.lang} label={`${sdk.name} SDK`} />
          </div>
        </div>
      </div>
    </Station>
  );
}
