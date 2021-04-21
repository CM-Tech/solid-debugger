import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Component, createEffect, createMemo, Show, For, createSignal } from "solid-js";
import { JSONNodeProps } from "./p";

export const ErrorNode: Component<
  {
    key: string | number;
    value: Error;
    nodeType: string;
    expanded?: boolean;
  } & JSONNodeProps
> = (props) => {
  let [expanded, setExpanded] = createSignal(props.expanded ?? true);

  const stack = createMemo(() => props.value.stack.split("\n"));

  createEffect(() => {
    if (!props.parent.expanded) setExpanded(false);
  });

  function toggleExpand() {
    setExpanded(!expanded());
  }

  return (
    <>
      <li classList={{ indent: props.parent.expanded }}>
        <Show when={props.parent.expanded}>
          <JSONArrow onClick={toggleExpand} expanded={expanded()} />
        </Show>
        <JSONKey key={props.key} colon={":"} parent={props.parent} />
        <span onClick={toggleExpand}>Error: {expanded() ? "" : props.value.message}</span>
        <Show when={props.parent.expanded}>
          <ul classList={{ collapse: !expanded() }} style={{ "list-style": "none" }}>
            <Show when={expanded()}>
              <JSONNode
                key="message"
                value={props.value.message}
                parent={{ expanded: expanded(), isArray: false, isHTML: false, isRoot: false, type: props.nodeType }}
              />
              <li>
                <JSONKey
                  key="stack"
                  colon=":"
                  parent={{ expanded: expanded(), isArray: false, isHTML: false, isRoot: false, type: props.nodeType }}
                />
                <span>
                  <For each={stack()}>
                    {(line, index) => (
                      <>
                        <span classList={{ indent: index() > 0 }}>{line}</span>
                        <br />
                      </>
                    )}
                  </For>
                </span>
              </li>
            </Show>
          </ul>
        </Show>
      </li>
    </>
  );
};
