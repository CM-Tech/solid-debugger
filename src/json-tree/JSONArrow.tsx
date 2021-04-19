import { Component } from "solid-js";

export const JSONArrow: Component<{
  onClick: () => void;
  expanded: boolean;
}> = (props) => {
  return (
    <div class="arrow-container" onClick={props.onClick} style={{ display: "inline-block" }}>
      <div class="arrow" style={{ display: "inline-block", ...(props.expanded ? { transform: "rotate(90deg)" } : {}) }}>
        {""}
      </div>
    </div>
  );
};
