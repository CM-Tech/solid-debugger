
import { Component, createMemo } from 'solid-js';
import { JSONNested } from './JSONNested';
export const JSONIterableArrayNode: Component<{ key: string; value: any[]; isParentExpanded: boolean; isParentArray: boolean; nodeType: string; }> = (props) => {
  let keys = createMemo(() => {
    let result = [];
    let i = 0;
    for (const entry of props.value) {
      result.push([i++, entry]);
    }
    return result;
  })

  function getKey(key: string) {
    return String(key[0]);
  }
  function getValue(key: string) {
    return key[1];
  }
  return <JSONNested
    key={props.key}
    isParentExpanded={props.isParentExpanded}
    isParentArray={props.isParentArray}
    keys={keys()}
    getKey={getKey}
    getValue={getValue}
    isArray={true}
    label={`${props.nodeType}(${keys().length})`}
    bracketOpen={'{'}
    bracketClose={'}'}
  />
}