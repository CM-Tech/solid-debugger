import { JSONNested } from "./JSONNested";
import { Component, createMemo } from "solid-js";

export const JSONObjectNode: Component<{
  value: Record<string, any>;
  expanded?: boolean;
  isParentExpanded: boolean;
  isParentArray: boolean;
  key: string;
  nodeType: string;
}> = (props) => {
  let keys = createMemo(() => {
    try {
      return Object.getOwnPropertyNames(props.value);
    } catch (e) {
      return [];
    }
  });

  return (
    <JSONNested
      key={props.key}
      expanded={props.expanded ?? false}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      keys={keys()}
      previewKeys={keys()}
      getValue={(k: string) => {
        try {
          return props.value[k];
        } catch (e) {
          return null;
        }
      }}
      label={`${props.nodeType} `}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
