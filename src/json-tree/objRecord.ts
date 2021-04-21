import objType from "./objType";

export default function objRecord(obj: object): Record<string, any> {
  const type = objType(obj);
  if (type == "Object") {
    return obj;
  }
  if (type === "Array") {
    return Object.fromEntries((obj as Array<any>).entries());
  }
  return {};
}
