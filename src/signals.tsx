import { Component, createSignal, For, getOwner, runWithOwner } from "solid-js";

import { writeSignal } from "solid-js/dev";
import { valueToString } from "./utils";
import Editor from "./editor";

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
  };

  return (
    <div style="position: relative">
      <div style="overflow: auto scroll; max-height:100%;">
        <div style="display :grid;grid-template-columns: 1fr 3fr;">
          <For each={signalsS()}>
            {(el) => (
              <>
                <div
                  style={`
           /*width: 2rem; */
           min-height: 32px;
           background: rgb(0, 107, 255);
           display: flex; 
           align-items: center; 
           justify-content: center; 
           font-weight: bold; 
           color: white;
           text-shadow: black 0px 0px 10px;`}
                >
                  {el.name}/{el.fName}
                </div>
                <Editor
                  url={""}
                  disabled={false}
                  styles={{}}
                  style={`display:grid;flex-grow:1;min-height:19px`}
                  onDocChange={(v) => {
                    try {
                      let val = eval(v);
                      writeSignal.bind(el)(val);
                    } catch {
                      console.log("FAIL", el, v);
                    }
                  }}
                  value={valueToString(el.value)}
                ></Editor>
              </>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
