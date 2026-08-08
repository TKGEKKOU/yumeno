# GPT-SoVITS-Only TTS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Lunar/Qwen3-TTS completely and make every TTS workflow use GPT-SoVITS with correct, independent reference and output language handling.

**Architecture:** Add a focused GPT-SoVITS language module and synthesis service, persist reference language on each voice asset, validate training transcripts before launching expensive jobs, and route preview, HTTP stream, and WebSocket synthesis through the same service. Only after those paths pass regression tests, remove the exact Lunar directories and all explicit references.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, SQLite/MySQL schema upgrades, pytest, vanilla JavaScript, GPT-SoVITS v2Pro HTTP API.

## Global Constraints

- Preserve `voice/gpt_sovits/`, `runtime/gpt_sovits/`, `runtime/gpt_sovits_patches/`, and `data/gpt_sovits/`.
- Never delete with `*tts*`, `*sovits*`, or another fuzzy path pattern.
- Existing malformed voice assets are marked `needs_retraining`; their files are not deleted.
- `prompt_lang` always comes from the voice asset reference language; `text_lang` always comes from the current text segment.
- Use TDD for every behavioral change and explicit paths for every Git staging command.
- Do not alter Qwen3-ASR or Qwen3-Embedding merely because their names contain `Qwen3`.

---

## File Structure

- Create `voice/gpt_sovits/language.py`: language normalization, transcript validation, automatic text segmentation.
- Create `voice/gpt_sovits/synthesis.py`: one GPT-SoVITS synthesis facade and WAV merging.
- Modify `app/models.py`: persist voice asset reference language.
- Modify `app/database.py`: upgrade existing SQLite/MySQL `voice_assets` tables without deleting data.
- Modify `voice/gpt_sovits/training.py`: language-aware ASR labeling and pre-training validation.
- Modify `app/routers/voice_assets.py`: expose reference language, validate imports/training, preview with separate languages.
- Rewrite `app/routers/tts.py`: GPT-SoVITS-only status, preview, normal, HTTP stream, and WebSocket routes.
- Modify `app/main.py`: remove Lunar construction/warmup/shutdown and register the synthesis facade.
- Modify `app/routers/voice_studio.py`: remove Lunar preview dependency or delegate preview to a selected GPT-SoVITS asset.
- Modify `static/js/settings.js`, `static/views/settings.html`, `static/js/personas.js`, `static/js/chat.js`, and `static/views/voice.html`: remove Lunar controls and add language selection/asset validity states.
- Delete `voice/tts/`, `runtime/tts/`, `third_party/lunar_tts/` and only their dedicated tests.

### Task 1: Language Detection And Transcript Validation

**Files:**
- Create: `voice/gpt_sovits/language.py`
- Test: `tests/unit/test_gpt_sovits_language.py`

**Interfaces:**
- Produces: `normalize_language(value: str) -> str`
- Produces: `validate_training_rows(rows: list[TrainingRow], expected_language: str) -> list[str]`
- Produces: `split_text_by_language(text: str, default_language: str | None) -> list[TextSegment]`
- Produces dataclasses: `TrainingRow(path, speaker, language, text)` and `TextSegment(text, language)`

- [ ] **Step 1: Write failing language tests**

```python
def test_japanese_kana_forces_ja():
    assert split_text_by_language("何の用かしら", None) == [TextSegment("何の用かしら", "ja")]

def test_japanese_reference_can_emit_chinese_segment():
    assert split_text_by_language("你好，今天见。", "zh") == [TextSegment("你好，今天见。", "zh")]

def test_ambiguous_han_requires_default():
    with pytest.raises(LanguageUncertain):
        split_text_by_language("何用", None)

def test_rejects_mojibake_japanese_training_text():
    rows = [TrainingRow("001.wav", "asset", "JA", "銇傘倢銇屻仺")]
    assert "疑似乱码" in validate_training_rows(rows, "ja")[0]

def test_rejects_wrong_language_tag_for_japanese():
    rows = [TrainingRow("001.wav", "asset", "ZH", "何の用かしら")]
    assert "语言标签" in validate_training_rows(rows, "ja")[0]
```

