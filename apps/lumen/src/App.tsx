import { Bench } from "./components/Bench";
import { LumenMark } from "./components/LumenMark";
import { CANDELA_URL, DOCS_URL, REPO_URL } from "./data";

export function App() {
  return (
    <>
      <a className="skip" href="#station-install">
        Skip to the end of the bench
      </a>

      <header className="topbar">
        <a className="topbar__brand" href="#station-source">
          <LumenMark size={20} />
          <span>Lumen</span>
        </a>
        <nav className="topbar__links" aria-label="Elsewhere">
          <a href={DOCS_URL}>Docs</a>
          <a href={CANDELA_URL}>candela</a>
          <a href={REPO_URL}>GitHub</a>
        </nav>
      </header>

      <main>
        <Bench />
      </main>
    </>
  );
}
