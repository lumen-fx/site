import { useCallback, useRef, useState } from "react";
import { Candle } from "./components/Candle";
import { CandelaMark } from "./components/CandelaMark";
import { Install } from "./components/Install";
import { Prompt, type Flame, type PromptHandle } from "./components/Prompt";
import { Runtime } from "./components/Runtime";
import { Tour } from "./components/Tour";
import { DOCS_URL, LUMEN_URL, REPO_URL } from "./data";

export function App() {
  const [flame, setFlame] = useState<Flame>("cold");
  const prompt = useRef<PromptHandle | null>(null);

  const register = useCallback((handle: PromptHandle) => {
    prompt.current = handle;
  }, []);

  // Running a tour entry means typing it at the prompt, so the page goes back
  // to the prompt to watch it print.
  const runInPrompt = useCallback((code: string) => {
    prompt.current?.submit(code);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  }, []);

  return (
    <>
      <a className="skip" href="#tour">
        Skip to the language tour
      </a>

      <Candle flame={flame} />

      <header className="masthead">
        <p className="masthead__brand">
          <CandelaMark size={26} />
          <span>candela</span>
        </p>
        <nav className="masthead__links" aria-label="Elsewhere">
          <a href="#tour">Tour</a>
          <a href="#runtime">Runtime</a>
          <a href={DOCS_URL}>Docs</a>
          <a href={REPO_URL}>GitHub</a>
          <a href={LUMEN_URL}>Lumen</a>
        </nav>
      </header>

      <main className="page">
        <section className="opening" aria-labelledby="opening-title">
          <h1 className="opening__title" id="opening-title">
            A small, fast, statically typed language.
            <span className="opening__sub">Try it here before you install it.</span>
          </h1>
          <Prompt onFlame={setFlame} register={register} />
        </section>

        <Tour onRun={runInPrompt} />
        <Runtime />
        <Install />
      </main>
    </>
  );
}