- [ ] **Step 2: Run tests and confirm the module is missing**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_language.py -q`

Expected: collection fails because `voice.gpt_sovits.language` does not exist.

- [ ] **Step 3: Implement strict language helpers**

```python
SUPPORTED_LANGUAGES = {"zh", "ja", "en", "ko", "yue"}
MOJIBAKE_MARKERS = ("銇", "銈", "銉", "仭", "伄")

def normalize_language(value: str) -> str:
    language = value.strip().lower()
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"不支持的语言：{value}")
    return language

def split_text_by_language(text: str, default_language: str | None) -> list[TextSegment]:
    # Split on sentence punctuation, then classify kana, Hangul, Latin, or Han.
    # A Han-only segment uses the explicit default or raises LanguageUncertain.
    segments = classify_sentences(text, default_language)
    if not segments:
        raise ValueError("文本不能为空")
    return segments

def validate_training_rows(rows: list[TrainingRow], expected_language: str) -> list[str]:
    # Return deterministic validation messages for empty text, wrong tags,
    # mojibake markers, and script/language mismatch.
    errors = []
    for row in rows:
        if not row.text.strip():
            errors.append(f"{row.path}: 转写为空")
        if row.language.lower() != expected_language:
            errors.append(f"{row.path}: 语言标签与任务语言不一致")
        if any(marker in row.text for marker in MOJIBAKE_MARKERS):
            errors.append(f"{row.path}: 疑似乱码")
    return errors
```

- [ ] **Step 4: Run language tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_language.py -q`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add voice/gpt_sovits/language.py tests/unit/test_gpt_sovits_language.py
git commit -m "feat: add GPT-SoVITS language validation"
```

### Task 2: Voice Asset Language Schema And Safe Migration

**Files:**
- Modify: `app/models.py:137`
- Modify: `app/database.py:34`
- Modify: `app/main.py:15,244`
- Modify: `app/routers/voice_assets.py:35-115`
- Test: `tests/unit/test_voice_asset_schema.py`
- Test: `tests/api/test_voice_assets.py`

**Interfaces:**
- Produces column: `VoiceAsset.reference_language: str | None`
- Produces: `upgrade_voice_asset_schema(engine: Engine) -> None`
- `asset_response()` adds `reference_language`

- [ ] **Step 1: Write failing model and legacy SQLite migration tests**

```python
def test_voice_asset_exposes_reference_language(db_session):
    asset = VoiceAsset(name="JP", workspace_id="local", reference_language="ja")
    db_session.add(asset)
    db_session.commit()
    assert db_session.get(VoiceAsset, asset.id).reference_language == "ja"

def test_upgrade_adds_reference_language_to_legacy_sqlite(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE voice_assets (id VARCHAR(36) PRIMARY KEY)"))
    upgrade_voice_asset_schema(engine)
    assert "reference_language" in {c["name"] for c in inspect(engine).get_columns("voice_assets")}
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_voice_asset_schema.py tests/api/test_voice_assets.py -q`

Expected: failures for the absent column/function/response field.

- [ ] **Step 3: Add the nullable column and idempotent upgrade**

```python
reference_language: Mapped[str | None] = mapped_column(String(16), nullable=True)

def upgrade_voice_asset_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if "voice_assets" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("voice_assets")}
    if "reference_language" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE voice_assets ADD COLUMN reference_language VARCHAR(16) NULL"))
