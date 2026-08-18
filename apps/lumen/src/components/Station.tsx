import type { ReactNode } from "react";
import { CM_PER_STATION, STATIONS } from "../data";

// One position on the bench. The mark in the corner is its distance from the
// lamp, so the reader can place what they are looking at on the ruler below.
//
// Brightness arrives as the --e custom property, written by the bench on every
// frame. Content is never hidden: a dim station is still in the document, still
// reachable, and lights up when it takes focus.
export function Station({
  index,
  title,
  lede,
  children,
  wide = false,
}: {
  index: number;
  title: string;
  lede?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const meta = STATIONS[index];
  const headingId = `station-${meta.id}-title`;

  return (
    <section
      className={wide ? "station station--wide" : "station"}
      id={`station-${meta.id}`}
      aria-labelledby={headingId}
    >
      <p className="station__mark">
        <span className="station__cm">{index * CM_PER_STATION} cm</span>
        <span className="station__name">{meta.label}</span>
        <span className="station__rule" aria-hidden="true" />
      </p>
      <h2 className="station__title" id={headingId}>
        {title}
      </h2>
      {lede ? <p className="station__lede">{lede}</p> : null}
      <div className="station__body">{children}</div>
    </section>
  );
}
