import { Component, createSignal, For, getOwner } from "solid-js";
import { valueToString } from "./utils";

type Owner = NonNullable<ReturnType<typeof getOwner>>;
type ComputationArr = NonNullable<Owner["owned"]>;
type Computation = ComputationArr[number];
type Signal = NonNullable<Computation["sources"]>[number];

export const SignalList: Component<{ root: Owner }> = (props) => {
  let [bla, setBla] = createSignal(false);

  let signals = [] as Signal[];
  let walked = new Set();

  let queue = [props.root];
  function oneEl(x: Computation | Signal | Owner) {
    if (x == undefined || walked.has(x)) return;

    [...((x as Computation).sources || []), ...[(x as Computation).owner]].forEach((y) => oneEl(y));

    walked.add(x);

    // if (values.get(x) != x.value) updated.add(x);
    // values.set(x, x.value);
    if ((x as Signal).value != undefined) {
      signals.push(x as Signal);
    }
    let owned = (x as Computation).owned;
    if (owned) queue.push(...owned);

    let observers = (x as Signal).observers;
    if (observers) queue.push(...observers);
  }
  while (queue.length) oneEl(queue.shift()!);

  window._$afterUpdate = () => {
    signals = [];
    walked.clear();
    queue = [props.root];
    while (queue.length) oneEl(queue.shift()!);
  };

  return (
    <div style="position: relative">
      <div style="overflow: auto scroll; max-height:100%;">
        <For each={(bla() || true) && signals}>
          {(el) => (
            <div style="display: flex; border-bottom: 1px solid rgb(34, 46, 62); cursor: pointer; align-items: stretch;">
              <div
                style="flex: 0 0 auto; 
           /*width: 2rem; */
           min-height: 32px;
           background: rgb(0, 107, 255);
           display: flex; 
           align-items: center; 
           justify-content: center; 
           font-weight: bold; 
           color: white;
           text-shadow: black 0px 0px 10px;"
              >
                {el.name}
              </div>
              <code style="color:white;font-size: 0.9em; padding: 0.5rem;line-height: 1;">
                {valueToString(el.value)}
              </code>
            </div>
          )}
        </For>
      </div>
      <button
        style="position: absolute;
    top: 0; right: 0;
    margin: 0.5rem;
    padding: 0.5em;
    background: rgb(63, 78, 96);
    border: 0px;
    border-radius: 0.3em;
    color: white;"
        onClick={() => setBla(!bla())}
      >
        Refresh
      </button>
    </div>
  );
};
