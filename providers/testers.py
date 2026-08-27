"""
Provider testers - 各类提供商连接测试
"""
import httpx
from typing import Dict, Any


async def test_llm_provider(api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 LLM 提供商连接"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "PONG"}],
                    "max_tokens": 5,
                },
            )
            if response.status_code == 200:
                return {"success": True, "message": "连接成功"}
            else:
                return {"success": False, "message": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def test_embedding_provider(api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 Embedding 提供商连接"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url.rstrip('/')}/embeddings",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "input": "测试文本",
                },
            )
            if response.status_code == 200:
                data = response.json()
                if "data" in data and len(data["data"]) > 0:
                    return {"success": True, "message": "向量生成成功"}
                return {"success": False, "message": "响应格式错误"}
            else:
                return {"success": False, "message": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def test_tts_provider(provider_id: str, api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 TTS 提供商连接"""
    if provider_id == "gpt_sovits":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{base_url.rstrip('/')}")
                if response.status_code == 200:
                    return {"success": True, "message": "GPT-SoVITS 服务可达"}
                return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    elif provider_id == "edge_tts":
        return {"success": True, "message": "Edge TTS 无需测试"}
    else:
        # 通用 TTS API 测试
        return {"success": True, "message": "TTS 配置已保存，实际合成时验证"}


async def test_asr_provider(provider_id: str, api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 ASR 提供商连接"""
    if provider_id == "sensevoice":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{base_url.rstrip('/')}")
                if response.status_code == 200:
                    return {"success": True, "message": "SenseVoice 服务可达"}
                return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    else:
        # 通用 ASR API 测试（需要音频文件，暂时跳过）
        return {"success": True, "message": "ASR 配置已保存，实际识别时验证"}


async def test_reranker_provider(api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 Reranker 提供商连接"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url.rstrip('/')}/rerank",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "query": "测试查询",
                    "documents": ["文档1", "文档2"],
                },
            )
            if response.status_code == 200:
                return {"success": True, "message": "重排序成功"}
            else:
                return {"success": False, "message": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def test_web_search_provider(provider_id: str, api_key: str, base_url: str) -> Dict[str, Any]:
    """测试 Web Search 提供商连接"""
    try:
        if provider_id == "tavily":
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{base_url.rstrip('/')}/search",
                    headers={"Content-Type": "application/json"},
                    json={
                        "api_key": api_key,
                        "query": "test",
                        "max_results": 1,
                    },
                )
                if response.status_code == 200:
                    return {"success": True, "message": "搜索成功"}
                return {"success": False, "message": f"HTTP {response.status_code}"}
        elif provider_id == "serper":
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{base_url.rstrip('/')}/search",
                    headers={
                        "X-API-KEY": api_key,
                        "Content-Type": "application/json",
                    },
                    json={"q": "test"},
                )
                if response.status_code == 200:
                    return {"success": True, "message": "搜索成功"}
                return {"success": False, "message": f"HTTP {response.status_code}"}
        else:
            return {"success": True, "message": "自定义搜索配置已保存"}
    except Exception as e:
        return {"success": False, "message": str(e)}
