import { JSONNested } from "./JSONNested";
import MapEntry from "./utils/MapEntry";
import { Component, createMemo } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONIterableMapNode: Component<
  {
    value: any;
    key: any;
    getKey: (v: any) => any;
    getValue: (v: any) => any;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  const keys = createMemo(() => {
    let result = [];
    let i = 0;
    for (const entry of props.value) {
      result.push([i++, new MapEntry(entry[0], entry[1])]);
    }
    return result;
  });
  function getKey(entry: any) {
    return entry[0];
  }
  function getValue(entry: any) {
    return entry[1];
  }

  return (
    <JSONNested
      value={props.value}
      setValue={props.setValue}
      nodeType={props.nodeType}
      key={props.key}
      parent={props.parent}
      keys={keys()}
      getKey={props.getKey ?? getKey}
      getValue={props.getValue ?? getValue}
      label={`${props.nodeType}(${keys().length})`}
      colon=""
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
