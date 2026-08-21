import { useEffect, useRef, useState, type ReactNode } from "react";
import { Highlighted } from "../lib/highlight";
import { MARKUP_LMN, SIGNALS_CDL, STYLES_CSS } from "../data";

// The counter template as an exploded drawing. The four layers a Lumen window
// is made of - markup, cascade, signals, and the GPU raster - float apart in
// an isometric stack beside the markup, css, and signals stations. Scrolling
// through those stations collapses the stack, and at the end it lands as a
// working window: the buttons are real, and a click moves the signal readout
// in the signals layer and the raster preview at the same time, because they
// are all bound to the one value.
//
// The excerpts on the layers are sliced from the same generated constants the
// stations' code blocks show, so they cannot drift from the product repo.

const firstLines = (code: string, n: number) => code.split("\n").slice(0, n).join("\n");

const bumpFn = (() => {
  const m = SIGNALS_CDL.match(/fn on_bump[\s\S]*?\n\}/);
  return m ? m[0] : firstLines(SIGNALS_CDL, 6);
})();

// The raster layer: the counter painted coarse and upscaled with pixelation,
// standing in for the wgpu pass.
function paintRaster(ctx: CanvasRenderingContext2D, clicks: number) {
  ctx.fillStyle = "#0c1c30";
  ctx.fillRect(0, 0, 88, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(clicks), 44, 30);
  ctx.fillStyle = "#163459";
  ctx.fillRect(16, 42, 24, 10);
  ctx.fillRect(48, 42, 24, 10);
}

export function ExplodedDemo({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pxRef = useRef<HTMLCanvasElement>(null);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const ctx = pxRef.current?.getContext("2d");
    if (ctx) paintRaster(ctx, clicks);
  }, [clicks]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.style.setProperty("--p", "1");
      root.dataset.step = "2";
      root.dataset.assembled = "true";
      return;
    }

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh * 0.4 - rect.top) / (rect.height - vh * 0.55);
      const p = Math.min(1, Math.max(0, raw));
      const eased = p * p * (3 - 2 * p);
      root.style.setProperty("--p", eased.toFixed(4));
      root.dataset.step = p < 0.36 ? "0" : p < 0.7 ? "1" : "2";
      root.dataset.assembled = eased > 0.82 ? "true" : "false";
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="demo" ref={rootRef} data-step="0" data-assembled="false">
      <div className="demo__stations">{children}</div>

      <div className="demo__scene">
        <div className="demo__stick">
          <div className="assembly">
            <div className="layer layer--paint" aria-hidden="true">
              <span className="layer__tab">wgpu</span>
              <canvas ref={pxRef} width={88} height={64} />
            </div>

            <div className="layer layer--signals" aria-hidden="true">
              <span className="layer__tab">main.cdl</span>
              <p className="layer__readout">
                signal clicks = <b>{clicks}</b>
              </p>
              <pre className="layer__code">
                <code>
                  <Highlighted code={bumpFn} lang="script" />
                </code>
              </pre>
            </div>

            <div className="layer layer--css" aria-hidden="true">
              <span className="layer__tab">main.css</span>
              <pre className="layer__code">
                <code>
                  <Highlighted code={firstLines(STYLES_CSS, 8)} lang="css" />
                </code>
              </pre>
            </div>

            <div className="layer layer--markup" aria-hidden="true">
              <span className="layer__tab">main.lmn</span>
              <pre className="layer__code">
                <code>
                  <Highlighted code={firstLines(MARKUP_LMN, 8)} lang="lmn" />
                </code>
              </pre>
            </div>

            <div className="window">
              <div className="window__bar">
                <i /> <i /> <i />
                <span>counter</span>
              </div>
              <div className="window__body">
                <div className="window__display">{clicks}</div>
                <div className="window__row">
                  <button type="button" onClick={() => setClicks((n) => n + 1)}>
                    +1
                  </button>
                  <button type="button" onClick={() => setClicks(0)}>
                    reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="demo__caption" aria-hidden="true">
            <span data-for="0">main.lmn</span>
            <span data-for="1">main.css</span>
            <span data-for="2">main.cdl</span>
            <span data-for="asm">wgpu &middot; assembled, try it</span>
          </p>
        </div>
      </div>
    </div>
  );
}
