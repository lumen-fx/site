import { InstallLine } from "../components/InstallLine";
import { LumenMark } from "../components/LumenMark";
import { DOCS_URL, MSI_URL, REPO_URL } from "../data";

// The source: white light, before the prism. What Lumen is, and how to get
// it. Everything after this station is one band of the fan.
export function Source() {
  return (
    <section className="station station--source" id="station-source" aria-labelledby="source-title">
      <p className="station__mark">
        <span className="station__nm">{"λ"} 380&ndash;700<small> nm</small></span>
        <span className="station__name">source</span>
      </p>

      <div className="station__body">
        <p className="source__brand">
          <LumenMark size={30} />
          <span className="source__word">Lumen</span>
        </p>

        <h1 className="source__title" id="source-title">
          Desktop apps written as markup and CSS, painted by the GPU.
        </h1>
        <p className="source__lede">
          Describe the window in .lmn markup. Style it with the cascade you already know. Wire
          it in candela, lua, or rhai, or drive it from Rust, C++, or Python. Save the file and
          the running window catches up without losing your place.
        </p>

        <InstallLine />
        <p className="source__note">
          macOS and Linux take the prebuilt toolchain. On Windows,{" "}
          <a href={MSI_URL} download>
            download the installer
          </a>
          . It is not signed yet, so Windows warns before it runs.
        </p>

        <p className="source__cta">
          <a className="btn btn--lit" href={DOCS_URL}>
            Read the docs
          </a>
          <a className="btn btn--quiet" href={REPO_URL}>
            Source on GitHub
          </a>
        </p>

        <p className="source__hint" aria-hidden="true">
          scroll: the spectrum separates
        </p>
      </div>
    </section>
  );
}
