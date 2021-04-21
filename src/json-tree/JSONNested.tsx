import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Show, Component, For, createMemo, createSignal, createEffect, JSX } from "solid-js";
import { JSONNodeProps } from "./p";

export const JSONNested: Component<
  {
    label?: string;
    isArray?: boolean;
    isHTML?: boolean;
    getValue?: (v: any) => any;
    getPreviewValue?: (v: any) => any;
    getKey?: (v: any) => any;
    key: any;
    keys: any[];
    expandable?: boolean;
    previewCount?: number;
    expanded?: boolean;
    previewKeys?: string[];
    colon?: string;
    bracketOpen: JSX.Element;
    bracketClose: string;
    nodeType: string;
  } & JSONNodeProps
> = (props) => {
  let previewKeys = createMemo(() => props.previewKeys ?? props.keys);
  let [expanded, setExpanded] = createSignal(props.expanded ?? false);

  let slicedKeys = createMemo(() => (expanded() ? props.keys : previewKeys().slice(0, props.previewCount ?? 5)));

  createEffect(() => {
    if (!props.parent.expanded) {
      setExpanded(false);
    }
  });

  function toggleExpand() {
    setExpanded(!expanded() && (props.expandable ?? true));
  }

  function expand() {
    setExpanded(true && (props.expandable ?? true));
  }

  return (
    <li classList={{ indent: props.parent.expanded }}>
      <label>
        <Show when={(props.expandable ?? true) && props.parent.expanded}>
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
                  value={(() => {
                    try {
                      return expanded()
                        ? (props.getValue ?? ((key: string) => key))(key)
                        : (props.getPreviewValue ?? props.getValue)(key);
                    } catch (e) {
                      return null;
                    }
                  })()}
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
