import { Component, createEffect, createRoot, createSignal, For, getOwner, onMount, Show } from "solid-js";
import { select, zoom, forceManyBody, forceSimulation, forceY, forceLink, forceX, BaseType } from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum, Selection, ForceLink } from "d3";
import { valueToString } from "./utils";

type Owner = NonNullable<ReturnType<typeof getOwner>>;
type ComputationArr = NonNullable<Owner["owned"]>;
type Computation = ComputationArr[number];
type Signal = NonNullable<Computation["sources"]>[number];
type Item = (Computation | Signal) & SimulationNodeDatum;
type Link = SimulationLinkDatum<Item>;

export const NodeGraph: Component<{ root: Owner }> = (props) => {
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
        .attr("fill", (d) => ((d as Computation).componentName ? "green" : "red"));

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
