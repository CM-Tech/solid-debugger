import { Component, JSX } from "solid-js";
import { Root } from "./json-tree/Root";

export const Editor: Component<Props> = (props) => {
  return (
    <div class={`grid grid-cols-1`} style={{ "grid-template-rows": "minmax(0, 1fr) auto", ...props.style }}>
      <div style={{ height: "100%" }}>
        <Root value={props.value} onChange={props.onDocChange} />
      </div>
    </div>
  );
};

export default Editor;

interface Props {
  value?: object;
  onDocChange?: (code: object) => unknown;
  style: JSX.CSSProperties;
}
