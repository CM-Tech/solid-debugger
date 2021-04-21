import { Component, createMemo } from "solid-js";
import { ErrorNode } from "./ErrorNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONObjectNode } from "./JSONObjectNode";
import { useRefRef } from "./JSONRefValue";
import { JSONValueNode } from "./JSONValueNode";
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
    key: string;
    jsonRef: any;
  } & JSONNodeProps
> = (props) => {
  const refRef = useRefRef(() => props.jsonRefId, props.jsonRef);

  if (!refRef()) {
    return null;
  }
  const nodeType = createMemo(() => refRef()[1]);

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
        return (raw: Symbol) => raw?.toString?.();
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
      jsonRef={props.jsonRef}
      key={props.key}
      jsonRefId={props.jsonRefId}
      parent={props.parent}
      nodeType={nodeType()}
      valueGetter={getValueGetter(nodeType())}
    />
  );
};
