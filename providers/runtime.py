"""Small runtime registry modeled after AstrBot's adapter registration.

The registry is intentionally dependency-free and can be extended by LLM,
Embedding and Reranker adapters without changing the configuration API.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Callable


class ProviderRuntimeError(RuntimeError):
    pass


@dataclass(frozen=True)
class ProviderRuntimeDefinition:
    provider_type: str
    provider_id: str
    factory: Callable[[Any], Any]
    capabilities: frozenset[str] = field(default_factory=frozenset)
    note: str = ""


class ProviderRuntimeRegistry:
    def __init__(self) -> None:
        self._definitions: dict[tuple[str, str], ProviderRuntimeDefinition] = {}

    def register(self, definition: ProviderRuntimeDefinition) -> None:
        key = (definition.provider_type, definition.provider_id)
        if key in self._definitions:
            raise ProviderRuntimeError(f"Provider runtime 已注册: {key[0]}/{key[1]}")
        self._definitions[key] = definition

    def get(self, provider_type: str, provider_id: str) -> ProviderRuntimeDefinition | None:
        return self._definitions.get((provider_type, provider_id))

    def supported(self, provider_type: str, provider_id: str) -> bool:
        return self.get(provider_type, provider_id) is not None

    def capabilities(self, provider_type: str, provider_id: str) -> frozenset[str]:
        definition = self.get(provider_type, provider_id)
        return definition.capabilities if definition else frozenset()

    def create(self, provider_type: str, provider_id: str, settings: Any) -> Any:
        definition = self.get(provider_type, provider_id)
        if definition is None:
            raise ProviderRuntimeError(f"Provider 没有正式运行适配器: {provider_type}/{provider_id}")
        return definition.factory(settings)

    def all(self) -> tuple[ProviderRuntimeDefinition, ...]:
        return tuple(self._definitions.values())



# 注册只依赖运行时工厂的 Provider；其他目录项仍可配置/测试，但不会伪装成已接入。
def _tts_factory(settings):
    from voice.tts.http_provider import build_tts_provider
    return build_tts_provider(settings)

runtime_registry = ProviderRuntimeRegistry()
for _provider_id in ("openai_tts", "mimo_tts"):
    runtime_registry.register(ProviderRuntimeDefinition(
        "tts", _provider_id, _tts_factory,
        frozenset({"synthesize", "wav_output"}),
        "API TTS 适配器，输出统一为 WAV bytes",
    ))

