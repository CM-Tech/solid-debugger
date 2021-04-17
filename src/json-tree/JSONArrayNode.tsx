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
  let previewKeys = createMemo(() => keys().filter((key) => !filteredKey.has(key)));

  function getValue(key: any) {
    return props.value[key];
  }

  return (
    <JSONNested
      key={props.key}
      expanded={props.expanded ?? false}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isArray={true}
      keys={keys()}
      previewKeys={previewKeys()}
      getValue={getValue}
      label={`Array(${props.value.length})`}
      bracketOpen="["
      bracketClose="]"
    />
  );
};
