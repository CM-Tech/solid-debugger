import { JSONRef } from "./JSONRefValue";

export type JSONNodeProps = {
  jsonRef: JSONRef;
  jsonRefId: number;
  parent: {
    expanded: boolean;
    objType: string;
  };
};
