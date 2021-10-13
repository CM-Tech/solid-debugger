import { Component } from "solid-js";
import { JSONKey } from "./JSONKey";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONValueNode: Component<
  {
    key: string;
    nodeType: string;
    valueGetter?: (value: any, setValue: any) => any;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  return (
    <li classList={{ indent: props.parent.expanded }}>
      <JSONKey key={props.key} colon={":"} parent={props.parent} />
      <span class={props.nodeType}>
        {props.valueGetter ? props.valueGetter(props.value, props.setValue) : props.value + ""}
      </span>
    </li>
  );
};
