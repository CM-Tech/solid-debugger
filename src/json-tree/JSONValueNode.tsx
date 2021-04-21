import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { JSONKey } from "./JSONKey";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONValueNode: Component<
  {
    key: string;
    nodeType: string;
    valueGetter?: (value: any, setValue: any) => any;
    value: any;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  // const [val, setVal] = createSignal(props.valueGetter ? props.valueGetter(props.value,props.setValue) : props.value + "");
  // onMount(() => {
  //   let id = setInterval(() => {
  //     try {
  //       setVal(props.valueGetter ? props.valueGetter(props.value,props.setValue) : props.value + "");
  //     } catch (e) {}
  //   }, 100);
  //   onCleanup(() => clearInterval(id));
  // });
  return (
    <li classList={{ indent: props.parent.expanded }}>
      <JSONKey key={props.key} colon={":"} parent={props.parent} />
      <span class={props.nodeType}>
        {props.valueGetter ? props.valueGetter(props.value, props.setValue) : props.value + ""}
      </span>
    </li>
  );
};
