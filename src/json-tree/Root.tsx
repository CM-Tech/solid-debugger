import { JSONNode } from "./JSONNode";
import { Component, onMount, onCleanup, createSignal, createMemo, createState } from "solid-js";
import "./tmp.css";
import { makeJSONRef, JSONRef, JSONRefContext } from "./JSONRefValue";

export const jsonNoLoops = (a: any) => {
  let cache = new Set<any>();
  return JSON.stringify(a, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) return;
      cache.add(value);
    }
    return value;
  });
};

export const Root: Component<{ key?: string; value: object; onChange?: (v: object) => void }> = (props) => {
  // const [state, setState] = createState(makeJSONRef(props.value));
  let jj = makeJSONRef(props.value);
  const [jsonRefS, setJsonRefS] = createSignal<number>(jj[1]);
  const [jsonRefS2, setJsonRefS2] = createSignal<JSONRef>(jj[0]);
  // ,(ag,bg)=>{
  //   let a=ag[0];
  //   let b=bg[0];
  //   if(a.length!==b.length){
  //     return false;
  //   }
  //   if(ag[1]!==bg[1]){
  //     return false;
  //   }
  //   return !a.map((x,i)=>(b[i][0]===x[0])&&(b[i][1]===x[1]&&(JSON.stringify(b[i][2])===JSON.stringify(x[2])))).some(x=>!x)
  // });
  onMount(() => {
    const id = window.setInterval(() => {
      let nj = makeJSONRef(props.value, jj[0]);
      jj[0] = nj[0];
      jj[1] = nj[1];
      setJsonRefS2(jj[0]);
      setJsonRefS(jj[1]);
      // setJsonRef(makeJSONRef(props.value,jsonRef()[0]));
    }, 100);
    onCleanup(() => window.clearInterval(id));
  });
  const jI = createMemo(() => jj[1]);
  const jK = createMemo(() => jj[0]);
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
      {/* <JSONRefContext.Provider value={jsonRef()[0]}> */}
      <JSONNode key={props.key} jsonRefId={jsonRefS()} jsonRef={jsonRefS2()} parent={{ expanded: true, objType: "" }} />
      {/* </JSONRefContext.Provider> */}
    </ul>
  );
};
