import { GUARANTEES } from "../data";

export function FeelCallout() {
  return (
    <section className="section" id="feel">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow">What you feel</span>
          <h2 className="section__title">Fast where a UI developer notices</h2>
          <p className="section__lead">
            How soon a click paints, what the app costs while it sits there, and how a save lands.
          </p>
        </div>
        <div className="row g-4">
          {GUARANTEES.map((g) => (
            <div className="col-md-4" key={g.value}>
              <div className="guarantee h-100">
                <div className="guarantee__value">{g.value}</div>
                <div className="guarantee__label">{g.label}</div>
                <p className="guarantee__body">{g.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
