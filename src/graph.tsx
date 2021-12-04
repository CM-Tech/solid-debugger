import { Component, createEffect, createSignal, getOwner, onMount, onCleanup, createSelector } from "solid-js";
import * as d3 from "d3";
import { colors } from "./theme";
import { Root } from "./json-tree/Root";
import { BetterFor } from "./ForEquality";

type Owner = NonNullable<ReturnType<typeof getOwner>>;
type Computation = NonNullable<Owner["owned"]>[number];

type Item = (Owner | Computation) & {
  x0?: () => number;
  setX0?: (n: number) => void;
  y0?: () => number;
  setY0?: (n: number) => void;
  r?: () => number;
  setR?: (n: number) => void;
  expansionLevel?: number;
  recentlyUpdated?: number;
};

type DiagonalLink = {
  source: { x: number; y: number };
  target: { x: number; y: number };
};

const Info: Component<{ x: keyof Computation; active: Item }> = (props) => {
  return (
    <div style={{ "display": "flex", "flex-wrap": "nowrap" }}>
      <code
        style={{
          "font-family": "'Victor Mono', monospace",
          "color": "#d8dee9",
          "flex-shrink": 0,
          "flex-grow": 0,
          "font-weight": "normal",
          "font-size": " 14px",
          "line-height": "19px",
        }}
      >
        {props.x}:{" "}
      </code>
      <Root
        value={props.active[props.x as keyof Item]}
        setValue={(...args) => {
          if (args.length === 1) {
            props.active[props.x as keyof Item] = args[0];
          }
        }}
      />
    </div>
  );
};

const componentNodeColor = colors.ansi.green;
const computationNodeColor = colors.ansi.magenta;
const htmlNodeColor = colors.ansi.yellow;
const normalNodeColor = colors.ansi.blue;
const frameTime = 250;

const diagonal = d3
  .linkVertical<DiagonalLink, { x: number; y: number }>()
  .x((d) => d.x)
  .y((d) => d.y);

