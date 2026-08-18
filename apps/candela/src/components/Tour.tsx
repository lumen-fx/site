import { TourEntry } from "./TourEntry";
import { TOUR } from "../data";

// The tour. Every entry is a program the prompt can run, so reading it and
// trying it are the same action: Run feeds it to the prompt above and takes you
// back there to watch it print, and Edit lets you change it first.
export function Tour({ onRun }: { onRun: (code: string) => void }) {
  return (
    <section className="tour" id="tour" aria-labelledby="tour-title">
      <h2 className="tour__title" id="tour-title">
        The language, in five programs
      </h2>
      <p className="tour__lede">
        Each of these is the example from that page of the documentation, fetched when this site
        was built. Run one and it joins the session above, where the next thing you type can use
        it. Edit one first and the prompt runs your version.
      </p>

      <ol className="tour__list">
        {TOUR.map((entry) => (
          <TourEntry entry={entry} onRun={onRun} key={entry.id} />
        ))}
      </ol>
    </section>
  );
}
