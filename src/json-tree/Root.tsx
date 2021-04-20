import { JSONNode } from "./JSONNode";
import { Component, createMemo, createSignal, createState, onCleanup, onMount } from "solid-js";
import "./tmp.css";

export function decycle(obj, stack = []) {
  if (!obj || typeof obj !== "object") return obj;

  if (stack.includes(obj)) return null;

  let s = stack.concat([obj]);

  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, decycle(v, s)]));
}
export const jsonID = (a: any) => {
  const dd = decycle(a);
  // console.log("DD:",dd)
  // try{
  //   return JSON.stringify(Object.entries(dd));
  // }catch(e){
  return JSON.stringify(dd);
  // }
};
// window.jsonId=(a:any)=>{
//   const dd=decycle(a);
//   console.log("DD:",dd)

// return JSON.stringify(dd&&Object.entries(dd));
// }
// const deepEqual=(a:any,b:any,stack:[any,any][]=[])=>{

// }
export const createDeepMemo = (a) => {
  let lastRValueS = a();
  let lastJSON = jsonID(lastRValueS);
  const [rvalue, setRValue] = createSignal(lastRValueS, false, { name: JSON.stringify(decycle(lastRValueS)) });
  onMount(() => {
    let id = window.setInterval(() => {
      let aa = a();
      // if(
      //   rvalue().json!==json ||rvalue().value!==aa){
      let nJ = jsonID(aa);
      if (aa !== lastRValueS || lastJSON !== nJ) {
        lastJSON = nJ;
        lastRValueS = aa;
        setRValue(aa);
      }
      // }
    }, 1);
    onCleanup(() => {
      window.clearInterval(id);
    });
  });
  return rvalue; //()=>rvalue().value
};
export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
  const value = createDeepMemo(() => props.value);

  return (
    <ul
      style={{
        "font-family": "'Victor Mono',monospace",
        "list-style": "none",
        "margin": 0,
        "padding": 0,
        "padding-left": "1em",
      }}
    >
      <JSONNode key={props.key} value={value()} isParentExpanded={true} isParentArray={false} />
    </ul>
  );
};
