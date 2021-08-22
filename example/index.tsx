import "solid-js";
import { render } from "solid-js/web";
import { App } from "./App";
import { Debugger } from "../src";

render(
  () => (
    <Debugger>
      <App />
    </Debugger>
  ),
  document.querySelector("#root") as Node
);
