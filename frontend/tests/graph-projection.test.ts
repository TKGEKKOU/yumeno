import { describe, expect, it } from "vitest";

import { projectRoleGraph } from "../src/manage/graph/projection";
import type { RoleGraph } from "../src/manage/types";

const graph: RoleGraph = {
  nodes: [
    { id: "persona:p1", type: "persona", position: { x: 0, y: 0 }, data: { kind: "persona", label: "P", status: "available", level: 0, summary: "" } },
    { id: "module:rag", type: "module", position: { x: 0, y: 0 }, data: { kind: "rag", label: "RAG", status: "available", level: 0, summary: "" } },
    { id: "module:extensions", type: "module", position: { x: 0, y: 0 }, data: { kind: "extensions", label: "Extensions", status: "available", level: 0, summary: "" } },
    { id: "skill/search", type: "capability", position: { x: 0, y: 0 }, data: { kind: "skill", label: "Search", status: "available", level: 2, summary: "" } },
    { id: "tool/search", type: "capability", position: { x: 0, y: 0 }, data: { kind: "tool", label: "Tool", status: "available", level: 2, summary: "" } },
    { id: "mcp:search", type: "capability", position: { x: 0, y: 0 }, data: { kind: "mcp", label: "MCP", status: "available", level: 2, summary: "" } },
    { id: "skill/files", type: "capability", position: { x: 0, y: 0 }, data: { kind: "skill", label: "Files", status: "available", level: 1, summary: "" } },
    { id: "tool/files", type: "capability", position: { x: 0, y: 0 }, data: { kind: "tool", label: "Tool", status: "available", level: 1, summary: "" } },
  ],
  edges: [
    { id: "p-rag", source: "persona:p1", target: "module:rag" },
    { id: "p-extensions", source: "persona:p1", target: "module:extensions" },
    { id: "p-search", source: "module:extensions", target: "skill/search" },
    { id: "search-tool", source: "skill/search", target: "tool/search" },
    { id: "tool-mcp", source: "tool/search", target: "mcp:search" },
    { id: "p-files", source: "module:extensions", target: "skill/files" },
    { id: "files-tool", source: "skill/files", target: "tool/files" },
  ],
};

describe("projectRoleGraph", () => {
  it("keeps the default role architecture focused on the persona and core modules", () => {
    const projected = projectRoleGraph(graph, "persona:p1");
    expect(projected.nodes.map((node) => node.id)).toEqual([
      "persona:p1",
      "module:rag",
      "module:extensions",
    ]);
    expect(projected.edges.map((edge) => edge.id)).toEqual(["p-rag", "p-extensions"]);
  });

  it("shows all top-level packages when the extension hub is selected", () => {
    const projected = projectRoleGraph(graph, "module:extensions");
    expect(projected.nodes.map((node) => node.id)).toEqual([
      "persona:p1",
      "module:rag",
      "module:extensions",
      "skill/search",
      "skill/files",
    ]);
  });

  it("expands only the dependency branch belonging to the selected package", () => {
    const projected = projectRoleGraph(graph, "skill/search");
    expect(projected.nodes.map((node) => node.id)).toContain("tool/search");
    expect(projected.nodes.map((node) => node.id)).toContain("mcp:search");
    expect(projected.nodes.map((node) => node.id)).not.toContain("tool/files");
  });

  it("keeps a dependency visible with its owning branch when it is selected", () => {
    const projected = projectRoleGraph(graph, "mcp:search");
    expect(projected.nodes.map((node) => node.id)).toEqual([
      "persona:p1",
      "module:rag",
      "module:extensions",
      "skill/search",
      "tool/search",
      "mcp:search",
    ]);
  });
});
