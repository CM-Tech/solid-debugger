import { Component, createMemo, Show } from "solid-js";

export const JSONKey: Component<{
  key: string | number;
  colon?: string;
  isParentExpanded: boolean;
  isParentArray?: boolean;
  onClick?: () => void;
}> = (props) => {
  const showKey = createMemo(
    () => props.isParentExpanded || !(props.isParentArray ?? false) || props.key != +props.key
  );
  return (
    <Show when={showKey() && props.key}>
      <label classList={{ spaced: props.isParentExpanded }} style={{ display: "inline-block" }} onClick={props.onClick}>
        <span>
          {props.key}
          {props.colon ?? ":"}
        </span>
      </label>
    </Show>
  );
};
