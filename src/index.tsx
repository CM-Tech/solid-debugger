import { Component, createEffect, createRoot, createSignal, For, getOwner, onMount, Show } from "solid-js";
import { select, zoom, forceManyBody, forceSimulation, forceY, forceLink, forceX, BaseType } from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum, Selection, ForceLink } from "d3";

type Owner = NonNullable<ReturnType<typeof getOwner>>;
type ComputationArr = NonNullable<Owner["owned"]>;
type Computation = ComputationArr[number];
type Signal = NonNullable<Computation["sources"]>[number];
type Item = (Computation | Signal) & SimulationNodeDatum;
type Link = SimulationLinkDatum<Item>;

function valueToString(x: any): string {
  try {
    return x === undefined
      ? "undefined"
      : JSON.stringify(x, (_, value) => {
          if (value instanceof Element) {
            return value.outerHTML.replace(value.innerHTML, "...");
          }
          return value;
        });
  } catch (e) {
    console.log(x);
    return "could not stringify value, value has been logged to the console instead";
  }
}
const NodeGraph: Component<{ root: Owner }> = (props) => {
  let el!: SVGSVGElement;
  let [active, setActive] = createSignal(props.root as Computation | Signal, undefined, {
    name: "analyze-node",
  });

  let nodes = [] as Item[];
  let links = [] as SimulationLinkDatum<Item>[];
  let depth = new Map<Item, number>();
  let values = new Map<Item, any>();
  let updated = new Set<Item>();

  let queue = [props.root as Item] as Item[];
  function oneEl(x: Item) {
    if (depth.has(x)) return depth.get(x)!;

    let myDepth = -1;
    if (x != props.root) {
      let parents = [
        // ...((x as Computation).sources || []),
        ...[(x as Computation).owner as Item], // this could be undefined but we filter below
      ]
        .filter((x) => x != props.root && !!x)
        .map((y) => {
          links.push({ source: y, target: x });
          return oneEl(y);
        });

      myDepth = Math.max(...(parents.length ? parents : [-1])) + 1;
      nodes.push(x);
    }
    depth.set(x, myDepth);
    if (values.get(x) != x.value) updated.add(x);
    values.set(x, x.value);

    let owned = (x as Computation).owned;
    if (owned) queue.push(...owned);

    // let observers = (x as Signal).observers;
    // if (observers) queue.push(...observers);

    return myDepth;
  }
  while (queue.length) oneEl(queue.shift()!);

  onMount(() => {
    const svg = select(el)
      .attr("width", "100%")
      .attr("height", "100%")
      .on("click", () => {
        setActive(props.root as Computation | Signal);
      });

    const g = svg.append("g");

    let simulation = forceSimulation<Item, Link>(nodes)
      .force("charge", forceManyBody().strength(-200))
      .force(
        "link",
        forceLink()
          .links(links)
          .strength(2)
          .distance((l) => (depth.get(l.target as Item)! - depth.get(l.source as Item)!) * 100)
      )
      .force(
        "x",
        forceX(0).strength((d) => (depth.get(d as Item) == 0 ? 0.5 : 0.01))
      )
      .force(
        "y",
        forceY()
          .y((d) => depth.get(d as Item)! * 100)
          .strength(1)
      )
      .alpha(0.1)
      .alphaDecay(0.01);

    let link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    svg.call(
      zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 1])
        .on("zoom", ({ transform }) => g.attr("transform", transform))
    );

    const createNode = <T extends BaseType>(x: Selection<T, Item, SVGGElement, unknown>) =>
      x
        .attr("r", 10)
        .attr("fill", (d) => ((d as Computation).componentName ? "green" : "red"))
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          setActive(d);
          e.stopPropagation();
        })
        .on("mouseover", (_, d) => {
          node
            .filter(
              (x) => x != d && (d as Computation).owner != x /*&& !(d as Computation).sources?.includes(x as Signal)*/
            )
            .style("fill", "#B8B8B8");

          link
            .filter((l) => l.target == d)
            .style("stroke", "#69b3b2")
            .style("stroke-width", 4);
        })
        .on("mouseout", () => {
          node.style("fill", null);
          link.style("stroke", null).style("stroke-width", null);
        });

    let node = g.append("g").selectAll("circle").data(nodes).join("circle").call(createNode);

    window._$afterUpdate = () => {
      updated.clear();
      depth.clear();

      nodes = [];
      links = [];
      queue = [props.root as Item];
      while (queue.length) oneEl(queue.shift()!);

      if (updated.has(active())) setActive(active());

      node = node.data(nodes).join((enter) => enter.append("circle").call(createNode));

      node
        .filter((x) => updated.has(x))
        .transition()
        .duration(400)
        .attr("fill", "white")
        .transition()
        .duration(400)
        .attr("fill", "red");

      link = link.data(links).join("line").attr("stroke", "#999").attr("stroke-opacity", 0.6).attr("stroke-width", 2);

      simulation.nodes(nodes);
      (simulation.force("link") as ForceLink<Item, Link>).links(links);
      simulation.alpha(0.1).restart();
    };

    simulation.on("tick", () => {
      // var kx = .4 * 0.1, ky = 1.4 * 0.1;
      // links.forEach(function(d, i) {
      //   d.target.x += (d.source.x - d.target.x) * kx;
      //   d.target.y += (d.source.y + 100 - d.target.y) * ky;
      // });

      link
        .attr("x1", (d) => (d.source as Item).x!)
        .attr("y1", (d) => (d.source as Item).y!)
        .attr("x2", (d) => (d.target as Item).x!)
        .attr("y2", (d) => (d.target as Item).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      simulation.alpha(0.1).restart();
    });
  });

  let [left, setLeft] = createSignal(200);
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

  return (
    <div style={`display:grid; width:100%;height:100%;grid-template-columns: 1fr 2px ${left()}px;`}>
      <svg ref={el}></svg>
      <div
        style="border-left: 1px solid rgb(63, 78, 96); cursor: col-resize;"
        onMouseDown={[setIsDragging, true]}
      ></div>
      <div style="overflow: auto;">
        <div>
          <code style="color: white;">name: {valueToString(active().name)}</code>
        </div>
        <div>
          <code style="color: white;">componentName: {(active() as Computation).componentName}</code>
        </div>
        <div>
          <code style="color: white;">value: {valueToString(active().value)}</code>
        </div>
        <div>
          <code style="color: white;">fn: {(active() as Computation).fn?.toString()}</code>
        </div>
      </div>
    </div>
  );
};

