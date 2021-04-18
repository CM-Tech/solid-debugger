import { JSONNode } from "./JSONNode";
import { Component } from "solid-js";
import "./tmp.css";

export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
  return (
    <ul
      style={{
        "font-family": "'Nausti Sans',monospace",
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
