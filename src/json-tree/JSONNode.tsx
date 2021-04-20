import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONValueNode } from "./JSONValueNode";
import { ErrorNode } from "./ErrorNode";
import { JSONObjectNode } from "./JSONObjectNode";
import objType from "./objType";
import { Component, createEffect, createMemo, createSignal, on, untrack } from "solid-js";
import { createDeepMemo } from "./Root";

function getComponent(nodeType: string, value): Component<any> {
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
  return () => props.component(props);
}

export const JSONNode: Component<{
  value: any;
  key: string;
  isParentExpanded?: boolean;
  isParentArray?: boolean;
  isParentHTML?: boolean;
}> = (props) => {
  const value = createDeepMemo(() => props.value);
  const nodeType = createMemo(() => objType(value()));

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
        return (raww: Text) => {
          const r = createDeepMemo(() => raww);
          let raw = r();
          const rt = createDeepMemo(() => raww.textContent);
          const amOnlyTextNode = raw.parentElement.childNodes.length === 1;
          let list: any[] = [];
          if (!amOnlyTextNode) list.push(`"`);
          let lines = `${rt()}`.split(`\n`);
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
  let [valueGetter, setValueGetter] = createSignal((v: any) => undefined);
  let [component, setComponent] = createSignal(JSONValueNode);
  createEffect(
    on(nodeType, () => {
      setValueGetter(getValueGetter(nodeType()));
    })
  );
  createEffect(
    on(nodeType, value, () => {
      setComponent(getComponent(nodeType(), value()));
    })
  );
  return (
    <Switcher
      key={props.key}
      value={value()}
      component={component()}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isParentHTML={props.isParentHTML}
      nodeType={nodeType()}
      valueGetter={valueGetter()}
    />
  );
};
