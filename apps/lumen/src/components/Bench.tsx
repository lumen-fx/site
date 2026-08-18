import { useCallback, useRef, useState } from "react";
import { Cord } from "./Cord";
import { Lamp, type ReadoutRefs } from "./Lamp";
import { Ruler } from "./Ruler";
import { useRail, type Readout } from "../lib/useRail";
import { CM_PER_STATION, STATIONS } from "../data";
import { Source } from "../stations/Source";
import { Markup } from "../stations/Markup";
import { Styles } from "../stations/Styles";
import { Signals } from "../stations/Signals";
import { Reload } from "../stations/Reload";
import { Hosts } from "../stations/Hosts";
import { Measured } from "../stations/Measured";
import { Install } from "../stations/Install";

// The bench: a lamp and a graduated rail down the left, and the stations
// stacked beside them. The rail's children are the stations in order, which is
// also the order the bench measures them in.
export function Bench() {
  const readout: ReadoutRefs = {
    target: useRef<HTMLSpanElement>(null),
    distance: useRef<HTMLSpanElement>(null),
    lux: useRef<HTMLSpanElement>(null),
    bar: useRef<HTMLSpanElement>(null),
  };

  // Which station the lamp is on. That changes eight times over the whole page,
  // so it can be state; the numbers beside it change every frame and cannot.
  const [nearest, setNearest] = useState(0);
  const [lit, setLit] = useState(true);
  const lastIndex = useRef(0);
  const cursor = useRef<HTMLDivElement>(null);

  const onReadout = useCallback((r: Readout) => {
    if (readout.target.current) {
      readout.target.current.textContent = r.e > 0 ? STATIONS[r.index].caption : "dark";
    }
    if (readout.distance.current) readout.distance.current.textContent = r.cm.toFixed(1);
    if (readout.lux.current) readout.lux.current.textContent = r.e.toFixed(3);
    if (readout.bar.current) readout.bar.current.style.width = `${(r.e * 100).toFixed(1)}%`;
    cursor.current?.style.setProperty("--p", r.progress.toFixed(5));
    if (r.index !== lastIndex.current) {
      lastIndex.current = r.index;
      setNearest(r.index);
    }
  }, []);

  const { railRef, compact, goTo, scrubTo } = useRail(CM_PER_STATION, lit, onReadout);

  const classes = ["bench"];
  if (compact) classes.push("bench--compact");
  if (!lit) classes.push("bench--dark");

  return (
    <div className={classes.join(" ")}>
      <div className="bench__instrument" ref={cursor}>
        <Lamp readout={readout} lit={lit} cord={<Cord lit={lit} onToggle={() => setLit((on) => !on)} />} />
        <Ruler onGo={goTo} onScrub={scrubTo} current={nearest} />
      </div>

      <div className="bench__stations" ref={railRef}>
        <Source />
        <Markup />
        <Styles />
        <Signals />
        <Reload />
        <Hosts />
        <Measured />
        <Install />
      </div>
    </div>
  );
}
