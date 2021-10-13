import { Component, createMemo } from "solid-js";
import { JSONNested } from "./JSONNested";
import { JSONEditableProps, JSONNodeProps } from "./p";
export const JSONIterableArrayNode: Component<
  {
    key: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps<any[]>
> = (props) => {
  let keys = createMemo(() => {
    let result = [];
    let i = 0;
    for (const entry of props.value) {
      result.push([i++, entry]);
    }
    return result;
  });

  function getKey(key: string) {
    return String(key[0]);
  }
  function getValue(key: string) {
    return key[1];
  }
  return (
    <JSONNested
      value={props.value}
      setValue={props.setValue}
      key={props.key}
      nodeType={props.nodeType}
      parent={props.parent}
      keys={keys()}
      getKey={getKey}
      getValue={getValue}
      isArray={true}
      label={`${props.nodeType}(${keys().length})`}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
