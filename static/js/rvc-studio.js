"use strict";
window.PL = window.PL || { modules: {} };

let rvcFile = null;
let rvcFilePreviewUrl = "";
let rvcSessionId = null;
let rvcSession = null;
let rvcPollTimer = null;
let rvcRuntimeReady = false;
let rvcTask = null;

const rvcHeaders = { "X-YUMENO-Request": "web" };
const rvc$ = (id) => document.getElementById(id);
const rvcSet = (id, value, error = false) => {
  const node = rvc$(id);
  if (!node) return;
  node.textContent = value || "";
  node.classList.toggle("is-error", error);
};
const rvcHidden = (id, hidden) => rvc$(id)?.classList.toggle("is-hidden", hidden);
const rvcError = (error) => error?.message || String(error || "未知错误");
const rvcSessionPhaseText = { idle: "等待素材", uploaded: "素材已上传", extracting: "正在提取音频", normalizing: "正在标准化 WAV", ready: "音频已准备", separating: "正在分离人声与背景音", separated: "人声与背景音已准备", failed: "处理失败" };
const rvcTaskPhaseText = { queued: "等待任务开始", preparing: "准备输入和模型", loading_model: "加载 RVC 模型", extracting_features: "提取音高与音频特征", converting: "正在进行音色转换", encoding_output: "正在写入 WAV 文件", trimming: "正在裁剪音频", normalizing_instrumental: "正在准备 Instrumental", mixing: "正在合并音频", encoding_mix: "正在写入混合音频", done: "已完成", failed: "处理失败", cancelling: "正在取消任务", cancelled: "任务已取消" };
const formatRvcElapsed = (seconds) => {
  const value = Math.max(0, Math.round(Number(seconds) || 0));
  if (value < 60) return value + " 秒";
  return Math.floor(value / 60) + " 分 " + (value % 60) + " 秒";
};
function updateRvcThinProgress(id, progress, { running = false, error = false } = {}) {
  const track = rvc$(id);
  const bar = rvc$(id + "-bar");
  if (!track || !bar) return;
  const value = Math.max(0, Math.min(100, Number(progress) || 0));
  track.setAttribute("aria-valuenow", String(Math.round(value)));
  track.classList.toggle("is-running", running);
  track.classList.toggle("is-error", error);
  bar.style.width = String(value) + "%";
  if (!running && !error) bar.style.transform = "translateX(0)";
}
function updateRvcSessionProgress(state) {
  const phase = state?.phase || "idle";
  const running = !["ready", "separated", "failed", "idle", "uploaded"].includes(phase);
  const error = phase === "failed";
  updateRvcThinProgress("rvc-prepare-progress", state?.progress ?? 0, { running, error });
  rvcSet("rvc-prepare-status", state?.error || rvcSessionPhaseText[phase] || "正在处理…", error);
}
function updateRvcTaskProgress(task) {
  const state = task?.state || task?.status || "running";
  const phase = task?.phase || state;
  const rawProgress = task?.progress_percent ?? task?.progress;
  const progress = typeof rawProgress === "number" ? rawProgress : 0;
  const terminal = ["succeeded", "failed", "cancelled"].includes(state);
  rvcSet("rvc-phase", rvcTaskPhaseText[phase] || phase);
  rvcSet("rvc-progress-detail", task?.message || (phase === "converting" ? "模型已加载，正在处理整段音频；时长和显卡负载会影响等待时间。" : ""));
  rvcSet("rvc-progress-elapsed", task?.elapsed_seconds != null ? "已用时 " + formatRvcElapsed(task.elapsed_seconds) : "");
  rvcSet("rvc-percent", Math.round(progress) + "%");
  updateRvcThinProgress("rvc-task-progress-line", progress, { running: !terminal, error: state === "failed" });
  return { state, terminal };
}
const rvcApi = async (response) => {
  if (!response.ok) {
    let detail = response.statusText;
    try { detail = (await response.json()).detail || detail; } catch {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return response.json();
};

function initRvcPage() {
  bindSafe("rvc-input", "change", (event) => setRvcFile(event.target.files?.[0] || null));
  bindSafe("rvc-file-clear", "click", resetRvcPage);
  bindSafe("rvc-process", "click", processRvcSource);
  bindSafe("rvc-model", "change", loadRvcSpeakerMetadata);
  bindSafe("rvc-model-input", "change", importRvcModels);
  bindSafe("rvc-open-model-directory", "click", openRvcModelDirectory);
  bindSafe("rvc-refresh-models", "click", loadRvcPageData);
  bindSafe("rvc-index", "change", syncRvcButton);
  bindSafe("rvc-index-rate", "input", syncRvcButton);
  bindSafe("rvc-preset", "change", applyRvcPreset);
  bindSafe("rvc-convert", "click", startRvcConversion);
  bindSafe("rvc-cancel", "click", cancelRvcTask);
  bindSafe("rvc-reset", "click", resetRvcPage);
  bindSafe("rvc-mix-manual", "click", () => mixRvcResult());
  bindSafe("rvc-mix-upload", "change", (event) => mixRvcResult(event.target.files?.[0] || null));
  document.querySelectorAll(".rvc-trim-button").forEach((button) => button.addEventListener("click", () => trimRvcSessionFile(button.dataset.rvcTrim)));
  bindRvcDropzone();
  void loadRvcPageData();
}

const rvcPresets = {
  default: { pitch: 0, f0: "rmvpe", indexRate: 0.75, protect: 0.33, rms: 1 },
  target: { pitch: 0, f0: "rmvpe", indexRate: 0.9, protect: 0.2, rms: 0.95 },
  source: { pitch: 0, f0: "rmvpe", indexRate: 0.35, protect: 0.45, rms: 1 },
  higher: { pitch: 4, f0: "rmvpe", indexRate: 0.75, protect: 0.33, rms: 1 },
};

function applyRvcPreset(event) {
  const preset = rvcPresets[event.target.value];
  if (!preset) return;
  rvc$("rvc-pitch").value = preset.pitch;
  rvc$("rvc-f0").value = preset.f0;
  rvc$("rvc-index-rate").value = preset.indexRate;
  rvc$("rvc-protect").value = preset.protect;
  rvc$("rvc-rms").value = preset.rms;
  syncRvcButton();
}

function bindRvcDropzone() {
  const dropzone = rvc$("rvc-drop");
  const input = rvc$("rvc-input");
  if (!dropzone || !input) return;
  dropzone.addEventListener("click", (event) => { if (event.target !== input) input.click(); });
  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });
  ["dragenter", "dragover"].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  }));
  ["dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
  }));
  dropzone.addEventListener("drop", (event) => setRvcFile(event.dataTransfer?.files?.[0] || null));
}

