import { describe, expect, it } from "vitest";

import { buildRoleGraph } from "../src/manage/graph/model";
import type { WorkbenchSnapshot } from "../src/manage/types";

const snapshot: WorkbenchSnapshot = {
  persona: { id: "p1", name: "Luna", profile: { description: "角色设定" } },
  documents: [{ id: "d1", status: "indexed", original_name: "knowledge.md" }],
  capabilities: {
    overrides: {},
    packages: [{
      id: "skill/web-research", name: "web-research", description: "外部检索", kind: "skill",
      level: 2, assigned: false, status: "unassigned", reason: "package_not_assigned",
      required_servers: ["free-search"],
      dependencies: [{ id: "mcp/free-search/search", name: "search", source: "mcp", server: "free-search", level: 2, effective: false, reason: "package_not_assigned" }],
    }],
    capabilities: [{ id: "mcp/free-search/search", name: "search", source: "mcp", server: "free-search", default_allowed: false }],
  },
  grants: { servers: [{ name: "free-search", description: "搜索", enabled: true, global: false, authorized: false, status: { status: "connected" } }] },
};

describe("buildRoleGraph", () => {
  it("builds persona modules and server-reported capability dependencies", () => {
    const graph = buildRoleGraph(snapshot);
    expect(graph.nodes.find((node) => node.id === "persona:p1")?.data.summary).toBe("角色设定");
    expect(graph.nodes.find((node) => node.id === "module:profile")?.data.summary).toBe("编辑角色设定");
    expect(["profile", "memory", "rag", "voice", "live2d", "extensions"].every((id) => graph.nodes.some((node) => node.id === `module:${id}`))).toBe(true);
    expect(graph.nodes.some((node) => node.id === "skill/web-research")).toBe(true);
    expect(graph.nodes.some((node) => node.id === "mcp/free-search/search")).toBe(true);
    expect(graph.nodes.some((node) => node.id === "mcp:free-search")).toBe(true);
    expect(graph.nodes.find((node) => node.id === "skill/web-research")?.data.configurable).toBe(true);
    expect(graph.nodes.find((node) => node.id === "mcp/free-search/search")?.data.configurable).toBe(false);
    expect(graph.nodes.find((node) => node.id === "mcp:free-search")?.data.configurable).toBe(true);
    expect(graph.edges.some((edge) => edge.source === "skill/web-research" && edge.target === "mcp/free-search/search")).toBe(true);
    expect(graph.edges.some((edge) => edge.source === "module:extensions" && edge.target === "skill/web-research")).toBe(true);
    expect(graph.edges.find((edge) => edge.source === "persona:p1" && edge.target === "module:profile")).toMatchObject({ sourceHandle: "left-source", targetHandle: "right-target" });
    expect(graph.edges.find((edge) => edge.source === "module:extensions" && edge.target === "skill/web-research")).toMatchObject({ sourceHandle: "right-source", targetHandle: "left-target" });
    expect(graph.edges.some((edge) => edge.source === "mcp/free-search/search" && edge.target === "mcp:free-search")).toBe(true);
  });
});
