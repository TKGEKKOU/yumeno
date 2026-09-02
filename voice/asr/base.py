from abc import ABC, abstractmethod


class STTError(RuntimeError):
    """语音转文字运行时错误。"""


class STTUpstreamError(STTError):
    pass


class STTConfigurationError(STTError):
    pass


class STTEmptyResultError(STTError):
    pass


class STTProvider(ABC):
    @abstractmethod
    async def transcribe(self, filename: str, content_type: str, audio: bytes) -> str:
        raise NotImplementedError


# 兼容旧扩展和旧配置导入；新代码统一使用 STT 命名。
ASRError = STTError
ASRUpstreamError = STTUpstreamError
ASRConfigurationError = STTConfigurationError
ASREmptyResultError = STTEmptyResultError
ASRProvider = STTProvider
