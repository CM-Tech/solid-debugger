# Solid Debugger

Playing around with the best way to visualize declarative graphs

```jsx
import { render } from "solid-js/web";
import { Debugger } from "solid-debugger";

function App() {
  return (
    <Debugger>
      your app code here
    </Debugger>
  );
}

render(App, document.getElementById("app"));
```
