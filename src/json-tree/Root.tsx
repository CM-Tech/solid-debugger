import { JSONNode } from "./JSONNode";
import { Component } from "solid-js";
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

export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
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
      <JSONNode key={props.key} value={props.value} isParentExpanded={true} isParentArray={false} />
    </ul>
  );
};
