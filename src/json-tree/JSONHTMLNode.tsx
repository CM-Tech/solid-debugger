import { JSONNested } from "./JSONNested";
import { Component, createMemo, For } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONHTMLNode: Component<
  {
    expanded?: boolean;
    key: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps<HTMLElement>
> = (props) => {
  let keys = createMemo(() => Object.getOwnPropertyNames(props.value?.childNodes ?? {}));

  return (
    <JSONNested
      value={props.value}
      setValue={(...args) => props.setValue("childNodes", ...args)}
      key={props.key ? (props.parent.isHTML ? "" : props.key + ":") : props.key}
      expanded={props.expanded ?? false}
      parent={props.parent}
      nodeType={props.nodeType}
      isHTML
      keys={keys()}
      previewKeys={keys()}
      previewCount={0}
      getValue={(k: number) => props.value?.childNodes?.[k]}
      colon=""
      label=""
      notExpandable={!props.value.childNodes?.length}
      bracketOpen={
        <>
          {"<"}
          {props.value.tagName?.toLowerCase?.()}
          <For each={[...props.value?.attributes]}>
            {(a) => (
              <>
                {" "}
                <span class="Number">{a.name}</span>
                {a.value !== "" ? (
                  <>
                    =<span class="String">{JSON.stringify(a.value)}</span>
                  </>
                ) : (
                  ""
                )}
              </>
            )}
          </For>
          {">"}
        </>
      }
      bracketClose={`</${props.value.tagName?.toLowerCase?.()}>`}
    />
  );
};
