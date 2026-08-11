"use strict";
window.PL = window.PL || { modules: {} };
window.PL.modules.integrations = { init: initIntegrations, onShow: attachLiveStage, releaseLiveStage };

let biliSocket = null;
let liveStageHome = null;
let biliPersona = null;
let biliStatus = { state: "disconnected" };
let replyRecords = [];
let biliSessionEpoch = 0;

function deriveBiliViewModel(status = {}, draftRoom = "") {
  const stateName = status.state || (status.connected ? (status.paused ? "paused" : "running") : "disconnected");
  const stateLabels = {
    disconnected: "未连接", connecting: "连接中", running: "运行中", paused: "已暂停",
    switching: "切换中", disconnecting: "断开中", error: "连接异常",
  };
  const transitioning = ["connecting", "switching", "disconnecting"].includes(stateName);
  const activeRoom = String(status.active_room_id || "");
  const normalizedDraft = String(draftRoom || "").trim();
  const changingRoom = Boolean(activeRoom && normalizedDraft && activeRoom !== normalizedDraft);
  const mode = status.mode || "idle";
  const channel = mode === "realtime"
    ? { label: "实时弹幕", tone: "success" }
    : mode === "polling"
      ? { label: "弹幕轮询", tone: "info" }
      : mode === "unavailable"
        ? { label: "通道不可用", tone: "error" }
        : { label: "等待连接", tone: "muted" };
  const enterAvailable = status.enter_available ?? mode === "realtime";
  return {
    state: stateName,
    stateLabel: stateLabels[stateName] || "未知状态",
    liveLabel: status.live_status === 1 ? "直播中" : status.live_status === 0 ? "未开播" : "开播状态未知",
    channelLabel: channel.label,
    channelTone: channel.tone,
    enterAvailable,
    enterCapabilityLabel: enterAvailable ? "进场可用" : (mode === "polling" ? "进场暂停" : "等待连接"),
    connectLabel: changingRoom ? "切换直播间" : activeRoom ? "重新连接" : "连接直播间",
    pauseLabel: stateName === "paused" ? "继续" : "暂停",
    pauseDisabled: !["running", "paused"].includes(stateName),
    disconnectDisabled: stateName === "disconnected" || transitioning,
    configDisabled: transitioning,
    clearSessionDisabled: transitioning,
    connected: ["running", "paused"].includes(stateName),
  };
}

function mergeReplyRecord(records, next, limit = 100) {
  return [next, ...records.filter((record) => record.eventId !== next.eventId)].slice(0, limit);
}

function shouldResetBiliSession(previousSessionId, nextSessionId) {
  return Boolean(previousSessionId && nextSessionId && previousSessionId !== nextSessionId);
}

function buildReplyRecord(result, event, completedAt = new Date()) {
  const started = Date.parse(event.created_at || "");
  return {
    eventId: event.id,
    username: event.username || "匿名观众",
    prompt: event.content || "",
    answer: result.answer || "角色未返回文字",
    completedAt: completedAt.toISOString(),
    elapsedSeconds: Number.isFinite(started)
      ? Math.max(0, Math.round((completedAt.getTime() - started) / 1000))
      : null,
  };
}

async function initIntegrations() {
  $("bili-config-form").addEventListener("submit", connectBilibili);
  $("bili-pause").addEventListener("click", toggleBilibiliPause);
  $("bili-disconnect").addEventListener("click", disconnectBilibili);
  $("bili-clear-queue").addEventListener("click", clearBilibiliQueue);
  $("bili-clear-session").addEventListener("click", clearBilibiliSession);
  $("bili-clear-feed").addEventListener("click", () => $("bili-event-feed").replaceChildren(empty("等待新的直播事件")));
  $("bili-persona").addEventListener("change", () => { $("bili-persona").dataset.dirty = "true"; syncBilibiliPersona(); });
  $("bili-room-id").addEventListener("input", () => { $("bili-room-id").dataset.dirty = "true"; renderBilibiliStatus(biliStatus); });
  await fillBilibiliPersonas();
  renderBilibiliStatus(await api(fetch("/api/integrations/bilibili")), true);
  connectBilibiliEvents();
}

function attachLiveStage() {
  const dock = $("live2d-dock");
  const host = $("bili-live2d-host");
  if (!dock || !host) return;
  if (!liveStageHome) liveStageHome = { parent: dock.parentNode, next: dock.nextSibling };
  host.append(dock);
  dock.hidden = false;
  window.PLLive2DHub?.open?.();
  requestAnimationFrame(() => window.PLLive2DHub?.refreshLayout?.());
}

function releaseLiveStage() {
  const dock = $("live2d-dock");
  if (!dock || !liveStageHome?.parent) return;
  liveStageHome.parent.insertBefore(dock, liveStageHome.next);
  requestAnimationFrame(() => window.PLLive2DHub?.refreshLayout?.());
}

