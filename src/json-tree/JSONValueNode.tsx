import { Component, useContext } from 'solid-js';
import { contextKey } from './context';
import { JSONKey } from './JSONKey';

export const JSONValueNode: Component<{ key: string; isParentExpanded: boolean, isParentArray: boolean, nodeType: string, valueGetter?: (value:any) => any, value: any }> = (props) => {
  const { colon } = useContext(contextKey);

  return <li classList={{ indent: props.isParentExpanded }}>
    <JSONKey key={props.key} colon={colon} isParentExpanded={props.isParentExpanded} isParentArray={props.isParentArray} />
    <span class={props.nodeType}>
      {props.valueGetter ? props.valueGetter(props.value) : props.value}
    </span>
  </li>
}