import type {
  CapabilityStatus,
  NodeKind,
  RoleGraph,
  RoleGraphNode,
  RoleGraphNodeData,
  WorkbenchSnapshot,
} from "../types";

const MODULES: Array<{ id: NodeKind; label: string; summary: (data: WorkbenchSnapshot) => string }> = [
  { id: "profile", label: "设定", summary: () => "编辑角色设定" },
  { id: "memory", label: "记忆", summary: () => "会话与长期记忆" },
  { id: "rag", label: "知识库", summary: (data) => `${data.documents.length} 份资料` },
  { id: "voice", label: "声音", summary: (data) => (data.persona.profile?.tts as any)?.voice_asset_id ? "已绑定角色音色" : "未绑定角色音色" },
  { id: "live2d", label: "Live2D", summary: (data) => (data.persona.profile?.live2d as any)?.model ? "已绑定模型" : "未绑定模型" },
  { id: "extensions", label: "扩展能力", summary: (data) => `${data.capabilities.packages.length} 项 Skill 与 Tool` },
];

function statusOf(value: string): CapabilityStatus {
  if (["available", "partial", "unassigned", "blocked", "pending", "error"].includes(value)) return value as CapabilityStatus;
  return "blocked";
}

function node(id: string, type: RoleGraphNode["type"], data: RoleGraphNodeData): RoleGraphNode {
  return { id, type, position: { x: 0, y: 0 }, data };
}

export function buildRoleGraph(snapshot: WorkbenchSnapshot): RoleGraph {
  const nodes = new Map<string, RoleGraphNode>();
  const edges = new Map<string, { id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }>();
  const rootId = `persona:${snapshot.persona.id}`;
  const extensionHubId = "module:extensions";
  nodes.set(rootId, node(rootId, "persona", { kind: "persona", label: snapshot.persona.name, summary: String(snapshot.persona.profile?.description || "尚未填写人设"), status: "available", level: 0 }));

  for (const module of MODULES) {
    const id = `module:${module.id}`;
    nodes.set(id, node(id, "module", { kind: module.id, label: module.label, summary: module.summary(snapshot), status: "available", level: 0 }));
    const isExtensionHub = module.id === "extensions";
    edges.set(`${rootId}->${id}`, { id: `${rootId}->${id}`, source: rootId, target: id, sourceHandle: isExtensionHub ? "right-source" : "left-source", targetHandle: isExtensionHub ? "left-target" : "right-target" });
  }

  for (const capabilityPackage of snapshot.capabilities.packages) {
    const packageKind: NodeKind = capabilityPackage.kind === "skill" ? "skill" : "tool";
    const packageOverride = snapshot.capabilities.overrides[capabilityPackage.id];
    const assigned = packageOverride === undefined ? capabilityPackage.assigned : packageOverride;
    const packageStatus = packageOverride === false ? "blocked" : packageOverride === true && capabilityPackage.status === "unassigned" ? "available" : capabilityPackage.status;
    nodes.set(capabilityPackage.id, node(capabilityPackage.id, "capability", {
      kind: packageKind,
      label: capabilityPackage.name,
      summary: capabilityPackage.description || capabilityPackage.reason || "能力包",
      status: statusOf(packageStatus),
      level: capabilityPackage.level,
      assigned,
      configurable: true,
      sourceId: capabilityPackage.id,
    }));
    edges.set(`${extensionHubId}->${capabilityPackage.id}`, { id: `${extensionHubId}->${capabilityPackage.id}`, source: extensionHubId, target: capabilityPackage.id, sourceHandle: "right-source", targetHandle: "left-target" });

    for (const dependency of capabilityPackage.dependencies || []) {
      if (!dependency.id) continue;
      const dependencyOverride = snapshot.capabilities.overrides[dependency.id];
      const dependencyEffective = dependencyOverride === undefined ? dependency.effective : dependencyOverride;
      nodes.set(dependency.id, node(dependency.id, "capability", {
        kind: "tool",
        label: dependency.name,
        summary: dependency.server ? `MCP · ${dependency.server}` : dependency.source,
        status: dependencyEffective ? "available" : "blocked",
        level: dependency.level,
        assigned: dependencyEffective,
        configurable: false,
        sourceId: dependency.id,
      }));
      edges.set(`${capabilityPackage.id}->${dependency.id}`, { id: `${capabilityPackage.id}->${dependency.id}`, source: capabilityPackage.id, target: dependency.id, sourceHandle: "right-source", targetHandle: "left-target" });
      if (dependency.server) {
        const serverId = `mcp:${dependency.server}`;
        const server = snapshot.grants.servers.find((item) => item.name === dependency.server);
        const connected = server?.status?.status === "connected";
        nodes.set(serverId, node(serverId, "capability", {
          kind: "mcp",
          label: dependency.server,
          summary: server?.description || "MCP 服务",
          status: server?.authorized && connected ? "available" : "blocked",
          level: dependency.level,
          assigned: Boolean(server?.authorized),
          configurable: Boolean(server && !server.global),
          sourceId: dependency.server,
        }));
        edges.set(`${dependency.id}->${serverId}`, { id: `${dependency.id}->${serverId}`, source: dependency.id, target: serverId, sourceHandle: "right-source", targetHandle: "left-target" });
      }
    }
  }
  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}
