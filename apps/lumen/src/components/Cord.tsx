import { useRef, useState } from "react";

// The lamp's pull cord. Drag it down and let go, or press it like any button,
// and the lamp goes out: the falloff stops, no station is lit, and the readout
// reads zero. Pull again and the light comes back.
//
// It is the one control on the page that operates the instrument the page is
// built out of, which is the point of putting it here rather than a switch in
// a corner.
const PULL_TO_CLICK = 26;
const MAX_STRETCH = 46;

export function Cord({ lit, onToggle }: { lit: boolean; onToggle: () => void }) {
  const [stretch, setStretch] = useState(0);
  const origin = useRef(0);
  const pulling = useRef(false);

  const start = (event: React.PointerEvent<HTMLButtonElement>) => {
    pulling.current = true;
    origin.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!pulling.current) return;
    const pulled = Math.max(0, Math.min(MAX_STRETCH, event.clientY - origin.current));
    setStretch(pulled);
  };

  const end = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!pulling.current) return;
    pulling.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    // A pull past the catch toggles, and so does a plain tap. A short drag that
    // never reached the catch springs back and changes nothing, which is what a
    // cord does.
    if (stretch === 0 || stretch >= PULL_TO_CLICK) onToggle();
    setStretch(0);
  };

  return (
    <button
      type="button"
      className={stretch > 0 ? "cord cord--pulling" : "cord"}
      style={{ "--pull": `${stretch}px` } as React.CSSProperties}
      aria-pressed={lit}
      aria-label={lit ? "Turn the lamp off" : "Turn the lamp on"}
      title={lit ? "Pull to turn the lamp off" : "Pull to turn the lamp on"}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onClick={(event) => {
        // Pointer sequences are handled above. A keyboard activation arrives as
        // a click with no pointer behind it, which is what detail 0 means.
        if (event.detail === 0) onToggle();
      }}
    >
      <span className="cord__line" aria-hidden="true" />
      <span className="cord__bead" aria-hidden="true" />
    </button>
  );
}
