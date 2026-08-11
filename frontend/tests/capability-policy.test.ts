import { describe, expect, it } from "vitest";

import { applyCapabilityPolicy } from "../src/manage/state/capabilityPolicy";
import type { WorkbenchSnapshot } from "../src/manage/types";

const snapshot = {
  persona: { id: "p", name: "P", profile: {} }, documents: [],
  capabilities: { overrides: {}, capabilities: [], packages: [{
    id: "skill/web", name: "web", description: "", kind: "skill", level: 2, assigned: false, status: "unassigned", reason: "",
    required_servers: ["search-server"], dependencies: [{ id: "mcp/search/query", name: "query", source: "mcp", server: "search-server", level: 2, effective: false, reason: "" }],
  }] },
  grants: { servers: [{ name: "search-server", description: "", enabled: true, global: false, authorized: false }] },
} satisfies WorkbenchSnapshot;

describe("applyCapabilityPolicy", () => {
  it("prepares tool and MCP dependencies when a package is enabled", () => {
    const next = applyCapabilityPolicy(snapshot, "skill/web", "allow");
    expect(next.capabilities.overrides["skill/web"]).toBe(true);
    expect(next.capabilities.overrides["mcp/search/query"]).toBe(true);
    expect(next.grants.servers[0].authorized).toBe(true);
  });

  it("does not revoke shared dependencies when a package is denied", () => {
    const enabled = applyCapabilityPolicy(snapshot, "skill/web", "allow");
    const denied = applyCapabilityPolicy(enabled, "skill/web", "deny");
    expect(denied.capabilities.overrides["skill/web"]).toBe(false);
    expect(denied.capabilities.overrides["mcp/search/query"]).toBe(true);
    expect(denied.grants.servers[0].authorized).toBe(true);
  });
});
