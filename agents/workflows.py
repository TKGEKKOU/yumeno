"""用户可见的 Agent 工作流公开视图。

这里是运行时与前端之间的稳定边界：只包含用户能理解的流程节点，
不把 LangGraph 节点名、工具消息、文件路径或内部运行状态带出。
"""
from __future__ import annotations

from copy import deepcopy
from typing import Any

RVC_EDGES = [
    {"from": source, "to": target}
    for source, target in (
        ("prepare_source", "separate_vocals"),
        ("separate_vocals", "select_vocals"),
        ("select_vocals", "select_model"),
        ("select_model", "prepare_index"),
        ("prepare_index", "load_model"),
        ("load_model", "gpu_inference"),
        ("gpu_inference", "write_result"),
        ("write_result", "mix_instrumental"),
        ("mix_instrumental", "register_result"),
    )
]

RVC_NODES = [
    ("prepare_source", "准备音频", "将会话附件转换为标准 WAV"),
    ("separate_vocals", "分离人声", "按任务选择生成 Vocals 和 Instrumental"),
    ("select_vocals", "准备人声输入", "确认用于变声的音频输入"),
    ("select_model", "选择音色模型", "检查 RVC 音色模型及其元数据"),
    ("prepare_index", "准备 Index", "检查可选 Index 与比例配置"),
    ("load_model", "加载模型", "准备 GPU 推理模型"),
    ("gpu_inference", "GPU 音色转换", "提取特征并完成音频到音频推理"),
    ("write_result", "保存变声结果", "写入纯 RVC 人声文件"),
    ("mix_instrumental", "合并背景音", "按用户选择合并 Instrumental"),
    ("register_result", "登记结果", "将生成音频登记到当前会话附件"),
]

_PHASE_NODE = {
    "preparing": "prepare_source",
    "extracting": "prepare_source",
    "preparing_source": "prepare_source",
    "separating": "separate_vocals",
    "separate_vocals": "separate_vocals",
    "selecting_input": "select_vocals",
    "select_vocals": "select_vocals",
    "selecting_model": "select_model",
    "select_model": "select_model",
    "preparing_index": "prepare_index",
    "prepare_index": "prepare_index",
    "loading_model": "load_model",
    "extracting_features": "gpu_inference",
    "converting": "gpu_inference",
    "inference": "gpu_inference",
    "gpu_inference": "gpu_inference",
    "encoding_output": "write_result",
    "writing_output": "write_result",
    "writing_result": "write_result",
    "mixing": "mix_instrumental",
    "encoding_mix": "mix_instrumental",
    "registering": "register_result",
    "register_result": "register_result",
    "done": "register_result",
}

_TERMINAL = {"completed", "failed", "cancelled", "skipped"}


def _number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _public_status(status: Any) -> str:
    value = str(status or "running").lower()
    aliases = {
        "accepted": "running",
        "queued": "running",
        "preparing": "running",
        "processing": "running",
        "succeeded": "completed",
        "done": "completed",
        "error": "failed",
        "rejected": "failed",
        "not_cancelled": "running",
    }
    value = aliases.get(value, value)
    return value if value in {"idle", "running", "waiting_input", "completed", "failed", "cancelled"} else "running"


def _node_status(node: str, current: str | None, status: str, order: list[str]) -> str:
    if not current:
        return "completed" if status == "completed" and node == "register_result" else "pending"
    if node == current:
        if status in {"failed", "cancelled", "waiting_input"}:
            return status
        return "completed" if status == "completed" else "running"
    try:
        node_index = order.index(node)
        current_index = order.index(current)
    except ValueError:
        return "pending"
    if node_index < current_index or (status == "completed" and node_index <= current_index):
        return "completed"
    return "pending"


def _apply_branches(nodes: list[dict[str, Any]], payload: dict[str, Any]) -> None:
    """根据后端已返回的分支事实标记 skipped，不由前端猜测。"""

    separate = payload.get("separate_vocals")
    if separate is False or payload.get("skip_separation") is True:
        for node in nodes:
            if node["id"] in {"separate_vocals", "select_vocals"}:
                node["status"] = "skipped"

    mix = payload.get("mix_instrumental")
    if mix is False or payload.get("skip_mix") is True:
        for node in nodes:
            if node["id"] == "mix_instrumental":
                node["status"] = "skipped"

    has_index = payload.get("index_id") or payload.get("has_index")
    index_rate = payload.get("index_rate")
    if has_index is False or (has_index is None and _number(index_rate, 0.0) <= 0):
        for node in nodes:
            if node["id"] == "prepare_index":
                node["status"] = "skipped"


