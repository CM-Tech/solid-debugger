import {JSONNested} from './JSONNested';
import {Component, createMemo, For} from "solid-js";

export const JSONHTMLNode:Component<{value:HTMLElement;expanded?:boolean;isParentExpanded:boolean; isParentArray:boolean;key:string;nodeType:string;isParentHTML?:boolean}> = (props)=>{

  let keys = createMemo(()=>Object.getOwnPropertyNames(props.value.children));

return <JSONNested
  key={props.isParentHTML?"":props.key+":"}
  expanded={props.expanded ?? false}
  isParentExpanded={props.isParentExpanded}
  isParentArray={props.isParentArray}
  isParentHTML={props.isParentHTML}
  isHTML={true}
  keys={keys()}
  previewKeys={keys()}
  previewCount={0}
  getValue={(k:string)=>props.value.children[k]}
  colon={""}
  label={``}
  expandable={props.value.children.length>0}
  bracketOpen={<>{'<'}{props.value.tagName.toLowerCase()} <For each={[...props.value.attributes]}>{(a)=><>{" "}<span class="Number">{a.name}</span>=<span class="String">{JSON.stringify(a.value)}</span></>}</For>{'>'}</>}
  bracketClose={`</${props.value.tagName.toLowerCase()}>`}
/>
}