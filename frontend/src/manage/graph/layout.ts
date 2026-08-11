import dagre from "@dagrejs/dagre";

import type { RoleGraph } from "../types";

const NODE_WIDTH = 190;
const NODE_HEIGHT = 78;
const MODULE_ORDER = ["profile", "memory", "rag", "extensions", "voice", "live2d"];

function architectureLayout(graph: RoleGraph): RoleGraph | undefined {
  const persona = graph.nodes.find((node) => node.data.kind === "persona");
  const extensionHub = graph.nodes.find((node) => node.data.kind === "extensions");
  if (!persona || !extensionHub) return undefined;

  const positions = new Map<string, { x: number; y: number }>();
  const modules = graph.nodes
    .filter((node) => node.type === "module" && node.data.kind !== "extensions")
    .sort((a, b) => MODULE_ORDER.indexOf(a.data.kind) - MODULE_ORDER.indexOf(b.data.kind));
  modules.forEach((node, index) => positions.set(node.id, { x: 34, y: 24 + index * 112 }));
  const centerY = 24 + ((modules.length - 1) * 112) / 2;
  positions.set(persona.id, { x: 340, y: centerY });
  positions.set(extensionHub.id, { x: 650, y: centerY });

  const packageIds = new Set(graph.edges.filter((edge) => edge.source === extensionHub.id).map((edge) => edge.target));
  const packages = graph.nodes
    .filter((node) => packageIds.has(node.id))
    .sort((a, b) => a.data.level - b.data.level || a.data.label.localeCompare(b.data.label));

  if (packages.length > 1) {
    const columns = Math.min(3, packages.length);
    packages.forEach((node, index) => positions.set(node.id, {
      x: 960 + (index % columns) * 230,
      y: 24 + Math.floor(index / columns) * 108,
    }));
  } else if (packages.length === 1) {
    const owner = packages[0];
    positions.set(owner.id, { x: 960, y: positions.get(extensionHub.id)!.y });
    const depths = new Map<string, number>([[owner.id, 0]]);
    const pending = [owner.id];
    while (pending.length) {
      const source = pending.shift()!;
      const depth = depths.get(source)!;
      graph.edges.filter((edge) => edge.source === source).forEach((edge) => {
        if (depths.has(edge.target)) return;
        depths.set(edge.target, depth + 1); pending.push(edge.target);
      });
    }
    const maxDepth = Math.max(0, ...depths.values());
    for (let depth = 1; depth <= maxDepth; depth += 1) {
      const level = graph.nodes
        .filter((node) => depths.get(node.id) === depth)
        .sort((a, b) => a.data.label.localeCompare(b.data.label));
      const branchCenterY = positions.get(extensionHub.id)!.y;
      level.forEach((node, index) => positions.set(node.id, {
        x: 960 + depth * 260,
        y: branchCenterY + (index - (level.length - 1) / 2) * 104,
      }));
    }
  }

  return {
    nodes: graph.nodes.map((node) => ({ ...node, position: positions.get(node.id) || node.position })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}

export function layoutRoleGraph(graph: RoleGraph): RoleGraph {
  const architecture = architectureLayout(graph);
  if (architecture) return architecture;
  const layout = new dagre.graphlib.Graph();
  layout.setDefaultEdgeLabel(() => ({}));
  layout.setGraph({ rankdir: "LR", nodesep: 34, ranksep: 96, marginx: 28, marginy: 28 });
  [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)).forEach((item) => layout.setNode(item.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  [...graph.edges].sort((a, b) => a.id.localeCompare(b.id)).forEach((edge) => layout.setEdge(edge.source, edge.target));
  dagre.layout(layout);
  return {
    nodes: graph.nodes.map((item) => {
      const position = layout.node(item.id);
      return { ...item, position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 } };
    }),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}
