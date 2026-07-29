import { FEATURES } from "../data";

export function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section__head" data-reveal>
          <span className="eyebrow">Why Lumen</span>
          <h2 className="section__title">A small authoring surface over a serious runtime</h2>
          <p className="section__lead">
            Three files describe your app. Underneath, a native ECS core drives layout, styling,
            and GPU paint.
          </p>
        </div>
        <div className="row g-4">
          {FEATURES.map((f, i) => (
            <div className="col-md-6 col-lg-4" key={f.title} data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
              <div className="feature h-100">
                <span className="feature__tag">{f.tag}</span>
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
