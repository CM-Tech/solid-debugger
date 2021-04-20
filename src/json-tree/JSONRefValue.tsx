import objRecord from "./objRecord";
import objType from "./objType";
import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  createState,
  createMemo,
  on,
} from "solid-js";

export type JSONRef = [any, string, [string | number, number][]][];
export const makeJSONRef = (a: any, old?: JSONRef): [JSONRef, number] => {
  let refR: JSONRef = [];
  let ref: JSONRef = old ?? [];
  const regV = (v: any): number => {
    let d0 = refR.findIndex((x) => x[0] === v);
    let d = ref.findIndex((x) => x[0] === v);
    if (d0 !== -1) {
      //FIXME: don't assume everything is reference (we should dup strings, nums ect)
      return d;
    }

    if (d === -1) {
      d = ref.length;
      ref.push([v, "Undefined", []]);
    }
    refR.push(ref[d]);
    ref[d][1] = objType(v);
    ref[d][2] = objRecord(v).map(([k, b]) => [k, regV(b)]);

    return d;
  };
  let n = regV(a);
  return [ref, n];
};
export const makeJSONStringRef = (a: any) => {
  let ref: JSONRef = makeJSONRef(a)[0];
  return JSON.stringify(ref.map((x) => [x[0] + "", x[1], x[2]]));
};
export const JSONRefContext = createContext([]);
const cq = (x, y) => x && y && y[0] === x[0] && y[1] === x[1] && JSON.stringify(y[2]) === JSON.stringify(x[2]);
export const useRefRef = (jsonRefId: () => number, jsonRefg: JSONRef, name?: string) => {
  let g = createMemo(
    () => {
      return { v: jsonRefg[jsonRefId()], a: jsonRefg[jsonRefId()][0], b: jsonRefg[jsonRefId()][1], l: jsonRefId() };
    },
    undefined,
    (a, b) => cq(a.v, b.v)
  );
  return () => {
    return g().v;
  };
};
