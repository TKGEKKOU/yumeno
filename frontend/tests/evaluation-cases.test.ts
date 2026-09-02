import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import EvalDatasetPanel from "../src/evaluation/EvalDatasetPanel.vue";
import { createEvalCase, deleteEvalCase, listEvalCases, updateEvalCase } from "../src/evaluation/dataset";

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: () => Promise.resolve(body),
  } as Response;
}

const sampleCase = {
  id: "case-1",
  knowledge_space_id: "space-1",
  question: "如何启动？",
  expected_answer: "执行启动命令。",
  relevant_document_ids: ["doc-1"],
  tags: ["入门", "运行"],
  difficulty: "easy",
  enabled: true,
};

afterEach(() => vi.restoreAllMocks());

describe("人工评测集 API", () => {
  it("loads cases from the encoded knowledge-space endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ items: [sampleCase], total: 1 }));
    await expect(listEvalCases("space/1")).resolves.toEqual({ items: [sampleCase], total: 1 });
    expect(fetchMock).toHaveBeenCalledWith("/api/knowledge-spaces/space%2F1/eval-cases", { cache: "no-store" });
  });

  it("updates and deletes a case through the case-scoped endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response({ ...sampleCase, question: "更新后的问题" }))
      .mockResolvedValueOnce(response(null, 204));
    const form = { question: "更新后的问题", expectedAnswer: "更新后的答案", documentIds: "doc-2", tags: "更新", difficulty: "hard" as const, enabled: false };
    await expect(updateEvalCase("space-1", "case/1", form)).resolves.toMatchObject({ question: "更新后的问题" });
    await expect(deleteEvalCase("space-1", "case/1")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls.map(([input, init]) => [String(input), init?.method, init?.body])).toEqual([
      ["/api/knowledge-spaces/space-1/eval-cases/case%2F1", "PATCH", JSON.stringify({ question: "更新后的问题", expected_answer: "更新后的答案", relevant_document_ids: ["doc-2"], tags: ["更新"], difficulty: "hard", enabled: false })],
      ["/api/knowledge-spaces/space-1/eval-cases/case%2F1", "DELETE", undefined],
    ]);
  });
});

describe("EvalDatasetPanel", () => {
  it("lists cases and creates a new manual case", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response({ items: [sampleCase], total: 1 }))
      .mockResolvedValueOnce(response({ ...sampleCase, id: "case-2", question: "新的问题" }, 201));

    const wrapper = mount(EvalDatasetPanel, { props: { spaceId: "space-1" } });
    await vi.waitFor(() => expect(wrapper.text()).toContain("如何启动？"));
    await wrapper.get("button.primary").trigger("click");
    await wrapper.get("textarea[name=question]").setValue("新的问题");
    await wrapper.get("textarea[name=expected_answer]").setValue("新的答案");
    await wrapper.findAll("button.primary")[1].trigger("click");
    await vi.waitFor(() => expect(wrapper.text()).toContain("新的问题"));
    expect(wrapper.text()).toContain("人工题集");
  });

  it("does not request cases without a knowledge space", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const wrapper = mount(EvalDatasetPanel, { props: { spaceId: "" } });
    await vi.waitFor(() => expect(wrapper.text()).toContain("先选择一个角色"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
