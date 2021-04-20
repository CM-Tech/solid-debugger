import objRecord from "./objRecord";
import objType from "./objType";

export type JSONRef = [any, string, Record<string, number>][];
export const makeJSONRef = (a: any) => {
  let ref: JSONRef = [];
  const regV = (v: any): number => {
    let d = ref.findIndex((x) => x[0] === v);
    if (d !== -1) {
      //FIXME: don't assume everything is reference (we should dup strings, nums ect)
      return d;
    }
    d = ref.length;
    ref.push([v, objType(v), {}]);
    ref[d][2] = Object.fromEntries(Object.entries(objRecord(v)).map(([k, b]) => [k, regV(b)]));
    return d;
  };
  regV(a);
  return ref;
};
export const makeJSONStringRef = (a: any) => {
  let ref: JSONRef = makeJSONRef(a);
  return JSON.stringify(ref.map((x) => [x[0] + "", x[1], x[2]]));
};
