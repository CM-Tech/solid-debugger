import { Component, createMemo, Show } from "solid-js";
import { JSONNodeProps } from "./p";

export const JSONKey: Component<{
  parent: JSONNodeProps["parent"];
  key: string | number;
  colon?: string;
  onClick?: () => void;
}> = (props) => {
  const showKey = createMemo(
    () =>
      props.parent?.expanded ||
      !["Iterable", "Map", "Set", "Array"].includes(props.parent?.objType) ||
      props.key != +props.key
  );
  return (
    <Show when={showKey() && props.key && !(props.parent?.objType === "HTMLElement")}>
      <label classList={{ spaced: props.parent?.expanded }} style={{ display: "inline-block" }} onClick={props.onClick}>
        <span>
          {props.key}
          {props.colon ?? ":"}
        </span>
      </label>
    </Show>
  );
};
