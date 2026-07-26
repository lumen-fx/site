import { FEATURES } from "../data";

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section__head">
          <h2 className="section__title">Everything you need in a scripting language</h2>
          <p className="section__lead">
            Statically checked, fast to run, small to ship, and easy to embed.
          </p>
        </div>
        <div className="row g-4">
          {FEATURES.map((f) => (
            <div className="col-md-6 col-lg-4" key={f.title}>
              <div className="feature h-100">
                <h3 className="feature__title">{f.title}</h3>
                <p className="feature__body">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
