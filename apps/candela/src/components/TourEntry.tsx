import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import type { TourEntry as Entry } from "../data";

// One program from the tour. It reads as a code block until you decide to
// change it: Edit swaps in a text area holding the same source, and Run sends
// whatever is there now to the prompt. Changing a number and watching the
// output change is the whole point of putting a runtime on the page.
export function TourEntry({ entry, onRun }: { entry: Entry; onRun: (code: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [source, setSource] = useState(entry.code);
  const changed = source !== entry.code;

  return (
    <li className="tour__item" id={`tour-${entry.id}`}>
      <div className="tour__text">
        <h3 className="tour__head">{entry.title}</h3>
        <p className="tour__body">{entry.body}</p>
        <p className="tour__actions">
          <button type="button" className="tour__run" onClick={() => onRun(source)}>
            Run this
          </button>
          <button type="button" className="tour__edit" onClick={() => setEditing((on) => !on)}>
            {editing ? "Done" : "Edit"}
          </button>
          {changed ? (
            <button
              type="button"
              className="tour__edit"
              onClick={() => setSource(entry.code)}
              title="Put the documentation's version back"
            >
              Reset
            </button>
          ) : null}
        </p>
      </div>

      {editing ? (
        <div className="tour__editor">
          <label className="tour__editor-bar" htmlFor={`edit-${entry.id}`}>
            {entry.id}.cdl
            {changed ? <span className="tour__changed">edited</span> : null}
          </label>
          <textarea
            id={`edit-${entry.id}`}
            className="tour__source"
            value={source}
            spellCheck={false}
            rows={source.split("\n").length + 1}
            onChange={(event) => setSource(event.target.value)}
          />
        </div>
      ) : (
        <CodeBlock code={source} label={`${entry.id}.cdl`} />
      )}
    </li>
  );
}
