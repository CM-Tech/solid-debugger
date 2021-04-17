import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONValueNode } from "./JSONValueNode";
import { ErrorNode } from "./ErrorNode";
import objType from "./objType";
import { Component, createMemo } from "solid-js";
import { JSONObjectNode } from "./JSONObjectNode";
function Switcher(props: any) {
  return createMemo(() => {
    const SelectedComponent = props.component;
    return SelectedComponent && (() => SelectedComponent(props));
  });
}
export const JSONNode: Component<{
  value: any;
  key: string;
  isParentExpanded?: boolean;
  isParentArray?: boolean;
  isParentHTML?: boolean;
}> = (props) => {
  const nodeType = createMemo(() => objType(props.value));

  function getComponent(nodeType: string): Component<any> {
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
        return typeof props.value.set === "function" ? JSONIterableMapNode : JSONIterableArrayNode;
      case "MapEntry":
        return JSONMapEntryNode;

      default:
        return JSONValueNode;
    }
  }

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
            } else {
              // list.push(lines[i]);
            }
          }
          if (!amOnlyTextNode) list.push(`"`);
          return list;
        };
      default:
        return () => `<${nodeType}>`;
    }
  }
  const ComponentType = createMemo(() => getComponent(nodeType()));
  const valueGetter = createMemo(() => getValueGetter(nodeType()));

  return (
    <Switcher
      component={ComponentType()}
      key={props.key}
      value={props.value}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isParentHTML={props.isParentHTML}
      nodeType={nodeType()}
      valueGetter={valueGetter()}
    />
  );
};
