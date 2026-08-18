import type { ReactNode, RefObject } from "react";

// The lamp: the one fixed thing on the bench. It holds position at the left of
// the viewport while the stations travel past it, and its readout reports what
// the nearest station is receiving.
//
// The readout is written straight into these nodes on every animation frame.
// Routing numbers that change 60 times a second through React state would
// re-render the whole bench for a label nobody is reading character by
// character, so the values live in the DOM and the components stay still.
export interface ReadoutRefs {
  target: RefObject<HTMLSpanElement>;
  distance: RefObject<HTMLSpanElement>;
  lux: RefObject<HTMLSpanElement>;
  bar: RefObject<HTMLSpanElement>;
}

export function Lamp({
  readout,
  lit,
  cord,
}: {
  readout: ReadoutRefs;
  lit: boolean;
  cord: ReactNode;
}) {
  return (
    <div className={lit ? "lamp" : "lamp lamp--out"}>
      <div className="lamp__housing" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="lamp__glass" role="presentation">
          <circle className="lamp__bloom" cx="32" cy="32" r="30" />
          <circle className="lamp__ring" cx="32" cy="32" r="19" />
          <circle className="lamp__core" cx="32" cy="32" r="7" />
          <path className="lamp__filament" d="M26 32h4l2-5 2 10 2-5h4" />
        </svg>
        <span className="lamp__label">{lit ? "lamp" : "lamp off"}</span>
      </div>
      {cord}

      <dl className="readout" aria-hidden="true">
        <div className="readout__row">
          <dt>target</dt>
          <dd>
            <span ref={readout.target}>source</span>
          </dd>
        </div>
        <div className="readout__row">
          <dt>distance</dt>
          <dd>
            <span ref={readout.distance}>0.0</span> cm
          </dd>
        </div>
        <div className="readout__row">
          <dt>lux</dt>
          <dd>
            <span ref={readout.lux}>1.000</span>
          </dd>
        </div>
        <div className="readout__meter">
          <span className="readout__fill" ref={readout.bar} />
        </div>
      </dl>
    </div>
  );
}
