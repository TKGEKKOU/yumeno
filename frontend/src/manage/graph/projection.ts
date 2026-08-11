import type { RoleGraph } from "../types";

function descendantsOf(graph: RoleGraph, startId: string): Set<string> {
  const visible = new Set<string>([startId]);
  const pending = [startId];
  while (pending.length) {
    const source = pending.shift()!;
    for (const edge of graph.edges) {
      if (edge.source !== source || visible.has(edge.target)) continue;
      visible.add(edge.target);
      pending.push(edge.target);
    }
  }
  return visible;
}

function owningPackage(graph: RoleGraph, selectedNodeId: string, packageIds: Set<string>): string | undefined {
  if (packageIds.has(selectedNodeId)) return selectedNodeId;
  const visited = new Set<string>();
  const pending = [selectedNodeId];
  while (pending.length) {
    const target = pending.shift()!;
    if (visited.has(target)) continue;
    visited.add(target);
    for (const edge of graph.edges) {
      if (edge.target !== target) continue;
      if (packageIds.has(edge.source)) return edge.source;
      pending.push(edge.source);
    }
  }
  return undefined;
}

export function projectRoleGraph(graph: RoleGraph, selectedNodeId: string): RoleGraph {
  const persona = graph.nodes.find((node) => node.data.kind === "persona");
  if (!persona) return graph;
  const extensionHubId = graph.nodes.find((node) => node.data.kind === "extensions")?.id;
  const packageIds = new Set(
    graph.edges
      .filter((edge) => edge.source === (extensionHubId || persona.id))
      .map((edge) => edge.target)
      .filter((id) => graph.nodes.some((node) => node.id === id && ["skill", "tool"].includes(node.data.kind))),
  );
  const owner = owningPackage(graph, selectedNodeId, packageIds);
  const overview = selectedNodeId === extensionHubId;
  const visible = new Set<string>([
    persona.id,
    ...graph.nodes.filter((node) => node.type === "module").map((node) => node.id),
    ...(owner ? [owner] : overview ? packageIds : []),
  ]);
  if (owner) descendantsOf(graph, owner).forEach((id) => visible.add(id));
  return {
    nodes: graph.nodes.filter((node) => visible.has(node.id)),
    edges: graph.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target)),
  };
}
