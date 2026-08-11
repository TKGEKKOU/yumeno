from dataclasses import dataclass
from pathlib import Path

from voice.gpt_sovits.language import (
    TrainingRow,
    detect_script_language,
    normalize_language,
    validate_training_rows,
)


LANGUAGE_ALIASES = {"cantonese": "yue"}


@dataclass(frozen=True)
class AssetDatasetInspection:
    reference_language: str | None
    needs_retraining: bool
    error_message: str = ""


def _read_rows(list_path: Path) -> tuple[list[TrainingRow], list[str]]:
    rows: list[TrainingRow] = []
    errors: list[str] = []
    for number, line in enumerate(
        list_path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1
    ):
        if not line.strip():
            continue
        parts = line.split("|", 3)
        if len(parts) != 4:
            errors.append(f"第 {number} 行格式错误")
            continue
        path, speaker, language, text = parts
        language = LANGUAGE_ALIASES.get(language.strip().lower(), language)
        rows.append(TrainingRow(path, speaker, language, text))
    return rows, errors


def inspect_asset_dataset(asset) -> AssetDatasetInspection:
    dataset_value = getattr(asset, "dataset_dir", None)
    dataset_dir = Path(dataset_value) if dataset_value else None
    if dataset_dir is None or not dataset_dir.is_dir():
        return AssetDatasetInspection(None, True, "缺少训练数据，无法确认参考语言")
    list_files = sorted(dataset_dir.glob("*.list"))
    if not list_files:
        return AssetDatasetInspection(None, True, "缺少训练清单，无法确认参考语言")
    try:
        rows, errors = _read_rows(list_files[0])
    except UnicodeError:
        return AssetDatasetInspection(None, True, "训练清单不是有效的 UTF-8 文本")
    if not rows:
        return AssetDatasetInspection(None, True, "训练清单没有有效标注")

    strong_languages = {
        language
        for row in rows
        if (language := detect_script_language(row.text)) is not None
    }
    tagged_languages: set[str] = set()
    for row in rows:
        try:
            tagged_languages.add(normalize_language(row.language))
        except ValueError:
            errors.append(f"{row.path}: 不支持的语言标签 {row.language}")

    inferred = next(iter(strong_languages)) if len(strong_languages) == 1 else None
    if inferred is None and len(tagged_languages) == 1:
        inferred = next(iter(tagged_languages))
    if inferred is None:
        errors.append("训练数据包含多个语种或无法确定参考语言")
        return AssetDatasetInspection(None, True, "；".join(errors))

    errors.extend(validate_training_rows(rows, inferred))
    return AssetDatasetInspection(inferred, bool(errors), "；".join(errors))


def migrate_voice_assets(session) -> int:
    from app.models import VoiceAsset

    assets = (
        session.query(VoiceAsset)
        .filter(
            VoiceAsset.status == "ready",
            VoiceAsset.reference_language.is_(None),
        )
        .all()
    )
    for asset in assets:
        inspection = inspect_asset_dataset(asset)
        asset.reference_language = inspection.reference_language
        if inspection.needs_retraining:
            asset.status = "needs_retraining"
            asset.error_message = inspection.error_message
    if assets:
        session.commit()
    return len(assets)
