import { JSONRef } from "./JSONRefValue";

export type JSONNodeProps = {
  jsonRef: JSONRef;
  jsonRefId: number;
  parent: {
    root: boolean;
    expanded: boolean;
    objType: string;
  };
};
