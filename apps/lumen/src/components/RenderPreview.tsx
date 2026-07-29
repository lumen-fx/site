import { useState } from "react";

// The signature element: the counter from the hero markup, rendered as a live
// window. Clicking the buttons drives the same count the .lmn/script sample
// describes, so the panel shows what the markup on the left turns into.
export function RenderPreview() {
  const [count, setCount] = useState(0);

  return (
    <div className="render" aria-label="The counter markup, running">
      <div className="render__chrome">
        <span className="render__dot" />
        <span className="render__dot" />
        <span className="render__dot" />
        <span className="render__title">Counter</span>
      </div>
      <div className="render__body">
        <div className="render__count" aria-live="polite">
          {count}
        </div>
        <div className="render__row">
          <button
            type="button"
            className="render__btn render__btn--primary"
            onClick={() => setCount((c) => c + 1)}
          >
            +1
          </button>
          <button
            type="button"
            className="render__btn"
            onClick={() => setCount(0)}
          >
            reset
          </button>
        </div>
      </div>
    </div>
  );
}
