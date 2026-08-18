import { CodeBlock } from "../components/CodeBlock";
import { Station } from "../components/Station";
import { SIGNALS_CDL } from "../data";

export function Signals() {
  return (
    <Station
      index={3}
      title="State is a named signal."
      lede="Set a value by name and every widget bound to that name repaints. Look an element up, hang a handler on it, and the loop is closed: no store to wire, no diffing to think about."
    >
      <CodeBlock code={SIGNALS_CDL} lang="script" label="main.cdl" />
      <ul className="notes">
        <li>
          <span className="notes__key">get_by_id</span>
          <span className="notes__body">
            Returns a node you call methods on, the way the DOM does.
          </span>
        </li>
        <li>
          <span className="notes__key">on_ready</span>
          <span className="notes__body">
            Runs once the tree is mounted, which is when a lookup can find anything.
          </span>
        </li>
        <li>
          <span className="notes__key">typed signals</span>
          <span className="notes__body">
            An int stays an int across the script host, the SDKs, and the C ABI.
          </span>
        </li>
      </ul>
    </Station>
  );
}
