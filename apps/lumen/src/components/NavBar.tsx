import { LumenMark } from "./LumenMark";
import { CANDELA_URL, DOCS_URL, REPO_URL } from "../data";

export function NavBar({ theme, onToggleTheme }: { theme: "light" | "dark"; onToggleTheme: () => void }) {
  return (
    <nav className="navbar sticky-top site-nav">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2 site-nav__brand" href="/">
          <LumenMark size={26} />
          <span className="site-nav__wordmark">lumen</span>
        </a>
        <div className="d-flex align-items-center gap-1 gap-sm-3">
          <a className="site-nav__link d-none d-sm-inline" href={DOCS_URL}>
            Docs
          </a>
          <a className="site-nav__link d-none d-sm-inline site-nav__link--icon" href={CANDELA_URL}>
            <img src="/candela-logo.svg" width={15} height={15} alt="" aria-hidden="true" />
            Candela
          </a>
          <a className="site-nav__link d-none d-sm-inline" href={REPO_URL}>
            GitHub
          </a>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
    </nav>
  );
}
