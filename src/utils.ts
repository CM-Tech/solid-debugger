export function valueToString(x: any): string {
  try {
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
