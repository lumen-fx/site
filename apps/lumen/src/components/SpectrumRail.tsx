import { useEffect, useState } from "react";
import { STATIONS } from "../data";

// The site's navigation: the visible spectrum as a thin vertical strip at the
// right edge. Each station is a tick at its wavelength; the source sits above
// the strip as white light. Clicking a tick travels there, and the tick of the
// station currently on screen is enlarged.
const NM_MIN = 400;
const NM_MAX = 700;

export function SpectrumRail() {
  const [active, setActive] = useState("source");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace("station-", ""));
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    for (const meta of STATIONS) {
      const el = document.getElementById(`station-${meta.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(`station-${id}`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav className="rail" aria-label="Stations">
      {STATIONS.map((meta) => {
        const frac = meta.nm ? (meta.nm - NM_MIN) / (NM_MAX - NM_MIN) : 0;
        return (
          <button
            key={meta.id}
            type="button"
            className={meta.id === active ? "rail__tick rail__tick--on" : "rail__tick"}
            style={
              meta.nm
                ? { top: `calc(${(frac * 100).toFixed(1)}% )`, color: meta.hue }
                : { top: "-34px", color: meta.hue }
            }
            aria-label={meta.nm ? `${meta.label}, ${meta.nm} nm` : meta.label}
            aria-current={meta.id === active ? "true" : undefined}
            onClick={() => go(meta.id)}
          >
            <span className="rail__dot" aria-hidden="true" />
            <span className="rail__name">{meta.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
