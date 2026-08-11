import { describe, expect, it } from "vitest";

import { layoutRoleGraph } from "../src/manage/graph/layout";
import type { RoleGraph } from "../src/manage/types";

describe("layoutRoleGraph", () => {
  it("returns stable left-to-right positions without mutating input", () => {
    const graph: RoleGraph = {
      nodes: [
        { id: "persona:p", type: "persona", position: { x: 0, y: 0 }, data: { kind: "persona", label: "P", status: "available", level: 0, summary: "" } },
        { id: "skill/a", type: "capability", position: { x: 0, y: 0 }, data: { kind: "skill", label: "A", status: "available", level: 1, summary: "" } },
        { id: "tool/a", type: "capability", position: { x: 0, y: 0 }, data: { kind: "tool", label: "A", status: "available", level: 1, summary: "" } },
      ],
      edges: [
        { id: "p-a", source: "persona:p", target: "skill/a" },
        { id: "a-tool", source: "skill/a", target: "tool/a" },
      ],
    };
    const first = layoutRoleGraph(graph);
    const second = layoutRoleGraph(graph);
    expect(first).toEqual(second);
    expect(first.nodes.find((node) => node.id === "persona:p")!.position.x).toBeLessThan(first.nodes.find((node) => node.id === "skill/a")!.position.x);
    expect(first.nodes.find((node) => node.id === "skill/a")!.position.x).toBeLessThan(first.nodes.find((node) => node.id === "tool/a")!.position.x);
    expect(graph.nodes.every((node) => node.position.x === 0)).toBe(true);
  });

  it("places role foundations left of the persona and extension capabilities on the right", () => {
    const graph: RoleGraph = {
      nodes: [
        { id: "persona:p", type: "persona", position: { x: 0, y: 0 }, data: { kind: "persona", label: "P", status: "available", level: 0, summary: "" } },
        { id: "module:profile", type: "module", position: { x: 0, y: 0 }, data: { kind: "profile", label: "设定", status: "available", level: 0, summary: "" } },
        { id: "module:memory", type: "module", position: { x: 0, y: 0 }, data: { kind: "memory", label: "记忆", status: "available", level: 0, summary: "" } },
        { id: "module:rag", type: "module", position: { x: 0, y: 0 }, data: { kind: "rag", label: "知识库", status: "available", level: 0, summary: "" } },
        { id: "module:voice", type: "module", position: { x: 0, y: 0 }, data: { kind: "voice", label: "声音", status: "available", level: 0, summary: "" } },
        { id: "module:live2d", type: "module", position: { x: 0, y: 0 }, data: { kind: "live2d", label: "Live2D", status: "available", level: 0, summary: "" } },
        { id: "module:extensions", type: "module", position: { x: 0, y: 0 }, data: { kind: "extensions", label: "扩展能力", status: "available", level: 0, summary: "" } },
        { id: "skill/a", type: "capability", position: { x: 0, y: 0 }, data: { kind: "skill", label: "A", status: "available", level: 1, summary: "" } },
      ],
      edges: [
        { id: "p-profile", source: "persona:p", target: "module:profile" },
        { id: "p-memory", source: "persona:p", target: "module:memory" },
        { id: "p-rag", source: "persona:p", target: "module:rag" },
        { id: "p-voice", source: "persona:p", target: "module:voice" },
        { id: "p-live2d", source: "persona:p", target: "module:live2d" },
        { id: "p-extensions", source: "persona:p", target: "module:extensions" },
        { id: "extensions-a", source: "module:extensions", target: "skill/a" },
      ],
    };
    const laidOut = layoutRoleGraph(graph);
    const x = (id: string) => laidOut.nodes.find((node) => node.id === id)!.position.x;
    for (const id of ["profile", "memory", "rag", "voice", "live2d"]) expect(x(`module:${id}`)).toBeLessThan(x("persona:p"));
    expect(x("module:extensions")).toBeGreaterThan(x("persona:p"));
    expect(x("skill/a")).toBeGreaterThan(x("module:extensions"));
  });
});
