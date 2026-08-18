import { useCallback, useEffect, useRef, useState } from "react";
import { Ansi } from "../lib/ansi";
import { Runtime } from "../lib/runtime";
import { Session } from "../lib/session";
import { OPENING_LINES, RUN_TIMEOUT_MS } from "../data";

// The prompt. It is the page's argument: a language you can try before you
// install it, running the same runtime a release ships.
//
// The flame beside it reports what the runtime is doing, so state lives here
// and is handed up to the candle.

export type Flame = "cold" | "loading" | "steady" | "burning" | "guttering" | "out";

interface Line {
  kind: "in" | "out" | "err" | "note";
  text: string;
}

export interface PromptHandle {
  submit: (chunk: string) => void;
}

export function Prompt({
  onFlame,
  register,
}: {
  onFlame: (flame: Flame) => void;
  register: (handle: PromptHandle) => void;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [broken, setBroken] = useState(false);
  const [showing, setShowing] = useState(false);
  const [program, setProgram] = useState("");
  // What has been typed, newest last, and where the up arrow currently is.
  const history = useRef<string[]>([]);
  const recall = useRef(-1);

  const runtime = useRef<Runtime | null>(null);
  const session = useRef(new Session());
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const flame = useRef(onFlame);
  flame.current = onFlame;

  const say = (line: Line) => setLines((prev) => [...prev, line]);

  // Load the runtime once the page is up, not while it is painting.
  useEffect(() => {
    const engine = new Runtime();
    runtime.current = engine;
    let alive = true;
    flame.current("loading");

    engine.warm(20000).then((result) => {
      if (!alive) return;
      if (result.unavailable || result.timedOut) {
        setBroken(true);
        flame.current("out");
        say({
          kind: "note",
          text: "The runtime did not load, so this prompt is reading only. Everything below still runs on your machine after an install.",
        });
        return;
      }
      setReady(true);
      flame.current("steady");
    });

    return () => {
      alive = false;
      engine.dispose();
    };
  }, []);

  const runChunk = useCallback(async (chunk: string) => {
    const engine = runtime.current;
    if (!engine) return;

    const staged = session.current.stage(chunk);
    for (const line of staged.imports) {
      say({
        kind: "note",
        text: `${line} needs the standard library on disk, which the browser build has no access to. Install candela to import it.`,
      });
    }
    if (!staged.added) return;

    setBusy(true);
    flame.current("burning");
    const result = await engine.run(staged.program, RUN_TIMEOUT_MS);
    setBusy(false);

    if (result.stopped) {
      session.current.rollback();
      say({ kind: "note", text: "Stopped." });
      flame.current("steady");
      return;
    }
    if (result.timedOut) {
      session.current.rollback();
      say({ kind: "err", text: "Stopped: that program ran longer than the page allows." });
      flame.current("guttering");
      window.setTimeout(() => flame.current("steady"), 900);
      return;
    }
    if (result.failed) {
      session.current.rollback();
      say({ kind: "err", text: result.output.trimEnd() });
      flame.current("guttering");
      window.setTimeout(() => flame.current("steady"), 900);
      return;
    }

    const fresh = session.current.fresh(result.output);
    session.current.commit(result.output);
    setProgram(session.current.program());
    if (fresh.trim() !== "") say({ kind: "out", text: fresh.replace(/\n$/, "") });
    flame.current("steady");
  }, []);

  const submit = useCallback(
    (chunk: string) => {
      const text = chunk.trim();
      if (text === "" || broken) return;
      history.current.push(text);
      recall.current = -1;
      say({ kind: "in", text });
      void runChunk(text);
    },
    [broken, runChunk],
  );

  useEffect(() => {
    register({ submit });
  }, [register, submit]);

  // Keep the newest line in view without moving the page around it.
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const onKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl-C stops a running program, and Ctrl-L clears the screen, because
    // that is what those keys do at a prompt.
    if (event.ctrlKey && event.key.toLowerCase() === "c" && busy) {
      event.preventDefault();
      runtime.current?.interrupt();
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setLines([]);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(draft);
      setDraft("");
      return;
    }
    // Walk back through what has been typed. Only from a single-line draft, so
    // arrow keys still move the caret inside a pasted program.
    const past = history.current;
    if (event.key === "ArrowUp" && !draft.includes("\n") && past.length > 0) {
      event.preventDefault();
      const next = recall.current < 0 ? past.length - 1 : Math.max(0, recall.current - 1);
      recall.current = next;
      setDraft(past[next]);
      return;
    }
    if (event.key === "ArrowDown" && recall.current >= 0) {
      event.preventDefault();
      const next = recall.current + 1;
      if (next >= past.length) {
        recall.current = -1;
        setDraft("");
      } else {
        recall.current = next;
        setDraft(past[next]);
      }
    }
  };

  const reset = () => {
    session.current.reset();
    setLines([]);
    setDraft("");
    setProgram("");
    history.current = [];
    recall.current = -1;
    input.current?.focus();
  };

  const openWith = (line: string) => {
    submit(line);
  };

  return (
    <div className="prompt">
      <div className="prompt__bar">
        <span className="prompt__title">candela</span>
        <span className="prompt__state">
          {broken ? "runtime unavailable" : busy ? "running" : ready ? "ready" : "loading runtime"}
        </span>
        {busy ? (
          <button
            type="button"
            className="prompt__reset"
            onClick={() => runtime.current?.interrupt()}
          >
            Stop
          </button>
        ) : null}
        <button
          type="button"
          className={showing ? "prompt__reset prompt__reset--on" : "prompt__reset"}
          onClick={() => setShowing((open) => !open)}
          aria-expanded={showing}
          disabled={program === ""}
        >
          Program
        </button>
        <button type="button" className="prompt__reset" onClick={reset} disabled={busy}>
          Clear
        </button>
      </div>

      <div className="prompt__log" ref={log} role="log" aria-live="polite" tabIndex={0}>
        <p className="prompt__banner">
          This is candela compiled to WebAssembly, running in this tab. Type a line and press
          Enter. What you type stays in scope, because the session is recompiled and rerun on
          every line, which is what the prompt does at a terminal too.
        </p>

        {lines.map((line, i) => (
          <pre className={`prompt__line prompt__line--${line.kind}`} key={i}>
            {line.kind === "in" ? <span className="prompt__caret">&gt;</span> : null}
            {line.kind === "err" ? <Ansi text={line.text} /> : line.text}
          </pre>
        ))}

        {lines.length === 0 && !broken ? (
          <p className="prompt__try">
            Try{" "}
            {OPENING_LINES.map((line) => (
              <button
                type="button"
                className="prompt__seed"
                key={line}
                onClick={() => openWith(line)}
              >
                {line}
              </button>
            ))}
          </p>
        ) : null}
      </div>

      {showing && program !== "" ? (
        <pre className="prompt__program" aria-label="The program candela recompiles">
          {program}
        </pre>
      ) : null}

      <div className="prompt__entry">
        <span className="prompt__caret" aria-hidden="true">
          &gt;
        </span>
        <textarea
          ref={input}
          className="prompt__input"
          value={draft}
          rows={1}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          disabled={broken}
          aria-label="candela prompt"
          placeholder={broken ? "runtime unavailable" : "let x = 41"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
        />
        <span className="prompt__hint" aria-hidden="true">
          enter runs, shift+enter adds a line, up recalls, ctrl+c stops
        </span>
      </div>
    </div>
  );
}
