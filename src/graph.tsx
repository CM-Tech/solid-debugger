import { Component, createEffect, createSignal, createState, getOwner, onMount } from "solid-js";
import { select, zoom, forceManyBody, forceSimulation, forceY, forceLink, forceX, BaseType } from "d3";
import * as d3 from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum, Selection, ForceLink } from "d3";
import { valueToString } from "./utils";
import { defaultTheme } from "./theme/defaultTheme";
import { Root } from "./json-tree/Root";
import objType from "./json-tree/objType";

type Owner = NonNullable<ReturnType<typeof getOwner>>;
type ComputationArr = NonNullable<Owner["owned"]>;
type Computation = ComputationArr[number];
type Signal = NonNullable<Computation["sources"]>[number];
type Item = (Computation | Signal) & SimulationNodeDatum;
type Link = SimulationLinkDatum<Item>;
const Info: Component<{ x: keyof (Computation & Signal); active: any }> = (props) => {
  return (
    <div style={{ "display": "flex", "flex-wrap": "nowrap" }}>
      <code
        style={{
          "color": "#d8dee9",
          "flex-shrink": 0,
          "flex-grow": 0,
          "font-family": '"Droid Sans Mono", monospace, monospace, "Droid Sans Fallback"',
          "font-weight": "normal",
          "font-size": " 14px",
          "line-height": "19px",
        }}
      >
        {props.x}:{" "}
      </code>
      <Root value={(props.active as any)[props.x]} />
    </div>
  );
};
export const NodeGraph: Component<{ root: Owner; setBbox: any }> = (props) => {
  const componentNodeColor = defaultTheme.colors.ansi.green;
  const htmlNodeColor = defaultTheme.colors.ansi.yellow;
  const normalNodeColor = defaultTheme.colors.ansi.blue;
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
      let parentsO = [
        // ...((x as Computation).sources || []),
        ...[(x as Computation).owner as Item], // this could be undefined but we filter below
      ].filter((x) => x != props.root && !!x);
      let parents = parentsO.map((y) => {
        links.push({ source: y, target: x });
        return oneEl(y);
      });

      myDepth = Math.max(...(parents.length ? parents : [-1])) + 1;
      x.x ||= (parentsO[0]?.x ?? 0) + Math.random();
      x.y ||= myDepth + Math.random();
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

    var sfid = 1000;

    var w = 960,
      h = 500,
      root = d3.hierarchy({ id: "root", name: "root" }),
      data = [],
      tree = d3.tree().size([w - 20, h - 20]),
      diagonal = d3
        .linkVertical()
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        }),
      duration = 100;
    let tsp = duration;
    let timer = setInterval(update, tsp);

    var vis = svg.append("svg:g");
    const zoome = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 1])
      .on("zoom", ({ transform }) => vis.attr("transform", transform));
    zoome.translateBy(svg, (window.innerWidth - 2 - left()) / 2, 0);
    svg.call(zoome);

    vis
      .selectAll("circle")
      .data(tree(root))
      .enter()
      .append("svg:circle")
      .attr("class", "node")
      .attr("r", 3.5)
      .attr("cx", x)
      .attr("cy", y);

    function update() {
      let mdepth = Math.max(...depth.values());
      h = mdepth * 100;
      let mWi = 0;
      let ent = [...depth.entries()];
      for (let i = 0; i < mdepth + 1; i++) {
        mWi = Math.max(mWi, ent.filter((x) => x[1] === i).length);
      }
      w = mWi * 100;
      tree = tree.size([w, h]);
      //   if (data.length >= 100) {
      //   data.splice(50, 1);
      // }
      // Add a new datum to a random parent.
      // var d = {id: "ohai"+(++sfid)}, parent = data[~~(Math.random() * data.length)];
      // if (parent.children) parent.children.push(d); else parent.children = [d];
      // data.push(d);

      // Compute the new tree layout. We'll stash the old layout in the data.
      var treeData = tree(root);
      var nodes = treeData,
        links = treeData.links();
      let qq = treeData.descendants();
      data = data.filter((x) => !!qq.find((d) => x.data.id === d.data.id));
      // console.log(qq.length)
      for (let no of qq) {
        let dt = data.find((d) => no.data.id === d.data.id);
        if (!dt) {
          dt = no;
          data.push(no);
        }
        // dt.data={...dt.data,...no.data};
        if ((dt.x !== no.x || dt.y !== no.y) && (dt.children || []).length === 0) dt.data.countdown = duration + 1;
        dt.x = no.x;
        dt.y = no.y;
        dt.children = no.children;
        no.data = dt.data;
        // no.data.x0=dt.data.x0;
        // no.data.y0=dt.data.y0;
        // no.data.countdown=dt.data.countdown;
      }
      for (let no of qq) {
        let dt = data.find((d) => no.data.id === d.data.id);
        dt.parent = no.parent;
        if (!no.parent) {
          dt.data.countdown = 0;
        } else {
          dt.data.countdown = (dt.data.countdown ?? duration + 1) - tsp;
          if ((dt.parent.data.countdown ?? duration) > 0) {
            dt.data.countdown = duration + 1;
            dt.data.x0 = no.parent.data.x01 ?? 0;
            dt.data.y0 = no.parent.data.y01 ?? 0;
          }
          dt.data.countdown = Math.max(dt.data.countdown, 0);
        }
        dt.data.x0 = dt.data.x0 ?? (no.parent && no.parent.data.x01) ?? 0;
        dt.data.y0 = dt.data.y0 ?? (no.parent && no.parent.data.y01) ?? 0;
        let cd = (dt.data.countdown ?? duration) / duration;
        dt.data.y01 = cd * dt.data.y0 + (1 - cd) * dt.y;
        dt.data.x01 = cd * dt.data.x0 + (1 - cd) * dt.x;
        // no.data.x0=dt.data.x0;
        // no.data.y0=dt.data.y0;
        no.data = dt.data;
      }
      window.data = data;
      // Update the links…
      var link = vis.selectAll("path.link").data(links, linkId);

      // Enter any new links at the parent's previous position.
      link
        .enter()
        .insert("svg:path")
        .style("fill", "none")
        .style("stroke", defaultTheme.colors.foregroundColor)
        .style("stroke-width", "2px")
        .attr("class", "link")
        .attr("d", function (d) {
          var o = { x: d.source.data.x01, y: d.source.data.y01 };
          var o2 = { x: d.target.data.x01, y: d.target.data.y01 };
          return diagonal({ source: o, target: o2 });
        });
      // .transition()
      //   .duration(duration)
      //   .attr("d", diagonal);
      link.exit().remove();
      // Transition links to their new position.
      // link.transition()
      //     .duration(duration)
      //     .attr("d", diagonal);

      link
        .transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = { x: d.source.data.x01, y: d.source.data.y01 };
          var o2 = { x: d.target.data.x01, y: d.target.data.y01 };
          return diagonal({ source: o, target: o2 });
        });
      // Update the nodes…
      var node = vis.selectAll("circle.node").data(nodes, nodeId);
      // Enter any new nodes at the parent's previous position.
      node
        .enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("cx", function (d) {
          // let cd=(d.data.countdown??duration)/duration;
          return d.data.x01;
        })
        .attr("cy", function (d) {
          // let cd=(d.data.countdown??duration)/duration;
          return d.data.y01; //=d.data.y0*cd+d.y*(1-cd);
        })
        .attr("fill", (d) =>
          (d.data.more as Computation).componentName
            ? componentNodeColor
            : d.data.more.value instanceof HTMLElement
            ? htmlNodeColor
            : normalNodeColor
        )
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          setActive(d.data.more);
          e.stopPropagation();
        })
        .attr("stroke", (d) => (d.data.more.value instanceof HTMLElement ? htmlNodeColor : normalNodeColor))
        .style("stroke-width", "5px")
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          setActive(d.data.more);
          e.stopPropagation();
        });
      // .transition()
      //   .duration(duration)
      //   .attr("cx", x)
      //   .attr("cy", y);

      node.exit().remove();

      // Transition nodes to their new position.
      // node.transition()
      //     .duration(duration)
      // .attr("cx", x)
      // .attr("cy", y);
      node
        .transition()
        .duration(duration)
        .attr("cx", function (d) {
          let cd = (d.data.countdown ?? duration) / duration;
          return d.data.x01; //=d.data.x0*cd+d.x*(1-cd);
        })
        .attr("cy", function (d) {
          let cd = (d.data.countdown ?? duration) / duration;
          return d.data.y01; //=d.data.y0*cd+d.y*(1-cd);
        });
    }

    function linkId(d) {
      return btoa(d.source.data.id) + "-" + btoa(d.target.data.id);
    }

    function nodeId(d) {
      return d.data.id;
    }

    function x(d) {
      return (d.data.x0 = d.x);
    }

    function y(d) {
      return (d.data.y0 = d.y);
    }

    // const g = svg.append("g");
    // let findChildrenFromLinks = (pI: Item) => {
    //   return links.filter((x) => x.source === pI).map((x) => x.target as Item);
    // };
    // let findParentsFromLinks = (pI: Item) => {
    //   return [(pI as Computation).owner as Item].filter((x) => x && x != props.root);
    // };

    // let link = g
    //   .append("g")
    //   .selectAll("line")
    //   .data(links)
    //   .join("line")
    //   .attr("stroke", "#D8DEE9")
    //   .attr("stroke-opacity", 1)
    //   .attr("stroke-width", 1);

    // const zoome = zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([0.1, 1])
    //   .on("zoom", ({ transform }) => g.attr("transform", transform));
    // zoome.translateBy(svg, (window.innerWidth - 2 - left()) / 2, 0);
    // svg.call(zoome);

    // const createNode = <T extends BaseType>(x: Selection<T, Item, SVGGElement, unknown>) =>
    //   x
    //     .attr("r", 10)
    //     .attr("fill", (d) =>
    //       (d as Computation).componentName
    //         ? componentNodeColor
    //         : d.value instanceof HTMLElement
    //         ? htmlNodeColor
    //         : normalNodeColor
    //     )
    //     .style("cursor", "pointer")
    //     .on("click", (e, d) => {
    //       setActive(d);
    //       e.stopPropagation();
    //     })
    //     .on("mouseover", (_, d) => {
    //       node
    //         .filter(
    //           (x) => x != d && (d as Computation).owner != x /*&& !(d as Computation).sources?.includes(x as Signal)*/
    //         )
    //         .style("opacity", 0.6);

    //       link
    //         .filter((l) => l.target == d)
    //         .style("stroke", "#88C0D0")
    //         .style("stroke-width", 2);
    //     })
    //     .on("mouseout", () => {
    //       node.style("opacity", null);
    //       link.style("stroke", null).style("stroke-width", null);
    //     });

    // let node = g.append("g").selectAll("circle").data(nodes).join("circle").call(createNode);

    window._$afterUpdate = () => {
      updated.clear();
      depth.clear();

      nodes = [];
      links = [];
      queue = [props.root as Item];
      while (queue.length) oneEl(queue.shift()!);
      const itemToTreeC = (x: Item & Owner) => {
        return { name: x.name, id: x.name, children: x.owned ? x.owned.map(itemToTreeC) : [], more: x };
      };
      root = d3.hierarchy(itemToTreeC(props.root));
      // data=[root];
      // update();
      // node = node.data(nodes).join((enter) => enter.append("circle").call(createNode));

      // node
      //   .filter((x) => updated.has(x))
      //   .transition()
      //   .duration(400)
      //   .attr("fill", "white")
      //   .transition()
      //   .duration(400)
      //   .attr("fill", (d) =>
      //     (d as Computation).componentName
      //       ? componentNodeColor
      //       : d.value instanceof HTMLElement
      //       ? htmlNodeColor
      //       : normalNodeColor
      //   );

      // link = link.data(links).join("line").attr("stroke", "#D8DEE9").attr("stroke-opacity", 1).attr("stroke-width", 1);
    };

    // const tick = () => {
    //   link
    //     .attr("x1", (d) => (d.source as Item).xx!)
    //     .attr("y1", (d) => (d.source as Item).yy!)
    //     .attr("x2", (d) => (d.target as Item).xx!)
    //     .attr("y2", (d) => (d.target as Item).yy!);
    //   const compNodes = (a: Item, b: Item): number => {
    //     let aP = findParentsFromLinks(a);
    //     let bP = findParentsFromLinks(b);
    //     if (aP.length > 0 && bP.length > 0) {
    //       let r = compNodes(aP[0], bP[0]);
    //       if (r !== 0) {
    //         return r;
    //       }
    //     }
    //     return a.x - b.x;
    //   };
    //   let sortedRows = {};
    //   for (let i = 0; i < 10; i++)
    //     nodes.forEach((d: Item) => {
    //       let pI = (d as Computation).owner as Item;
    //       if (!pI || pI == props.root) return;
    //       let children = findChildrenFromLinks(d);
    //       let MUL = 100;
    //       let myDepth = depth.get(d);
    //       let row = sortedRows[myDepth];
    //       if (!row) {
    //         row = nodes.filter((x) => depth.get(x) === myDepth);
    //         row.sort(compNodes);
    //         sortedRows[myDepth] = row;
    //       }
    //       let xi = row.indexOf(d);
    //       let fx = 0;
    //       if (xi < row.length - 1) {
    //         fx += 0.1 * Math.min(0, row[xi + 1].x - MUL - d.x);
    //       }
    //       if (xi > 0) {
    //         fx += 0.1 * Math.max(0, row[xi - 1].x + MUL - d.x);
    //       }
    //       let targetChildrenMean =
    //         children.length > 0 ? children.map((x) => x.x).reduce((a, b) => a + b) / children.length : 0;
    //       if (children.length > 0) {
    //         fx += 0.02 * (targetChildrenMean - d.x);
    //       }
    //       d.x += fx; // * 0.9+0.1*(0.5*targetChildrenMean+0.5*Math.max((pI.x + sOff),diff+d.x+MUL));// + ((pI.x + sOff) / 2 * 2) * 0.01;//Math.max(-diff+d.x+MUL,pI.x+sOff);//m+100+Math.random()-0.5;
    //       d.y = depth.get(d)! * 100;
    //       d.xx = d.x; //d.y*Math.sin(d.x!/(d.y!+100)*Math.PI);
    //       d.yy = d.y; //d.y*Math.cos(d.x!/(d.y!+100)*Math.PI);
    //     });

    //   node.attr("cx", (d) => d.xx).attr("cy", (d) => d.yy);
    //   window.requestAnimationFrame(tick);
    // };
    // tick();
  });

  let [left, setLeft] = createSignal(400);
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

  createEffect(() => {
    let upd = () => {
      let valu = active().value;
      if (valu instanceof HTMLElement) {
        let r = valu.getBoundingClientRect();
        let rect = { x: r.x, y: r.y, w: r.width, h: r.height };
        props.setBbox(rect);
      } else {
        props.setBbox({ x: -10, y: -10, w: 0, h: 0 });
      }
    };
    let ud2 = () => {
      requestAnimationFrame(ud2);
      upd();
    };
    ud2();
    window.addEventListener("scroll", upd);

    window.addEventListener("resize", upd);
  });

  return (
    <div
      style={{
        "display": "grid",
        "width": "100%",
        "height": "100%",
        "grid-template-columns": `1fr 2px ${left()}px`,
        "box-shadow": "rgba(0, 0, 0, 0.4) 0 6px 6px -6px inset",
      }}
    >
      <svg ref={el} style={{ "box-shadow": "rgba(0, 0, 0, 0.4) -6px 0 6px -6px inset" }}></svg>
      <div
        style={{ "border-left": "1px solid rgb(63, 78, 96)", "cursor": "col-resize" }}
        onMouseDown={[setIsDragging, true]}
      ></div>
      <div style={{ overflow: "auto" }}>
        <Info x="name" active={active()} />
        <Info x="componentName" active={active()} />
        <Info x="value" active={active()} />
        <Info x="fn" active={active()} />
      </div>
    </div>
  );
};
