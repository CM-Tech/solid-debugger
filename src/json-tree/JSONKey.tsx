import { Component, Show } from "solid-js";
import { JSONNodeProps } from "./p";

export const JSONKey: Component<
  {
    key: string | number;
    colon?: string;
    onClick?: () => void;
  } & JSONNodeProps
> = (props) => {
  const showKey = () => props.parent.expanded || !(props.parent.isArray ?? false) || props.key != +props.key;
  return (
    <Show when={showKey() && props.key && !props.parent.isHTML}>
      <label classList={{ spaced: props.parent.expanded }} style={{ display: "inline-block" }} onClick={props.onClick}>
        <span>
          {props.key}
          {props.colon ?? ":"}
        </span>
      </label>
    </Show>
  );
};
