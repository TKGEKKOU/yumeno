import { apiRequest } from "../shared/api";

export type EvalDifficulty = "easy" | "medium" | "hard";
export type EvalDatasetMode = "generated" | "manual" | "combined";

export interface EvalRunForm {
  personaId: string;
  tier: string;
  datasetMode: EvalDatasetMode;
}

export function toEvalRunPayload(form: EvalRunForm) {
  return {
    persona_id: form.personaId,
    tier: form.tier,
    dataset_mode: form.datasetMode,
  };
}

export interface EvalCase {
  id: string;
  workspace_id?: string;
  knowledge_space_id?: string;
  question: string;
  expected_answer?: string;
  relevant_document_ids?: string[];
  tags?: string[];
  difficulty?: EvalDifficulty;
  enabled?: boolean;
  source?: "manual" | "feedback" | string;
  source_query_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EvalCaseForm {
  question: string;
  expectedAnswer: string;
  documentIds: string;
  tags: string;
  difficulty: EvalDifficulty;
  enabled: boolean;
}

export function normalizeEvalCases(payload: unknown): EvalCase[] {
  if (Array.isArray(payload)) return payload as EvalCase[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: EvalCase[] }).items;
  }
  return [];
}

export function splitListInput(value: string): string[] {
  return [...new Set(value.split(/[\n,，]+/).map((item) => item.trim()).filter(Boolean))];
}

export function toEvalCasePayload(form: EvalCaseForm) {
  return {
    question: form.question.trim(),
    expected_answer: form.expectedAnswer.trim(),
    relevant_document_ids: splitListInput(form.documentIds),
    tags: splitListInput(form.tags),
    difficulty: form.difficulty,
    enabled: form.enabled,
  };
}

export function listEvalCases(spaceId: string): Promise<{ items: EvalCase[]; total: number }> {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-cases`, { cache: "no-store" });
}

export function createEvalCase(spaceId: string, form: EvalCaseForm): Promise<EvalCase> {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toEvalCasePayload(form)),
  });
}

export function updateEvalCase(spaceId: string, caseId: string, form: EvalCaseForm): Promise<EvalCase> {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-cases/${encodeURIComponent(caseId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toEvalCasePayload(form)),
  });
}

export async function deleteEvalCase(spaceId: string, caseId: string): Promise<void> {
  await apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-cases/${encodeURIComponent(caseId)}`, {
    method: "DELETE",
  });
}

export interface EvalCandidate {
  id: string;
  source_query_id: string;
  status: "pending" | "accepted" | "rejected" | string;
  source: string;
  question: string;
  suggested_answer: string;
  relevant_document_ids: string[];
  tags: string[];
  signals: Array<{ code: string; label: string }>;
  evidence: Array<Record<string, unknown>>;
  confidence: number;
  grounded: boolean;
  useful: boolean;
  feedback_helpful: boolean | null;
  reviewer_note: string;
  created_at?: string;
}

export interface EvalCandidateList {
  items: EvalCandidate[];
  total: number;
  pending_total: number;
}

export interface EvalCandidateReviewForm {
  expectedAnswer?: string;
  documentIds?: string;
  tags?: string;
  difficulty?: EvalDifficulty;
  note?: string;
}

export function listEvalCandidates(spaceId: string, status = "pending"): Promise<EvalCandidateList> {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-candidates?status=${encodeURIComponent(status)}`, { cache: "no-store" });
}

export function syncEvalCandidates(spaceId: string): Promise<{ created: number; existing: number; items: EvalCandidate[] }> {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-candidates/sync`, { method: "POST" });
}

function toCandidateReviewPayload(form: EvalCandidateReviewForm) {
  const payload: Record<string, unknown> = { note: (form.note || "").trim() };
  if (form.expectedAnswer !== undefined) payload.expected_answer = form.expectedAnswer.trim();
  if (form.documentIds !== undefined) payload.relevant_document_ids = splitListInput(form.documentIds);
  if (form.tags !== undefined) payload.tags = splitListInput(form.tags);
  if (form.difficulty !== undefined) payload.difficulty = form.difficulty;
  return payload;
}

export function approveEvalCandidate(spaceId: string, candidateId: string, form: EvalCandidateReviewForm) {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-candidates/${encodeURIComponent(candidateId)}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toCandidateReviewPayload(form)),
  });
}

export function rejectEvalCandidate(spaceId: string, candidateId: string, note = "") {
  return apiRequest(`/api/knowledge-spaces/${encodeURIComponent(spaceId)}/eval-candidates/${encodeURIComponent(candidateId)}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: note.trim() }),
  });
}
