import {
  Component,
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  Show,
  JSX,
  createState,
  createMemo,
} from "solid-js";
import { NodeGraph } from "./graph";
import { SignalList } from "./signals";
import { defaultTheme } from "./theme/defaultTheme";
const solidUpdateListeners: (() => void)[] = [window._$afterUpdate];
let solidUpdateListenerCount = 1;
window.addSolidUpdateListener = (listener: () => void) => {
  let c = solidUpdateListenerCount++;
  solidUpdateListeners[c] = listener;
  return c;
};
window.removeSolidUpdateListener = (id: number) => {
  delete solidUpdateListeners[id];
};
const newAfterUpdate = () => {
  for (let k of Object.keys(solidUpdateListeners)) {
    if (k !== "length") {
      try {
        solidUpdateListeners[(k as unknown) as keyof typeof solidUpdateListeners]();
      } catch (e) {}
    }
  }
};
window._$afterUpdate = newAfterUpdate;
Object.defineProperty(window, "_$afterUpdate", {
  get: function () {
    return newAfterUpdate;
  },
  set: function (val) {
    return (solidUpdateListeners[0] = val);
  },
});
const SelEl: Component<{ sty: any }> = (props) => {
  // FIXME
  return (
    <div class="bad-selection-class" ref={(el) => (window.solidDebugHighlight = el)}>
      <style>{`.bad-selection-class{
  position:${props.sty.position};
  width:${props.sty.width};
  height:${props.sty.height};
  border:${props.sty.border};
  top:${props.sty.top};
  left:${props.sty.left};
  pointer-events:none;
}`}</style>
    </div>
  );
};
export const Debugger: Component<{}> = (props) => {
  let self = getOwner()!;
  let root = self;
  while (root.owner) root = root.owner;

  let comp = self;
  while (comp.owner && comp.owner.componentName) comp = comp.owner;
  let children = props.children;

  return createRoot(() => {
    const [bbox, setBbox] = createSignal({ x: -10, y: -10, w: 0, h: 0 });
    const sty = createMemo(() => ({
      position: "fixed",
      top: bbox().y + "px",
      left: bbox().x + "px",
      width: bbox().w + "px",
      height: bbox().h + "px",
      border: `1px dotted ${defaultTheme.colors.ansi.blue}`,
    }));
    let [open, setOpen] = createSignal(false);
    let [tab, setTab] = createSignal("graph");

    let [height, setHeight] = createSignal(300);
    const [isDragging, setIsDragging] = createSignal(false);

    let offset: number | undefined;
    const onMouseMove = (e: MouseEvent) => {
      const h = window.innerHeight - e.clientY;
      if (!offset) offset = height() - h;
      if (h < 200) return;

      setHeight(h + offset);
    };

    const onMouseUp = () => setIsDragging(false);

    createEffect(() => {
      if (isDragging()) {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      } else {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        offset = undefined;
      }
    });

    const buttonStyles: JSX.CSSProperties = {
      "display": "inline-flex",
      "box-sizing": "border-box",
      "max-width": "100%",
      "border": "none",
      "color": defaultTheme.colors.foregroundColor,
      "min-width": "0px",
      "min-height": "0px",
      "flex-direction": "column",
      "padding": "12px 24px",
      "border-radius": "0px",
    };

    return (
      <>
        <SelEl sty={sty()} />
        <div style={{ [open() ? "padding-bottom" : ""]: `${height()}px` }}>{children}</div>
        <footer>
          <Show when={!open()}>
            <button
              style={{
                position: "fixed",
                bottom: "10px",
                left: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setOpen(true)}
            >
              {/* prettier-ignore */}
              <svg xmlns="http://www.w3.org/2000/svg" width="40px" viewBox="0 0 166 155.3">
                <path d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" fill="#76b3e1"/>
                <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="27.5" y1="3" x2="152" y2="63.5"><stop offset=".1" stop-color="#76b3e1"/><stop offset=".3" stop-color="#dcf2fd"/><stop offset="1" stop-color="#76b3e1"/></linearGradient>
                <path d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" opacity=".3" fill="url(#a)"/>
                <path d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" fill="#518ac8"/>
                <linearGradient id="b" gradientUnits="userSpaceOnUse" x1="95.8" y1="32.6" x2="74" y2="105.2"><stop offset="0" stop-color="#76b3e1"/><stop offset=".5" stop-color="#4377bb"/><stop offset="1" stop-color="#1f3b77"/></linearGradient>
                <path d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" opacity=".3" fill="url(#b)"/>
                <linearGradient id="c" gradientUnits="userSpaceOnUse" x1="18.4" y1="64.2" x2="144.3" y2="149.8"><stop offset="0" stop-color="#315aa9"/><stop offset=".5" stop-color="#518ac8"/><stop offset="1" stop-color="#315aa9"/></linearGradient>
                <path d="M134 80a45 45 0 00-48-15L24 85 4 120l112 19 20-36c4-7 3-15-2-23z" fill="url(#c)"/>
                <linearGradient id="d" gradientUnits="userSpaceOnUse" x1="75.2" y1="74.5" x2="24.4" y2="260.8"><stop offset="0" stop-color="#4377bb"/><stop offset=".5" stop-color="#1a336b"/><stop offset="1" stop-color="#1a336b"/></linearGradient>
                <path d="M114 115a45 45 0 00-48-15L4 120s53 40 94 30l3-1c17-5 23-21 13-34z" fill="url(#d)"/>
              </svg>
            </button>
          </Show>

          <div
            style={{
              "font-size": "clamp(12px, 1.5vw, 14px)",
              "font-family": "sans-serif",
              "display": "grid",
              "grid-template-rows": "auto minmax(0, 1fr)",
              "grid-template-columns": "1fr",
              "background-color": defaultTheme.colors.backgroundColor,
              "color": "white",
              "position": "fixed",
              "bottom": "0px",
              "right": "0px",
              "z-index": 99999,
              "width": "100%",
              "height": `${height()}px`,
              "max-height": "90%",
              "box-shadow": "rgba(0, 0, 0, 0.3) 0px 0px 20px",
              "border-top": "1px solid rgb(63, 78, 96)",
              "transform-origin": "center top",
              "transition": "transform 0.2s ease 0s, opacity 0.2s ease 0s",
              "opacity": open() ? 1 : 0,
              "pointer-events": open() ? "all" : "none",
              "transform": `translateY(${open() ? 0 : 15}px) scale(${open() ? 1 : 1.02})`,
            }}
          >
            <button
              style={{
                "appearance": "none",
                "font-size": "0.9em",
                "font-weight": "bold",
                "background": "rgb(63, 78, 96)",
                "border": "0px",
                "border-radius": "0.3em",
                "color": "white",
                "padding": "0.5em",
                "cursor": "pointer",
                "position": "fixed",
                "z-index": 99999,
                "margin": "0.5rem",
                "bottom": "0px",
                "left": "0px,",
              }}
              onclick={() => setOpen(false)}
            >
              Close
            </button>
            <div
              style={{
                "padding": "0.5rem",
                "background": defaultTheme.colors.backgroundColor,
                "display": "flex",
                "justify-content": "space-between",
                "align-items": "center",
              }}
              onMouseDown={[setIsDragging, true]}
            >
              <div style={{ "font-size": "1.2rem", "font-weight": "bold" }}>Signals</div>
              <div>
                <button
                  style={{
                    ...buttonStyles,
                    background: defaultTheme.colors.ansi.blue,
                    opacity: tab() == "signals" ? 1 : 0.3,
                  }}
                  onClick={() => setTab("signals")}
                >
                  Signals
                </button>
                <button
                  style={{
                    ...buttonStyles,
                    background: defaultTheme.colors.ansi.green,
                    opacity: tab() == "graph" ? 1 : 0.3,
                  }}
                  onClick={() => setTab("graph")}
                >
                  Graph
                </button>
              </div>
            </div>
            <Show when={open()}>
              <Show when={tab() == "graph"}>
                <NodeGraph root={root} setBbox={(v) => setBbox(v)} />
              </Show>
              <Show when={tab() == "signals"}>
                <SignalList root={comp} />
              </Show>
            </Show>
          </div>
        </footer>
      </>
    );
  });
};