async function fillBilibiliPersonas() {
  const personas = await api(fetch("/api/personas"));
  const select = $("bili-persona");
  for (const persona of personas) {
    const option = document.createElement("option");
    option.value = persona.id;
    option.textContent = persona.name;
    option.dataset.persona = JSON.stringify(persona);
    select.append(option);
  }
}

function renderBilibiliStatus(status, initialize = false) {
  const previousActiveRoom = biliStatus.active_room_id;
  const previousSessionId = biliStatus.session_id;
  biliStatus = { ...biliStatus, ...status };
  const sessionChanged = shouldResetBiliSession(previousSessionId, biliStatus.session_id);
  if (sessionChanged) {
    resetBilibiliSessionView("本次直播已清空，等待新的直播事件");
  } else if (previousActiveRoom && biliStatus.active_room_id && previousActiveRoom !== biliStatus.active_room_id) {
    resetBilibiliSessionView();
  }
  const roomInput = $("bili-room-id");
  const personaSelect = $("bili-persona");
  if (initialize || !roomInput.dataset.dirty) roomInput.value = biliStatus.room_id || "";
  if (initialize || !personaSelect.dataset.dirty) personaSelect.value = biliStatus.default_persona_id || "";
  if (initialize) {
    $("bili-danmaku").checked = biliStatus.danmaku_enabled !== false;
    $("bili-enter").checked = biliStatus.enter_enabled !== false;
    $("bili-auto-voice").checked = biliStatus.auto_voice !== false;
  }
  syncBilibiliPersona();

  const view = deriveBiliViewModel(biliStatus, roomInput.value);
  $("bili-state").textContent = view.stateLabel;
  $("bili-live-state").textContent = view.liveLabel;
  $("bili-channel").textContent = view.channelLabel;
  $("bili-channel").dataset.tone = view.channelTone;
  $("bili-enter-capability").textContent = view.enterCapabilityLabel;
  $("bili-enter-capability").dataset.tone = view.enterAvailable ? "success" : (biliStatus.mode === "polling" ? "warning" : "muted");
  $("bili-enter-control").title = view.enterAvailable
    ? "实时连接正常，可接收进场消息"
    : (biliStatus.mode === "polling" ? "轮询接口不提供进场事件；程序正在自动重连实时通道" : "连接实时通道后可接收进场消息");
  $("bili-dot").className = `live-dot${view.connected ? " is-live" : ""}`;
  $("bili-queue-count").textContent = `等待 ${biliStatus.queue_size || 0}`;
  $("bili-processed").textContent = `已完成 ${biliStatus.processed_count || 0}`;
  $("bili-room-title").textContent = biliStatus.room_title || "尚未读取直播间标题";
  $("bili-room-label").textContent = biliStatus.active_room_id ? `正在监听 ${biliStatus.active_room_id}` : "等待连接直播间";
  renderCurrentEvent(biliStatus.current);

  const pause = $("bili-pause");
  pause.querySelector("span").textContent = view.pauseLabel;
  pause.dataset.paused = String(view.state === "paused");
  pause.disabled = view.pauseDisabled;
  $("bili-disconnect").disabled = view.disconnectDisabled;
  $("bili-connect").disabled = view.configDisabled;
  $("bili-connect").querySelector("span").textContent = view.connectLabel;
  $("bili-clear-queue").disabled = view.disconnectDisabled || !(biliStatus.queue_size > 0);
  $("bili-clear-session").disabled = view.clearSessionDisabled;
  roomInput.disabled = view.configDisabled;
  personaSelect.disabled = view.configDisabled;

  setText("bili-error", biliStatus.error || "");
  const channelNotice = biliStatus.warning || (biliStatus.mode === "polling"
    ? "普通弹幕可用；实时连接正在自动重试，恢复前无法获取进场消息。"
    : "");
  setText("bili-notice", channelNotice);
  if (biliStatus.events?.length && !$("bili-event-feed").querySelector(".live-event")) {
    biliStatus.events.slice().reverse().forEach((item) => appendBiliEvent(item, "received"));
  }
}

function resetBilibiliSessionView(message = "等待新的直播事件") {
  biliSessionEpoch += 1;
  window.PL?.stopVoicePlayback?.();
  replyRecords = [];
  $("bili-current-audio").replaceChildren();
  $("bili-event-feed").replaceChildren(empty(message));
  $("bili-reply-list").replaceChildren(empty("角色回复会以纯文本记录在这里"));
  renderCurrentEvent(null);
}

