import { CodeBlock } from "../components/CodeBlock";
import { Station } from "../components/Station";
import { MARKUP_LMN } from "../data";

export function Markup() {
  return (
    <Station
      index={1}
      title="A window is a tree of widgets."
      lede="Write it in .lmn. Tags nest, ids and classes mean what they mean everywhere else, and bind-text points a label at a value instead of at a string."
    >
      <CodeBlock code={MARKUP_LMN} lang="lmn" label="main.lmn" />
      <ul className="notes">
        <li>
          <span className="notes__key">row, column, label, button</span>
          <span className="notes__body">
            Layout tags carry the box: gap, padding, alignment. Widgets carry their own text.
          </span>
        </li>
        <li>
          <span className="notes__key">bind-text</span>
          <span className="notes__body">
            Names a signal. The label follows it, so no handler ever sets the text by hand.
          </span>
        </li>
        <li>
          <span className="notes__key">script src</span>
          <span className="notes__body">
            Attaches the behaviour. The extension decides which language runs it.
          </span>
        </li>
      </ul>
    </Station>
  );
}
