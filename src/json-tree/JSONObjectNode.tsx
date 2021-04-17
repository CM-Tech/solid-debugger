import {JSONNested} from './JSONNested';
import {Component, createMemo} from "solid-js";

export const JSONObjectNode:Component<{value:Record<string,any>;expanded?:boolean;isParentExpanded:boolean; isParentArray:boolean;key:string;nodeType:string;}> = (props)=>{

  let keys = createMemo(()=>Object.getOwnPropertyNames(props.value));

return <JSONNested
  key={props.key}
  expanded={props.expanded ?? false}
  isParentExpanded={props.isParentExpanded}
  isParentArray={props.isParentArray}
  keys={keys()}
  previewKeys={keys()}
  getValue={(k:string)=>props.value[k]}
  label={`${props.nodeType} `}
  bracketOpen={'{'}
  bracketClose={'}'}
/>
}