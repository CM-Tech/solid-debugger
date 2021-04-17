# Solid Debugger

Playing around with the best way to visualize declarative graphs

Eventually you will be able to write the following

```jsx
import { render } from "solid-js/web";
import { Debugger } from "solid-debugger";

function App() {
  return <Debugger>your app code here</Debugger>;
}

render(App, document.getElementById("app"));
```

# Demo

1. `pnpm i`
2. `pnpm run dev`
3. http://localhost:3000
