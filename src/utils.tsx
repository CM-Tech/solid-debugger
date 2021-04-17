import { JSX } from "solid-js/jsx-runtime";
import Editor from "./editor";

export function valueToEditor(x: any): string | JSX.Element {
  try {
    return (
      <Editor
        url={""}
        disabled={true}
        styles={{}}
        style={`display:grid;flex-grow:1;`}
        value={valueToString(x)}
      ></Editor>
    );
  } catch (e) {
    console.log(x);
    return "could not stringify value, value has been logged to the console instead";
  }
}

export function valueToString(x: any): string {
  try {
    if (typeof x === "string") {
      return JSON.stringify(x);
      // <span style={`color:#d8dee9;`}>{'"'}<span style={`color:#a3be8c;`}>{x}</span>{'"'}</span>
    }
    if (typeof x === "function") {
      return x.toString();
      // <span style={`color:#d8dee9;`}>{'"'}<span style={`color:#a3be8c;`}>{x}</span>{'"'}</span>
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
