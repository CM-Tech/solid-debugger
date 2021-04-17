import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONValueNode } from "./JSONValueNode";
import { ErrorNode } from "./ErrorNode";
import objType from "./objType";
import { Component } from "solid-js";
import { JSONObjectNode } from "./JSONObjectNode";
export const JSONNode: Component<{
  value: any;
  key: string;
  isParentExpanded?: boolean;
  isParentArray?: boolean;
  isParentHTML?: boolean;
}> = (props) => {
  const nodeType = objType(props.value);
  const ComponentType = getComponent(nodeType);
  const valueGetter = getValueGetter(nodeType);

  function getComponent(nodeType: string): Component<any> {
    switch (nodeType) {
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
      case "HTMLElement":
        return JSONHTMLNode;
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
      default:
        return (raw) => {
          if (raw instanceof HTMLElement)
            return raw.innerHTML ? raw.outerHTML.replace(raw.innerHTML, "...") : raw.outerHTML;

          return `<${nodeType}>`;
        };
    }
  }

  return (
    <ComponentType
      key={props.key}
      value={props.value}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isParentHTML={props.isParentHTML}
      nodeType={nodeType}
      valueGetter={valueGetter}
    />
  );
};
