import { useRef } from "react";
import { CM_PER_STATION, STATIONS } from "../data";

// The bench ruler, standing on its edge beside the lamp. It is the scale the
// stations sit on, the indicator of how far down the page you are, and the way
// to move: click a mark to travel to that station, or drag the cursor to run
// the lamp along the bench. It is the page's scrollbar, in the page's own
// language, which is why there is no row of navigation links.
export function Ruler({
  onGo,
  onScrub,
  current,
}: {
  onGo: (index: number) => void;
  onScrub: (fraction: number) => void;
  current: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fractionAt = (clientY: number): number => {
    const box = track.current?.getBoundingClientRect();
    if (!box || box.height === 0) return 0;
    return (clientY - box.top) / box.height;
  };

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(fractionAt(event.clientY));
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    onScrub(fractionAt(event.clientY));
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <nav className="ruler" aria-label="Bench stations">
      <div
        className="ruler__track"
        ref={track}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        title="Drag to run the lamp along the bench"
      >
        <span className="ruler__line" aria-hidden="true" />
        <span className="ruler__cursor" aria-hidden="true" />
      </div>

      <ol className="ruler__marks">
        {STATIONS.map((station, i) => (
          <li className="ruler__mark" key={station.id}>
            <button
              type="button"
              className="ruler__go"
              aria-current={i === current ? "true" : undefined}
              onClick={() => onGo(i)}
            >
              <span className="ruler__tick" aria-hidden="true" />
              <span className="ruler__cm">{i * CM_PER_STATION}</span>
              <span className="ruler__name">{station.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
