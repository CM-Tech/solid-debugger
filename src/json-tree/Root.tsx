import { JSONNode } from "./JSONNode";
import { Component } from "solid-js";
import "./tmp.css";

export const Root: Component<{
  key?: string;
  value: any;
  setValue: (...args: any[]) => any;
}> = (props) => {
  return (
    <ul
      style={{
        "font-family": "'Victor Mono', monospace",
        "list-style": "none",
        "margin": 0,
        "padding": 0,
        "padding-left": "1em",
      }}
    >
      <JSONNode
        setValue={props.setValue}
        key={props.key}
        value={props.value}
        parent={{ isRoot: true, expanded: true, isArray: false, isHTML: false, type: "" }}
      />
    </ul>
  );
};
