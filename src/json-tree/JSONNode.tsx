import { Component, createMemo, onCleanup, onMount } from "solid-js";
import { createCyclicState } from "../cyclicState";
import { ErrorNode } from "./ErrorNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONObjectNode } from "./JSONObjectNode";
import { JSONValueNode } from "./JSONValueNode";
import objType from "./objType";
import { JSONNodeProps } from "./p";

function getComponent(nodeType: string, value: any): Component<any> {
  switch (nodeType) {
    case "HTMLElement":
      return JSONHTMLNode;
    case "Object":
      return JSONObjectNode;
    case "Error":
      return ErrorNode;
    case "Array":
      return JSONArrayNode;
    case "Iterable":
    case "Map":
    case "Set":
      return typeof value.set === "function" ? JSONIterableMapNode : JSONIterableArrayNode;
    case "MapEntry":
      return JSONMapEntryNode;

    default:
      return JSONValueNode;
  }
}
function Switcher(props: any) {
  return createMemo(() => {
    const component = getComponent(props.nodeType, props.value);
    return () => component(props);
  });
}

export const JSONNode: Component<
  {
    value: any;
    key: string;
  } & JSONNodeProps
> = (props) => {
  const [val, setVal] = createCyclicState({ v: props.value });
  onMount(() => {
    let id = setInterval(() => {
      setVal("v", () => props.value);
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  const nodeType = createMemo(() => objType(val.v));
  function getValueGetter(nodeType: string) {
    switch (nodeType) {
      case "Object":
      case "Error":
      case "Array":
      case "Iterable":
      case "Map":
      case "Set":
      case "MapEntry":
      case "Number":
      case "HTMLElement":
        return undefined;
      case "String":
        return (raw: string) => `"${raw}"`;
      case "Boolean":
        return (raw: boolean) => (raw ? "true" : "false");
      case "Date":
        return (raw: Date) => raw.toISOString();
      case "Null":
        return () => "null";
      case "Undefined":
        return () => "undefined";
      case "Function":
      case "Symbol":
        return (raw: Symbol) => raw.toString();
      case "Text":
        return (raw: Text) => {
          const amOnlyTextNode = raw.parentElement.childNodes.length === 1;
          let list: any[] = [];
          if (!amOnlyTextNode) list.push(`"`);
          let lines = `${raw.textContent}`.split(`\n`);
          for (let i = 0; i < lines.length; i++) {
            list.push(lines[i]);
            if (i < lines.length - 1) {
              list.push(<br />);
            }
          }
          if (!amOnlyTextNode) list.push(`"`);
          return list;
        };
      default:
        return () => `<${nodeType}>`;
    }
  }

  return (
    <Switcher
      key={props.key}
      value={val.v}
      parent={props.parent}
      nodeType={nodeType()}
      valueGetter={getValueGetter(nodeType())}
    />
  );
};