function renderCurrentEvent(event) {
  const panel = $("bili-current");
  if (!event) {
    panel.classList.add("is-empty");
    $("bili-processing").textContent = "当前空闲";
    $("bili-current-user").textContent = "等待下一条消息";
    $("bili-current-content").textContent = "队列会按接收顺序逐条交给角色。";
    return;
  }
  panel.classList.remove("is-empty");
  $("bili-processing").textContent = `正在回复 ${event.username}`;
  $("bili-current-user").textContent = event.username || "匿名观众";
  $("bili-current-content").textContent = event.content || "";
}

async function saveBilibiliConfig() {
  const status = await api(fetch("/api/integrations/bilibili/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room_id: $("bili-room-id").value.trim(),
      default_persona_id: $("bili-persona").value,
      danmaku_enabled: $("bili-danmaku").checked,
      enter_enabled: $("bili-enter").checked,
      auto_voice: $("bili-auto-voice").checked,
    }),
  }));
  delete $("bili-room-id").dataset.dirty;
  delete $("bili-persona").dataset.dirty;
  return status;
}

async function connectBilibili(event) {
  event.preventDefault();
  setCommandFeedback("正在验证直播间并建立数据通道…");
  try {
    renderBilibiliStatus(await saveBilibiliConfig());
    syncBilibiliPersona();
    renderBilibiliStatus(await postBili("connect"));
    setCommandFeedback("", false);
  } catch (reason) {
    setCommandFailure(reason, "连接失败，请检查直播间号后重试。");
  }
}

async function toggleBilibiliPause() {
  const isPaused = biliStatus.state === "paused";
  setCommandFeedback(isPaused ? "正在继续处理等待队列…" : "正在暂停队列处理…");
  try {
    renderBilibiliStatus(await postBili(isPaused ? "resume" : "pause"));
    setCommandFeedback(isPaused ? "已继续，等待消息将按原顺序处理。" : "已暂停接收后的处理；新消息仍会进入等待队列。", false);
  } catch (reason) {
    setCommandFailure(reason, isPaused ? "继续失败，请重试。" : "暂停失败，请重试。");
  }
}

async function disconnectBilibili() {
  setCommandFeedback("正在停止数据通道并清空等待队列…");
  try {
    renderBilibiliStatus(await postBili("disconnect"));
    setCommandFeedback("已断开，当前未接收直播间消息。", false);
  } catch (reason) {
    setCommandFailure(reason, "断开失败，连接可能仍在运行，请重试。");
  }
}

async function clearBilibiliQueue() {
  setCommandFeedback("正在清空等待队列…");
  try {
    renderBilibiliStatus(await postBili("queue/clear"));
    setCommandFeedback("等待队列已清空；当前处理项不受影响。", false);
  } catch (reason) {
    setCommandFailure(reason, "清空队列失败，请重试。");
  }
}

async function clearBilibiliSession() {
  const confirmed = window.confirm("清空本次直播？\n\n当前语音会立即停止，等待队列、事件流、回复记录和本次角色记忆都会被删除。直播间连接会保持。此操作不可撤销。");
  if (!confirmed) return;
  const button = $("bili-clear-session");
  button.disabled = true;
  window.PL?.stopVoicePlayback?.();
  $("bili-current-audio").replaceChildren();
  setCommandFeedback("正在丢弃当前结果并清空本次直播…");
  try {
    const status = await postBili("session/clear");
    renderBilibiliStatus(status);
    setCommandFeedback("已清空队列、事件流、回复和角色记忆；直播间连接保持不变。", false);
  } catch (reason) {
    setCommandFailure(reason, "清空失败；当前语音已停止，但后台会话可能仍保留，请重试。");
  } finally {
    button.disabled = deriveBiliViewModel(biliStatus, $("bili-room-id").value).clearSessionDisabled;
  }
}

function setCommandFeedback(message, busy = true) {
  setText("bili-error", "");
  setText("bili-action-feedback", message);
  $("bili-config-form").classList.toggle("is-busy", busy);
}

function setCommandFailure(reason, fallback) {
  $("bili-config-form").classList.remove("is-busy");
  setText("bili-action-feedback", "");
  setText("bili-error", reason?.message || reason || fallback);
}

async function postBili(path) {
  return api(fetch(`/api/integrations/bilibili/${path}`, { method: "POST", headers: { "X-YUMENO-Request": "web" } }));
}

function connectBilibiliEvents() {
  if (biliSocket && biliSocket.readyState < WebSocket.CLOSING) return;
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  biliSocket = new WebSocket(`${scheme}://${location.host}/api/integrations/bilibili/events/ws`);
  biliSocket.addEventListener("message", (message) => {
    let payload;
    try { payload = JSON.parse(message.data); } catch { return; }
    if (payload.type === "status") renderBilibiliStatus(payload.status);
    if (payload.type === "event") {
      appendBiliEvent(payload.event, "waiting");
      $("bili-queue-count").textContent = `等待 ${payload.queue_size}`;
    }
    if (payload.type === "processing") {
      updateBiliEventState(payload.event.id, "processing");
      renderCurrentEvent(payload.event);
    }
    if (payload.type === "reply") {
      updateBiliEventState(payload.event.id, "complete");
      renderBilibiliReply(payload.result, payload.event);
    }
    if (payload.type === "session.cleared") {
      renderBilibiliStatus(payload.status);
    }
    if (payload.type === "error") setText("bili-error", payload.message);
  });
  biliSocket.addEventListener("close", () => { biliSocket = null; setTimeout(connectBilibiliEvents, 1500); });
}

