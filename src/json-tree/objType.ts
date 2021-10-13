export function objType(obj: object) {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === "Object") {
    if (typeof (obj as Iterable<any>)[Symbol.iterator] === "function") {
      return "Iterable";
    }
    return obj.constructor.name;
  }
  if (obj instanceof HTMLElement) {
    return "HTMLElement";
  }

  return type;
}
