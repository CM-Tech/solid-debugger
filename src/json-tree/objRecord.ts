import objType from "./objType";

export default function objRecord(obj: object): [string | number, any][] {
  const type = objType(obj);
  if (type == "Object") {
    return Object.entries(obj);
  }
  if (type === "Array") {
    return [...(obj as Array<any>).entries()];
  }
  if (type === "HTMLElement") {
    return [...(obj as HTMLElement).childNodes.entries()];
  }
  switch (type) {
    case "Iterable":
    case "Map":
    case "Set":
      return typeof obj.set === "function"
        ? [...([...obj] as Array<any>).entries()]
        : [...([...obj] as Array<any>).entries()];
    default:
      return [];
  }
}
