
  import {JSONArrow} from './JSONArrow';
  import {JSONNode} from './JSONNode';
  import {JSONKey} from './JSONKey';
import {Component, createEffect, createMemo, Show, useContext, For, createSignal} from "solid-js";
import { contextKey } from './context';

export const ErrorNode:Component<{key: string|number;value:Error;isParentExpanded:boolean;isParentArray:boolean;expanded?:boolean}>=(props)=>{

  let [expanded, setExpanded] = createSignal(props.expanded??true);

  const stack = createMemo(()=>props.value.stack.split('\n'));

  const context = useContext(contextKey);
  // setContext(contextKey, { ...context, colon: ':' })

  createEffect(()=>{
    if (!props.isParentExpanded) {
    setExpanded(false);
  }
});

  function toggleExpand() {
    setExpanded(!expanded());
  }

return <>
<li classList={{indent:props.isParentExpanded}}>
  <Show when={props.isParentExpanded}>
    <JSONArrow onClick={toggleExpand} expanded={expanded()} />
  </Show>
  <JSONKey key={props.key} colon={context.colon} isParentExpanded={props.isParentExpanded} isParentArray={props.isParentArray} />
  <span onClick={toggleExpand}>Error: {expanded()?'':props.value.message}</span>
  <Show when={props.isParentExpanded}>
    <ul classList={{collapse:!expanded()}}>
      <Show when={expanded()}>
        <JSONNode key="message" value={props.value.message} />
        <li>
          <JSONKey key="stack" colon=":" isParentExpanded={props.isParentExpanded} />
          <span>
            <For each={stack()}>{(line, index)=>
              <><span classList={{indent:index() > 0}}>{line}</span><br /></>
            }</For>
          </span>
        </li>
      </Show>
    </ul>
  </Show>
</li>
</>
}