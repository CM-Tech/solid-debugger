import { JSONNested } from "./JSONNested";
import { Component, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONObjectNode: Component<
  {
    value: Record<string, any>;
    expanded?: boolean;
    key: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  let b = Math.random();
  const [keys, setKeys] = createSignal([], (a, b) => JSON.stringify(a) === JSON.stringify(b));
  const ud = () => {
    try {
      setKeys(Object.getOwnPropertyNames(props.value));
    } catch (e) {
      setKeys([]);
    }
  };
  ud();
  onMount(() => {
    let id = setInterval(ud, 100);
    onCleanup(() => clearInterval(id));
  });

  return (
    <JSONNested
      value={props.value}
      setValue={props.setValue}
      nodeType={props.nodeType}
      key={props.key}
      expanded={props.expanded ?? false}
      parent={props.parent}
      keys={keys()}
      previewKeys={keys()}
      getValue={(k: string) => {
        try {
          return props.value[k];
        } catch (e) {
          return null;
        }
      }}
      label={`${props.nodeType} `}
      bracketOpen={"{"}
      bracketClose={"}"}
    />
  );
};
