import { describe, expect, it } from "vitest";

import { formatMetricValue, progressPercent } from "../src/evaluation/model";

describe("RAG evaluation view model", () => {
  it("formats rates and booleans for the report", () => {
    expect(formatMetricValue("recall_at_3_answerable", 0.823)).toBe("82%");
    expect(formatMetricValue("scope_isolation_ok", true)).toBe("通过");
    expect(formatMetricValue("mean_latency_ms", 12.3456)).toBe("12.346");
  });

  it("keeps progress bounded", () => {
    expect(progressPercent(3, 5)).toBe(60);
    expect(progressPercent(9, 5)).toBe(100);
    expect(progressPercent(1, 0)).toBe(0);
  });
});
