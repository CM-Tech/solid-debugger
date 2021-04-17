import { JSONNode } from "./JSONNode";
import { Component } from "solid-js";
import { contextKey } from "./context";
import "./tmp.css";

export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
  return (
    <ul style={{ "font-family": "'Nausti Sans',monospace", "list-style": "none" }}>
      <contextKey.Provider value={{}}>
        <JSONNode key={props.key} value={props.value} isParentExpanded={true} isParentArray={false} />
      </contextKey.Provider>
    </ul>
  );
};
