from langchain.tools import ToolRuntime, tool

from agents.context import PersonaAgentContext
from rag.adaptive_graph import serialize_document
from rag.web_search import web_search_documents
from settings import Settings


@tool("web_search")
def web_search(query: str, runtime: ToolRuntime[PersonaAgentContext]) -> list[dict]:
    """Search public web information via the configured API-key provider (Tavily/Bocha).

    Only works when an API-key search service is configured in Settings.
    """
    del runtime
    settings = Settings.load()
    if not settings.enable_web_fallback:
        return [
            {
                "title": "API key 搜索未配置",
                "url": "",
                "content": (
                    "当前未配置需要 API key 的搜索服务（博查/Tavily）。"
                    "请在设置页配置 API key 搜索服务，"
                    "或在设置页配置搜索服务后重试。"
                ),
            }
        ]
    return [serialize_document(document) for document in web_search_documents(query, recent=True)]
