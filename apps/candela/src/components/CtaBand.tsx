import { DOCS_URL, REPO_URL } from "../data";

export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container text-center">
        <h2 className="cta-band__title">Start writing Candela</h2>
        <p className="cta-band__lead">
          Install the toolchain, read the language tour, and build your first <code>.cdl</code>.
        </p>
        <div className="hero__cta justify-content-center">
          <a className="btn btn-flame btn-lg" href={DOCS_URL}>
            Read the docs
          </a>
          <a className="btn btn-outline-soft btn-lg" href={REPO_URL}>
            Browse the source
          </a>
        </div>
      </div>
    </section>
  );
}
