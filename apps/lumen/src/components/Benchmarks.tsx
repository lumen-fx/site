import { BENCH, BENCH_URL } from "../data";

// Measured startup + memory, straight from tools/startup-bench. Cold is the
// first launch (caches empty); warm is the steady-state median. Lumen's edge is
// cold start; the fair peer is Qt Quick, which renders its own scene like Lumen.
export function Benchmarks() {
  return (
    <section className="section section--muted" id="benchmarks">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">Measured</span>
          <h2 className="section__title">Cold start is what a first launch feels like</h2>
          <p className="section__lead">
            The same small app in each framework, offscreen, warm median of nine runs. Lumen
            reaches its first frame about five times sooner than Qt Quick, the peer that also
            composites its own scene on the GPU.
          </p>
        </div>

        <div className="bench" data-reveal>
          <div className="bench__bar">
            <span className="bench__title">startup + memory / cold vs warm</span>
            <a className="bench__note" href={BENCH_URL}>
              tools/startup-bench &gt;
            </a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="bench__table">
              <thead>
                <tr>
                  <th>framework</th>
                  <th>cold ms</th>
                  <th>warm ms</th>
                  <th>rss mb</th>
                </tr>
              </thead>
              <tbody>
                {BENCH.map((r) => (
                  <tr key={r.framework} className={r.self ? "bench__row--self" : undefined}>
                    <td>
                      {r.framework}
                      {r.note ? <span className="bench__rownote"> {r.note}</span> : null}
                    </td>
                    <td>{r.cold}</td>
                    <td>{r.warm}</td>
                    <td>{r.rss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="bench__caption" data-reveal>
          Qt Widgets draws native OS controls and paints little itself, so it is a floor,
          not a peer. RSS counts shared-clean library pages; the fair cross-framework memory
          figure is lower. Numbers are reproducible from the harness.
        </p>
      </div>
    </section>
  );
}
