from pathlib import Path

import pytest

from voice.gpt_sovits.config import GPTSoVITSConfig
from voice.gpt_sovits.training import TrainingDataInvalid, TrainingService


def test_label_with_asr_sends_japanese_hint(tmp_path: Path, monkeypatch):
    service = TrainingService(tmp_path, GPTSoVITSConfig(tmp_path))
    dataset = service.dataset_dir("asset-ja")
    dataset.mkdir(parents=True)
    wav = dataset / "001.wav"
    wav.write_bytes(b"wav")
    list_path = dataset / "asset-ja.list"
    list_path.write_text(f"{wav.as_posix()}|asset|JA|\n", encoding="utf-8")
    captured = []

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

        def read(self):
            return '{"language":"ja","text":"何の用かしら"}'.encode("utf-8")

    def fake_urlopen(request, timeout):
        captured.append(request.full_url)
        return Response()

    monkeypatch.setattr("voice.gpt_sovits.training.urlopen", fake_urlopen)

    service.label_with_asr("asset-ja", language="ja")

    assert "language=ja" in captured[0]
    assert "|JA|何の用かしら" in list_path.read_text(encoding="utf-8")


def test_start_training_rejects_mojibake_before_thread(tmp_path: Path):
    service = TrainingService(tmp_path, GPTSoVITSConfig(tmp_path))
    dataset = service.dataset_dir("asset-bad")
    dataset.mkdir(parents=True)
    (dataset / "asset-bad.list").write_text(
        "001.wav|asset|JA|銇傘倢銇屻仺\n",
        encoding="utf-8",
    )

    with pytest.raises(TrainingDataInvalid, match="疑似乱码"):
        service.start_training("asset-bad", expected_language="ja")

    assert service._active_asset_id is None
