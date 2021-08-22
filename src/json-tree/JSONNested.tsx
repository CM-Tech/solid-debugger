import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Show, Component, For, createMemo, createSignal, createEffect, JSX } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONNested: Component<
  {
    label?: string;
    isArray?: boolean;
    isHTML?: boolean;
    getValue?: (v: any) => any;
    getKey?: (v: any) => any;
    key: any;
    keys: any[];
    notExpandable?: boolean;
    previewCount?: number;
    expanded?: boolean;
    previewKeys?: string[];
    colon?: string;
    bracketOpen: JSX.Element;
    bracketClose: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  let previewKeys = createMemo(() => props.previewKeys ?? props.keys, undefined, {
    equals: (array1, array2) =>
      array1.length === array2.length && array1.every((value, index) => value === array2[index]),
  });
  let [expanded, setExpanded] = createSignal(props.expanded ?? false);

  let slicedKeys = createMemo(
    () => (expanded() ? props.keys : previewKeys().slice(0, props.previewCount ?? 5)),
    undefined,
    {
      equals: (array1, array2) =>
        array1.length === array2.length && array1.every((value, index) => value === array2[index]),
    }
  );

  createEffect(() => {
    if (!props.parent.expanded) {
      setExpanded(false);
    }
  });

  function toggleExpand() {
    setExpanded(!expanded() && !props.notExpandable);
  }

  function expand() {
    setExpanded(!props.notExpandable);
  }

  return (
    <li classList={{ indent: props.parent.expanded }}>
      <label>
        <Show when={!props.notExpandable && props.parent.expanded}>
          <JSONArrow onClick={toggleExpand} expanded={expanded()} />
        </Show>
        <JSONKey key={props.key} colon={props.colon ?? ":"} parent={props.parent} onClick={toggleExpand} />
        <span onClick={toggleExpand}>
          <span>{props.label ?? ""}</span>
          {props.bracketOpen}
        </span>
      </label>
      <Show when={props.parent.expanded}>
        <ul classList={{ collapse: !expanded() }} onClick={expand} style={{ "list-style": "none" }}>
          <For each={slicedKeys()}>
            {(key, index) => (
              <>
                <JSONNode
                  key={(props.getKey ?? ((key: string) => key))(key)}
                  parent={{
                    isRoot: false,
                    expanded: expanded(),
                    isHTML: props.isHTML ?? false,
                    isArray: props.isArray ?? false,
                    type: props.nodeType,
                  }}
                  setValue={(...rest: any[]) => props.setValue(key, ...rest)}
                  value={props.getValue?.(key) ?? key}
                />
                <Show when={!expanded() && index() < previewKeys().length - 1}>
                  <span class="comma">,</span>
                </Show>
              </>
            )}
          </For>
          <Show when={slicedKeys().length < previewKeys().length}>
            <span>…</span>
          </Show>
        </ul>
      </Show>
      <Show when={!props.parent.expanded}>
        <span>…</span>
      </Show>
      <span>{props.bracketClose}</span>
    </li>
  );
};
