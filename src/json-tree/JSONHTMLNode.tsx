import { Component, For } from "solid-js";
import { JSONNested } from "./JSONNested";
import { useRefRef } from "./JSONRefValue";
import { JSONNodeProps } from "./p";

export const JSONHTMLNode: Component<
  {
    key: string;
    nodeType: string;
  } & JSONNodeProps
> = (props) => {
  const refRef = useRefRef(() => props.jsonRefId, props.jsonRef);
  if (!refRef()) {
    return null;
  }
  return (
    <JSONNested
      jsonRefId={props.jsonRefId}
      jsonRef={props.jsonRef}
      key={props.key ? (props.parent.objType === "HTMLElement" ? "" : props.key + ":") : props.key}
      parent={props.parent}
      previewCount={0}
      colon={""}
      label={``}
      expandable={refRef()[0].childNodes.length > 0}
      bracketOpen={
        <>
          {"<"}
          {refRef()[0].tagName.toLowerCase()}
          {[...refRef()[0].attributes].length > 0 ? " " : ""}
          <For each={[...refRef()[0].attributes]}>
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
      bracketClose={`</${refRef()[0].tagName.toLowerCase()}>`}
    />
  );
};