function setRvcFile(file) {
  rvcFile = file;
  // 新素材必须从全新的会话开始，避免沿用上一次的 vocals / 推理输入。
  rvcSessionId = null;
  rvcSession = null;
  if (rvcFilePreviewUrl) URL.revokeObjectURL(rvcFilePreviewUrl);
  rvcFilePreviewUrl = "";
  rvcHidden("rvc-file", !file);
  if (!file) {
    rvcHidden("rvc-stems", true);
    rvcHidden("rvc-prepare-progress", true);
    updateRvcThinProgress("rvc-prepare-progress", 0);
    rvcSet("rvc-source-status", "");
    rvcSet("rvc-prepare-status", "");
    syncRvcProcessButton();
    syncRvcButton();
    return;
  }
  rvcSet("rvc-file-name", file.name);
  rvcSet("rvc-file-detail", `${formatBytes(file.size)} · ${file.type || "素材"}`);
  if (rvcFilePreviewUrl) URL.revokeObjectURL(rvcFilePreviewUrl);
  rvcFilePreviewUrl = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mkv|webm|mov|avi)$/i.test(file.name);
  rvcHidden("rvc-prepare-progress", false);
  updateRvcThinProgress("rvc-prepare-progress", 5, { running: true });
  rvcSet("rvc-source-status", isVideo ? "视频已选择，正在自动提取音频…" : "音频已选择，正在自动检查并标准化…");
  syncRvcProcessButton();
  syncRvcButton();
  icons();
  // 音频和视频统一进入同一条受管流程；视频只是在后端多一步提取音轨。
  void extractRvcSource();
}

function syncRvcProcessButton() {
  const button = rvc$("rvc-process");
  if (!button) return;
  button.disabled = !rvcSession?.normalized_wav || Boolean(rvcPollTimer) || Boolean(rvcSession?.vocals);
}

async function loadRvcPageData() {
  try {
    const status = await rvcApi(await fetch("/api/voice/rvc/status", { cache: "no-store", headers: rvcHeaders }));
    rvcRuntimeReady = Boolean(status.ready);
    rvc$("rvc-status-dot")?.classList.toggle("is-ready", rvcRuntimeReady);
    const title = rvc$("rvc-page-title");
    if (title) title.textContent = rvcRuntimeReady ? "RVC 已就绪" : "RVC 未完成配置";
    rvc$("rvc-status-dot")?.classList.toggle("is-ready", rvcRuntimeReady);

    const data = await rvcApi(await fetch("/api/voice/rvc/models", { cache: "no-store", headers: rvcHeaders }));
    const model = rvc$("rvc-model");
    model.replaceChildren();
    (data.models || []).forEach((item) => model.add(new Option(item.name || item.id, item.id)));
    if (!data.models?.length) model.add(new Option("暂无 .pth 音色模型", ""));

    const index = rvc$("rvc-index");
    index.replaceChildren(new Option("不使用 Index", ""));
    (data.indices || []).forEach((item) => index.add(new Option(item.name || item.id, item.id)));
    if (data.indices?.length) index.value = data.indices[0].id;
    rvcSet(
      "rvc-model-hint",
      data.models?.length ? "选择模型后会读取版本、采样率和 Speaker 范围。" : "暂无模型，请先在上方上传目标音色文件。",
      !data.models?.length,
    );
    if (model.value) await loadRvcSpeakerMetadata();
    selectDefaultRvcIndex(model.value);
    syncRvcButton();
  } catch (error) {
    rvcRuntimeReady = false;
    const title = rvc$("rvc-page-title");
    if (title) title.textContent = "RVC 未完成配置";
    rvcSet("rvc-status", `RVC 状态不可用：${rvcError(error)}`, true);
    syncRvcButton();
  }
}

async function openRvcModelDirectory() {
  const button = rvc$("rvc-open-model-directory");
  if (button) button.disabled = true;
  try {
    const data = await rvcApi(await fetch("/api/providers/rvc/open-model-directory", { method: "POST", headers: rvcHeaders }));
    rvcSet("rvc-model-upload-status", data.opened ? `已打开音色目录：${data.directory}` : `音色目录：${data.directory}`);
  } catch (error) {
    rvcSet("rvc-model-upload-status", `打开音色目录失败：${rvcError(error)}`, true);
  } finally {
    if (button) button.disabled = false;
  }
}

