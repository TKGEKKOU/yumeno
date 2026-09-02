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
                    "Authorization": (f"Bearer {api_key}" if api_key else ""),
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
            elif response.status_code == 429:
                return {"success": True, "message": "连接正常（速率限制）"}
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
                    "Authorization": (f"Bearer {api_key}" if api_key else ""),
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
    """执行真实的最小 TTS 请求；成功仅表示响应可解析，不把保存配置当成功。"""
    if provider_id == "edge_tts":
        return {"success": True, "message": "Edge TTS 无需 API 鉴权，运行时将在首次合成时验证"}
    if provider_id == "gsv_tts_local":
        return {"success": False, "message": "本地 GPT-SoVITS 请使用资源状态检查"}
    if provider_id == "openai_tts":
        endpoint = f"{base_url.rstrip('/')}/audio/speech"
        payload = {"model": model, "voice": "alloy", "input": "YUMENO 测试", "response_format": "wav"}
    elif provider_id == "mimo_tts":
        endpoint = f"{base_url.rstrip('/')}/chat/completions"
        payload = {"model": model, "messages": [{"role": "assistant", "content": "YUMENO 测试"}], "audio": {"format": "wav", "voice": "mimo_default"}}
    else:
        return {"success": False, "message": "该 TTS Provider 尚未接入正式运行适配器"}
    if not api_key or not base_url or not model:
        return {"success": False, "message": "TTS API 配置不完整"}
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.post(endpoint, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json=payload)
        if response.status_code >= 400:
            return {"success": False, "message": f"HTTP {response.status_code}: {response.text[:300]}"}
        if provider_id == "mimo_tts":
            data = response.json()
            encoded = data.get("choices", [{}])[0].get("message", {}).get("audio", {}).get("data")
            if not encoded:
                return {"success": False, "message": "MiMo 响应缺少 audio.data"}
        elif not response.content:
            return {"success": False, "message": "TTS 返回空音频"}
        return {"success": True, "message": "TTS API 鉴权和最小合成请求成功"}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def test_stt_provider(provider_id: str, api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 STT 提供商连接。"""
    if provider_id == "sensevoice":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{base_url.rstrip('/')}")
                if response.status_code == 200:
                    return {"success": True, "message": "SenseVoice 服务可达"}
                return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    elif provider_id in {"whisper_api", "xinference_stt"}:
        if not api_key or not base_url or not model:
            return {"success": False, "message": "STT API 配置不完整"}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{base_url.rstrip('/')}/audio/transcriptions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    data={"model": model, "response_format": "json"},
                    files={"file": ("probe.wav", b"RIFF\x00\x00\x00\x00WAVE", "audio/wav")},
                )
            if response.status_code in {200, 400, 422}:
                return {"success": True, "message": "STT 音频接口可达"}
            return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    elif provider_id == "mimo_stt":
        if not api_key or not base_url or not model:
            return {"success": False, "message": "MiMo STT API 配置不完整"}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{base_url.rstrip('/')}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": [{"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64,UklGRg=="}}]}],
                        "max_completion_tokens": 8,
                    },
                )
            if response.status_code in {200, 400, 422}:
                return {"success": True, "message": "MiMo STT 接口可达（请用真实音频完成识别验证）"}
            return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    return {"success": False, "message": "未注册的 STT Provider"}


# 旧函数名兼容第三方扩展。
test_asr_provider = test_stt_provider


async def test_reranker_provider(provider_id: str, api_key: str, base_url: str, model: str) -> Dict[str, Any]:
    """测试 Reranker Provider；百炼使用其标准 reranks 接口。"""
    try:
        endpoint = base_url.rstrip("/")
        payload = {"model": model, "query": "测试查询", "documents": ["文档1", "文档2"]}
        if provider_id == "bailian_rerank":
            if endpoint.endswith(("/compatible-mode/v1", "/compatible-api/v1", "/v1")):
                endpoint += "/reranks"
        else:
            endpoint += "/rerank"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                endpoint,
                headers={
                    "Authorization": (f"Bearer {api_key}" if api_key else ""),
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if response.status_code == 200:
                data = response.json()
                results = data.get("results") if provider_id == "bailian_rerank" else data.get("results")
                if isinstance(results, list):
                    return {"success": True, "message": "重排序成功"}
                return {"success": False, "message": "响应格式错误"}
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
        elif provider_id in {"bocha", "custom_search"}:
            endpoint = base_url.rstrip("/")
            if not endpoint:
                return {"success": False, "message": "缺少搜索接口地址"}
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "query": "test",
                        "freshness": "noLimit",
                        "summary": True,
                        "count": 1,
                    },
                )
                if response.status_code != 200:
                    return {"success": False, "message": f"HTTP {response.status_code}"}
                data = response.json()
                if provider_id == "custom_search":
                    pages = data.get("data", {}).get("webPages", {}).get("value", [])
                    if not isinstance(pages, list):
                        return {"success": False, "message": "搜索响应格式错误"}
                return {"success": True, "message": "搜索接口可用"}
        else:
            return {"success": False, "message": "未注册的联网搜索 Provider"}
    except Exception as e:
        return {"success": False, "message": str(e)}
