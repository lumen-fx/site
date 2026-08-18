import { useEffect, useRef } from "react";
import type { Flame } from "./Prompt";

// A candela is the intensity of one candle flame, so the page keeps one lit.
//
// The flame reports the runtime: steady while it waits, tall while a program
// runs, guttering when one fails. The wax tracks how far down the page you are,
// so by the footer there is a stub left. Neither is decoration: both say
// something the page would otherwise need a label for.
export function Candle({ flame }: { flame: Flame }) {
  const wax = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let queued = false;
    const paint = () => {
      queued = false;
      const el = wax.current;
      if (!el) return;
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      const burnt = travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0;
      el.style.setProperty("--burnt", burnt.toFixed(4));

      // The candle shortens as it burns, so the flame sits lower each time.
      // The room is lit from where the flame is, not from a spot the
      // stylesheet chose once.
      const flameBox = tip.current?.getBoundingClientRect();
      if (flameBox) {
        const root = document.documentElement.style;
        root.setProperty("--flame-x", `${flameBox.left + flameBox.width / 2}px`);
        root.setProperty("--flame-y", `${flameBox.top + flameBox.height / 2}px`);
      }
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <aside className={`candle candle--${flame}`} aria-hidden="true">
      <div className="candle__flame">
        <span className="candle__glow" />
        <span className="candle__tip" ref={tip} />
      </div>
      <div className="candle__stick" ref={wax}>
        <span className="candle__wick" />
        <span className="candle__wax" />
      </div>
      <p className="candle__unit">1 cd</p>
    </aside>
  );
}