async function importRvcModels(event) {
  const input = event.target;
  const files = Array.from(input?.files || []);
  if (!files.length) return;
  const label = rvc$("rvc-model-upload-label");
  const status = rvc$("rvc-model-upload-status");
  if (label) label.textContent = "上传中…";
  if (status) { status.textContent = "正在复制音色文件并检查模型…"; status.classList.remove("is-error"); }
  input.disabled = true;
  try {
    const form = new FormData();
    files.forEach((file) => form.append("files", file, file.name));
    const data = await rvcApi(await fetch("/api/providers/rvc/models/import", { method: "POST", headers: rvcHeaders, body: form }));
    const model = rvc$("rvc-model");
    model.replaceChildren();
    (data.models || []).forEach((item) => model.add(new Option(item.name || item.id, item.id)));
    if (!data.models?.length) model.add(new Option("暂无可用 .pth 音色模型", ""));
    if (data.models?.length) {
      model.value = data.models[data.models.length - 1].id;
      const indices = data.indices || [];
      const index = rvc$("rvc-index");
      if (index) {
        index.replaceChildren(new Option("不使用 Index", ""));
        indices.forEach((item) => index.add(new Option(item.name || item.id, item.id)));
        if (indices.length) index.value = indices[0].id;
      }
      await loadRvcSpeakerMetadata();
    }
    const imported = (data.imported || []).map((item) => item.name).join("、");
    if (status) status.textContent = imported ? `已上传：${imported}` : "音色文件已上传";
  } catch (error) {
    if (status) { status.textContent = `上传失败：${rvcError(error)}`; status.classList.add("is-error"); }
  } finally {
    input.disabled = false;
    input.value = "";
    if (label) label.textContent = "选择 .pth / .index";
    syncRvcButton();
  }
}

async function ensureSession() {
  if (rvcSessionId) return rvcSessionId;
  rvcSession = await rvcApi(await fetch("/api/voice/rvc/sessions", { method: "POST", headers: rvcHeaders }));
  rvcSessionId = rvcSession.session_id;
  return rvcSessionId;
}

async function extractRvcSource() {
  if (!rvcFile || rvcPollTimer) return;
  try {
    const sessionId = await ensureSession();
    const form = new FormData();
    form.append("file", rvcFile);
    await rvcApi(await fetch(`/api/voice/rvc/sessions/${sessionId}/source`, { method: "POST", headers: rvcHeaders, body: form }));
    await rvcApi(await fetch(`/api/voice/rvc/sessions/${sessionId}/extract`, { method: "POST", headers: rvcHeaders }));
    rvcSet("rvc-source-status", "正在提取并标准化 WAV…");
    pollSession();
  } catch (error) {
    rvcSet("rvc-source-status", `处理失败：${rvcError(error)}`, true);
    rvcHidden("rvc-prepare-progress", false);
    updateRvcThinProgress("rvc-prepare-progress", 0, { error: true });
    syncRvcProcessButton();
  }
}

function pollSession() {
  if (rvcPollTimer) clearInterval(rvcPollTimer);
  rvcPollTimer = setInterval(async () => {
    try {
      const state = await rvcApi(await fetch(`/api/voice/rvc/sessions/${rvcSessionId}`, { cache: "no-store", headers: rvcHeaders }));
      rvcSession = state;
      // 原始音频/视频预览在后端标准化完成后切换到受管 WAV，裁剪编辑器
      // 因此编辑的是实际会进入分离与推理链路的文件，而不是浏览器临时预览。
      if (state.normalized_wav?.file_id && rvcSessionId) {
      }
      updateRvcSessionProgress(state);
      rvcSet(
        "rvc-source-status",
        state.phase === "failed"
          ? state.error
          : (state.message || (state.phase === "ready" ? "音频已准备，可以继续处理。" : "正在提取并标准化音频…")),
        state.phase === "failed",
      );
      if (state.phase === "ready") {
        mountRvcSourceEditor(state);
        clearInterval(rvcPollTimer);
        rvcPollTimer = null;
        updateRvcThinProgress("rvc-prepare-progress", 100);
        rvcSet("rvc-prepare-status", state.message || "音频已准备，请点击“处理音频”继续。");
        syncRvcProcessButton();
      } else if (state.phase === "failed") {
        clearInterval(rvcPollTimer);
        rvcPollTimer = null;
      }
    } catch (error) {
      clearInterval(rvcPollTimer);
      rvcPollTimer = null;
      rvcSet("rvc-source-status", rvcError(error), true);
    }
  }, 500);
}

async function processRvcSource() {
  if (!rvcSessionId || !rvcSession?.normalized_wav || rvcPollTimer || rvcSession?.vocals) return;
  const button = rvc$("rvc-process");
  if (button) button.disabled = true;
  try {
    await rvcApi(await fetch(`/api/voice/rvc/sessions/${rvcSessionId}/separate`, { method: "POST", headers: rvcHeaders }));
    rvcHidden("rvc-prepare-progress", false);
    updateRvcThinProgress("rvc-prepare-progress", 5, { running: true });
    rvcSet("rvc-prepare-status", "正在检查 WAV 并分离人声与背景音…");
    pollSessionUntilSeparate();
  } catch (error) {
    if (button) button.disabled = false;
    rvcSet("rvc-prepare-status", rvcError(error), true);
    syncRvcProcessButton();
  }
}

function pollSessionUntilSeparate() {
  if (rvcPollTimer) clearInterval(rvcPollTimer);
  rvcPollTimer = setInterval(async () => {
    try {
      const state = await rvcApi(await fetch(`/api/voice/rvc/sessions/${rvcSessionId}`, { cache: "no-store", headers: rvcHeaders }));
      rvcSession = state;
      updateRvcSessionProgress(state);
      rvcSet(
        "rvc-prepare-status",
        state.phase === "failed"
          ? state.error
          : (state.message || (state.phase === "separated" ? "Vocal 已识别，可进行下一步 ↓" : "正在分离人声与背景音…")),
        state.phase === "failed",
      );
      if (state.phase === "separated") {
        updateRvcThinProgress("rvc-prepare-progress", 100);
        clearInterval(rvcPollTimer);
        rvcPollTimer = null;
        renderStems(state);
        if (rvc$("rvc-process")) rvc$("rvc-process").disabled = true;
      } else if (state.phase === "failed") {
        clearInterval(rvcPollTimer);
        rvcPollTimer = null;
      }
    } catch (error) {
      clearInterval(rvcPollTimer);
      rvcPollTimer = null;
      rvcSet("rvc-prepare-status", rvcError(error), true);
    }
  }, 700);
}

