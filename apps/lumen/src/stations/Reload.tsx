import { Station } from "../components/Station";
import { RELOAD_READINGS } from "../data";

export function Reload() {
  return (
    <Station
      index={4}
      title="Save the file. Keep your place."
      lede="Hot reload swaps markup, CSS, or script into the window that is already open. Focus, scroll position, and every signal value survive, so you carry on from where you were rather than from the first screen."
    >
      <ol className="swap">
        {RELOAD_READINGS.map((reading) => (
          <li className="swap__item" key={reading.key}>
            <p className="swap__head">
              <span className="swap__file">{reading.key}</span>
              <span className="swap__arrow" aria-hidden="true">
                -&gt;
              </span>
              <span className="swap__verb">{reading.value}</span>
            </p>
            <p className="swap__body">{reading.body}</p>
          </li>
        ))}
      </ol>
      <p className="station__aside">
        The window never restarts, so there is no cold start to sit through and no state to
        set up again before the change you made is on screen.
      </p>
    </Station>
  );
}
