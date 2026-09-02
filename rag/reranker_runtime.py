"""Runtime adapters for configured Reranker providers.

The RAG graph consumes the small synchronous ``score_pairs`` contract.  Remote
providers are deliberately adapted here so the graph does not know any vendor
request/response format.
"""

from __future__ import annotations

from typing import Any
from urllib.parse import urlsplit

import httpx

from ingestion.local_reranker.client import ManagedLocalReranker, get_managed_reranker


class RerankerRuntimeError(RuntimeError):
    """Base error for runtime Reranker failures."""


class RerankerConfigurationError(RerankerRuntimeError):
    """The selected Reranker is missing required configuration."""


class RerankerAPIError(RerankerRuntimeError):
    """The Reranker returned an API-level error or invalid response."""


class BailianReranker:
    """阿里云百炼 Rerank 适配器。

    Supports both Bailian's compatible ``/reranks`` API and the native
    ``/api/v1/services/rerank/text-rerank/text-rerank`` API.  ``score_pairs``
    returns scores in the same order as the input documents, which is the
    contract expected by YUMENO's RAG pipeline.
    """

    COMPATIBLE_SUFFIXES = ("/compatible-api/v1/reranks", "/compatible-mode/v1/reranks")
    COMPATIBLE_BASE_SUFFIXES = ("/compatible-api/v1", "/compatible-mode/v1", "/v1")
    DEFAULT_NATIVE_URL = (
        "https://dashscope.aliyuncs.com/api/v1/services/rerank/"
        "text-rerank/text-rerank"
    )

    def __init__(
        self,
        api_key: str,
        base_url: str,
        model: str,
        *,
        timeout: float = 30.0,
        return_documents: bool = False,
        instruct: str = "",
        client: httpx.Client | None = None,
    ) -> None:
        if not api_key.strip():
            raise RerankerConfigurationError("Bailian Reranker API Key 不能为空")
        if not model.strip():
            raise RerankerConfigurationError("Bailian Reranker 模型不能为空")
        self.api_key = api_key.strip()
        self.model = model.strip()
        self.return_documents = return_documents
        self.instruct = instruct.strip()
        self.base_url = self._resolve_url(base_url)
        self._owns_client = client is None
        self.client = client or httpx.Client(
            timeout=httpx.Timeout(timeout),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        if client is not None:
            self.client.headers.update({
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            })

    @classmethod
    def _resolve_url(cls, base_url: str) -> str:
        value = (base_url or "").strip().rstrip("/")
        if not value:
            return cls.DEFAULT_NATIVE_URL
        path = urlsplit(value).path.rstrip("/")
        if path.endswith("/reranks") or path.endswith("/text-rerank/text-rerank"):
            return value
        if path.endswith(cls.COMPATIBLE_BASE_SUFFIXES):
            return f"{value}/reranks"
        return value

    @property
    def uses_compatible_api(self) -> bool:
        path = urlsplit(self.base_url).path.rstrip("/")
        return path.endswith("/reranks")

    def _payload(self, query: str, documents: list[str]) -> dict[str, Any]:
        if self.uses_compatible_api:
            payload: dict[str, Any] = {
                "model": self.model,
                "query": query,
                "documents": documents,
            }
            if self.instruct:
                payload["instruct"] = self.instruct
            return payload
        parameters: dict[str, Any] = {}
        if self.return_documents:
            parameters["return_documents"] = True
        if self.instruct:
            parameters["instruct"] = self.instruct
        payload = {"model": self.model, "input": {"query": query, "documents": documents}}
        if parameters:
            payload["parameters"] = parameters
        return payload

    @staticmethod
    def _results(data: dict[str, Any], compatible: bool) -> list[dict[str, Any]]:
        if compatible:
            if data.get("code"):
                raise RerankerAPIError(f"百炼 API 错误: {data.get('code')} – {data.get('message', '')}")
            result = data.get("results", [])
        else:
            code = str(data.get("code", "200"))
            if code != "200":
                raise RerankerAPIError(f"百炼 API 错误: {code} – {data.get('message', '')}")
            result = (data.get("output") or {}).get("results", [])
        if not isinstance(result, list):
            raise RerankerAPIError("百炼 Rerank 响应缺少 results 列表")
        return [item for item in result if isinstance(item, dict)]

    def score_pairs(self, query: str, documents: list[str]) -> list[float]:
        if not documents or not query.strip():
            return [] if not documents else [0.0 for _ in documents]
        original_count = len(documents)
        documents = documents[:500]
        try:
            response = self.client.post(self.base_url, json=self._payload(query, documents))
            response.raise_for_status()
            results = self._results(response.json(), self.uses_compatible_api)
        except httpx.HTTPError as exc:
            raise RerankerRuntimeError(f"百炼 Rerank 网络请求失败: {exc}") from exc
        except ValueError as exc:
            raise RerankerAPIError("百炼 Rerank 返回了无效 JSON") from exc

        scores = [0.0] * len(documents)
        for fallback_index, item in enumerate(results):
            index = item.get("index", fallback_index)
            try:
                index = int(index)
                if 0 <= index < len(scores):
                    scores[index] = float(item.get("relevance_score") or 0.0)
            except (TypeError, ValueError):
                continue
        return scores + [0.0] * max(0, original_count - len(scores))

    def close(self) -> None:
        if self.client is not None and self._owns_client:
            self.client.close()
        self.client = None


def build_reranker(settings, *, client: httpx.Client | None = None):
    provider = (getattr(settings, "reranker_provider", "local_rerank") or "local_rerank").strip()
    if provider == "bailian_rerank":
        return BailianReranker(
            getattr(settings, "reranker_api_key", ""),
            getattr(settings, "reranker_base_url", ""),
            getattr(settings, "reranker_model", "qwen3-rerank"),
            client=client,
        )
    if provider == "local_rerank":
        return get_managed_reranker(
            str(settings.project_root.resolve()), settings.reranker_model, settings.reranker_device
        )
    raise RerankerConfigurationError(f"Reranker Provider 尚未接入运行链路: {provider}")


__all__ = [
    "BailianReranker",
    "RerankerAPIError",
    "RerankerConfigurationError",
    "RerankerRuntimeError",
    "build_reranker",
]