```

Call `upgrade_voice_asset_schema(engine)` immediately after `Base.metadata.create_all(engine)`. Extend create/update/import/train payloads and `asset_response()` with normalized `reference_language`.

- [ ] **Step 4: Run schema and API tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_voice_asset_schema.py tests/api/test_voice_assets.py -q`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add app/models.py app/database.py app/main.py app/routers/voice_assets.py tests/unit/test_voice_asset_schema.py tests/api/test_voice_assets.py
git commit -m "feat: persist GPT-SoVITS reference language"
```

### Task 3: Prevent Corrupt Japanese Training

**Files:**
- Modify: `voice/asr/worker_server.py:70-80`
- Modify: `voice/gpt_sovits/training.py:93-180,179-205`
- Modify: `app/routers/voice_assets.py:326-403`
- Test: `tests/unit/test_gpt_sovits_training.py`
- Test: `tests/api/test_voice_assets.py`

**Interfaces:**
- `label_with_asr(asset_id: str, language: str) -> dict` sends the requested language to ASR and writes the selected normalized tag.
- Produces: `TrainingService.validate_dataset(asset_id: str, expected_language: str) -> list[str]`
- `start_training(asset_id, expected_language)` refuses invalid datasets before spawning a thread.

- [ ] **Step 1: Add failing tests for ASR language propagation and corrupt rows**

```python
def test_label_with_asr_sends_japanese_hint(tmp_path, monkeypatch):
    # Fake the ASR response as {"language": "ja", "text": "何の用かしら"}.
    # Assert the request URL includes `?language=ja` and the .list row is `|JA|何の用かしら`.
    service = configured_service(tmp_path)
    captured = []
    monkeypatch.setattr(service, "_asr_request", lambda url, payload: captured.append(url) or {"language": "ja", "text": "何の用かしら"})
    service.label_with_asr("asset", language="ja")
    assert "language=ja" in captured[0]
    assert "|JA|何の用かしら" in service.list_path("asset").read_text(encoding="utf-8")

def test_start_training_rejects_mojibake_before_thread(tmp_path):
    service = configured_service(tmp_path)
    write_list(service, "asset", "001.wav|asset|JA|銇傘倢銇屻仺\n")
    with pytest.raises(TrainingDataInvalid, match="疑似乱码"):
        service.start_training("asset", expected_language="ja")
```

- [ ] **Step 2: Run tests and verify failure occurs before implementation**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_training.py tests/api/test_voice_assets.py -q`

Expected: the language hint assertion and validation exception tests fail.

- [ ] **Step 3: Implement language-aware labeling and validation gate**

```python
url = f"{ASR_SERVICE_URL}?language={quote(normalize_language(language))}"
request = Request(
    url,
    data=payload,
    headers={"Content-Type": "audio/wav", "x-audio-filename": wav_file.name},
    method="POST",
)

errors = validate_training_rows(parsed_rows, normalize_language(expected_language))
if errors:
    raise TrainingDataInvalid("；".join(errors[:5]))
```

Update the ASR HTTP endpoint to accept an optional query language and call `infer(path, language)`. Store `asset.reference_language` before starting training. On validation failure set `status="needs_retraining"`, retain the dataset, and return HTTP 422 instead of deleting the asset.

- [ ] **Step 4: Run focused training tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_training.py tests/api/test_voice_assets.py -q`

Expected: all tests pass and no training subprocess is started for corrupt data.

- [ ] **Step 5: Commit**

```powershell
git add voice/asr/worker_server.py voice/gpt_sovits/training.py app/routers/voice_assets.py tests/unit/test_gpt_sovits_training.py tests/api/test_voice_assets.py
git commit -m "fix: reject corrupt GPT-SoVITS training labels"
```

### Task 4: Build One GPT-SoVITS Synthesis Facade

**Files:**
- Create: `voice/gpt_sovits/synthesis.py`
- Modify: `voice/gpt_sovits/__init__.py`
- Test: `tests/unit/test_gpt_sovits_synthesis.py`

**Interfaces:**
- Consumes: `split_text_by_language()` and `GPTSoVITSAdapter.synthesize()`
- Produces: `GPTSoVITSSynthesisService.synthesize(asset, text, default_language=None) -> bytes`
- Produces: `GPTSoVITSSynthesisService.synthesize_segments(asset, text, default_language=None) -> list[SynthesizedSegment]`
- Produces: `merge_wavs(parts: list[bytes]) -> bytes`

- [ ] **Step 1: Write failing request-contract tests**

```python
def test_japanese_asset_reads_japanese_with_separate_languages():
    service, calls = fake_service()
    asset = fake_asset(reference_language="ja", prompt_text="こんにちは")
    service.synthesize(asset, "何の用かしら")
    assert calls[0]["prompt_lang"] == "ja"
    assert calls[0]["text_lang"] == "ja"

