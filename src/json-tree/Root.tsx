import { JSONNode } from "./JSONNode";
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import "./tmp.css";

export const jsonNoLoops = (a: any) => {
  let cache = new Set<any>();
  return JSON.stringify(a, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) return;
      cache.add(value);
    }
    return value;
  });
};

export const createDeepMemo = (a: any) => {
  let lastRValueS = a();
  let lastJSON = jsonNoLoops(lastRValueS);
  const [rvalue, setRValue] = createSignal(lastRValueS, false, { name: jsonNoLoops(lastRValueS) });
  onMount(() => {
    let id = window.setInterval(() => {
      let aa = a();
      let nJ = jsonNoLoops(aa);
      if (aa !== lastRValueS || lastJSON !== nJ) {
        lastJSON = nJ;
        lastRValueS = aa;
        setRValue(aa);
      }
    }, 1);
    onCleanup(() => {
      window.clearInterval(id);
    });
  });
  return rvalue;
};

export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
  const value = createDeepMemo(() => props.value);

  return (
    <ul
      style={{
        "font-family": "'Victor Mono',monospace",
        "list-style": "none",
        "margin": 0,
        "padding": 0,
        "padding-left": "1em",
      }}
    >
      <JSONNode key={props.key} value={value()} isParentExpanded={true} isParentArray={false} />
    </ul>
  );
};
