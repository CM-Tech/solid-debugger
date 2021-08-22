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
    for (const k in solidUpdateListeners) solidUpdateListeners[k]();
  };
}

export const Debugger: Component = (props) => {
  const [children, root] = createRoot(() => [props.children, getOwner()!]);

  const [outlineBbox, setBbox] = createSignal({ x: -10, y: -10, width: 0, height: 0 });
  let [open, setOpen] = createSignal(false);
  let [tab, setTab] = createSignal("signals");
  const [leftButtons, setLeftButtons] = createSignal([]);

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

  const buttonStyles = (active: boolean): JSX.CSSProperties => ({
    "border-radius": "0px",
    "border": "none",
    "padding": "6px",
    "margin": "0 6px",
    "box-sizing": "border-box",
    "height": "100%",
    "color": colors.ansi.blue,
    "background": colors.backgroundColor,
    "border-width": "2px 0 2px 0",
    "font-weight": "bold",
    "border-top-color": colors.backgroundColor,
    "border-bottom": active ? `2px solid ${colors.ansi.blue}` : `2px solid ${colors.backgroundColor}`,
  });

  return (
    <>
      <div
        style={{
          "position": "fixed",
          "top": outlineBbox().y + "px",
          "left": outlineBbox().x + "px",
          "width": outlineBbox().width + "px",
          "height": outlineBbox().height + "px",
          "border": `1px dotted ${colors.ansi.blue}`,
          "pointer-events": "none",
          "z-index": 9999,
        }}
      />

      <div style={{ "padding-bottom": open() ? `${height()}px` : undefined }}>{children}</div>
      <footer style={{ "font-size": "clamp(16px, 1.5vw, 18px)" }}>
        <Show when={!open()}>
          <button
            style={{
              "appearance": "none",
              "font-size": "36px",
              "border": `2px solid ${colors.ansi.red}`,
              "background": colors.backgroundColor,
              "box-sizing": "border-box",
              "border-radius": "24px",
              "color": colors.ansi.red,
              "cursor": "pointer",
              "position": "fixed",
              "z-index": 99999,
              "margin": "16px",
              "bottom": "0px",
              "padding": 0,
              "left": "0px,",
              "line-height": "44px",
              "text-align": "center",
              "width": "48px",
              "height": "48px",
              "font-family": "'Victor Mono', monospace",
            }}
            onClick={() => setOpen(true)}
          >
            <span style={{ "margin-right": "0.125em" }}></span>
          </button>
        </Show>

        <div
          style={{
            "font-size": "clamp(12px, 1.5vw, 14px)",
            "font-family": "'Victor Mono', monospace",
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
            {leftButtons()}
            <button style={buttonStyles(tab() === "signals")} onClick={() => setTab("signals")}>
              Signals
            </button>
            <button style={buttonStyles(tab() === "graph")} onClick={() => setTab("graph")}>
              Graph
            </button>
          </div>
          <Show when={open()}>
            <Show when={tab() == "graph"}>
              <NodeGraph root={root} setBbox={setBbox} setLeftButtons={setLeftButtons} />
            </Show>
            <Show when={tab() == "signals"}>
              <SignalList root={root} />
            </Show>
          </Show>
        </div>
      </footer>
    </>
  );
};
