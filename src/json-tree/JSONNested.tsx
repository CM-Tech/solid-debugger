import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Show, Component, For, createMemo, createSignal, createEffect, JSX } from "solid-js";

export const JSONNested: Component<{
  isParentHTML?: boolean;
  label?: string;
  isArray?: boolean;
  isHTML?: boolean;
  getValue?: (v: any) => any;
  getPreviewValue?: (v: any) => any;
  getKey?: (v: any) => any;
  isParentExpanded: boolean;
  isParentArray: boolean;
  key: any;
  keys: any[];
  expandable?: boolean;
  previewCount?: number;
  expanded?: boolean;
  previewKeys?: string[];
  colon?: string;
  bracketOpen: JSX.Element;
  bracketClose: string;
}> = (props) => {
  let previewKeys = createMemo(() => props.previewKeys ?? props.keys);
  let [expanded, setExpanded] = createSignal(props.expanded ?? false);

  let slicedKeys = createMemo(() => (expanded() ? props.keys : previewKeys().slice(0, props.previewCount ?? 5)));

  createEffect(() => {
    if (!props.isParentExpanded) {
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
    <li classList={{ indent: props.isParentExpanded }}>
      <label>
        <Show when={(props.expandable ?? true) && props.isParentExpanded}>
          <JSONArrow onClick={toggleExpand} expanded={expanded()} />
        </Show>
        <JSONKey
          key={props.key}
          colon={props.colon ?? ":"}
          isParentExpanded={props.isParentExpanded}
          isParentArray={props.isParentArray}
          onClick={toggleExpand}
        />
        <span onClick={toggleExpand}>
          <span>{props.label ?? ""}</span>
          {props.bracketOpen}
        </span>
      </label>
      <Show when={props.isParentExpanded}>
        <ul classList={{ collapse: !expanded() }} onClick={expand} style={{ "list-style": "none" }}>
          <For each={slicedKeys()}>
            {(key, index) => (
              <>
                <JSONNode
                  key={(props.getKey ?? ((key: string) => key))(key)}
                  isParentExpanded={expanded()}
                  isParentHTML={props.isHTML ?? false}
                  isParentArray={props.isArray ?? false}
                  value={
                    expanded()
                      ? (props.getValue ?? ((key: string) => key))(key)
                      : (props.getPreviewValue ?? props.getValue)(key)
                  }
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
      <Show when={!props.isParentExpanded}>
        <span>…</span>
      </Show>
      <span>{props.bracketClose}</span>
    </li>
  );
};
