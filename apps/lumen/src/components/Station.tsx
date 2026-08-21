import type { CSSProperties, ReactNode } from "react";
import { STATIONS } from "../data";

// One band of the spectrum. The mark in the margin is the station's
// wavelength, so the reader can place it on the rail at the right edge. The
// band's hue arrives as --acc and colours the eyebrow, panel edges, and
// anything else the stylesheet keys off it.
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
      style={{ "--acc": meta.hue } as CSSProperties}
    >
      <p className="station__mark">
        <span className="station__nm" aria-label={`${meta.nm} nanometres`}>
          {"λ"} {meta.nm}
          <small> nm</small>
        </span>
        <span className="station__name">{meta.label}</span>
      </p>
      <div className="station__body">
        <h2 className="station__title" id={headingId}>
          {title}
        </h2>
        {lede ? <p className="station__lede">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