def test_japanese_asset_reads_chinese_without_changing_prompt_language():
    service, calls = fake_service()
    asset = fake_asset(reference_language="ja", prompt_text="こんにちは")
    service.synthesize(asset, "你好", default_language="zh")
    assert (calls[0]["prompt_lang"], calls[0]["text_lang"]) == ("ja", "zh")
```

- [ ] **Step 2: Run tests and confirm missing facade**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_synthesis.py -q`

Expected: import failure for `GPTSoVITSSynthesisService`.

- [ ] **Step 3: Implement the facade and WAV merger**

```python
for segment in split_text_by_language(text, default_language):
    audio = self.adapter.synthesize(
        segment.text,
        text_lang=segment.language,
        gpt_weights=asset.gpt_weights_path,
        sovits_weights=asset.sovits_weights_path,
        refer_audio=refer_audio,
        prompt_text=prompt_text,
        prompt_lang=normalize_language(asset.reference_language),
    )
    results.append(SynthesizedSegment(segment.text, segment.language, audio))
```

Move only generic PCM WAV merging behavior from `LocalTTS` into this module. Reject assets with missing language, missing weights, or `status == "needs_retraining"` using specific exception classes.

- [ ] **Step 4: Run facade tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_synthesis.py tests/unit/test_gpt_sovits_adapter.py -q`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add voice/gpt_sovits/synthesis.py voice/gpt_sovits/__init__.py tests/unit/test_gpt_sovits_synthesis.py
git commit -m "feat: unify GPT-SoVITS synthesis"
```

### Task 5: Route Every TTS API Through The Facade

**Files:**
- Modify: `app/routers/tts.py`
- Modify: `app/routers/voice_assets.py:291-323`
- Test: `tests/api/test_tts_synthesis.py`
- Test: `tests/api/test_tts_voice.py`
- Replace: `tests/api/test_tts_resources.py`

**Interfaces:**
- Consumes: `request.app.state.tts_synthesis`
- All persona synthesis endpoints require a ready GPT-SoVITS asset with valid `reference_language`.
- `/api/tts/status` delegates to GPT-SoVITS status/install state.

- [ ] **Step 1: Replace Lunar fakes with a facade fake and add three-path contract tests**

```python
@pytest.mark.parametrize("route_kind", ["normal", "stream", "websocket"])
def test_all_routes_use_japanese_text_and_prompt_languages(route_kind, client, japanese_asset):
    # Invoke each route with `何の用かしら`.
    # Assert the facade receives the same asset and default language `auto`.
    # Assert no `tts_worker`, `tts_factory`, or `tts_resources` state is accessed.
    result = invoke_route(route_kind, client, japanese_asset, text="何の用かしら")
    assert result.status_code in {200, 201}
    assert result.facade_calls[0]["prompt_lang"] == "ja"
    assert result.facade_calls[0]["text_lang"] == "ja"

def test_tts_status_is_gpt_sovits_only(client):
    response = client.get("/api/tts/status")
    assert response.json()["engine"] == "gpt_sovits"
    assert "runtime_bundled" not in response.json()
```

- [ ] **Step 2: Run API tests and confirm the old Lunar paths fail**

Run: `.\.venv\Scripts\python.exe -m pytest tests/api/test_tts_synthesis.py tests/api/test_tts_voice.py tests/api/test_tts_resources.py -q`

Expected: failures identify `tts_factory`/`tts_resources` access in preview and HTTP stream routes.

- [ ] **Step 3: Refactor routes to the single facade**

```python
asset = persona_voice_asset(persona, session)
if asset is None:
    raise HTTPException(status_code=409, detail="角色未绑定可用的 GPT-SoVITS 音色")
audio = request.app.state.tts_synthesis.synthesize(
    asset,
    text,
    default_language=persona_output_language(persona),
)
```

