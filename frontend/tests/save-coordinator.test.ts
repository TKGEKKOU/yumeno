import { describe, expect, it, vi } from "vitest";

import { saveDomains } from "../src/manage/state/saveCoordinator";

describe("saveDomains", () => {
  it("reports successful and failed domains independently", async () => {
    const result = await saveDomains({
      profile: vi.fn().mockResolvedValue(undefined),
      capabilities: vi.fn().mockRejectedValue(new Error("能力保存失败")),
      grants: vi.fn().mockResolvedValue(undefined),
    });
    expect(result.ok).toBe(false);
    expect(result.savedDomains).toEqual(["profile", "grants"]);
    expect(result.failedDomains).toEqual([{ domain: "capabilities", message: "能力保存失败" }]);
  });
});
