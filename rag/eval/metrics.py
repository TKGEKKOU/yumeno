"""Pure RAG evaluation metrics with an explicit Top-3 contract."""

from __future__ import annotations

from math import ceil
from statistics import mean


EVAL_K = 3


def _unique_ranked(retrieved: list[str]) -> list[str]:
    return list(dict.fromkeys(doc_id for doc_id in retrieved if doc_id))


def recall_at_k(retrieved: list[str], expected: set[str], k: int | None = None) -> float:
    if not expected:
        return 0.0
    top = _unique_ranked(retrieved if k is None else retrieved[:k])
    return sum(doc_id in expected for doc_id in top) / len(expected)


def precision_at_k(
    retrieved: list[str], expected: set[str], k: int | None = None
) -> float:
    source = retrieved if k is None else retrieved[:k]
    top = _unique_ranked(source)
    if not top:
        return 0.0
    denominator = len(top) if k is None else k
    return sum(doc_id in expected for doc_id in top) / denominator


def mrr(retrieved: list[str], expected: set[str], k: int | None = None) -> float:
    top = retrieved if k is None else retrieved[:k]
    seen: set[str] = set()
    for rank, doc_id in enumerate(top, start=1):
        if doc_id in seen:
            continue
        seen.add(doc_id)
        if doc_id in expected:
            return 1.0 / rank
    return 0.0


def hit_at_k(retrieved: list[str], expected: set[str], k: int = 1) -> float:
    return 1.0 if any(doc_id in expected for doc_id in _unique_ranked(retrieved[:k])) else 0.0


def average(values: list[float]) -> float:
    return mean(values) if values else 0.0


def percentile(values: list[float], quantile: float) -> float:
    """Return the nearest-rank percentile used by the benchmark report."""

    if not values:
        return 0.0
    ordered = sorted(values)
    rank = max(1, ceil(len(ordered) * quantile))
    return ordered[min(len(ordered) - 1, rank - 1)]


def p50(values: list[float]) -> float:
    return percentile(values, 0.50)


def p95(values: list[float]) -> float:
    return percentile(values, 0.95)


def summarize_retrieval(cases: list[dict]) -> dict:
    recall_values: list[float] = []
    precision_values: list[float] = []
    mrr_values: list[float] = []
    hit3_values: list[float] = []
    answerable_recall: list[float] = []
    answerable_precision: list[float] = []
    answerable_mrr: list[float] = []
    answerable_hit3: list[float] = []

    for case in cases:
        if not case.get("expected_ids") and case.get("expected_source") != "auto":
            continue
        retrieved = list(case.get("retrieved_ids", []))
        expected = set(case.get("expected_ids", []))
        recall_value = recall_at_k(retrieved, expected, EVAL_K)
        precision_value = precision_at_k(retrieved, expected, EVAL_K)
        mrr_value = mrr(retrieved, expected, EVAL_K)
        hit3_value = hit_at_k(retrieved, expected, EVAL_K)
        recall_values.append(recall_value)
        precision_values.append(precision_value)
        mrr_values.append(mrr_value)
        hit3_values.append(hit3_value)
        if expected:
            answerable_recall.append(recall_value)
            answerable_precision.append(precision_value)
            answerable_mrr.append(mrr_value)
            answerable_hit3.append(hit3_value)

    latencies = [
        case["retrieval_latency_ms"]
        for case in cases
        if case.get("retrieval_latency_ms") is not None
    ]
    summary = {
        "metric_k": EVAL_K,
        "recall_at_3": average(recall_values),
        "precision_at_3": average(precision_values),
        "mrr_at_3": average(mrr_values),
        "hit_at_3": average(hit3_values),
        "mean_latency_ms": average(latencies),
        "p50_latency_ms": p50(latencies),
        "p95_latency_ms": p95(latencies),
        "cases_with_expected": len(recall_values),
        "cases_judged": len(recall_values),
        "cases_total": len(cases),
        "cases_answerable": len(answerable_recall),
        "recall_at_3_answerable": average(answerable_recall),
        "precision_at_3_answerable": average(answerable_precision),
        "mrr_at_3_answerable": average(answerable_mrr),
        "hit_at_3_answerable": average(answerable_hit3),
    }
    # One-release compatibility aliases for existing API consumers.
    summary.update(
        {
            "recall_at_k": summary["recall_at_3"],
            "precision_at_k": summary["precision_at_3"],
            "mrr": summary["mrr_at_3"],
            "hit_at_1": summary["hit_at_3"],
            "recall_at_k_answerable": summary["recall_at_3_answerable"],
            "precision_at_k_answerable": summary["precision_at_3_answerable"],
            "mrr_answerable": summary["mrr_at_3_answerable"],
            "hit_at_1_answerable": summary["hit_at_3_answerable"],
        }
    )
    return summary


def summarize_generation(cases: list[dict]) -> dict:
    graded = [case for case in cases if case.get("grounded") is not None]
    grounded = [case["grounded"] for case in graded]
    useful = [case["useful"] for case in graded]
    refused = [case for case in cases if case.get("refused")]
    accepted = [case for case in cases if case.get("accepted")]
    rewrote = [case for case in cases if case.get("rewrite_used")]
    corrected = [case for case in cases if case.get("corrected")]
    complex_cases = [case for case in cases if case.get("is_complex")]
    complex_rewrote = [case for case in complex_cases if case.get("rewrite_used")]
    complex_corrected = [case for case in complex_cases if case.get("corrected")]
    probes = [case for case in cases if case.get("is_probe")]
    probe_refused = [case for case in probes if case.get("refused")]
    confidences = [case["confidence"] for case in cases if case.get("confidence") is not None]
    latencies = [
        case["total_latency_ms"]
        for case in cases
        if case.get("total_latency_ms") is not None
    ]
    rewrite_counts = [case.get("rewrite_count", 0) for case in cases]
    correction_counts = [case.get("correction_count", 0) for case in cases]
    total = len(cases)
    return {
        "grounded_rate": average([1.0 if value else 0.0 for value in grounded]) if grounded else None,
        "useful_rate": average([1.0 if value else 0.0 for value in useful]) if useful else None,
        "cases_checked": len(graded),
        "cases_total": total,
        "cases_refused": len(refused),
        "cases_accepted": len(accepted),
        "refusal_rate": len(refused) / total if total else 0.0,
        "answer_rate": (total - len(refused)) / total if total else 0.0,
        "accepted_rate": len(accepted) / total if total else 0.0,
        "mean_confidence": average(confidences) if confidences else None,
        "rewrite_rate": len(rewrote) / total if total else 0.0,
        "correction_rate": len(corrected) / total if total else 0.0,
        "mean_rewrite_count": average(rewrite_counts),
        "mean_correction_count": average(correction_counts),
        "cases_complex": len(complex_cases),
        "complex_rewrite_rate": len(complex_rewrote) / len(complex_cases) if complex_cases else None,
        "complex_correction_rate": len(complex_corrected) / len(complex_cases) if complex_cases else None,
        "probe_refusal_rate": len(probe_refused) / len(probes) if probes else None,
        "mean_total_latency_ms": average(latencies),
        "p50_total_latency_ms": p50(latencies),
        "p95_total_latency_ms": p95(latencies),
    }
