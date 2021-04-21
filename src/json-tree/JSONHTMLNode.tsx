import { JSONNested } from "./JSONNested";
import { Component, createMemo, For } from "solid-js";
import { JSONEditableProps, JSONNodeProps } from "./p";

export const JSONHTMLNode: Component<
  {
    value: HTMLElement;
    expanded?: boolean;
    key: string;
    nodeType: string;
  } & JSONNodeProps &
    JSONEditableProps
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
      isHTML={true}
      keys={keys()}
      previewKeys={keys()}
      previewCount={0}
      getValue={(k: number) => props.value?.childNodes?.[k]}
      colon={""}
      label={``}
      expandable={props.value.childNodes?.length > 0}
      bracketOpen={
        <>
          {"<"}
          {props.value.tagName?.toLowerCase?.()}
          {[...props.value?.attributes].length > 0 ? " " : ""}
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
