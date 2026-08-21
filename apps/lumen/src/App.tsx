import { ExplodedDemo } from "./components/ExplodedDemo";
import { LumenMark } from "./components/LumenMark";
import { PrismCanvas } from "./components/PrismCanvas";
import { SpectrumRail } from "./components/SpectrumRail";
import { CANDELA_URL, DOCS_URL, REPO_URL } from "./data";
import { Hosts } from "./stations/Hosts";
import { Install } from "./stations/Install";
import { Markup } from "./stations/Markup";
import { Measured } from "./stations/Measured";
import { Reload } from "./stations/Reload";
import { Signals } from "./stations/Signals";
import { Source } from "./stations/Source";
import { Styles } from "./stations/Styles";

export function App() {
  return (
    <>
      <a className="skip" href="#station-install">
        Skip to the install station
      </a>

      <PrismCanvas />

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

      <SpectrumRail />

      <main>
        <Source />
        <ExplodedDemo>
          <Markup />
          <Styles />
          <Signals />
        </ExplodedDemo>
        <Reload />
        <Hosts />
        <Measured />
        <Install />
      </main>
    </>
  );
}
