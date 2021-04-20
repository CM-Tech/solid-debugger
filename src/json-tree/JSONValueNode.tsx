import { Component } from "solid-js";
import { JSONKey } from "./JSONKey";
import { createDeepMemo } from "./Root";

export const JSONValueNode: Component<{
  key: string;
  isParentExpanded: boolean;
  isParentArray: boolean;
  isParentHTML: boolean;
  nodeType: string;
  valueGetter?: (value: any) => any;
  value: any;
}> = (props) => {
  const value = createDeepMemo(() => props.value);
  return (
    <li classList={{ indent: props.isParentExpanded }}>
      <JSONKey
        key={props.key}
        colon={":"}
        isParentExpanded={props.isParentExpanded}
        isParentArray={props.isParentArray}
        isParentHTML={props.isParentHTML}
      />
      <span class={props.nodeType}>
        {(() => {
          try {
            return props.valueGetter ? props.valueGetter(value()) + "" : value() + "";
          } catch (e) {
            return "";
          }
        })()}
      </span>
    </li>
  );
};
