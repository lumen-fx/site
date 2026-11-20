import { Station } from "../components/Station";
import { BENCH, BENCH_URL, FRAME, FRAME_BUDGET } from "../data";

// The one station that reports numbers. They come from the public benchmark
// suite, which is linked, so anyone who doubts a row can run it.
const PERCENTILES = [
  { key: "p50", value: FRAME.p50 },
  { key: "p95", value: FRAME.p95 },
  { key: "p99", value: FRAME.p99 },
];

export function Measured() {
  return (
    <Station
      index={6}
      title="Measured, not asserted."
      lede="Frame time while scrolling ten thousand rows, and the same hello-world app built in nine frameworks and started the same way. Both come from the open benchmark suite, measured on Lumen 0.0.12 as the installer ships it."
      wide
    >
      <div className="measured">
        <figure className="frames">
          <figcaption className="frames__cap">
            frame time, 10k-row scroll
            <span className="frames__budget">one 60 Hz frame is {FRAME_BUDGET} ms</span>
          </figcaption>
          {PERCENTILES.map((p) => (
            <div className="frames__row" key={p.key}>
              <span className="frames__key">{p.key}</span>
              <span className="frames__track">
                <span
                  className="frames__bar"
                  style={{ width: `${(Number(p.value) / FRAME_BUDGET) * 100}%` }}
                />
              </span>
              <span className="frames__val">{p.value} ms</span>
            </div>
          ))}
        </figure>

        <figure className="startup">
          <figcaption className="startup__cap">
            exec to first frame, hello world
            <span className="startup__unit">ms / idle MiB / binary MiB</span>
            <span className="startup__unit startup__machine">
              medians, Intel Core i9-12900K, nested headless weston, Arch Linux
            </span>
          </figcaption>
          <table className="startup__table">
            <thead>
              <tr>
                <th scope="col">framework</th>
                <th scope="col">start</th>
                <th scope="col">idle</th>
                <th scope="col">binary</th>
              </tr>
            </thead>
            <tbody>
              {BENCH.map((row) => (
                <tr key={row.framework} className={row.self ? "startup__self" : undefined}>
                  <th scope="row">
                    {row.framework}
                    {row.note ? <span className="startup__note">{row.note}</span> : null}
                  </th>
                  <td>{row.startup}</td>
                  <td>{row.mem}</td>
                  <td>{row.binary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>
      <p className="station__aside">
        Run them yourself: <a href={BENCH_URL}>guibench</a> builds every entry from source and
        reports the same table. Lumen's binary is lumenc with the engine library, the standard
        library, and the script host it loads; the toolkit rows leave their shared libraries out.
        Lumen and iced start in times the suite cannot tell apart.
      </p>
    </Station>
  );
}
