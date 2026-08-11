import re
from dataclasses import dataclass


SUPPORTED_LANGUAGES = {"zh", "ja", "en", "ko", "yue"}
MOJIBAKE_MARKERS = ("銇", "銈", "銉", "仭", "伄")
_KANA_RE = re.compile(r"[\u3040-\u30ff]")
_HANGUL_RE = re.compile(r"[\uac00-\ud7af]")
_LATIN_RE = re.compile(r"[A-Za-z]")
_HAN_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
_SENTENCE_RE = re.compile(r"[^。！？!?\n]+[。！？!?]?|\n+")


class LanguageUncertain(ValueError):
    pass


@dataclass(frozen=True)
class TrainingRow:
    path: str
    speaker: str
    language: str
    text: str


@dataclass(frozen=True)
class TextSegment:
    text: str
    language: str


def normalize_language(value: str) -> str:
    language = value.strip().lower()
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"不支持的语言：{value}")
    return language


def detect_script_language(text: str) -> str | None:
    if _KANA_RE.search(text):
        return "ja"
    if _HANGUL_RE.search(text):
        return "ko"
    if _LATIN_RE.search(text) and not _HAN_RE.search(text):
        return "en"
    return None


def _nearest_language(languages: list[str | None], index: int) -> str | None:
    for distance in range(1, len(languages)):
        left = index - distance
        right = index + distance
        if left >= 0 and languages[left] is not None:
            return languages[left]
        if right < len(languages) and languages[right] is not None:
            return languages[right]
    return None


def split_text_by_language(text: str, default_language: str | None) -> list[TextSegment]:
    value = text.strip()
    if not value:
        raise ValueError("文本不能为空")
    parts = []
    for match in _SENTENCE_RE.finditer(value):
        part = match.group(0).strip()
        if part:
            parts.append(part)
    languages = [detect_script_language(part) for part in parts]
    fallback = None
    if default_language not in {None, "auto"}:
        fallback = normalize_language(default_language)
    for index, language in enumerate(languages):
        if language is None:
            languages[index] = fallback or _nearest_language(languages, index)
        if languages[index] is None:
            if _HAN_RE.search(parts[index]):
                raise LanguageUncertain("纯汉字文本无法自动区分中文与日语")
            raise LanguageUncertain("无法确定文本语言")

    segments: list[TextSegment] = []
    for part, language in zip(parts, languages):
        if segments and segments[-1].language == language:
            previous = segments[-1]
            segments[-1] = TextSegment(previous.text + part, previous.language)
        else:
            segments.append(TextSegment(part, str(language)))
    return segments


def validate_training_rows(rows: list[TrainingRow], expected_language: str) -> list[str]:
    expected = normalize_language(expected_language)
    errors: list[str] = []
    for row in rows:
        text = row.text.strip()
        try:
            actual = normalize_language(row.language)
        except ValueError:
            actual = ""
        if not text:
            errors.append(f"{row.path}: 转写为空")
        if actual != expected:
            errors.append(f"{row.path}: 语言标签与任务语言不一致")
        if any(marker in text for marker in MOJIBAKE_MARKERS):
            errors.append(f"{row.path}: 疑似乱码")
        if expected == "ja" and text and not _KANA_RE.search(text) and _HAN_RE.search(text):
            errors.append(f"{row.path}: 日语转写缺少假名，请确认标注")
        if expected in {"zh", "yue"} and _KANA_RE.search(text):
            errors.append(f"{row.path}: 中文素材包含日文假名")
    return errors