function appendBiliEvent(event, eventState = "waiting") {
  const feed = $("bili-event-feed");
  const existing = findEventRow(event.id);
  if (existing) { updateBiliEventState(event.id, eventState); return existing; }
  if (feed.querySelector(".empty-state")) feed.replaceChildren();
  const row = document.createElement("article");
  row.className = `live-event is-${event.kind}`;
  row.dataset.eventId = event.id;
  const kind = document.createElement("span");
  kind.className = "live-event-kind";
  kind.textContent = event.kind === "danmaku" ? "弹幕" : "进场";
  const body = document.createElement("div");
  const name = document.createElement("strong"); name.textContent = event.username;
  const content = document.createElement("p"); content.textContent = event.content;
  body.append(name, content);
  const meta = document.createElement("div"); meta.className = "live-event-meta";
  const time = document.createElement("time"); time.textContent = formatMessageTime(event.created_at);
  const badge = document.createElement("span"); badge.className = "live-event-state";
  meta.append(time, badge);
  row.append(kind, body, meta);
  feed.prepend(row);
  updateBiliEventState(event.id, eventState);
  return row;
}

function findEventRow(eventId) {
  return Array.from($("bili-event-feed").querySelectorAll(".live-event"))
    .find((row) => row.dataset.eventId === String(eventId));
}

function updateBiliEventState(eventId, eventState) {
  const row = findEventRow(eventId);
  if (!row) return;
  const labels = { waiting: "等待", processing: "处理中", complete: "完成", received: "已接收" };
  row.dataset.state = eventState;
  row.querySelector(".live-event-state").textContent = labels[eventState] || eventState;
}

async function renderBilibiliReply(result, event) {
  const record = buildReplyRecord(result, event);
  const replyEpoch = biliSessionEpoch;
  replyRecords = mergeReplyRecord(replyRecords, record, 100);
  const list = $("bili-reply-list");
  list.querySelector(`[data-reply-id="${event.id}"]`)?.remove();
  list.querySelector(".empty-state")?.remove();

  const item = document.createElement("article");
  item.className = "live-reply-record";
  item.dataset.replyId = event.id;
  const header = document.createElement("header");
  const identity = document.createElement("strong"); identity.textContent = record.username;
  const completion = document.createElement("time"); completion.textContent = formatMessageTime(record.completedAt);
  header.append(identity, completion);
  const prompt = document.createElement("p"); prompt.className = "live-reply-prompt"; prompt.textContent = record.prompt;
  const answer = document.createElement("p"); answer.className = "live-reply-answer"; answer.textContent = record.answer;
  const footer = document.createElement("footer");
  const duration = document.createElement("span");
  duration.textContent = record.elapsedSeconds === null ? "处理完成" : `耗时 ${record.elapsedSeconds} 秒`;
  footer.append(duration);
  item.append(header, prompt, answer, footer);
  list.prepend(item);
  while (list.children.length > 100) list.lastElementChild.remove();

  try {
    if (result.answer && $("bili-auto-voice").checked && typeof synthesizeAnswer === "function") {
      const audioHost = $("bili-current-audio");
      audioHost.replaceChildren();
      await synthesizeAnswer(result.answer, audioHost, { persona: biliPersona, conversationId: "bilibili-live" });
      await waitForBiliAudioIdle();
    }
  } finally {
    if (replyEpoch === biliSessionEpoch) $("bili-current-audio").replaceChildren();
    if (biliSocket?.readyState === WebSocket.OPEN) {
      biliSocket.send(JSON.stringify({ type: "audio.done", event_id: event.id }));
    }
  }
}

function syncBilibiliPersona() {
  const option = $("bili-persona")?.selectedOptions[0];
  biliPersona = option?.dataset.persona ? JSON.parse(option.dataset.persona) : null;
  window.PLLive2DHub?.setPersonaModel?.(biliPersona?.profile?.live2d?.model || null);
}

function waitForBiliAudioIdle() {
  return new Promise((resolve) => {
    const check = () => {
      if (!state.voicePlaybackActive && !(state.voicePlaybackQueue || []).length) return resolve();
      setTimeout(check, 150);
    };
    check();
  });
}

if (typeof module !== "undefined") module.exports = {
  deriveBiliViewModel,
  mergeReplyRecord,
  buildReplyRecord,
  shouldResetBiliSession,
};
