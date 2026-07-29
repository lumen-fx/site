import { STACK_ROWS } from "../data";

// The window the hero markup renders to: the list the candela snippet builds by
// querying "#stack" and appending a row per crate. Its own colours, not the
// site's, so it reads as a real app rather than a piece of the page.
export function RenderPreview() {
  return (
    <div className="render" aria-label="The rendered window">
      <div className="render__chrome">
        <span className="render__dot" />
        <span className="render__dot" />
        <span className="render__dot" />
        <span className="render__title">the stack</span>
      </div>
      <div className="render__body render__body--list">
        <div className="render__list-title">the stack</div>
        {STACK_ROWS.map((name) => (
          <div className="render__crate" key={name}>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
