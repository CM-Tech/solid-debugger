import { Component, createSignal, For, getOwner, onCleanup, DEV } from "solid-js";
import { Root } from "./json-tree/Root";
import { colors } from "./theme";
const { writeSignal } = DEV;
type Owner = NonNullable<ReturnType<typeof getOwner>>;
type Computation = NonNullable<Owner["owned"]>[number];
type Signal = NonNullable<Computation["sources"]>[number];
let updating = false;

export const SignalList: Component<{ root: Owner }> = (props) => {
  let signals = [] as Signal[];

  let [signalsS, setSignalsS] = createSignal<Signal[]>([]);
  let walked = new Set();

  let queue = [props.root];
  function oneEl(x: Computation | Signal | Owner | null) {
    if (x == undefined || walked.has(x)) return;

    // If we have an owner, make sure that it is a child of root so we don't escape the children of the debugger
    if ((x as Owner).owner != undefined) {
      let xOwner = x as Owner | null;
      while (xOwner != props.root) {
        if (!xOwner) return;
        xOwner = xOwner.owner;
      }
    }

    [...((x as Computation).sources || []), ...[(x as Computation).owner]].forEach((y) => oneEl(y));

    walked.add(x);
    // if (values.get(x) != x.value) updated.add(x);
    // values.set(x, x.value);
    if ((x as Owner).owner == undefined) {
      signals.push(x as Signal);
    }
    let owned = (x as Computation).owned;
    if (owned) queue.push(...owned);

    let observers = (x as Signal).observers;
    if (observers) queue.push(...observers);
  }
  while (queue.length) oneEl(queue.shift()!);

  const updateListener = window.addSolidUpdateListener(() => {
    if (!updating) {
      signals = [];
      walked.clear();
      queue = [props.root];
      while (queue.length) {
        oneEl(queue.shift()!);
      }
      updating = true;
      setSignalsS(signals);
    }
    updating = false;
  });
  onCleanup(() => window.removeSolidUpdateListener(updateListener));

  return (
    <div style={{ position: "relative" }}>
      <div style={{ "overflow": "scroll", "max-height": "100%" }}>
        <div style={{ "display": "grid", "grid-template-columns": "1fr 3fr" }}>
          <For each={signalsS()}>
            {(el) => (
              <>
                <div
                  style={{
                    "min-height": "32px",
                    "background": `${colors.backgroundColor}`,
                    "display": "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "bold",
                    "color": `${colors.ansi.blue}`,
                  }}
                >
                  {el.name || "unnamed"}
                </div>
                <div
                  style={{
                    "display": "flex",
                    "align-items": "center",
                  }}
                >
                  <Root
                    value={el.value}
                    setValue={(...args) => {
                      if (args.length === 1) {
                        writeSignal(el, args[0]);
                      } else {
                        writeSignal(el, el.value);
                      }
                    }}
                  />
                </div>
              </>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
