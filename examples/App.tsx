import { Debugger } from "../src";
import { defaultTheme } from "../src/theme/defaultTheme";
import { createSignal } from "solid-js";
import { Show } from "solid-js/web";
import { Root } from "../src/json-tree/Root";

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return (
    <button
      onClick={increment}
      style={{ border: "none", background: defaultTheme.colors.ansi.green, color: defaultTheme.colors.backgroundColor }}
    >
      {count()}
    </button>
  );
}

function App() {
  const [visible, setVisible] = createSignal(false, true, { name: "hi cole" });
  return (
    <Debugger>
      <div class="App-header">
        <button
          onClick={() => setVisible(!visible())}
          style={{
            border: "none",
            background: defaultTheme.colors.ansi.red,
            color: defaultTheme.colors.backgroundColor,
          }}
        >
          Toggle visibility
        </button>
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
