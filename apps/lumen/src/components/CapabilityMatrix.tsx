import { SHIPPING, PLANNED } from "../data";

// Scope, stated plainly: everything on the left runs today, everything on the
// right is on the roadmap and not yet built.
export function CapabilityMatrix() {
  return (
    <section className="section" id="scope">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">Scope</span>
          <h2 className="section__title">What ships today, and what is next</h2>
          <p className="section__lead">
            Lumen is pre-1.0. Everything on the left works now; everything on the right
            is planned.
          </p>
        </div>
        <div className="matrix" data-reveal>
          <div className="row g-4">
            <div className="col-md-7">
              <div className="matrix-col matrix-col--today">
                <div className="matrix-col__head">Shipping today</div>
                <ul className="matrix-col__list">
                  {SHIPPING.map((item) => (
                    <li className="feat feat--on" key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-5">
              <div className="matrix-col matrix-col--planned">
                <div className="matrix-col__head">Planned</div>
                <ul className="matrix-col__list">
                  {PLANNED.map((item) => (
                    <li className="feat feat--soon" key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
