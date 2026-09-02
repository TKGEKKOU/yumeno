import { describe, expect, it } from "vitest";

import { normalizeEvalCases, splitListInput, toEvalCasePayload } from "../src/evaluation/dataset";

describe("manual evaluation dataset model", () => {
  it("normalizes the API envelope and keeps editable list fields stable", () => {
    expect(normalizeEvalCases({ total: 1, items: [{ id: "case-1", question: "问题", tags: [" RAG "], relevant_document_ids: ["doc-1"] }] })).toEqual([
      { id: "case-1", question: "问题", tags: [" RAG "], relevant_document_ids: ["doc-1"] },
    ]);
    expect(normalizeEvalCases([{ id: "case-2", question: "兼容数组" }])).toEqual([{ id: "case-2", question: "兼容数组" }]);
  });

  it("splits comma and newline separated ids without duplicates", () => {
    expect(splitListInput("doc-1, doc-2\ndoc-1")).toEqual(["doc-1", "doc-2"]);
  });

  it("serializes the form into the backend contract", () => {
    expect(toEvalCasePayload({
      question: "  如何检索？ ",
      expectedAnswer: "  先召回。 ",
      documentIds: "doc-1, doc-2",
      tags: "rag, 回归",
      difficulty: "hard",
      enabled: false,
    })).toEqual({
      question: "如何检索？",
      expected_answer: "先召回。",
      relevant_document_ids: ["doc-1", "doc-2"],
      tags: ["rag", "回归"],
      difficulty: "hard",
      enabled: false,
    });
  });
});

import { toEvalRunPayload } from "../src/evaluation/dataset";

describe("评测运行配置", () => {
  it("serializes the selected dataset mode with the role and tier", () => {
    expect(toEvalRunPayload({ personaId: "persona-1", tier: "standard", datasetMode: "combined" })).toEqual({
      persona_id: "persona-1",
      tier: "standard",
      dataset_mode: "combined",
    });
  });
});
