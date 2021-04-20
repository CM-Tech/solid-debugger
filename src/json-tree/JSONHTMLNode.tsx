import { JSONNested } from "./JSONNested";
import { Component, createMemo, For } from "solid-js";
import { createDeepMemo } from "./Root";

export const JSONHTMLNode: Component<{
  value: HTMLElement;
  expanded?: boolean;
  isParentExpanded: boolean;
  isParentArray: boolean;
  key: string;
  nodeType: string;
  isParentHTML?: boolean;
}> = (props) => {
  let value = () => props.value; //createDeepMemo(()=>props.value);
  let keys = createMemo(() => Object.getOwnPropertyNames(value().childNodes));

  return (
    <JSONNested
      key={props.key ? (props.isParentHTML ? "" : props.key + ":") : props.key}
      expanded={props.expanded ?? false}
      isParentExpanded={props.isParentExpanded}
      isParentArray={props.isParentArray}
      isParentHTML={props.isParentHTML}
      isHTML={true}
      keys={keys()}
      previewKeys={keys()}
      previewCount={0}
      getValue={(k: number) => value().childNodes[k]}
      colon={""}
      label={``}
      expandable={value().childNodes.length > 0}
      bracketOpen={
        <>
          {"<"}
          {value().tagName.toLowerCase()}
          {[...value().attributes].length > 0 ? " " : ""}
          <For each={[...value().attributes]}>
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
      bracketClose={`</${value().tagName.toLowerCase()}>`}
    />
  );
};
