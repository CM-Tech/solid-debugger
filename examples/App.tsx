import { Debugger } from "../src";
import { createSignal } from "solid-js";
import { Show } from "solid-js/web";
import { Root } from "../src/json-tree/Root";

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return <button onClick={increment}>{count()}</button>;
}

function App() {
  const [visible, setVisible] = createSignal(false, true, { name: "hi cole" });
  return (
    <Debugger>
      <div class="App-header">
        <button onClick={() => setVisible(!visible())}>Toggle visibility</button>
        <Show when={visible()}>
          <Counter />
        </Show>
        <Root
          value={{
            notYourCHeese: [1, 2, 3],
            booolFoool: true,
            spaghetti: "code",
            bob: document.body,
          }}
        />
      </div>
    </Debugger>
  );
}

export default App;
