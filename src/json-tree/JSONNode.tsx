import { Component, createMemo, createSignal, onCleanup, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { colors } from "../theme";
import { ErrorNode } from "./ErrorNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONObjectNode } from "./JSONObjectNode";
import { JSONValueNode } from "./JSONValueNode";
import { objType } from "./objType";
import { JSONEditableProps, JSONNodeProps } from "./p";

function getComponent(nodeType: string, value: any): typeof JSONValueNode | typeof JSONIterableMapNode {
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

const EditableString: Component<{
  value: string;
  setValue: (s: string) => void;
}> = (props) => {
  const [editing, setEditing] = createSignal(false);
  const [editVal, setEditVal] = createSignal(props.value);

  return (
    <span>
      <Show when={editing()}>
        "
        <input
          onInput={(e) => setEditVal(e.currentTarget.value)}
          value={editVal()}
          style={{
            "border": "none",
            "border-bottom": `2px solid ${colors.ansi.red}`,
            "font-family": "inherit",
            "display": "inline-block",
          }}
          onBlur={(e) => {
            props.setValue(e.currentTarget.value);
            setEditing(false);
          }}
        />
        "
      </Show>
      <Show when={!editing()}>
        <span
          onDblClick={() => {
            setEditVal(props.value);
            setEditing(true);
          }}
        >
          "{props.value}"
        </span>
      </Show>
      <span
        onClick={() => {
          if (editing()) {
            props.setValue(editVal());
          } else {
            setEditVal(props.value);
          }
          setEditing(!editing());
        }}
      >
        
      </span>
    </span>
  );
};

const EditableBoolean: Component<{
  value: boolean;
  setValue: (s: boolean) => void;
}> = (props) => {
  return (
    <span>
      <input type="checkbox" checked={props.value} onChange={(e) => props.setValue(e.currentTarget.checked)} />
    </span>
  );
};

const EditableNumber: Component<{
  value: number;
  setValue: (s: number) => void;
}> = (props) => {
  const [editing, setEditing] = createSignal(false);
  const [editVal, setEditVal] = createSignal(props.value);

  return (
    <span>
      <Show when={editing()}>
        <input
          type="number"
          onInput={(e) => setEditVal(e.currentTarget.valueAsNumber)}
          value={editVal()}
          style={{
            "border": "none",
            "border-bottom": `2px solid ${colors.ansi.cyan}`,
            "font-family": "inherit",
            "display": "inline-block",
          }}
          onBlur={(e) => {
            props.setValue(e.currentTarget.valueAsNumber);
            setEditing(false);
          }}
        />
      </Show>
      <Show when={!editing()}>
        <span
          onDblClick={() => {
            setEditVal(props.value);
            setEditing(true);
          }}
        >
          {props.value}
        </span>
      </Show>
      <span
        onClick={() => {
          if (editing()) {
            props.setValue(editVal());
          } else {
            setEditVal(props.value);
          }
          setEditing(!editing());
        }}
      >
        
      </span>
    </span>
  );
};
export const JSONNode: Component<
  {
    value: any;
    key?: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  const [val, setVal] = createSignal(props.value);

  let id = setInterval(() => {
    setVal(() => props.value);
  }, 100);
  onCleanup(() => clearInterval(id));

  const nodeType = createMemo(() => objType(val()));
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
        return (raw: number, setRaw: (s: number) => any) => <EditableNumber value={raw} setValue={setRaw} />;
      case "HTMLElement":
        return undefined;
      case "String":
        return (raw: string, setRaw: (s: string) => any) => <EditableString value={raw} setValue={setRaw} />;
      case "Boolean":
        return (raw: boolean, setRaw: (b: boolean) => any) => <EditableBoolean value={raw} setValue={setRaw} />;
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
          return (
            <EditableString
              value={raw.textContent || ""}
              setValue={(...args) => (raw.textContent = args[args.length - 1])}
            />
          );
        };
      default:
        return () => `<${nodeType}>`;
    }
  }

  return (
    <Dynamic
      component={getComponent(nodeType(), val())}
      key={props.key!}
      value={val()}
      setValue={props.setValue}
      parent={props.parent}
      nodeType={nodeType()}
      valueGetter={getValueGetter(nodeType())}
    />
  );
};
