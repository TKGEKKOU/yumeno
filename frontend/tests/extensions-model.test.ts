import { describe, expect, it } from "vitest";

import { deriveExtensionSummary, parseKeyValueLines } from "../src/extensions/model";

describe("extension console model", () => {
  it("derives the overview without coupling it to rendered DOM", () => {
    expect(deriveExtensionSummary({
      skills: [
        { name: "rag", enabled: true, builtin: true, trusted: true },
        { name: "search", enabled: false, builtin: false, trusted: false },
      ],
      servers: [
        { name: "ok", enabled: true, status: { status: "connected" } },
        { name: "bad", enabled: true, status: { status: "error" } },
      ],
      tools: [{ name: "query" }],
    })).toEqual({ enabledSkills: 1, mcpOnline: 1, mcpIssues: 1, toolCount: 1, attentionCount: 2 });
  });

  it("parses MCP environment and header lines", () => {
    expect(parseKeyValueLines("TOKEN=abc\nAuthorization: Bearer demo\ninvalid")).toEqual({
      TOKEN: "abc",
      Authorization: "Bearer demo",
    });
  });
});
