from typing import Literal

from langchain_core.prompts import ChatPromptTemplate

from rag.llm import invoke_llm
from agents.intent_funnel import analyze_intents


InteractionMode = Literal["conversation", "capability", "knowledge", "web"]

ROUTER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "把用户消息分类为 conversation 或 knowledge。"
            "角色闲聊、情绪、偏好、创作和一般交流属于 conversation；"
            "需要从角色资料中查事实、设定、经历或专业内容属于 knowledge。"
            "只输出一个分类词。",
        ),
        ("human", "{question}"),
    ]
)


def classify_ambiguous(question: str) -> Literal["conversation", "knowledge"]:
    # LLM 兜底：规则无法判定的模糊请求交给模型二分类；失败时保守归为 knowledge，
    # 保证资料类问题不会被错误分流到闲聊。
    try:
        value = invoke_llm(ROUTER_PROMPT, {"question": question}).strip().lower()
        return "conversation" if value == "conversation" else "knowledge"
    except Exception:
        return "knowledge"


def route_interaction(question: str, enable_web_search: bool) -> InteractionMode:
    # 与 Agent 入口共用同一个确定性漏斗：先处理否定与多意图，再按 RAG
    # 可执行模式选路；复杂歧义仍交给现有 LLM 二分类兜底。
    analysis = analyze_intents(question)
    if analysis.primary == "web" and enable_web_search:
        return "web"
    if analysis.primary in {"management", "memory_worker", "knowledge_worker"}:
        return "knowledge"
    if analysis.primary == "capability":
        return "capability"
    if analysis.primary == "conversation":
        return "conversation"
    return classify_ambiguous(question)


def route_interaction_for_tests(question: str, enable_web_search: bool) -> InteractionMode:
    """测试入口：不访问真实 LLM，模糊问题按知识路由。"""
    analysis = analyze_intents(question)
    if analysis.primary == "web" and enable_web_search:
        return "web"
    if analysis.primary in {"management", "memory_worker", "knowledge_worker"}:
        return "knowledge"
    if analysis.primary == "capability":
        return "capability"
    if analysis.primary == "conversation":
        return "conversation"
    return "knowledge"