function renderStems(state) {
  const hasStems = Boolean(state?.vocals?.file_id && state?.instrumental?.file_id);
  rvcHidden("rvc-stems", !hasStems);
  if (!hasStems) {
    ["vocals", "instrumental"].forEach((kind) => {
      const audio = rvc$(`rvc-${kind}-audio`), download = rvc$(`rvc-${kind}-download`);
      audio?.closest("div")?.querySelectorAll(".rvc-waveform-editor")?.forEach((editor) => editor.remove());
      if (audio) audio.removeAttribute("src");
      if (download) { download.removeAttribute("href"); download.removeAttribute("download"); }
    });
    syncRvcProcessButton();
    return;
  }
  const derived = state.derived_files || [];
  const selected = derived.find((item) => item.file_id === state.selected_input && item.kind === "trimmed_vocals");
  const vocalItem = selected || state.vocals;
  [["vocals", vocalItem], ["instrumental", state.instrumental]].forEach(([kind, item]) => {
    const url = `/api/voice/rvc/sessions/${state.session_id}/files/${encodeURIComponent(item.file_id)}`;
    const audio = rvc$(`rvc-${kind}-audio`), download = rvc$(`rvc-${kind}-download`);
    if (audio) audio.src = url;
    if (download) { download.href = url; download.download = item.name; }
  });
  rvcSession.selected_input = vocalItem.file_id;
  rvcSet("rvc-prepare-status", "Vocal 已识别，可进行下一步 ↓");
  syncRvcButton();
  icons();
}
function selectRvcInput(kind) {
  if (!rvcSession || kind === "instrumental") return;
  const item = rvcSession[kind];
  if (!item) return;
  const derived = rvcSession.derived_files || [];
  const selected = derived.find((candidate) => candidate.file_id === rvcSession.selected_input && candidate.kind === "trimmed_vocals");
  rvcSession.selected_input = (selected || item).file_id;
  rvcSet("rvc-prepare-status", "Vocal 已识别，可进行下一步 ↓");
  syncRvcButton();
}
function selectDefaultRvcIndex(modelId) {
  const index = rvc$("rvc-index");
  if (!index || !index.options.length) return;
  const modelStem = String(modelId || "").replace(/\.pth$/i, "").toLowerCase();
  const match = Array.from(index.options).find((option) => {
    if (!option.value) return false;
    const indexStem = option.value.replace(/\.index$/i, "").toLowerCase();
    return modelStem && (indexStem === modelStem || indexStem.includes(modelStem) || modelStem.includes(indexStem));
  });
  // 有匹配项优先；否则选择第一个可用 Index，满足默认使用 Index 的约定。
  const firstAvailable = Array.from(index.options).find((option) => option.value);
  index.value = (match || firstAvailable)?.value || "";
  syncRvcButton();
}

async function loadRvcSpeakerMetadata() {
  const model = rvc$("rvc-model")?.value;
  if (!model) {
    syncRvcButton();
    return;
  }
  try {
    const metadata = await rvcApi(await fetch(`/api/voice/rvc/models/${encodeURIComponent(model)}/metadata`, { headers: rvcHeaders }));
    const speaker = rvc$("rvc-speaker");
    if (speaker) speaker.replaceChildren(...(metadata.speakers || [{ id: 0, name: "Speaker 0" }]).map((item) => new Option(item.name, String(item.id))));
    const rate = metadata.sample_rate ? `${Math.round(metadata.sample_rate / 1000)} kHz` : "采样率未知";
    rvcSet("rvc-model-hint", `${metadata.version || "版本未知"} / ${rate} / ${metadata.speaker_count || 1} speakers`);
  } catch (error) {
    rvcSet("rvc-model-hint", `模型元数据读取失败：${rvcError(error)}`, true);
  }
  syncRvcButton();
}

function syncRvcButton() {
  const button = rvc$("rvc-convert");
  if (!button) return;
  const indexRate = Number(rvc$("rvc-index-rate")?.value || 0);
  const missingIndex = indexRate > 0 && !rvc$("rvc-index")?.value;
  const hasVocals = Boolean(rvcSession?.vocals?.file_id);
  const ready = rvcRuntimeReady && hasVocals && Boolean(rvcSession?.selected_input) && Boolean(rvc$("rvc-model")?.value) && !rvcPollTimer && !missingIndex;
  button.disabled = !ready;
  rvcHidden("rvc-source-ready", !ready);
  if (ready) rvcSet("rvc-source-ready", "所需源文件已准备就绪，可以生成。");
  if (missingIndex && rvcSession?.selected_input) rvcSet("rvc-status", "Index 比例大于 0 时，请选择 Index；不使用 Index 时请将比例设为 0。", true);
  else if (!rvcPollTimer && !ready) rvcSet("rvc-status", "");
}

