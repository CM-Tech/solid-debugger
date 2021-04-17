import { SolidDebuggerTheme } from "./theme/Theme";

declare module "solid-js/dev";

declare global {
  interface Window {
    SOLID_DEBUGGER_THEME: SolidDebuggerTheme;
  }
}
