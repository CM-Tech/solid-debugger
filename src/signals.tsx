import { Component, createSignal, For, getOwner, onCleanup, DEV } from "solid-js";
import { Root } from "./json-tree/Root";
import { colors } from "./theme";
const { writeSignal } = DEV;
type Owner = NonNullable<ReturnType<typeof getOwner>>;
type ComputationArr = NonNullable<Owner["owned"]>;
type Computation = ComputationArr[number];
type Signal = NonNullable<Computation["sources"]>[number];
let updating = false;

export const SignalList: Component<{ root: Owner }> = (props) => {
  let signals = [] as Signal[];

  let [signalsS, setSignalsS] = createSignal([]);
  let walked = new Set();

  let queue = [props.root];
  function oneEl(x: Computation | Signal | Owner) {
    if (x == undefined || walked.has(x)) return;

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
                <div>
                  <Root
                    value={el.value}
                    setValue={(...args) => {
                      if (args.length === 1) {
                        writeSignal.bind(el)(args[0]);
                      } else {
                        writeSignal.bind(el)(el.value);
                      }
                    }}
                  ></Root>
                </div>
              </>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
