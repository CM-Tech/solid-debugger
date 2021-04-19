import { Component, createMemo } from "solid-js";
import { JSONNested } from "./JSONNested";

export const JSONArrayNode: Component<{
  value: any[];
  key: any;
  expanded?: boolean;
  isParentExpanded: boolean;
  isParentArray: boolean;
}> = (props) => {
  const filteredKey = new Set(["length"]);

  let keys = createMemo(() => Object.getOwnPropertyNames(props.value));

  return (
    <JSONNested
      key={props.key}
      expanded={props.expanded ?? false}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isArray={true}
      keys={keys()}
      previewKeys={keys().filter((key) => !filteredKey.has(key))}
      getValue={(key: any) => props.value[key]}
      label={`Array(${props.value.length})`}
      bracketOpen="["
      bracketClose="]"
    />
  );
};
