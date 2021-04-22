import { createSignal, getOwner, onMount } from "solid-js";
import { Show } from "solid-js/web";
import { Debugger } from "../src";
import { Root } from "../src/json-tree/Root";
import { colors } from "../src/theme";

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
    let o: any = {};
    o.loop = o;
    o.function = alert;
    o.string = "Make Life Take The Lemons Back!";
    o.number = 47;
    o.date = new Date();
    o.array = [o, "I came in 1st place! I must have won!", "You know arrays are zero indexed....."];
    setArr(o);
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
