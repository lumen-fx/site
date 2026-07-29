import { LumenMark } from "./LumenMark";
import { CANDELA_URL, DOCS_URL, LICENSE_URL, RELEASES_URL, REPO_URL } from "../data";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <LumenMark size={24} />
              <span className="site-nav__wordmark">lumen</span>
            </div>
            <p className="site-footer__blurb">
              A Rust UI framework for native desktop apps: markup and real CSS, reactive signals,
              and hot reload.
            </p>
          </div>
          <div className="col-6 col-md-3 offset-md-1">
            <h4 className="site-footer__h">Project</h4>
            <ul className="site-footer__links">
              <li><a href={DOCS_URL}>Documentation</a></li>
              <li><a href={REPO_URL}>GitHub</a></li>
              <li><a href={RELEASES_URL}>Releases</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-3">
            <h4 className="site-footer__h">Family</h4>
            <ul className="site-footer__links">
              <li><a href={CANDELA_URL}>Candela</a></li>
              <li><a href={DOCS_URL}>All docs</a></li>
            </ul>
          </div>
        </div>
        <hr className="site-footer__rule" />
        <div className="site-footer__legal">
          <p>
            Lumen is pre-1.0 and moving fast; the API may change between releases. Licensed under{" "}
            <a href={LICENSE_URL}>MPL-2.0</a>.
          </p>
          <p>Copyright (c) 2026 Lumen FX.</p>
        </div>
      </div>
    </footer>
  );
}