export const NodeGraph: Component<{
  active: Item;
  setActive: (a: Item) => void;
  root: Owner;
  setBbox: any;
  setLeftButtons: any;
}> = (props) => {
  let svg!: SVGSVGElement;
  const [visTransform, setTransform] = createSignal("");
  const [left, setLeft] = createSignal(400);
  const [selecting, setSelecting] = createSignal(false);
  const isSelected = createSelector(() => props.active);

  const values = new Map<Item, any>();
  const updated = new Set<Item>();

  const [links, setLinks] = createSignal([] as d3.HierarchyPointLink<Item>[]);
  const [nodes, setNodes] = createSignal([] as d3.HierarchyPointNode<Item>[]);

  props.setLeftButtons([
    <svg
      style={{ "margin": "4px", "text-align": "center", "width": 24, "cursor": "hand" }}
      viewBox="0 0 24 24"
      fill={selecting() ? colors.ansi.blue : colors.ansi.white}
      onClick={() => setSelecting(true)}
    >
      <g>
        <rect fill="none" height="24" width="24" />
        <path d="M17,5h-2V3h2V5z M15,15v6l2.29-2.29L19.59,21L21,19.59l-2.29-2.29L21,15H15z M19,9h2V7h-2V9z M19,13h2v-2h-2V13z M11,21h2 v-2h-2V21z M7,5h2V3H7V5z M3,17h2v-2H3V17z M5,21v-2H3C3,20.1,3.9,21,5,21z M19,3v2h2C21,3.9,20.1,3,19,3z M11,5h2V3h-2V5z M3,9h2 V7H3V9z M7,21h2v-2H7V21z M3,13h2v-2H3V13z M3,5h2V3C3.9,3,3,3.9,3,5z" />
      </g>
    </svg>,
  ]);
  onCleanup(() => props.setLeftButtons([]));

  let root = d3.hierarchy<Item>(props.root as Item, (d) => d.owned as Item[]);
  root.each((x) => {
    updated.add(x.data);
    x.data.expansionLevel = undefined;
    x.data.recentlyUpdated = 0;
  });

  const updateListener = window.addSolidUpdateListener(() => {
    updated.clear();

    root = d3.hierarchy<Item>(props.root as Item, (x) => x.owned as Item[]);
    root.each((x) => {
      if ("value" in x.data && values.get(x.data) !== x.data.value) {
        updated.add(x.data);
        x.data.recentlyUpdated = 0;
        values.set(x.data, x.data.value);
      }
    });

    if (updated.has(props.active)) props.setActive(props.active);
  });
  onCleanup(() => window.removeSolidUpdateListener(updateListener));

  const tree = d3.tree<Item>().nodeSize([50, 100]);
  function update() {
    // Compute the new tree layout. We'll stash the old layout in the data.
    const treeData = tree(root);

    for (const dt of treeData) {
      dt.data.recentlyUpdated = (dt.data.recentlyUpdated ?? 0) + 1;

      if (dt.data.expansionLevel == undefined) dt.data.expansionLevel = -1;
      else if (!dt.parent || dt.parent.data.expansionLevel! > 0) dt.data.expansionLevel++;
      dt.data.expansionLevel = Math.min(dt.data.expansionLevel, 1);

      if (!dt.data.setR) {
        [dt.data.r, dt.data.setR] = createSignal(0);
      } else {
        dt.data.setR(dt.data.expansionLevel! < 0 ? 0 : Math.max(10, 30 - dt.data.recentlyUpdated! * 10));
      }
      if (!dt.data.setX0 || !dt.data.setY0) {
        [dt.data.x0, dt.data.setX0] = createSignal(dt.x);
        [dt.data.y0, dt.data.setY0] = createSignal(dt.y);
      } else {
        dt.data.setX0(dt.x);
        dt.data.setY0(dt.y);
      }
      if (dt.parent && dt.data.expansionLevel < 0) {
        dt.data.setX0(dt.parent.data.x0!() ?? 0); // based on the traversal, the parent will have x0 defined
        dt.data.setY0(dt.parent.data.y0!() ?? 0);
      }
    }

    setLinks(treeData.links());
    setNodes([...treeData]);
  }

  const interval = setInterval(update, frameTime);
  onCleanup(() => clearInterval(interval));

  onMount(() => {
    const d3svg = d3.select(svg);
    const { width, height } = svg.getBoundingClientRect();
    const zoome = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 1])
      .on("zoom", ({ transform }) => setTransform(transform));
    zoome.translateBy(d3svg, width / 2, height / 2);
    d3svg.call(zoome);
  });

  createEffect(() => {
    if (selecting()) {
      const nodes = [];
      const newNodes = [props.root];
      while (newNodes.length > 0) {
        const newNode = newNodes.pop()!;
        nodes.push(newNode);
        newNodes.push(...(newNode.owned || []));
      }

      for (const x of nodes) {
        if (!((x as Computation).value instanceof HTMLElement)) continue;
        const hoverListener = (event: MouseEvent) => {
          event.stopImmediatePropagation();
          props.setActive(x as Item);
        };
        const clickListener = (event: MouseEvent) => {
          event.stopImmediatePropagation();
          setSelecting(false);
          props.setActive(x as Item);
        };
        const el: HTMLElement = (x as Computation).value;
        el.addEventListener("mouseover", hoverListener);
        el.addEventListener("click", clickListener, { once: true });
        onCleanup(() => {
          el.removeEventListener("mouseover", hoverListener);
          el.removeEventListener("click", clickListener);
        });
      }
    }
  });

  const [isDragging, setIsDragging] = createSignal(false);

  const onMouseMove = (e: MouseEvent) => {
    const w = window.innerWidth - e.clientX;
    if (w < 200) return;
    setLeft(w);
  };

  const onMouseUp = () => setIsDragging(false);

  createEffect(() => {
    if (isDragging()) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
  });

  const updatePickerBBox = () => {
    const valu = "value" in props.active && props.active.value;
    if (valu instanceof HTMLElement) {
      const r = valu.getBoundingClientRect();
      props.setBbox(r);
    } else {
      props.setBbox({ x: -10, y: -10, width: 0, height: 0 });
    }
  };

  let frame: number;
  const updateLoop = () => {
    frame = requestAnimationFrame(updateLoop);
    updatePickerBBox();
  };
  updateLoop();

  const observer = new ResizeObserver(updatePickerBBox);
  createEffect(() => {
    const valu = "value" in props.active && props.active.value;
    if (valu instanceof HTMLElement) {
      observer.observe(valu);
    }
    onCleanup(() => {
      observer.disconnect();
      props.setBbox({ x: -10, y: -10, width: 0, height: 0 });
    });
  });

  window.addEventListener("scroll", updatePickerBBox);
  onCleanup(() => {
    window.removeEventListener("scroll", updatePickerBBox);
    window.cancelAnimationFrame(frame);
    props.setBbox({ x: -10, y: -10, width: 0, height: 0 });
  });

  createEffect(() => {
    console.log(nodes());
  });
  return (
    <div
      style={{
        "display": "grid",
        "width": "100%",
        "height": "100%",
        "grid-template-columns": `1fr 4px ${left()}px`,
        "box-shadow": "rgba(0, 0, 0, 0.4) 0 6px 6px -6px inset",
      }}
    >
      <svg ref={svg} width="100%" height="100%" style={{ "box-shadow": "rgba(0, 0, 0, 0.4) -6px 0 6px -6px inset" }}>
        <g transform={visTransform()}>
          <g>
            <BetterFor each={links()} value={(a) => a.target.data}>
              {(d) => (
                <path
                  stroke={colors.foregroundColor}
                  stroke-width={2}
                  style={{
                    d: `path('${diagonal({
                      source: { x: d.source.data.x0!(), y: d.source.data.y0!() },
                      target: { x: d.target.data.x0!(), y: d.target.data.y0!() },
                    })!}')`,
                    transition: `d ${frameTime / 1000}s ease-in-out`,
                  }}
                />
              )}
            </BetterFor>
          </g>
          <g>
            <BetterFor each={nodes()} value={(a) => a.data}>
              {(d) => (
                <circle
                  stroke-width={5}
                  cursor="pointer"
                  fill={
                    (d.data as Computation).componentName
                      ? componentNodeColor
                      : "sources" in d.data
                      ? computationNodeColor
                      : normalNodeColor
                  }
                  stroke={"value" in d.data && d.data.value instanceof HTMLElement ? htmlNodeColor : normalNodeColor}
                  onClick={(e) => {
                    props.setActive(d.data);
                    e.stopPropagation();
                  }}
                  style={{
                    outline: isSelected(d.data) ? "1px solid white" : "none",
                    cx: d.data.x0!(),
                    cy: d.data.y0!(),
                    r: d.data.r!(),
                    transition: `all ${frameTime / 1000}s ease-in-out`,
                  }}
                ></circle>
              )}
            </BetterFor>
          </g>
        </g>
      </svg>
      <div
        style={{
          "border-left": "1px solid rgb(63, 78, 96)",
          "cursor": "col-resize",
        }}
        onMouseDown={() => setIsDragging(true)}
      ></div>
      <div style={{ overflow: "auto" }}>
        <Info x="name" active={props.active} />
        <Info x="componentName" active={props.active} />
        <Info x="value" active={props.active} />
        <Info x="fn" active={props.active} />
        <Info x="sources" active={props.active} />
      </div>
    </div>
  );
};
