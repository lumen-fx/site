// Drives the bench.
//
// The page scrolls the way every page scrolls. What the bench adds is the lamp:
// it holds position at the left of the viewport, and each station is lit by how
// far it is from that position. The station beside the lamp is at full
// brightness and the ones above and below cool off, but they stay readable, so
// the whole page can be skimmed, searched, and read out of order.
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp01, illuminance } from "./falloff";

export interface Readout {
  /** Index of the station nearest the lamp. */
  index: number;
  /** Its distance from the lamp, in centimetres of bench; negative once past. */
  cm: number;
  /** The illuminance it is receiving, 0..1. */
  e: number;
  /** How far down the whole bench the lamp has travelled, 0..1. */
  progress: number;
}

const NARROW = "(max-width: 900px)";

function isNarrow(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(NARROW).matches;
}

export function useRail(cmPerStation: number, lit: boolean, onReadout: (r: Readout) => void) {
  const railRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(isNarrow);
  const readout = useRef(onReadout);
  readout.current = onReadout;
  // The lamp's switch. Held in a ref as well as a dependency so the frame loop
  // reads it without being rebuilt mid-drag.
  const on = useRef(lit);
  on.current = lit;
  const span = useRef({ first: 0, last: 0 });
  const repaint = useRef<() => void>(() => {});

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const sync = () => setCompact(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let queued = false;
    const paint = () => {
      queued = false;
      const stations = rail.children as HTMLCollectionOf<HTMLElement>;
      const lamp = window.scrollY + window.innerHeight / 2;

      let nearest = 0;
      let brightest = -1;
      let offset = 0;
      const centres: number[] = [];

      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const centre = station.offsetTop + station.offsetHeight / 2;
        centres.push(centre);
        const from = centre - lamp;
        // With the lamp switched off nothing is lit, so every station sits at
        // the floor the stylesheet keeps for readability.
        const e = on.current ? illuminance(from / window.innerHeight) : 0;
        station.style.setProperty("--e", e.toFixed(4));
        if (e > brightest) {
          brightest = e;
          nearest = i;
          offset = from;
        }
      }

      // Centimetres, read off the bench itself: consecutive stations are one
      // mark apart however tall they are, so the distance is interpolated
      // against the gap the lamp is currently inside.
      const neighbour = offset >= 0 ? centres[nearest + 1] : centres[nearest - 1];
      const gap = neighbour === undefined ? 0 : Math.abs(neighbour - centres[nearest]);
      const cm = gap > 0 ? (offset / gap) * cmPerStation : 0;

      const first = centres[0];
      const last = centres[centres.length - 1];
      span.current = { first, last };
      const progress = last > first ? clamp01((lamp - first) / (last - first)) : 0;

      readout.current({ index: nearest, cm, e: brightest, progress });
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };

    paint();
    repaint.current = schedule;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(rail);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [cmPerStation]);

  // Switching the lamp changes every station's light, and nothing scrolled, so
  // ask for a frame.
  useEffect(() => {
    repaint.current();
  }, [lit]);

  /** Put the lamp at a fraction of the way down the bench. The ruler's cursor
   *  is draggable, and this is what dragging it does. */
  const scrubTo = useCallback((fraction: number) => {
    const { first, last } = span.current;
    if (last <= first) return;
    const lamp = first + clamp01(fraction) * (last - first);
    window.scrollTo({ top: Math.max(0, lamp - window.innerHeight / 2), behavior: "auto" });
  }, []);

  /** Bring a station to the lamp. Used by the ruler. */
  const goTo = useCallback((index: number) => {
    const rail = railRef.current;
    const station = rail?.children[index] as HTMLElement | undefined;
    if (!station) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = station.offsetTop - Math.max(0, (window.innerHeight - station.offsetHeight) / 2);
    window.scrollTo({ top: Math.max(0, top), behavior: still ? "auto" : "smooth" });
  }, []);

  return { railRef, compact, goTo, scrubTo };
}
