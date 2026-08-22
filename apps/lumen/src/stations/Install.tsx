import { InstallLine } from "../components/InstallLine";
import { Station } from "../components/Station";
import {
  CANDELA_URL,
  DOCS_URL,
  LICENSE_URL,
  MSI_URL,
  PLANNED,
  RELEASES_URL,
  REPO_URL,
  SHIPPING,
} from "../data";

// The red end of the spectrum: everything needed to start, and what is not
// here yet.
export function Install() {
  return (
    <Station
      index={7}
      title="Take it with you."
      lede="One command installs the prebuilt toolchain. lumenc new writes a project, lumenc run opens it, and the docs cover the rest."
      wide
    >
      <div className="ending">
        <div className="ending__get">
          <InstallLine />
          <p className="ending__note">
            On Windows,{" "}
            <a href={MSI_URL} download>
              download the installer
            </a>
            . It is unsigned for now, so Windows warns before it runs.
          </p>
          <p className="ending__links">
            <a className="btn btn--lit" href={DOCS_URL}>
              Read the docs
            </a>
            <a className="btn btn--quiet" href={REPO_URL}>
              GitHub
            </a>
            <a className="btn btn--quiet" href={RELEASES_URL}>
              Releases
            </a>
          </p>
        </div>

        <div className="ending__scope">
          <div className="scope">
            <h3 className="scope__head">Here now</h3>
            <ul className="scope__list">
              {SHIPPING.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="scope">
            <h3 className="scope__head">Next</h3>
            <ul className="scope__list scope__list--planned">
              {PLANNED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="ending__foot">
        <span>MPL-2.0. Read the <a href={LICENSE_URL}>licence</a>.</span>
        <span>
          The scripting language has its own home at <a href={CANDELA_URL}>candela</a>.
        </span>
        <span>Pre-1.0: the APIs move between releases.</span>
      </footer>
    </Station>
  );
}
