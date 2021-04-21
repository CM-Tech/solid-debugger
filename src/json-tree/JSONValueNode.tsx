import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { JSONKey } from "./JSONKey";
import { JSONNodeProps } from "./p";

export const JSONValueNode: Component<
  {
    key: string;
    nodeType: string;
    valueGetter?: (value: any) => any;
    value: any;
  } & JSONNodeProps
> = (props) => {
  const [val, setVal] = createSignal(props.valueGetter ? props.valueGetter(props.value) : props.value + "");
  onMount(() => {
    let id = setInterval(() => {
      try {
        setVal(props.valueGetter ? props.valueGetter(props.value) : props.value + "");
      } catch (e) {}
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  return (
    <li classList={{ indent: props.parent.expanded }}>
      <JSONKey key={props.key} colon={":"} parent={props.parent} />
      <span class={props.nodeType}>{val()}</span>
    </li>
  );
};
