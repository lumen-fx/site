import { CandelaMark } from "./CandelaMark";
import { DOCS_URL, KEEL_URL, REPO_URL } from "../data";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <CandelaMark size={24} />
              <span className="site-nav__wordmark">candela</span>
            </div>
            <p className="site-footer__blurb">
              The fast, statically-typed scripting language for the Lumen UI framework, and a
              general-purpose language on its own.
            </p>
          </div>
          <div className="col-6 col-md-3 offset-md-1">
            <h4 className="site-footer__h">Project</h4>
            <ul className="site-footer__links">
              <li><a href={DOCS_URL}>Documentation</a></li>
              <li><a href={REPO_URL}>GitHub</a></li>
              <li><a href="https://github.com/lumen-fx/candela/releases/latest">Releases</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-3">
            <h4 className="site-footer__h">Lumen</h4>
            <ul className="site-footer__links">
              <li><a href="https://lumenfx.dev/">Lumen UI</a></li>
              <li><a href="https://docs.lumenfx.dev/">All docs</a></li>
            </ul>
          </div>
        </div>
        <hr className="site-footer__rule" />
        <div className="site-footer__legal">
          <p>
            Candela is a fork of <a href={KEEL_URL}>keel</a> by Horace Hoff, licensed under
            Apache 2.0. It renames the language and adds a host embedding API for use inside Lumen.
          </p>
          <p>Copyright (c) 2026 Lumen FX.</p>
        </div>
      </div>
    </footer>
  );
}