Use `synthesize_segments()` for HTTP/WebSocket segment events and `merge_wavs()` for persistence. Remove Lunar configuration/install/reference-preview endpoints; keep reference upload only if GPT-SoVITS training still consumes it. Ensure failed normal requests unlink partial files and failed streams do not persist messages.

- [ ] **Step 4: Run all TTS API tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/api/test_tts_synthesis.py tests/api/test_tts_voice.py tests/api/test_tts_resources.py tests/api/test_voice_assets.py -q`

Expected: all tests pass with GPT-SoVITS-only app state.

- [ ] **Step 5: Commit**

```powershell
git add app/routers/tts.py app/routers/voice_assets.py tests/api/test_tts_synthesis.py tests/api/test_tts_voice.py tests/api/test_tts_resources.py
git commit -m "refactor: route TTS APIs through GPT-SoVITS"
```

### Task 6: Remove Lunar From Application Lifecycle And Voice Studio

**Files:**
- Modify: `app/main.py:98-163,201-220,241`
- Modify: `app/routers/voice_studio.py:240-270`
- Modify: `tests/conftest.py`
- Modify: `tests/api/test_voice_studio_api.py`

**Interfaces:**
- Produces app state: `gpt_sovits`, `gpt_sovits_install`, `gpt_sovits_training`, `tts_synthesis`
- Removes app state: `tts_resources`, `tts_worker`, `tts_factory`

- [ ] **Step 1: Add a failing lifecycle test**

```python
def test_app_registers_only_gpt_sovits_tts(client):
    assert hasattr(client.app.state, "tts_synthesis")
    assert not hasattr(client.app.state, "tts_worker")
    assert not hasattr(client.app.state, "tts_resources")
    assert not hasattr(client.app.state, "tts_factory")
```

- [ ] **Step 2: Run lifecycle and Voice Studio tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/api/test_voice_studio_api.py tests/api/test_tts_resources.py -q`

Expected: lifecycle test fails because Lunar state is still registered.

- [ ] **Step 3: Remove Lunar setup and delegate supported previews**

Instantiate `GPTSoVITSSynthesisService(app.state.gpt_sovits)` after the adapter. Delete `warm_tts_worker`, its task, cancellation, shutdown, `LocalTTS`, `TTSResourceManager`, and the `models/Qwen3-TTS` directory creation. Keep only `warm_gpt_sovits()` and `gpt_sovits.stop_service()`.

Voice Studio preview must accept/select a valid voice asset and call `tts_synthesis`; if no trained asset exists, return 409 with “请先训练或导入 GPT-SoVITS 音色”.

- [ ] **Step 4: Run lifecycle and Voice Studio tests**

Run: `.\.venv\Scripts\python.exe -m pytest tests/api/test_voice_studio_api.py tests/api/test_tts_resources.py tests/api/test_voice_assets.py -q`

Expected: all tests pass and no Lunar app state exists.

- [ ] **Step 5: Commit**

```powershell
git add app/main.py app/routers/voice_studio.py tests/conftest.py tests/api/test_voice_studio_api.py tests/api/test_tts_resources.py
git commit -m "refactor: remove Lunar TTS lifecycle"
```

### Task 7: Replace Dual-Engine Frontend With GPT-SoVITS Controls

**Files:**
- Modify: `static/views/settings.html`
- Modify: `static/js/settings.js`
- Modify: `static/js/common.js`
- Modify: `static/js/personas.js`
- Modify: `static/js/chat.js`
- Modify: `static/views/voice.html`
- Modify: `tests/unit/test_static_voice_assets.py`
- Modify: `tests/api/test_web.py`

**Interfaces:**
- Persona TTS profile uses `voice_asset_id`, `output_language` (`auto|zh|ja|en|ko|yue`), `enabled`, and `auto_play`.
- Voice asset UI displays `reference_language` and blocks `needs_retraining` assets.

- [ ] **Step 1: Add failing static asset assertions**

