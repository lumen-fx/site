import { BENCHMARKS } from "../data";

export function PerfCallout() {
  return (
    <section className="section" id="performance">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <h2 className="section__title">Fast to run, small to ship</h2>
            <p className="section__lead">
              Candela compiles a program to a self-contained <code>.cdlb</code> bytecode
              artifact ahead of time. The lean <code>candela-vm</code> loads and runs that
              bytecode with no parser or compiler on board; the goal is to keep it under 1 MiB.
            </p>
            <div className="stat-row">
              <div className="stat">
                <div className="stat__value">&lt; 1 MiB</div>
                <div className="stat__label">candela-vm runtime</div>
              </div>
              <div className="stat">
                <div className="stat__value">~10x</div>
                <div className="stat__label">faster than CPython</div>
              </div>
              <div className="stat">
                <div className="stat__value">.cdlb</div>
                <div className="stat__label">AOT bytecode</div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="bench">
              <div className="bench__head">
                <span>Benchmark</span>
                <span>Candela</span>
                <span>Python 3</span>
                <span>LuaJIT</span>
              </div>
              {BENCHMARKS.map((b) => (
                <div className="bench__row" key={b.name}>
                  <span className="bench__name">{b.name}</span>
                  <span className="bench__candela">{b.candela}</span>
                  <span className="bench__other">{b.python}</span>
                  <span className="bench__other">{b.luajit}</span>
                </div>
              ))}
              <p className="bench__foot">
                hyperfine, 2021 M1 Pro. Lower is better. See the repo's{" "}
                <a href="https://github.com/lumen-fx/candela/blob/main/BENCHMARKS.md">
                  BENCHMARKS.md
                </a>{" "}
                for the full set and sources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
