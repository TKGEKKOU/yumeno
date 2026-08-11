export const PERCENT_METRICS = new Set([
  "recall_at_3_answerable", "precision_at_3_answerable", "mrr_at_3_answerable", "hit_at_3_answerable",
  "grounded_rate", "useful_rate", "refusal_rate", "answer_rate", "accepted_rate", "rewrite_rate",
  "correction_rate", "complex_rewrite_rate", "complex_correction_rate", "probe_refusal_rate", "mean_confidence",
]);

export function formatMetricValue(key: string, value: unknown) {
  if (key === "scope_isolation_ok") return value ? "通过" : "未通过";
  const number = Number(value);
  if (PERCENT_METRICS.has(key) && Number.isFinite(number)) return `${Math.round(number * 100)}%`;
  if (typeof value === "number" && Number.isFinite(number)) return Number.isInteger(number) ? String(number) : number.toFixed(3);
  return String(value ?? "—");
}

export function progressPercent(progress: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
}
