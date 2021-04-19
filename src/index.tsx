import { Component, createEffect, createRoot, createSignal, getOwner, Show, JSX } from "solid-js";
import { NodeGraph } from "./graph";
import { SignalList } from "./signals";
import { colors } from "./theme";
import "./font.css";
if (!window._$afterUpdate) {
  const solidUpdateListeners: (() => void)[] = [];
  window.addSolidUpdateListener = (listener: () => void) => {
    return solidUpdateListeners.push(listener) - 1;
  };
  window.removeSolidUpdateListener = (id: number) => {
    delete solidUpdateListeners[id];
  };
  window._$afterUpdate = () => {
    for (let k of solidUpdateListeners) {
      try {
        k();
      } catch (e) {}
    }
  };
}

export const Debugger: Component<{}> = (props) => {
  let self = getOwner()!;
  let root = self;
  while (root.owner) root = root.owner;

  let comp = self;
  while (comp.owner && comp.owner.componentName) comp = comp.owner;
  let children = props.children;

  return createRoot(() => {
    const [bbox, setBbox] = createSignal({ x: -10, y: -10, width: 0, height: 0 });
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
      "border-radius": "0px",
      "border": "none",
      "padding": "6px",
      "margin": "0 6px",
      "box-sizing": "border-box",
      "height": "100%",
      "color": colors.ansi.blue,
      "background": colors.backgroundColor,
      "border-width": "2px 0 2px 0",
      "border-top-color": colors.backgroundColor,
    };

    return (
      <>
        <div
          style={{
            "position": "fixed",
            "top": bbox().y + "px",
            "left": bbox().x + "px",
            "width": bbox().width + "px",
            "height": bbox().height + "px",
            "border": `1px dotted ${colors.ansi.blue}`,
            "pointer-events": "none",
            "font-family": "'Victor Mono',monospace",
          }}
        />
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
              "display": "grid",
              "grid-template-rows": "auto minmax(0, 1fr)",
              "grid-template-columns": "1fr",
              "background-color": colors.backgroundColor,
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
                "background": colors.ansi.red,
                "border": "0px",
                "border-radius": "0.3em",
                "color": colors.backgroundColor,
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
                "padding": "0.0rem",
                "background": colors.backgroundColor,
                "display": "flex",
                "justify-content": "flex-start",
                "align-items": "center",
                "font-size": 24,
                "height": 24,
                "line-height": "32px",
              }}
              onMouseDown={[setIsDragging, true]}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ "margin": "6px", "text-align": "center", "width": 24 }}
                viewBox="0 0 24 24"
                fill="#FFFFFF"
              >
                <g>
                  <rect fill="none" height="24" width="24" />
                  <path d="M17,5h-2V3h2V5z M15,15v6l2.29-2.29L19.59,21L21,19.59l-2.29-2.29L21,15H15z M19,9h2V7h-2V9z M19,13h2v-2h-2V13z M11,21h2 v-2h-2V21z M7,5h2V3H7V5z M3,17h2v-2H3V17z M5,21v-2H3C3,20.1,3.9,21,5,21z M19,3v2h2C21,3.9,20.1,3,19,3z M11,5h2V3h-2V5z M3,9h2 V7H3V9z M7,21h2v-2H7V21z M3,13h2v-2H3V13z M3,5h2V3C3.9,3,3,3.9,3,5z" />
                </g>
              </svg>
              <button
                style={{
                  ...buttonStyles,
                  "border-bottom":
                    tab() !== "signals" ? `2px solid ${colors.backgroundColor}` : `2px solid ${colors.ansi.blue}`,
                }}
                onClick={() => setTab("signals")}
              >
                Signals
              </button>
              <button
                style={{
                  ...buttonStyles,
                  "border-bottom":
                    tab() !== "graph" ? `2px solid ${colors.backgroundColor}` : `2px solid ${colors.ansi.blue}`,
                }}
                onClick={() => setTab("graph")}
              >
                Graph
              </button>
            </div>
            <Show when={open()}>
              <Show when={tab() == "graph"}>
                <NodeGraph root={root} setBbox={setBbox} />
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