```python
def test_tts_ui_is_gpt_sovits_only():
    source = settings_html + settings_js
    assert "Lunar" not in source
    assert "Qwen3-TTS" not in source
    assert "tts-engine-lunar" not in source
    assert "GPT-SoVITS" in source

def test_persona_has_output_language_override():
    assert 'id="edit-tts-output-language"' in personas_html
    assert "output_language" in personas_js
```

- [ ] **Step 2: Run static tests and verify old copy is detected**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_static_voice_assets.py tests/api/test_web.py -q`

Expected: failures list Lunar controls/copy and missing output language selector.

- [ ] **Step 3: Implement GPT-SoVITS-only UI**

Remove engine radio controls and Lunar install/preview handlers. Reuse existing `/api/gpt-sovits/*` actions for install, detect, start, stop, directory, and status. Add output language options `自动、中文、日语、英文、韩语、粤语`; save `output_language` in the persona TTS profile. Show “需要重新训练：训练标注乱码或语言不匹配” for invalid assets and prevent selection.

Keep the WebSocket chat flow, but ensure its errors surface language uncertainty and retraining states without falling back to HTTP/Lunar.

- [ ] **Step 4: Validate JavaScript and static tests**

Run: `node --check static/js/settings.js; node --check static/js/personas.js; node --check static/js/chat.js; .\.venv\Scripts\python.exe -m pytest tests/unit/test_static_voice_assets.py tests/api/test_web.py -q`

Expected: JavaScript checks exit 0 and all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add static/views/settings.html static/js/settings.js static/js/common.js static/js/personas.js static/js/chat.js static/views/voice.html tests/unit/test_static_voice_assets.py tests/api/test_web.py
git commit -m "feat: expose multilingual GPT-SoVITS controls"
```

### Task 8: Migrate Existing Assets And Delete Lunar Exactly

**Files:**
- Create: `voice/gpt_sovits/migration.py`
- Modify: `app/main.py`
- Test: `tests/unit/test_gpt_sovits_migration.py`
- Delete: `voice/tts/`
- Delete: `runtime/tts/`
- Delete: `third_party/lunar_tts/`
- Delete: `tests/unit/test_local_tts_worker.py`
- Delete: `tests/unit/test_lunar_tts_runtime_layout.py`
- Delete: `tests/unit/test_tts_install.py`

**Interfaces:**
- Produces: `migrate_voice_assets(session_factory) -> MigrationSummary`
- Migration infers language only from valid `.list` rows and marks malformed assets `needs_retraining` without unlinking files.

- [ ] **Step 1: Write failing migration safety tests**

```python
def test_valid_japanese_asset_gets_reference_language(session_factory, tmp_path):
    asset = legacy_asset(list_text="001.wav|asset|JA|何の用かしら\n")
    summary = migrate_voice_assets(session_factory)
    assert reload(asset).reference_language == "ja"
    assert summary.updated == 1

def test_mojibake_asset_is_marked_without_deleting_files(session_factory, tmp_path):
    asset = legacy_asset(list_text="001.wav|asset|JA|銇傘倢銇屻仺\n")
    migrate_voice_assets(session_factory)
    assert reload(asset).status == "needs_retraining"
    assert Path(asset.gpt_weights_path).exists()
```

- [ ] **Step 2: Run migration tests and confirm missing migration**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_migration.py -q`

Expected: import failure for `migrate_voice_assets`.

- [ ] **Step 3: Implement idempotent metadata migration**

Read the first available `.list` under `dataset_dir`, parse all non-empty rows, validate them, and update only `reference_language`, `status`, and `error_message`. Run once at startup after schema upgrades; repeated runs must make no further changes.

- [ ] **Step 4: Run the migration and GPT-SoVITS protection baseline**

Run: `.\.venv\Scripts\python.exe -m pytest tests/unit/test_gpt_sovits_migration.py tests/unit/test_gpt_sovits_adapter.py tests/unit/test_gpt_sovits_training.py tests/api/test_voice_assets.py -q`

Expected: all tests pass before any deletion.

- [ ] **Step 5: Delete exact Lunar paths and dedicated tests**

```powershell
$targets = @(
  (Resolve-Path 'voice/tts'),
  (Resolve-Path 'runtime/tts'),
  (Resolve-Path 'third_party/lunar_tts'),
  (Resolve-Path 'tests/unit/test_local_tts_worker.py'),
  (Resolve-Path 'tests/unit/test_lunar_tts_runtime_layout.py'),
  (Resolve-Path 'tests/unit/test_tts_install.py')
)
$root = (Resolve-Path '.').Path
foreach ($target in $targets) {
  if (-not $target.Path.StartsWith($root + [IO.Path]::DirectorySeparatorChar)) { throw "Unsafe target: $target" }
  Remove-Item -LiteralPath $target.Path -Recurse -Force
}
```

- [ ] **Step 6: Prove Lunar references are gone and GPT-SoVITS paths remain**

Run: `rg -n "voice\.tts|LocalTTS|TTSResourceManager|Qwen3_TTS_Lunar|third_party[/\\]lunar_tts|runtime[/\\]tts|Qwen3-TTS" app voice static tests main.py; Test-Path voice/gpt_sovits; Test-Path runtime/gpt_sovits; Test-Path runtime/gpt_sovits_patches; Test-Path data/gpt_sovits`

Expected: `rg` has no Lunar TTS matches; all four `Test-Path` calls print `True`. Matches for Qwen3-ASR or Qwen3-Embedding are allowed and must not be removed.

- [ ] **Step 7: Commit exact migration and deletions**

```powershell
git add voice/gpt_sovits/migration.py app/main.py tests/unit/test_gpt_sovits_migration.py
git add -u -- voice/tts runtime/tts third_party/lunar_tts tests/unit/test_local_tts_worker.py tests/unit/test_lunar_tts_runtime_layout.py tests/unit/test_tts_install.py
git commit -m "refactor: remove Lunar Qwen3 TTS"
```

### Task 9: Full Regression And User-Facing QA

**Files:**
- Modify only files implicated by a failing test; do not broaden scope.

- [ ] **Step 1: Run the complete automated suite**

Run: `.\.venv\Scripts\python.exe -m pytest -q`

Expected: all tests pass; infrastructure-dependent skips remain documented.

- [ ] **Step 2: Run syntax and reference scans**

Run: `node --check static/js/chat.js; node --check static/js/personas.js; node --check static/js/settings.js; .\.venv\Scripts\python.exe -m compileall -q app voice; rg -n "Lunar|Qwen3-TTS|LocalTTS|TTSResourceManager|tts_factory|tts_worker|tts_resources" app voice static tests main.py`

Expected: syntax checks exit 0; final `rg` returns no Lunar TTS implementation references.

- [ ] **Step 3: Start the app and inspect the live API**

Run: `.\.venv\Scripts\python.exe -B main.py`

In another PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 17000 -State Listen
Invoke-RestMethod http://127.0.0.1:17000/api/tts/status
```

Expected: port 17000 listens; status identifies only `gpt_sovits` and contains no Lunar model fields.

- [ ] **Step 4: Browser QA in Microsoft Edge**

Open `http://127.0.0.1:17000/static/index.html`. Confirm settings show only GPT-SoVITS, invalid Japanese assets are blocked with a retraining message, and persona editing offers an output language selector. Using a valid Japanese asset, synthesize `何の用かしら` as Japanese and a Chinese sentence as Chinese; confirm neither request reads Japanese kanji with Chinese phonetics unless Chinese is explicitly selected.

- [ ] **Step 5: Record PID and stop command**

Report the PID returned by `Get-NetTCPConnection`. Provide:

```powershell
$conn = Get-NetTCPConnection -LocalPort 17000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess
    Write-Host "Stopped process PID:" $conn.OwningProcess
} else {
    Write-Host "No service is listening on port 17000"
}
```

- [ ] **Step 6: Final commit only if verification required a focused fix**

Stage only the files changed to resolve verified failures, rerun the affected test plus the full suite, then commit with a message describing that specific fix.