async function startRvcConversion() {
  try {
    const payload = {
      session_id: rvcSessionId,
      input_file_id: rvcSession.selected_input,
      model_id: rvc$("rvc-model").value,
      index_id: rvc$("rvc-index").value || null,
      speaker_id: Number(rvc$("rvc-speaker")?.value || 0),
      pitch: Number(rvc$("rvc-pitch").value || 0),
      f0_method: rvc$("rvc-f0").value,
      index_rate: Number(rvc$("rvc-index-rate").value || 0),
      protect: Number(rvc$("rvc-protect").value || 0.33),
      resample_sr: Number(rvc$("rvc-resample").value || 0),
      rms_mix_rate: Number(rvc$("rvc-rms").value || 1),
      mix_instrumental: Boolean(rvc$("rvc-mix-instrumental")?.checked),
    };
    rvcHidden("rvc-empty-result", true);
    rvcHidden("rvc-result", true);
    rvcHidden("rvc-progress", false);
    rvcSet("rvc-status", "所需源文件已准备就绪，正在提交生成任务…");
    updateRvcThinProgress("rvc-task-progress-line", 0, { running: true });
    rvcSet("rvc-phase", "正在提交任务");
    rvcSet("rvc-progress-detail", "正在创建受管 RVC 推理任务…");
    rvcSet("rvc-progress-elapsed", "");
    const result = await rvcApi(await fetch("/api/voice/rvc/convert", {
      method: "POST",
      headers: { ...rvcHeaders, "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    }));
    rvcSet("rvc-task-id", `任务 ${result.task_id}`);
    pollTask(result.task_id);
  } catch (error) {
    rvcHidden("rvc-progress", true);
    rvcHidden("rvc-empty-result", false);
    rvcSet("rvc-status", `提交失败：${rvcError(error)}`, true);
  }
}

function pollTask(id) {
  if (rvcPollTimer) clearInterval(rvcPollTimer);
  rvcPollTimer = setInterval(async () => {
    try {
      const task = await rvcApi(await fetch(`/api/voice/rvc/tasks/${encodeURIComponent(id)}`, { cache: "no-store", headers: rvcHeaders }));
      const { state, terminal } = updateRvcTaskProgress(task);
      if (terminal) {
        clearInterval(rvcPollTimer);
        rvcPollTimer = null;
        if (state === "succeeded") finishRvcResult(task);
        else {
          rvcHidden("rvc-progress", false);
          rvcHidden("rvc-empty-result", true);
          rvcSet("rvc-status", task.error || (state === "cancelled" ? "任务已取消" : "任务失败"), state !== "cancelled");
          updateRvcThinProgress("rvc-task-progress-line", task.progress_percent ?? task.progress ?? 0, { error: state === "failed" });
          const cancel = rvc$("rvc-cancel");
          if (cancel) cancel.disabled = true;
        }
        syncRvcButton();
      }
    } catch (error) {
      clearInterval(rvcPollTimer);
      rvcPollTimer = null;
      rvcSet("rvc-status", rvcError(error), true);
      syncRvcButton();
    }
  }, 1000);
}

function renderRvcOutput(item, taskId, index) {
  const url = item.url || `/api/voice/rvc/tasks/${taskId}/files/${encodeURIComponent(item.file_id)}`;
  const label = item.kind === "mixed" ? "RVC + Instrumental" : "RVC 人声";
  return `<div class="rvc-output-item"><div class="rvc-output-title"><b>${label}</b><span>${item.name || "output.wav"}</span></div><div class="rvc-editor-host rvc-task-editor" data-rvc-editor-file="${item.file_id}"></div><div class="rvc-result-actions"><a class="button button-primary" href="${url}" download="${item.name || `rvc-${taskId}.wav`}">另存为 WAV</a></div></div>`;
}

function finishRvcResult(task) {
  rvcTask = task;
  const id = task.task_id;
  const outputs = task.outputs || {};
  const vocal = outputs.rvc_vocal || { file_id: "rvc_vocal", kind: "rvc_vocal", name: `rvc-${id}.wav`, url: `/api/voice/rvc/tasks/${id}/output` };
  const list = rvc$("rvc-output-list");
  if (list) {
    list.innerHTML = Object.values(outputs).map((item) => renderRvcOutput(item, id)).join("") || renderRvcOutput(vocal, id);
    list.querySelectorAll("[data-rvc-editor-file]").forEach((host) => {
      const item = rvcTask.outputs?.[host.dataset.rvcEditorFile] || vocal;
      mountRvcWaveformEditor(host, item, { scope: "task", taskId: id });
    });
  }
  const audio = rvc$("rvc-output-audio");
  if (audio) { audio.pause(); audio.removeAttribute("src"); audio.hidden = true; }
  if (rvc$("rvc-download")) {
    rvc$("rvc-download").href = vocal.url || `/api/voice/rvc/tasks/${id}/output`;
    rvc$("rvc-download").download = vocal.name || `rvc-${id}.wav`;
  }
  rvcSet("rvc-result-name", `任务 ${id}`);
  rvcHidden("rvc-progress", true); rvcHidden("rvc-result", false);
  rvcHidden("rvc-mix-manual", Boolean(outputs.mixed)); rvcHidden("rvc-mix-upload-label", Boolean(outputs.mixed));
  if (!outputs.mixed) {
    const manual = rvc$("rvc-mix-manual"); const upload = rvc$("rvc-mix-upload-label");
    manual?.classList.remove("is-hidden"); upload?.classList.remove("is-hidden");
  }
  rvcSet("rvc-status", outputs.mixed ? "变声音频与 Instrumental 已生成" : "变声音频已生成，可试听或下载");
  list?.querySelectorAll(".rvc-output-play").forEach((button) => button.addEventListener("click", () => button.closest(".rvc-output-item")?.querySelector("audio")?.play().catch(() => {})));
  list?.querySelectorAll(".rvc-output-trim").forEach((button) => button.addEventListener("click", () => trimRvcTaskFile(button.dataset.fileId)));
  icons();
}

function mountRvcSourceEditor(state) {
  const host = rvc$("rvc-input-editor");
  if (!host || !state?.normalized_wav?.file_id || !rvcSessionId) return;
  mountRvcWaveformEditor(host, state.normalized_wav, { scope: "session", sessionId: rvcSessionId, replaceCurrent: true });
}

function mountRvcWaveformEditor(host, item, options = {}) {
  if (!host || !item?.file_id) return;
  host.querySelector(".rvc-waveform-editor")?.remove();
  const scope = options.scope || "session";
  const fileUrl = scope === "task"
    ? `/api/voice/rvc/tasks/${encodeURIComponent(options.taskId)}/files/${encodeURIComponent(item.file_id)}`
    : `/api/voice/rvc/sessions/${encodeURIComponent(options.sessionId || rvcSessionId)}/files/${encodeURIComponent(item.file_id)}`;
  const waveformUrl = scope === "task"
    ? `/api/voice/rvc/tasks/${encodeURIComponent(options.taskId)}/files/${encodeURIComponent(item.file_id)}/waveform`
    : `/api/voice/rvc/sessions/${encodeURIComponent(options.sessionId || rvcSessionId)}/files/${encodeURIComponent(item.file_id)}/waveform`;
  const panel = document.createElement("div"); panel.className = "rvc-waveform-editor is-waveform-loading";
  panel.innerHTML = `<audio class="rvc-editor-audio" preload="metadata" src="${fileUrl}"></audio><div class="rvc-waveform-wrap" tabindex="0" aria-label="音频波形裁剪编辑器"><img class="rvc-waveform" src="" data-waveform-url="${waveformUrl}" alt="音频波形"><span class="rvc-waveform-loading" role="status">正在生成波形…</span><div class="rvc-trim-overlay" role="group" aria-label="在波形上调整裁剪范围"><div class="rvc-trim-mask rvc-trim-mask-left"></div><div class="rvc-trim-mask rvc-trim-mask-right"></div><div class="rvc-trim-selection" aria-hidden="true"></div><button class="rvc-playhead" type="button" role="slider" tabindex="0" aria-label="当前播放位置" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0" title="拖动定位播放位置"></button><button class="rvc-trim-handle rvc-trim-handle-start" type="button" aria-label="调整裁剪开始位置" role="slider" tabindex="0"></button><button class="rvc-trim-handle rvc-trim-handle-end" type="button" aria-label="调整裁剪结束位置" role="slider" tabindex="0"></button></div></div><div class="rvc-editor-toolbar"><button class="button button-secondary rvc-editor-play" type="button" aria-label="播放选区" title="播放选区"><i data-lucide="play"></i></button><button class="button button-secondary rvc-editor-stop" type="button" aria-label="停止并回到选区起点" title="停止并回到选区起点"><i data-lucide="square"></i></button><button class="button button-secondary rvc-editor-mute" type="button" aria-label="静音" title="静音" aria-pressed="false"><i data-lucide="volume-2"></i></button><label class="rvc-editor-volume" title="试听音量"><i data-lucide="volume-1"></i><input class="rvc-editor-volume-input" type="range" min="0" max="200" step="1" value="100" aria-label="音量"><span>100%</span></label><label class="rvc-editor-time">开始 <input class="rvc-trim-start" type="number" min="0" step="0.01" value="0"></label><label class="rvc-editor-time">结束 <input class="rvc-trim-end" type="number" min="0.01" step="0.01" value="1"></label><span class="rvc-trim-duration" aria-live="polite"></span><button class="button button-primary rvc-editor-confirm" type="button">确认</button></div>`;
  host.append(panel); icons();
  const waveformImage = panel.querySelector(".rvc-waveform");
  let waveformRetry = 0;
  waveformImage?.addEventListener("load", () => { panel.classList.remove("is-waveform-loading", "is-waveform-error"); });
  waveformImage?.addEventListener("error", () => {
    if (waveformRetry < 2) {
      waveformRetry += 1;
      panel.classList.add("is-waveform-loading");
      window.setTimeout(() => { waveformImage.src = `${waveformUrl}?retry=${waveformRetry}&t=${Date.now()}`; }, waveformRetry * 450);
    } else {
      panel.classList.remove("is-waveform-loading");
      panel.classList.add("is-waveform-error");
    }
  });
  if (waveformImage) waveformImage.src = `${waveformUrl}?t=${Date.now()}`;
  const audio = panel.querySelector(".rvc-editor-audio"), overlay = panel.querySelector(".rvc-trim-overlay");
  const startHandle = panel.querySelector(".rvc-trim-handle-start"), endHandle = panel.querySelector(".rvc-trim-handle-end");
  const selection = panel.querySelector(".rvc-trim-selection"), playhead = panel.querySelector(".rvc-playhead"), leftMask = panel.querySelector(".rvc-trim-mask-left"), rightMask = panel.querySelector(".rvc-trim-mask-right");
  const startInput = panel.querySelector(".rvc-trim-start"), endInput = panel.querySelector(".rvc-trim-end"), durationLabel = panel.querySelector(".rvc-trim-duration");
  const play = panel.querySelector(".rvc-editor-play"), stop = panel.querySelector(".rvc-editor-stop"), mute = panel.querySelector(".rvc-editor-mute"), volume = panel.querySelector(".rvc-editor-volume-input"), volumeText = panel.querySelector(".rvc-editor-volume span");
  let duration = Number(audio.duration) || Number(item.duration) || 1, active = null, dragOrigin = null, selectionInitialized = false;
  const minGap = 0.01, clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  if (selectionInitialized) { startInput.value = "0.00"; endInput.value = duration.toFixed(2); }
  const updatePlayhead = (value = audio.currentTime) => {
    if (!playhead || !Number.isFinite(value)) return;
    const time = clamp(value, 0, duration);
    playhead.style.left = `${time / duration * 100}%`;
    playhead.setAttribute("aria-valuemax", duration.toFixed(2));
    playhead.setAttribute("aria-valuenow", time.toFixed(2));
    playhead.setAttribute("aria-valuetext", formatClock(time));
  };
  const formatClock = (v) => `${Math.floor(Math.max(0, v) / 60)}分${String(Math.floor(Math.max(0, v) % 60)).padStart(2, "0")}秒`;
  const sync = (source) => { let a=Number(startInput.value), b=Number(endInput.value); if(!Number.isFinite(a))a=0;if(!Number.isFinite(b))b=duration;if(source==="start")a=Math.min(a,b-minGap);if(source==="end")b=Math.max(b,a+minGap);a=clamp(a,0,Math.max(0,duration-minGap));b=clamp(b,a+minGap,duration);startInput.value=a.toFixed(2);endInput.value=b.toFixed(2);const l=a/duration*100,r=b/duration*100;selection.style.left=`${l}%`;selection.style.width=`${r-l}%`;leftMask.style.width=`${l}%`;rightMask.style.left=`${r}%`;rightMask.style.width=`${100-r}%`;startHandle.style.left=`${l}%`;endHandle.style.left=`${r}%`;[[startHandle,a],[endHandle,b]].forEach(([h,value])=>{h.setAttribute("aria-valuemin","0");h.setAttribute("aria-valuemax",duration.toFixed(2));h.setAttribute("aria-valuenow",value.toFixed(2));h.setAttribute("aria-valuetext",formatClock(value));});durationLabel.textContent=`${formatClock(a)} 至 ${formatClock(b)}，选中 ${(b-a).toFixed(2)} 秒`;};
  const setDuration=()=>{
    if(Number.isFinite(audio.duration)&&audio.duration>0){
      duration=audio.duration;
      endInput.max=duration;
      // 元数据到达后首次初始化必须覆盖完整时长，不能沿用 HTML 中的占位 1 秒。
      if(!selectionInitialized){ startInput.value=0; endInput.value=duration; selectionInitialized=true; }
    } else if(Number(item.duration)>0 && !selectionInitialized){
      duration=Number(item.duration);
      endInput.max=duration;
      startInput.value=0; endInput.value=duration; selectionInitialized=true;
    }
    sync();
  };
  const timeAt=(e)=>{const r=overlay.getBoundingClientRect();return clamp((e.clientX-r.left)/r.width,0,1)*duration;};
  const updatePointer=(e)=>{const t=timeAt(e),a=Number(startInput.value),b=Number(endInput.value);let na=a,nb=b;if(active==="playhead"){if(Number.isFinite(audio.duration)) audio.currentTime=t;updatePlayhead(t);return;}if(active==="start")na=Math.min(t,b-minGap);else if(active==="end")nb=Math.max(t,a+minGap);else if(active==="selection"&&dragOrigin){const w=dragOrigin.end-dragOrigin.start;na=clamp(dragOrigin.start+t-dragOrigin.time,0,duration-w);nb=na+w;}startInput.value=na;endInput.value=nb;sync();};
  const stopPlayback=(reset=true)=>{audio.pause();if(reset) audio.currentTime=Number(startInput.value)||0;play.innerHTML='<i data-lucide="play"></i>';play.setAttribute("aria-label","播放选区");updatePlayhead();icons();};
  const finish=()=>{if(active){active=null;dragOrigin=null;document.body.classList.remove("rvc-trimming");}};
  overlay.addEventListener("pointerdown",e=>{if(e.button!==0)return;const t=timeAt(e),a=Number(startInput.value),b=Number(endInput.value);if(e.target===playhead)active="playhead";else if(e.target===startHandle)active="start";else if(e.target===endHandle)active="end";else if(t>=a&&t<=b){active="selection";dragOrigin={time:t,start:a,end:b};}else active=Math.abs(t-a)<=Math.abs(t-b)?"start":"end";overlay.setPointerCapture?.(e.pointerId);updatePointer(e);e.preventDefault();});
  overlay.addEventListener("pointermove",e=>{if(active){updatePointer(e);e.preventDefault();}});overlay.addEventListener("pointerup",finish);overlay.addEventListener("pointercancel",finish);
  const key=(e,which)=>{
    let v=Number(which==="start"?startInput.value:endInput.value);
    const step=e.shiftKey?0.1:0.01;
    if(e.key==="ArrowLeft") v-=step;
    else if(e.key==="ArrowRight") v+=step;
    else if(e.key==="Home") v=0;
    else if(e.key==="End") v=duration;
    else return;
    e.preventDefault();
    if(which==="start") startInput.value=v; else endInput.value=v;
    sync(which);
  };
  startHandle.addEventListener("keydown",e=>key(e,"start"));
  endHandle.addEventListener("keydown",e=>key(e,"end"));
  startInput.addEventListener("input",()=>sync("start"));
  endInput.addEventListener("input",()=>sync("end"));
  audio.addEventListener("loadedmetadata",setDuration,{once:true});
  audio.addEventListener("timeupdate",()=>updatePlayhead());
  audio.addEventListener("seeking",()=>updatePlayhead());
  playhead?.addEventListener("keydown",(e)=>{const step=e.shiftKey?0.1:0.01;let value=Number(audio.currentTime)||0;if(e.key==="ArrowLeft")value-=step;else if(e.key==="ArrowRight")value+=step;else if(e.key==="Home")value=0;else if(e.key==="End")value=duration;else return;e.preventDefault();if(Number.isFinite(audio.duration))audio.currentTime=clamp(value,0,duration);updatePlayhead(value);});
  setDuration();
  play.onclick=()=>{
    const a=Number(startInput.value),b=Number(endInput.value);
    if(!audio.paused){
      stopPlayback(false);
      return;
    }
    // 暂停后再次点击应从当前位置继续；只有在选区外或已经播放完时才回到起点.
    if(!Number.isFinite(audio.currentTime) || audio.currentTime < a || audio.currentTime >= b - 0.005) audio.currentTime=a;
    audio.play().then(()=>{play.innerHTML='<i data-lucide="pause"></i>';play.setAttribute("aria-label","暂停选区");icons();}).catch(()=>{});
  };
  audio.addEventListener("timeupdate",()=>{if(audio.currentTime>=Number(endInput.value))stopPlayback();});stop.onclick=stopPlayback;
  mute.onclick=()=>{audio.muted=!audio.muted;mute.setAttribute("aria-pressed",String(audio.muted));mute.setAttribute("aria-label",audio.muted?"取消静音":"静音");mute.innerHTML=`<i data-lucide="${audio.muted?"volume-x":"volume-2"}"></i>`;icons();};
  volume.oninput=()=>{const v=Number(volume.value);audio.volume=Math.min(1,v/100);volumeText.textContent=`${v}%`;};
  panel.querySelector(".rvc-editor-confirm").onclick=async()=>{const a=Number(startInput.value),b=Number(endInput.value),v=Number(volume.value);if(b<=a)return;stopPlayback();const button=panel.querySelector(".rvc-editor-confirm");button.disabled=true;try{if(scope==="task"){const derived=await rvcApi(await fetch(`/api/voice/rvc/tasks/${encodeURIComponent(options.taskId)}/files/${encodeURIComponent(item.file_id)}/trim`,{method:"POST",headers:{...rvcHeaders,"Content-Type":"application/json"},body:JSON.stringify({start:a,end:b,volume_percent:v})}));if(rvcTask?.outputs)rvcTask.outputs[derived.file_id]=derived;finishRvcResult(rvcTask);}else{const data=await rvcApi(await fetch(`/api/voice/rvc/sessions/${encodeURIComponent(options.sessionId||rvcSessionId)}/files/${encodeURIComponent(item.file_id)}/trim`,{method:"POST",headers:{...rvcHeaders,"Content-Type":"application/json"},body:JSON.stringify({start:a,end:b,volume_percent:v,replace_current:Boolean(options.replaceCurrent)})}));rvcSession=data;renderStems(data);if(options.replaceCurrent)mountRvcSourceEditor(data);rvcSet("rvc-prepare-status",options.replaceCurrent?"已更新当前音频，下一步将基于此版本进行人声分离。":"已生成裁剪版音频，可继续试听或推理。");} }catch(error){button.disabled=false;rvcSet(scope==="task"?"rvc-status":"rvc-prepare-status",rvcError(error),true);}};
}

async function trimRvcSessionFile(kind) {
  const item = rvcSession?.[kind]; if (!item || !rvcSessionId) return;
  const button = document.querySelector(`[data-rvc-trim="${kind}"]`); const host = button?.closest("div"); if (!host) return;
  mountRvcWaveformEditor(host, item, { scope: "session", sessionId: rvcSessionId });
}

async function trimRvcTaskFile(fileId) {
  if (!rvcTask) return;
  const button = document.querySelector(`[data-file-id="${fileId}"]`); const host = button?.closest(".rvc-output-item"); const audio = host?.querySelector("audio"); const item = rvcTask.outputs?.[fileId]; if (!host || !item) return;
  mountRvcWaveformEditor(host, item, { scope: "task", taskId: rvcTask.task_id });
}

async function mixRvcResult(backgroundFile = null) {
  if (!rvcTask) return;
  try {
    const form = new FormData(); if (backgroundFile) form.append("background", backgroundFile, backgroundFile.name);
    await rvcApi(await fetch(`/api/voice/rvc/tasks/${rvcTask.task_id}/mix`, { method: "POST", headers: rvcHeaders, body: form }));
    rvcSet("rvc-status", "正在合并 Instrumental…");
    const wait = setInterval(async () => { const task = await rvcApi(await fetch(`/api/voice/rvc/tasks/${rvcTask.task_id}`, { headers: rvcHeaders, cache: "no-store" })); if (task.outputs?.mixed) { clearInterval(wait); finishRvcResult(task); } }, 700);
  } catch (error) { rvcSet("rvc-status", rvcError(error), true); }
}

async function cancelRvcTask() {
  const id = rvc$("rvc-task-id")?.textContent?.replace(/^任务\s*/, "");
  if (!id) return;
  try {
    await rvcApi(await fetch(`/api/voice/rvc/tasks/${encodeURIComponent(id)}`, { method: "DELETE", headers: rvcHeaders }));
    rvcSet("rvc-status", "正在取消任务…");
  } catch (error) {
    rvcSet("rvc-status", rvcError(error), true);
  }
}

function resetRvcPage() {
  if (rvcPollTimer) clearInterval(rvcPollTimer);
  rvcPollTimer = null;
  if (rvcFilePreviewUrl) URL.revokeObjectURL(rvcFilePreviewUrl);
  rvcFilePreviewUrl = "";
  rvcFile = null;
  rvcSessionId = null;
  rvcSession = null;
  rvcHidden("rvc-file", true);
  rvcHidden("rvc-stems", true);
  rvcHidden("rvc-result", true);
  rvcHidden("rvc-progress", true);
  rvcHidden("rvc-empty-result", false);
  rvcHidden("rvc-prepare-progress", true);
  updateRvcThinProgress("rvc-prepare-progress", 0);
  updateRvcThinProgress("rvc-task-progress-line", 0);
  rvcSet("rvc-phase", "准备中");
  rvcSet("rvc-percent", "—");
  rvcSet("rvc-progress-detail", "");
  rvcSet("rvc-progress-elapsed", "");
  rvcSet("rvc-task-id", "");
  rvcSet("rvc-status", "");
  rvcHidden("rvc-source-ready", true);
  rvcSet("rvc-source-status", "");
  rvcSet("rvc-prepare-status", "");
  const sourceEditor = rvc$("rvc-input-editor");
  if (sourceEditor) sourceEditor.replaceChildren();
  const outputList = rvc$("rvc-output-list");
  if (outputList) outputList.replaceChildren();
  if (rvc$("rvc-input")) rvc$("rvc-input").value = "";
  if (rvc$("rvc-process")) rvc$("rvc-process").disabled = true;
  syncRvcButton();
}

window.PL.rvc = window.PL.rvc || {};
window.PL.rvc.queueFile = (file) => {
  if (!file) return;
  window.PL.rvcQueuedFile = file;
  if (typeof window.switchView === "function") void window.switchView("rvc");
  window.setTimeout(() => {
    if (window.PL.rvcQueuedFile === file) { setRvcFile(file); window.PL.rvcQueuedFile = null; }
  }, 250);
};
window.PL.rvc.setFile = setRvcFile;
window.PL.modules.rvc = { init: initRvcPage };

