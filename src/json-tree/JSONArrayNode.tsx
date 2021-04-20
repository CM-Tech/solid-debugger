import { Component } from "solid-js";
import { JSONNested } from "./JSONNested";
import { useRefRef } from "./JSONRefValue";
import { JSONNodeProps } from "./p";

export const JSONArrayNode: Component<
  {
    key: string;
    nodeType: string;
  } & JSONNodeProps
> = (props) => {
  const refRef = useRefRef(() => props.jsonRefId, props.jsonRef);
  if (!refRef()) {
    return null;
  }
  return (
    <JSONNested
      jsonRef={props.jsonRef}
      key={props.key}
      jsonRefId={props.jsonRefId}
      parent={props.parent}
      label={`Array(${refRef().length})`}
      bracketOpen={"["}
      bracketClose={"]"}
    />
  );
};
