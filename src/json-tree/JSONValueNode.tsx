import { Component } from "solid-js";
import { JSONKey } from "./JSONKey";

export const JSONValueNode: Component<{
  key: string;
  isParentExpanded: boolean;
  isParentArray: boolean;
  isParentHTML: boolean;
  nodeType: string;
  valueGetter?: (value: any) => any;
  value: any;
}> = (props) => {
  return (
    <li classList={{ indent: props.isParentExpanded }}>
      <JSONKey
        key={props.key}
        colon={":"}
        isParentExpanded={props.isParentExpanded}
        isParentArray={props.isParentArray}
        isParentHTML={props.isParentHTML}
      />
      <span class={props.nodeType}>{props.valueGetter ? props.valueGetter(props.value) : props.value}</span>
    </li>
  );
};
