import { useEffect, useState } from "react";

// The signature scroll: a fixed vertical exposure rail down the left edge that
// fills as you read the page, with a tabular percent readout. Reads like an
// instrument tracking how much light has been let in.
export function ScrollMeter() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-meter" aria-hidden="true">
      <div className="scroll-meter__track">
        <div className="scroll-meter__fill" style={{ height: `${pct * 100}%` }} />
      </div>
      <span className="scroll-meter__pct">{String(Math.round(pct * 100)).padStart(2, "0")}</span>
    </div>
  );
}
