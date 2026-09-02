"""Shared LangGraph state for the persona workflow."""

from typing import Any, Literal, NotRequired, TypedDict

from langgraph.graph import MessagesState


Worker = Literal["knowledge", "memory", "document", "profile", "voice", "rvc_worker", "live2d", "config_worker"]
WORKERS: tuple[Worker, ...] = ("knowledge", "memory", "document", "profile", "voice", "rvc_worker", "live2d", "config_worker")

# 只用于读取旧 checkpoint / 旧客户端状态；新图和新合同永远使用 canonical 名称。
LEGACY_WORKER_ALIASES = {"voice_clone": "voice", "rvc": "rvc_worker", "config": "config_worker"}


class DispatchRequest(TypedDict, total=False):
    """Supervisor 发给 Worker 的数据引用型调度请求。"""

    worker: str
    request: str
    task_type: str
    conversation_context: dict[str, Any]
    input_refs: dict[str, Any] | list[str]
    options: dict[str, Any]
    selected_options: dict[str, Any]


class WorkflowContract(TypedDict, total=False):
    """可恢复的工作流摘要；不承载执行命令或本地路径。"""

    phase: str
    step: str
    status: str
    attempt: int


def canonicalize_worker_name(value: str | None) -> str | None:
    """将历史 Worker 名称转换为当前 canonical 名称。"""
    if value is None:
        return None
    name = str(value)
    return LEGACY_WORKER_ALIASES.get(name, name)


def worker_node_name(worker: str) -> str:
    """Return the graph node name for a canonical worker.

    Most historical workers are stored without the ``_worker`` suffix; RVC uses
    the explicit public name ``rvc_worker``.
    """
    canonical = canonicalize_worker_name(worker) or worker
    return canonical if canonical.endswith("_worker") else f"{canonical}_worker"


class PersonaWorkflowState(MessagesState):
    """跨节点共享状态；messages 由 LangGraph 管理，Worker 结果采用追加合并。"""

    active_worker: Worker | None
    worker_results: list[dict]
    loaded_skills: list[str]
    handoff_count: int
    worker_request: str
    worker_call_id: str
    intent_decision: dict
    route_node: str

    # Structured Core → Supervisor → Worker contract fields. They are optional
    # so old checkpoints and existing graph updates remain valid.
    conversation_id: NotRequired[str | None]
    pending_task: NotRequired[dict[str, Any] | str | None]
    task_id: NotRequired[str | None]
    task_type: NotRequired[str | None]
    dispatch_request: NotRequired[DispatchRequest | dict[str, Any] | None]
    input_refs: NotRequired[dict[str, Any] | list[str]]
    selected_options: NotRequired[dict[str, Any]]
    waiting_inputs: NotRequired[list[dict[str, Any] | str]]
    workflow: NotRequired[WorkflowContract | dict[str, Any] | None]
    result_refs: NotRequired[list[str]]
    dispatch_status: NotRequired[Literal["pending", "accepted", "waiting_input", "completed", "failed"]]


class SupervisorAgentState(MessagesState):
    """Supervisor 子图状态：只声明 messages 与 loaded_skills。

    刻意不继承 PersonaWorkflowState——子图若把未修改的 worker_results 等字段
    原样输出，父图 reducer 会把同一份值再次合并导致重复；子图只需回传
    loaded_skills（load_skill 工具写入）即可。
    """

    loaded_skills: list[str]
    intent_decision: dict
    # Parent Supervisor passes the validated dispatch contract into the restricted
    # Worker subgraph so the Worker never has to reconstruct refs from free text.
    dispatch_request: NotRequired[dict[str, Any] | None]
    pending_task: NotRequired[dict[str, Any] | None]
    task_type: NotRequired[str | None]
    input_refs: NotRequired[dict[str, Any]]
    selected_options: NotRequired[dict[str, Any]]
