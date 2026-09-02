import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getKnowledgeSpaceReport,
  listKnowledgeSpaceEvaluations,
} from "../src/manage/api";
import KnowledgeQualityPanel from "../src/manage/components/KnowledgeQualityPanel.vue";
import {
  normalizeEvaluationReports,
  summarizeKnowledgeDocuments,
} from "../src/manage/knowledge-quality";

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("knowledge quality model", () => {
  it("summarizes document processing states for the RAG inspector", () => {
    expect(summarizeKnowledgeDocuments([
      { status: "indexed" },
      { status: "indexing" },
      { status: "converting" },
      { status: "index_failed" },
      { status: "preview_ready" },
      { status: "unknown" },
    ])).toEqual({ total: 6, indexed: 1, processing: 2, failed: 1, attention: 3 });
  });

  it("accepts persisted evaluation envelopes without coupling the UI to one shape", () => {
    expect(normalizeEvaluationReports({ items: [{ id: "eval-1", status: "completed" }] })).toEqual([
      { id: "eval-1", status: "completed" },
    ]);
    expect(normalizeEvaluationReports({ results: [{ id: "eval-2" }] })).toEqual([{ id: "eval-2" }]);
  });
});

describe("knowledge quality API", () => {
  it("queries the knowledge-space report and persisted evaluations", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response({ knowledge_space_id: "space/1", total_documents: 2, indexed_count: 2 }))
      .mockResolvedValueOnce(response({ items: [{ id: "eval-1", status: "completed" }] }));

    await expect(getKnowledgeSpaceReport("space/1")).resolves.toEqual({ knowledge_space_id: "space/1", total_documents: 2, indexed_count: 2 });
    await expect(listKnowledgeSpaceEvaluations("persona/1")).resolves.toEqual([{ id: "eval-1", status: "completed" }]);

    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      "/api/knowledge-spaces/space%2F1/documents/report",
      "/api/eval/history?persona_id=persona%2F1&limit=1",
    ]);
  });
});

describe("KnowledgeQualityPanel", () => {
  it("shows live document health and the latest persisted evaluation", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response({ knowledge_space_id: "space-1", total_documents: 2, indexed_count: 1, failed_count: 1, index_version_counts: { "index-v1": 2 } }))
      .mockResolvedValueOnce(response({ items: [{ id: "eval-1", status: "completed", created_at: "2026-08-30T10:00:00Z", metrics: { accepted_rate: 0.8 } }] }));

    const wrapper = mount(KnowledgeQualityPanel, {
      props: {
        personaId: "persona-1",
        knowledgeSpaceId: "space-1",
        documents: [{ status: "indexed" }, { status: "index_failed" }],
      },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain("80%"));
    expect(wrapper.find(".knowledge-quality-stats").text()).toContain("1已索引");
    expect(wrapper.find(".knowledge-quality-stats").text()).toContain("1需处理");
    expect(wrapper.text()).toContain("80%");
    expect(wrapper.text()).toContain("索引 index-v1");
  });

  it("degrades to a clear empty state when the new routes are unavailable", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response({ detail: "Not Found" }, 404))
      .mockResolvedValueOnce(response({ detail: "Not Found" }, 404));

    const wrapper = mount(KnowledgeQualityPanel, {
      props: { personaId: "persona-1", knowledgeSpaceId: "space-1", documents: [] },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain("暂无处理报告"));
    expect(wrapper.text()).toContain("暂无已保存评测");
  });
});