def default_workflow(
    worker: str | None = None,
    *,
    status: str = "idle",
    phase: str | None = None,
    progress: float = 0,
    waiting_inputs: list[dict[str, Any]] | None = None,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """返回稳定的公开 workflow；非 RVC Worker 明确返回 None。"""

    if str(worker or "") not in {"rvc_worker", "rvc"}:
        return None
    payload = payload or {}
    public_status = _public_status(status)
    phase_value = str(phase or "").strip().lower()
    if not phase_value and payload.get("task_id") and public_status == "running":
        phase_value = "preparing"
    if not phase_value and public_status == "completed":
        phase_value = "done"
    current = _PHASE_NODE.get(phase_value)
    order = [item[0] for item in RVC_NODES]
    nodes: list[dict[str, Any]] = []
    for node_id, label, description in RVC_NODES:
        node_status = _node_status(node_id, current, public_status, order)
        node_progress = _number(progress, 0) if node_id == current else (100 if node_status == "completed" else 0)
        nodes.append({
            "id": node_id,
            "label": label,
            "description": description,
            "status": node_status,
            "progress": max(0.0, min(100.0, node_progress)),
        })
    _apply_branches(nodes, payload)
    result = {
        "flow_id": "rvc.audio_conversion",
        # worker is part of the public handoff contract; the UI must not infer RVC
        # from user text, titles, or legacy task fields.
        "worker": "rvc_worker",
        "title": "RVC 音频转换",
        "kind": "workflow",
        "status": public_status,
        "current_node": current,
        "progress": max(0.0, min(100.0, _number(progress, 0))),
        "nodes": nodes,
        "edges": deepcopy(RVC_EDGES),
        "waiting_inputs": [item for item in (waiting_inputs or []) if isinstance(item, dict)],
    }
    # Preserve only managed identifiers that are safe to expose to the frontend.
    for key in ("rvc_session_id", "source_file_id", "session_id", "task_id"):
        if payload.get(key):
            result[key] = str(payload[key])
    if isinstance(payload.get("attachment_ids"), list):
        result["attachment_ids"] = [str(item) for item in payload["attachment_ids"] if item]
    input_refs = payload.get("input_refs")
    if isinstance(input_refs, dict):
        result["input_refs"] = {
            key: value
            for key, value in input_refs.items()
            if key in {"attachment_ids", "audio_file_id", "source_file_id"}
        }
    return result


def workflow_from_task(
    worker: str | None,
    payload: dict[str, Any] | None = None,
    *,
    status: str = "running",
    phase: str | None = None,
    progress: float = 0,
) -> dict[str, Any] | None:
    payload = payload or {}
    return default_workflow(
        worker,
        status=status,
        phase=phase or payload.get("phase"),
        progress=progress if progress is not None else payload.get("progress", 0),
        waiting_inputs=payload.get("waiting_inputs") or payload.get("pending_inputs") or [],
        payload=payload,
    )


def workflow_update_for_stage(worker: str | None, stage: str) -> dict[str, Any] | None:
    """旧流式 stage 事件的兼容适配；仍返回同一份公开 workflow 合同。"""

    if str(worker or "") not in {"rvc_worker", "rvc"}:
        return None
    text = str(stage or "").lower()
    phase = "preparing"
    for key, node in (
        ("分离", "separating"),
        ("人声", "selecting_input"),
        ("模型", "loading_model"),
        ("index", "preparing_index"),
        ("特征", "extracting_features"),
        ("转换", "converting"),
        ("推理", "converting"),
        ("结果", "encoding_output"),
        ("背景", "mixing"),
        ("合并", "mixing"),
    ):
        if key in text:
            phase = node
            break
    return default_workflow(worker, status="running", phase=phase)
