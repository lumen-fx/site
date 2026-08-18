import { BENCHMARKS, RUNTIME_FACTS } from "../data";
import { WASM_BYTES } from "../generated/runtime";

// What the prompt above is made of, and what the same code costs when it is
// not in a browser. The download figure is measured at build time from the
// file this page loads, so it cannot drift.
function megabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

export function Runtime() {
  return (
    <section className="runtime" id="runtime" aria-labelledby="runtime-title">
      <h2 className="runtime__title" id="runtime-title">
        The runtime behind that prompt
      </h2>
      <p className="runtime__lede">
        {WASM_BYTES > 0 ? (
          <>
            The prompt loaded candela compiled to WebAssembly: {megabytes(WASM_BYTES)} of
            compiler and virtual machine, fetched once.
          </>
        ) : (
          <>The prompt runs candela compiled to WebAssembly: the compiler and the virtual
          machine, fetched once.</>
        )}{" "}
        Installed, the two are separable, and only the virtual machine has to ship with a
        program.
      </p>

      <dl className="runtime__facts">
        {RUNTIME_FACTS.map((fact) => (
          <div className="runtime__fact" key={fact.key}>
            <dt>{fact.key}</dt>
            <dd>{fact.body}</dd>
          </div>
        ))}
      </dl>

      <figure className="speed">
        <figcaption className="speed__cap">
          hyperfine, 2021 M1 Pro, from BENCHMARKS.md in the repository
        </figcaption>
        <table className="speed__table">
          <thead>
            <tr>
              <th scope="col">program</th>
              <th scope="col">candela</th>
              <th scope="col">python</th>
              <th scope="col">luajit</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARKS.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td className="speed__self">{row.candela}</td>
                <td>{row.python}</td>
                <td>{row.luajit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </section>
  );
}
