import type { KnowledgeEvaluationSummary } from "./types";

export interface KnowledgeDocumentSummary {
  total: number;
  indexed: number;
  processing: number;
  failed: number;
  attention: number;
}

const PROCESSING_STATUSES = new Set(["converting", "preview_ready", "indexing"]);

export function summarizeKnowledgeDocuments(documents: Array<Record<string, unknown>>): KnowledgeDocumentSummary {
  let indexed = 0;
  let processing = 0;
  let failed = 0;
  for (const document of documents) {
    const status = String(document.status || "");
    if (status === "indexed") indexed += 1;
    else if (status.endsWith("_failed") || ["failed", "error"].includes(status)) failed += 1;
    else if (PROCESSING_STATUSES.has(status) && status !== "preview_ready") processing += 1;
  }
  return { total: documents.length, indexed, processing, failed, attention: processing + failed };
}

export function normalizeEvaluationReports(payload: unknown): KnowledgeEvaluationSummary[] {
  if (Array.isArray(payload)) return payload as KnowledgeEvaluationSummary[];
  if (!payload || typeof payload !== "object") return [];
  const envelope = payload as Record<string, unknown>;
  for (const key of ["items", "evaluations", "results"]) {
    if (Array.isArray(envelope[key])) return envelope[key] as KnowledgeEvaluationSummary[];
  }
  return [payload as KnowledgeEvaluationSummary];
}

export function formatQualityPercent(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${Math.round((number <= 1 ? number * 100 : number))}%`;
}

export function qualityReportStatus(report: Record<string, unknown> | null): string {
  const total = Number(report?.total_documents);
  const indexed = Number(report?.indexed_count ?? report?.indexed_documents);
  const failed = Number(report?.failed_count ?? report?.failed_documents);
  const inProgress = Number(report?.in_progress_count ?? report?.processing_documents);
  const status = String(report?.status || report?.state || "");
  if (["ready", "completed", "complete", "healthy"].includes(status)) return "处理完成";
  if (["running", "processing", "pending", "indexing"].includes(status)) return "处理中";
  if (["failed", "error"].includes(status)) return "需要处理";
  if (Number.isFinite(failed) && failed > 0) return "需要处理";
  if (Number.isFinite(inProgress) && inProgress > 0) return "处理中";
  if (Number.isFinite(total) && total > 0 && Number.isFinite(indexed) && indexed >= total) return "处理完成";
  if (Number.isFinite(total) && total === 0) return "暂无资料";
  return report ? "已生成" : "暂无报告";
}

export function evaluationStatusLabel(status?: string): string {
  return ({ completed: "已完成", complete: "已完成", running: "进行中", pending: "等待中", failed: "失败", error: "失败" } as Record<string, string>)[status || ""] || status || "已保存";
}

