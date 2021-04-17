
  import {JSONNested} from './JSONNested';
  import MapEntry from './utils/MapEntry'
import {Component, createMemo, createSignal} from "solid-js";

  export const JSONIterableMapNode:Component<any> = (props)=>{

  const keys = createMemo(()=>{
    let result = [];
    let i = 0;
    for(const entry of props.value) {
      result.push([i++, new MapEntry(entry[0], entry[1])]);
    }
    return result;
  });
  function getKey(entry:any) {
    return entry[0];
  }
  function getValue(entry:any) {
    return entry[1];
  }

return <JSONNested
  key={props.key}
  isParentExpanded={props.isParentExpanded}
  isParentArray={props.isParentArray}
  keys={keys()}
  getKey={props.getKey}
  getValue={props.getValue}
  label={`${props.nodeType}(${keys().length})`}
  colon=""
  bracketOpen={'{'}
  bracketClose={'}'}
/>
}