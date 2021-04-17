import "./index.css";
import "solid-js";
import { render } from "solid-js/web";
import App from "./App";

render(App, document.querySelector("#root") as Node);
