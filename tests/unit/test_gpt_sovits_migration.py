from types import SimpleNamespace

from voice.gpt_sovits.migration import inspect_asset_dataset, migrate_voice_assets


def asset(dataset_dir):
    return SimpleNamespace(dataset_dir=str(dataset_dir))


def test_valid_japanese_dataset_infers_reference_language(tmp_path):
    dataset = tmp_path / "dataset"
    dataset.mkdir()
    (dataset / "voice.list").write_text(
        "001.wav|voice|JA|何の用かしら\n",
        encoding="utf-8",
    )

    result = inspect_asset_dataset(asset(dataset))

    assert result.reference_language == "ja"
    assert result.needs_retraining is False
    assert result.error_message == ""


def test_wrong_chinese_tag_on_japanese_dataset_requires_retraining(tmp_path):
    dataset = tmp_path / "dataset"
    dataset.mkdir()
    (dataset / "voice.list").write_text(
        "001.wav|voice|ZH|何の用かしら\n",
        encoding="utf-8",
    )

    result = inspect_asset_dataset(asset(dataset))

    assert result.reference_language == "ja"
    assert result.needs_retraining is True
    assert "语言标签" in result.error_message


def test_missing_dataset_requires_retraining_instead_of_guessing(tmp_path):
    result = inspect_asset_dataset(asset(tmp_path / "missing"))

    assert result.reference_language is None
    assert result.needs_retraining is True


def test_migration_updates_ready_assets_without_deleting_files(tmp_path, db_session):
    from app.models import VoiceAsset

    good_dataset = tmp_path / "good"
    good_dataset.mkdir()
    good_list = good_dataset / "good.list"
    good_list.write_text("001.wav|voice|JA|何の用かしら\n", encoding="utf-8")
    bad_dataset = tmp_path / "bad"
    bad_dataset.mkdir()
    bad_list = bad_dataset / "bad.list"
    bad_list.write_text("001.wav|voice|ZH|何の用かしら\n", encoding="utf-8")
    good = VoiceAsset(
        name="good",
        workspace_id="local",
        status="ready",
        dataset_dir=str(good_dataset),
        gpt_weights_path="good.ckpt",
        sovits_weights_path="good.pth",
    )
    bad = VoiceAsset(
        name="bad",
        workspace_id="local",
        status="ready",
        dataset_dir=str(bad_dataset),
        gpt_weights_path="bad.ckpt",
        sovits_weights_path="bad.pth",
    )
    db_session.add_all([good, bad])
    db_session.commit()

    assert migrate_voice_assets(db_session) == 2

    assert good.reference_language == "ja"
    assert good.status == "ready"
    assert bad.reference_language == "ja"
    assert bad.status == "needs_retraining"
    assert good_list.is_file()
    assert bad_list.is_file()
