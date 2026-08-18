import { CodeBlock } from "../components/CodeBlock";
import { Station } from "../components/Station";
import { STYLES_CSS } from "../data";

export function Styles() {
  return (
    <Station
      index={2}
      title="Styled by a real cascade."
      lede="Custom properties on :root, var() everywhere else, class and id selectors, hover, press, and focus states, flexbox and grid. It is CSS, and it behaves like CSS."
    >
      <CodeBlock code={STYLES_CSS} lang="css" label="main.css" />
      <ul className="notes">
        <li>
          <span className="notes__key">tokens</span>
          <span className="notes__body">
            Colours and radii live in one block, so a theme change touches one place.
          </span>
        </li>
        <li>
          <span className="notes__key">states</span>
          <span className="notes__body">
            hover-bg, press-bg, and :focus are properties of the widget, not of your handler.
          </span>
        </li>
        <li>
          <span className="notes__key">layout</span>
          <span className="notes__body">
            Flexbox and grid lay the tree out; text is shaped and hinted per glyph.
          </span>
        </li>
      </ul>
    </Station>
  );
}
