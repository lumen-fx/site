// The page's handle on the candela runtime: one worker, one program at a time,
// and a watchdog.
//
// Every run compiles the whole session from scratch, so a worker holds nothing
// worth keeping. That makes the watchdog simple: when a program overruns, kill
// the worker and start another. The next run rebuilds the same state anyway.

export interface RunResult {
  output: string;
  failed: boolean;
  /** The watchdog stopped it. */
  timedOut: boolean;
  /** The runtime itself could not be loaded. */
  unavailable: boolean;
  /** The reader stopped it with Ctrl-C. */
  stopped?: boolean;
}

type Pending = {
  id: number;
  resolve: (result: RunResult) => void;
  timer: number;
};

export class Runtime {
  private worker: Worker | null = null;
  private pending: Pending | null = null;
  private nextId = 1;

  private spawn(): Worker {
    const worker = new Worker(new URL("../workers/candela.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as {
        id: number;
        output?: string;
        failed?: boolean;
        ready?: boolean;
        unavailable?: boolean;
      };
      if (!this.pending || this.pending.id !== data.id) return;
      const { resolve, timer } = this.pending;
      window.clearTimeout(timer);
      this.pending = null;
      resolve({
        output: data.output ?? "",
        failed: Boolean(data.failed),
        timedOut: false,
        unavailable: Boolean(data.unavailable),
      });
    };
    return worker;
  }

  /** Load the runtime without running anything, so the first program is quick. */
  warm(timeoutMs: number): Promise<RunResult> {
    return this.send(undefined, timeoutMs);
  }

  run(source: string, timeoutMs: number): Promise<RunResult> {
    return this.send(source, timeoutMs);
  }

  private send(source: string | undefined, timeoutMs: number): Promise<RunResult> {
    if (!this.worker) this.worker = this.spawn();
    const worker = this.worker;
    const id = this.nextId++;

    return new Promise<RunResult>((resolve) => {
      const timer = window.setTimeout(() => {
        // The worker is wedged inside a program that will not return, so the
        // only way out is to end it and start a fresh one.
        this.pending = null;
        worker.terminate();
        if (this.worker === worker) this.worker = null;
        resolve({ output: "", failed: true, timedOut: true, unavailable: false });
      }, timeoutMs);

      this.pending = { id, resolve, timer };
      worker.postMessage({ id, source });
    });
  }

  /**
   * Stop whatever is running, the way Ctrl-C does at a terminal. The worker
   * cannot be interrupted from outside a running program, so it is ended and
   * the next run starts a fresh one; the session replays into it either way.
   */
  interrupt(): boolean {
    if (!this.pending) return false;
    const { resolve, timer } = this.pending;
    window.clearTimeout(timer);
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
    resolve({ output: "", failed: true, timedOut: false, unavailable: false, stopped: true });
    return true;
  }

  dispose(): void {
    if (this.pending) window.clearTimeout(this.pending.timer);
    this.pending = null;
    this.worker?.terminate();
    this.worker = null;
  }
}
