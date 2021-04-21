import { Debugger } from "../src";
import { colors } from "../src/theme";
import { createSignal, createState, onMount } from "solid-js";
import { Show } from "solid-js/web";
import { Root } from "../src/json-tree/Root";
import objType from "../src/json-tree/objType";
import { createCyclicState } from "../src/cyclicState";

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return (
    <button
      onClick={increment}
      style={{ border: "none", background: colors.ansi.green, color: colors.backgroundColor }}
    >
      {count()}
    </button>
  );
}

function App() {
  const [visible, setVisible] = createSignal(false, true, { name: "hi cole" });
  const [arr, setArr] = createSignal<any>();
  onMount(() => {
    let k: any = [{ hello: "world", b: document.body }];
    // k.g = k;
    k[1] = k;
    // const [s,ss]=createCyclicState(k);
    window.k = k;
    // console.log(s,objType(s));
    setArr(k);
  });
  return (
    <Debugger>
      <div class="App-header">
        <button
          onClick={() => {
            setVisible(!visible());
          }}
          style={{
            border: "none",
            background: colors.ansi.red,
            color: colors.backgroundColor,
          }}
        >
          Toggle visibility
        </button>
        <Show when={visible()}>
          <Counter />
        </Show>
        <Root value={arr()} />
      </div>
    </Debugger>
  );
}

export default App;
