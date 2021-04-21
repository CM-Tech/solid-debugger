import { Component } from "solid-js";
import { JSONNested } from "./JSONNested";
import { JSONEditableProps, JSONNodeProps } from "./p";

const keys = ["key", "value"];

export const JSONMapEntryNode: Component<
  {
    expanded?: boolean;
    key: string;
    value: Record<string, any>;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  function getValue(key: string) {
    return props.value[key];
  }
  return (
    <JSONNested
      value={props.value}
      setValue={props.setValue}
      nodeType={props.nodeType}
      expanded={props.expanded ?? false}
      parent={props.parent}
      key={props.parent.expanded ? String(props.key) : props.value.key}
      keys={keys}
      getValue={getValue}
      label={props.parent.expanded ? "Entry " : "=> "}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
