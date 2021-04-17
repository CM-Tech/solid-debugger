import { Debugger } from "../src";
import { createEffect, createSignal, createState } from "solid-js";
import { Show } from "solid-js/web";
import { Root } from "../src/json-tree/Root";

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return <button onClick={increment}>{count()}</button>;
}

function App() {
  const [visible, setVisible] = createSignal(false, true, {name:"hi cole"});
  const [state, setState] = createState({
    a: {
      b: 1,
      c: 1,
    },
    d: {
      e: 1,
      f: 1
    }
  });
  // const b=createEffect(()=>console.log(q()))
  return (
    <Debugger>
      <div class="App-header">
        <button onClick={() => setVisible(!visible())}>Toggle visibility</button>
        <Show when={visible()}>
          <Counter />
        </Show>
        <Root value={{notYourCHeese:[1,2,3],booolFoool:true,spaghetti:"code", asdf: [...document.querySelectorAll("body")]}}></Root>
      </div>
    </Debugger>
  );
}

export default App;
