import { BENCH, FRAME, BENCH_URL } from "../data";

// The same app built in eight frameworks, measured the same way. Startup is
// exec to first frame; memory is idle PSS; binary is the stripped file. Lumen
// sits mid-pack on startup and holds one frame under scroll load.
export function Benchmarks() {
  return (
    <section className="section section--muted" id="benchmarks">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">Measured</span>
          <h2 className="section__title">The same app in eight frameworks</h2>
          <p className="section__lead">
            One app, built and measured the same way in each framework. Lumen holds a
            single 60 Hz frame while scrolling 10,000 rows ({FRAME.p50}/{FRAME.p95}/{FRAME.p99} ms
            at p50/p95/p99), and sits mid-pack on startup and memory.
          </p>
        </div>

        <div className="bench" data-reveal>
          <div className="bench__bar">
            <span className="bench__title">startup + idle memory / hello app</span>
            <a className="bench__note" href={BENCH_URL}>
              lumen-benchmarks &gt;
            </a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="bench__table">
              <thead>
                <tr>
                  <th>framework</th>
                  <th>startup ms</th>
                  <th>idle mem mb</th>
                  <th>binary mb</th>
                </tr>
              </thead>
              <tbody>
                {BENCH.map((r) => (
                  <tr key={r.framework} className={r.self ? "bench__row--self" : undefined}>
                    <td>
                      {r.framework}
                      {r.note ? <span className="bench__rownote"> {r.note}</span> : null}
                    </td>
                    <td>{r.startup}</td>
                    <td>{r.mem}</td>
                    <td>{r.binary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="bench__caption" data-reveal>
          Startup is exec to first frame. Memory is idle PSS; the toolkit frameworks link
          tens of MiB of shared libraries the binary column does not count. Full method,
          frame-time percentiles, and per-app results are in the suite.
        </p>
      </div>
    </section>
  );
}
