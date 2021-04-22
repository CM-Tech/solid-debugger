import { Component, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { createCyclicState } from "../cyclicState";
import { colors } from "../theme";
import { ErrorNode } from "./ErrorNode";
import { JSONArrayNode } from "./JSONArrayNode";
import { JSONHTMLNode } from "./JSONHTMLNode";
import { JSONIterableArrayNode } from "./JSONIterableArrayNode";
import { JSONIterableMapNode } from "./JSONIterableMapNode";
import { JSONMapEntryNode } from "./JSONMapEntryNode";
import { JSONObjectNode } from "./JSONObjectNode";
import { JSONValueNode } from "./JSONValueNode";
import objType from "./objType";
import { JSONEditableProps, JSONNodeProps } from "./p";

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

const EditableString: Component<{
  value: string;
  setValue: (s: string) => void;
}> = (props) => {
  const [editing, setEditing] = createSignal(false, undefined, {
    name: "editing",
  });
  const [editVal, setEditVal] = createSignal(props.value);
  const [val, setVal] = createSignal(props.value);
  onMount(() => {
    let id = setInterval(() => {
      try {
        setVal(props.value);
      } catch (e) {}
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  return (
    <span>
      <Show when={editing()}>
        "
        <input
          onChange={(e) => setEditVal(e.currentTarget.value)}
          onKeyUp={(e) => setEditVal(e.currentTarget.value)}
          value={editVal()}
          size={editVal().length - 5}
          style={{
            "width": "fit-content",
            "background": "transparent",
            "color": "inherit",
            "font-size": "inherit",
            "border": "none",
            "border-bottom": `2px solid ${colors.ansi.red}`,
            "font-family": "inherit",
            "display": "inline-block",
          }}
          onBlur={(e) => {
            props.setValue(e.currentTarget.value);
            setEditing(false);
          }}
        ></input>
        "
      </Show>
      <Show when={!editing()}>
        <span
          onDblClick={() => {
            setEditVal(props.value);
            setEditing(true);
          }}
        >{`"${val()}"`}</span>
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
  const [val, setVal] = createSignal(props.value);
  onMount(() => {
    let id = setInterval(() => {
      try {
        setVal(props.value);
      } catch (e) {}
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  return (
    <span>
      <input type="checkbox" checked={val()} onChange={(e) => props.setValue(e.currentTarget.checked)}></input>
    </span>
  );
};

const EditableNumber: Component<{
  value: number;
  setValue: (s: number) => void;
}> = (props) => {
  const [editing, setEditing] = createSignal(false, undefined, {
    name: "editing",
  });
  const [editVal, setEditVal] = createSignal(props.value);
  const [val, setVal] = createSignal(props.value);
  onMount(() => {
    let id = setInterval(() => {
      try {
        setVal(props.value);
      } catch (e) {}
    }, 100);
    onCleanup(() => clearInterval(id));
  });
  return (
    <span>
      <Show when={editing()}>
        <input
          type="number"
          onChange={(e) => setEditVal(e.currentTarget.valueAsNumber)}
          value={editVal()}
          size={editVal().toString().length - 5}
          style={{
            "width": "fit-content",
            "background": "transparent",
            "color": "inherit",
            "font-size": "inherit",
            "border": "none",
            "border-bottom": `2px solid ${colors.ansi.cyan}`,
            "font-family": "inherit",
            "display": "inline-block",
          }}
          onBlur={(e) => {
            props.setValue(e.currentTarget.valueAsNumber);
            setEditing(false);
          }}
        ></input>
      </Show>
      <Show when={!editing()}>
        <span
          onDblClick={() => {
            setEditVal(props.value);
            setEditing(true);
          }}
        >{`${val()}`}</span>
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
    key: string;
  } & JSONNodeProps &
    JSONEditableProps
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
        return (raw: number, setRaw: (s: number) => any) => <EditableNumber value={raw} setValue={setRaw} />;
      case "HTMLElement":
        return undefined;
      case "String":
        return (raw: string, setRaw: (s: string) => any) => (
          <EditableString value={raw} setValue={setRaw}></EditableString>
        );
      case "Boolean":
        return (raw: boolean, setRaw: (b: boolean) => any) => (
          <EditableBoolean value={raw} setValue={setRaw}></EditableBoolean>
        );
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
        return (raw: Text, setValue: (s: any) => any) => {
          return (
            <EditableString
              value={raw.textContent}
              setValue={(...args) => (raw.textContent = args[args.length - 1])}
            ></EditableString>
          );
          // const amOnlyTextNode = raw.parentElement.childNodes.length === 1;
          // let list: any[] = [];
          // if (!amOnlyTextNode) list.push(`"`);
          // let lines = `${raw.textContent}`.split(`\n`);
          // for (let i = 0; i < lines.length; i++) {
          //   list.push(lines[i]);
          //   if (i < lines.length - 1) {
          //     list.push(<br />);
          //   }
          // }
          // if (!amOnlyTextNode) list.push(`"`);
          // return list;
        };
      default:
        return () => `<${nodeType}>`;
    }
  }

  return (
    <Switcher
      key={props.key}
      value={val.v}
      setValue={props.setValue}
      parent={props.parent}
      nodeType={nodeType()}
      valueGetter={getValueGetter(nodeType())}
    />
  );
};
