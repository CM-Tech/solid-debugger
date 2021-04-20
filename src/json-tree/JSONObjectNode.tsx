import { JSONNested } from "./JSONNested";
import { Component, createMemo } from "solid-js";
import { JSONNodeProps } from "./p";

export const JSONObjectNode: Component<
  {
    key: string;
    nodeType: string;
  } & JSONNodeProps
> = (props) => {
  return (
    <JSONNested
      jsonRef={props.jsonRef}
      key={props.key}
      jsonRefId={props.jsonRefId}
      parent={props.parent}
      label={`${props.nodeType} `}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
