import {createSignal,Component} from "solid-js";

export const JSONArrow:Component<any> = (props)=>{

return <div class="arrow-container" onClick={props.onClick}style={{display:"inline-block"}}>
  <div class="arrow" style={{display:"inline-block",...(props.expanded?{transform:"rotate(90deg)"}:{})}}>{'\u25B6'}</div>
</div>
}