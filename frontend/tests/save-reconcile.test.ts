import { describe, expect, it } from "vitest";

import { reconcileAfterSave } from "../src/manage/state/reconcile";
import type { WorkbenchSnapshot } from "../src/manage/types";

function snapshot(name: string, override: boolean, authorized: boolean): WorkbenchSnapshot {
  return {
    persona: { id: "p1", name, profile: {} }, documents: [],
    capabilities: { overrides: { skill: override }, packages: [], capabilities: [] },
    grants: { servers: [{ name: "search", description: "", enabled: true, global: false, authorized }] },
  };
}

describe("reconcileAfterSave", () => {
  it("keeps fresh successful domains and replays only failed domain drafts", () => {
    const fresh = snapshot("saved", true, true);
    const attempted = snapshot("draft", false, false);
    const reconciled = reconcileAfterSave(fresh, attempted, new Set(["grants"]));
    expect(reconciled.persona.name).toBe("saved");
    expect(reconciled.capabilities.overrides.skill).toBe(true);
    expect(reconciled.grants.servers[0].authorized).toBe(false);
  });
});