const JSXEl: Component<{ el: Owner }> = (props) => {
  return (
    <div>
      {props.el.componentName}
      <div style="margin-left: 10px">
        <For each={props.el.owned!.filter((x) => x.componentName)}>{(x) => <JSXEl el={x} />}</For>
      </div>
    </div>
  );
};

const ComputationList: Component<{ root: Owner }> = (props) => {
  let [bla, setBla] = createSignal(false);

  return (
    <div style="overflow: auto scroll; position: relative;">
      <JSXEl el={(bla() || true) && props.root} />
      <button
        style="position: absolute;
        top: 0; right: 0;
        margin: 0.5rem;
        padding: 0.5em;
        background: rgb(63, 78, 96);
        border: 0px;
        border-radius: 0.3em;
        color: white;"
        onClick={() => setBla(!bla)}
      >
        Refresh
      </button>
    </div>
  );
};

export const Debugger: Component<{}> = (props) => {
  console.log("here");
  let self = getOwner()!;
  let root = self;
  while (root.owner) root = root.owner;

  let comp = self;
  while (comp.owner && comp.owner.componentName) comp = comp.owner;
  let children = props.children;

  return createRoot(() => {
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

    const buttonStyles = `
      padding: 0.2em 0.4em;
      color: white;
      margin: 0.5em;
      font-weight: bold;
      text-shadow: black 0px 0px 10px;
      border-radius: 0.2em;`;

    return (
      <>
        <div style={open() ? `padding-bottom: ${height()}px` : ""}>{children}</div>
        <footer>
          <Show when={!open()}>
            <button
              style="position: fixed;
                  bottom: 10px;
                  left: 10px;
                  background: none;
                  border: none;
                  cursor: pointer;"
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
            style={`
                font-size: clamp(12px, 1.5vw, 14px);
                font-family: sans-serif;
                display: grid;
                grid-template-rows: auto minmax(0, 1fr);
                grid-template-columns: 1fr;
                background-color: rgb(11, 21, 33);
                color: white;
                position: fixed;
                bottom: 0px;
                right: 0px;
                z-index: 99999;
                width: 100%;
                height: ${height()}px;
                max-height: 90%;
                box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 20px;
                border-top: 1px solid rgb(63, 78, 96);
                transform-origin: center top;
                transition: transform 0.2s ease 0s, opacity 0.2s ease 0s;
                opacity: ${open() ? 1 : 0};
                pointer-events: ${open() ? "all" : "none"};
                transform: translateY(${open() ? 0 : 15}px)
                           scale(${open() ? 1 : 1.02});`}
          >
            <button
              style="appearance: none;
              font-size: 0.9em;
              font-weight: bold;
              background: rgb(63, 78, 96);
              border: 0px;
              border-radius: 0.3em;
              color: white;
              padding: 0.5em;
              cursor: pointer;
              position: fixed;
              z-index: 99999;
              margin: 0.5rem;
              bottom: 0px;
              left: 0px;"
              onclick={() => setOpen(false)}
            >
              Close
            </button>
            <div
              style="padding: 0.5rem;
              background: rgb(19, 35, 55);
              display: flex;
              justify-content: space-between;
              align-items: center;"
              onMouseDown={[setIsDragging, true]}
            >
              <div style="font-size: 1.2rem; font-weight: bold;">Computations</div>
              <div>
                <button
                  style={`${buttonStyles} 
                    background: rgb(0, 107, 255); 
                    opacity: ${tab() == "effects" ? 1 : 0.3};`}
                  onClick={() => setTab("effects")}
                >
                  Effects
                </button>
                <button
                  style={`${buttonStyles} 
                    background: rgb(0, 171, 82); 
                    opacity: ${tab() == "graph" ? 1 : 0.3};`}
                  onClick={() => setTab("graph")}
                >
                  Graph
                </button>
              </div>
            </div>
            <Show when={tab() == "graph"}>
              <NodeGraph root={root} />
            </Show>
            <Show when={tab() == "effects"}>
              <ComputationList root={comp} />
            </Show>
          </div>
        </footer>
      </>
    );
  });
};
