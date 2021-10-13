import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Component, Show, For, createSignal } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const ErrorNode: Component<
  {
    key: string | number;
    value: Error;
    nodeType: string;
    expanded?: boolean;
  } & JSONNodeProps &
    JSONEditableProps
> = (props) => {
  let [trueExpanded, setExpanded] = createSignal(props.expanded ?? true);
  const toggleExpand = () => setExpanded(!trueExpanded());

  let expanded = () => props.parent.expanded && trueExpanded();

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
                setValue={props.setValue}
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
                  <For each={props.value.stack.split("\n")}>
                    {(line: string, index) => (
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
