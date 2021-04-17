export function valueToString(x: any): string {
  try {
    if (typeof x === "string") {
      return JSON.stringify(x);
    }
    if (typeof x === "function") {
      return x.toString();
    }
    return x === undefined
      ? "undefined"
      : JSON.stringify(x, (_, value) => {
          if (value instanceof Element) {
            return value.outerHTML.replace(value.innerHTML, "...");
          }
          return value;
        });
  } catch (e) {
    console.log(x);
    return "could not stringify value, value has been logged to the console instead";
  }
}
