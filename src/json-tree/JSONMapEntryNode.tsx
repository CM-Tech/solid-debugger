import { Component } from "solid-js";
import { JSONNested } from "./JSONNested";

const keys = ["key", "value"];

export const JSONMapEntryNode: Component<{
  expanded?: boolean;
  isParentExpanded: boolean;
  isParentArray: boolean;
  key: string;
  value: Record<string, any>;
}> = (props) => {
  function getValue(key: string) {
    return props.value[key];
  }
  return (
    <JSONNested
      expanded={props.expanded ?? false}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      key={props.isParentExpanded ? String(props.key) : props.value.key}
      keys={keys}
      getValue={getValue}
      label={props.isParentExpanded ? "Entry " : "=> "}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
