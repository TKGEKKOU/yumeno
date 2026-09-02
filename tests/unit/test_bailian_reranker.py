import json

import httpx

from rag.reranker_runtime import BailianReranker, build_reranker
from settings import Settings


def test_bailian_compatible_reranker_posts_qwen_payload_and_parses_scores(monkeypatch):
    requests = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            json={"id": "r1", "results": [{"index": 1, "relevance_score": 0.91}, {"index": 0, "relevance_score": 0.12}]},
        )

    reranker = BailianReranker(
        api_key="bailian-key",
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        model="qwen3-rerank",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    try:
        assert reranker.score_pairs("query", ["doc-a", "doc-b"]) == [0.12, 0.91]
        assert requests[0].url.path.endswith("/compatible-mode/v1/reranks")
        assert json.loads(requests[0].content) == {
            "model": "qwen3-rerank",
            "query": "query",
            "documents": ["doc-a", "doc-b"],
        }
        assert requests[0].headers["authorization"] == "Bearer bailian-key"
    finally:
        reranker.close()


def test_bailian_native_reranker_posts_native_payload_and_parses_output():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"code": "200", "output": {"results": [{"index": 0, "relevance_score": 0.8}]}, "usage": {"total_tokens": 3}},
        )

    reranker = BailianReranker(
        api_key="key",
        base_url="https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank",
        model="gte-rerank",
        return_documents=True,
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    try:
        assert reranker.score_pairs("q", ["d"]) == [0.8]
    finally:
        reranker.close()


def test_build_reranker_selects_bailian_from_runtime_settings(tmp_path):
    settings = Settings.load(tmp_path)
    settings = settings.__class__(
        **{**settings.__dict__, "reranker_provider": "bailian_rerank", "reranker_api_key": "key", "reranker_base_url": "https://example.test/v1", "reranker_model": "qwen3-rerank"}
    )
    reranker = build_reranker(settings, client=httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200, json={"results": []}))))
    try:
        assert isinstance(reranker, BailianReranker)
    finally:
        reranker.close()
