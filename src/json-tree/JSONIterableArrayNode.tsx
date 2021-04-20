import { Component } from "solid-js";
import { JSONNested } from "./JSONNested";
import { useRefRef } from "./JSONRefValue";
import { JSONNodeProps } from "./p";

export const JSONIterableArrayNode: Component<
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
      label={`${props.nodeType}(${refRef().length})`}
      bracketOpen={"["}
      bracketClose={"]"}
    />
  );
};

// export const JSONIterableArrayNode: Component<{
//   key: string;
//   value: any[];
//   isParentExpanded: boolean;
//   isParentArray: boolean;
//   nodeType: string;
// }> = (props) => {
//   let keys = createMemo(() => {
//     let result = [];
//     let i = 0;
//     for (const entry of props.value) {
//       result.push([i++, entry]);
//     }
//     return result;
//   });

//   function getKey(key: string) {
//     return String(key[0]);
//   }
//   function getValue(key: string) {
//     return key[1];
//   }
//   return (
//     <JSONNested
//       key={props.key}
//       isParentExpanded={props.isParentExpanded}
//       isParentArray={props.isParentArray}
//       keys={keys()}
//       getKey={getKey}
//       getValue={getValue}
//       isArray={true}
//       label={`${props.nodeType}(${keys().length})`}
//       bracketOpen={"{"}
//       bracketClose={"}"}
//     />
//   );
// };
