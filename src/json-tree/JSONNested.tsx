import { JSONArrow } from "./JSONArrow";
import { JSONNode } from "./JSONNode";
import { JSONKey } from "./JSONKey";
import { Show, Component, For, createMemo, createSignal, createEffect, JSX, useContext } from "solid-js";
import { JSONNodeProps } from "./p";
import { JSONRefContext, useRefRef } from "./JSONRefValue";

export const JSONNested: Component<
  {
    label?: string;
    getValue?: (v: any) => any;
    getPreviewValue?: (v: any) => any;
    getKey?: (v: any) => any;
    key: any;
    expandable?: boolean;
    previewCount?: number;
    expanded?: boolean;
    previewEntries?: [string | number, number][];
    colon?: string;
    bracketOpen: JSX.Element;
    bracketClose: string;
  } & JSONNodeProps
> = (props) => {
  const refRef = useRefRef(() => props.jsonRefId, props.jsonRef);
  const entries = createMemo(() => refRef()[2]);
  const previewEntries = createMemo(() => props.previewEntries ?? entries());
  const [expanded, setExpanded] = createSignal(props.expanded ?? false);

  const slicedEntries = createMemo(() => (expanded() ? entries() : previewEntries().slice(0, props.previewCount ?? 5)));
  const isParentExpanded = createMemo(() => props.parent.expanded);
  createEffect(() => {
    if (!isParentExpanded()) {
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
    <li classList={{ indent: isParentExpanded() }} style={props.parent.root ? { "margin-left": "1em" } : {}}>
      <label>
        <Show when={(props.expandable ?? true) && isParentExpanded()}>
          <JSONArrow onClick={toggleExpand} expanded={expanded()} />
        </Show>
        <JSONKey key={props.key} colon={props.colon ?? ":"} parent={props.parent} onClick={toggleExpand} />
        <span onClick={toggleExpand}>
          <span>{props.label ?? ""}</span>
          {props.bracketOpen}
        </span>
      </label>
      <Show when={isParentExpanded()}>
        <ul classList={{ collapse: !expanded() }} onClick={expand} style={{ "list-style": "none" }}>
          <For each={slicedEntries()}>
            {([key, vRef], index) => (
              <>
                <JSONNode
                  key={(props.getKey ?? ((key: string) => key))(key)}
                  parent={{ expanded: expanded(), objType: refRef()[1], root: false }}
                  jsonRef={props.jsonRef}
                  jsonRefId={vRef}
                  // value={(() => {
                  //   try {
                  //     return expanded()
                  //       ? (props.getValue ?? ((key: string) => key))(key)
                  //       : (props.getPreviewValue ?? props.getValue)(key);
                  //   } catch (e) {
                  //     return null;
                  //   }
                  // })()}
                />
                <Show when={!expanded() && index() < previewEntries().length - 1}>
                  <span class="comma">,</span>
                </Show>
              </>
            )}
          </For>
          <Show when={slicedEntries().length < previewEntries().length}>
            <span>…</span>
          </Show>
        </ul>
      </Show>
      <Show when={!isParentExpanded()}>
        <span>…</span>
      </Show>
      <span>{props.bracketClose}</span>
    </li>
  );
};
