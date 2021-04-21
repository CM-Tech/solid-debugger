import { JSONNode } from "./JSONNode";
import { Component, createEffect } from "solid-js";
import "./tmp.css";
import { createCyclicState } from "../cyclicState";

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

export const Root: Component<{
  key?: string;
  value: object;
  onChange?: (v: object) => void;
}> = (props) => {
  const [state, setState] = createCyclicState({ v: props.value });
  createEffect(() => {
    setState("v", () => props.value);
  });
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
      <JSONNode
        key={props.key}
        value={state.v}
        parent={{ isRoot: true, expanded: true, isArray: false, isHTML: false, type: "" }}
      />
    </ul>
  );
};
