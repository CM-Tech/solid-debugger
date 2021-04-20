import { Component, createMemo, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { JSONKey } from "./JSONKey";
import { JSONRefContext, useRefRef } from "./JSONRefValue";
import { JSONNodeProps } from "./p";

export const JSONValueNode: Component<
  {
    key: string;
    nodeType: string;
    valueGetter?: (value: any) => any;
  } & JSONNodeProps
> = (props) => {
  // console.log("SU")
  const refRef = useRefRef(() => props.jsonRefId, props.jsonRef, "BOP");
  const [val, setVal] = createSignal(props.valueGetter ? props.valueGetter(refRef()[0]) : refRef()[0]);
  onMount(() => {
    let id = setInterval(() => {
      setVal(props.valueGetter ? props.valueGetter(refRef()[0]) : refRef()[0]);
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  // console.log("EU",refRef())
  return (
    <li classList={{ indent: props.parent.expanded }}>
      <JSONKey key={props.key} colon={":"} parent={props.parent} />
      <span class={props.nodeType}>{val()}</span>
    </li>
  );
};
