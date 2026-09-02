"use strict";
window.PL = window.PL || { modules: {} };
window.PL.modules.chat = { init: initChat, onShow: resumeChatView };

const RECENT_PERSONA_STORAGE_KEY = "yumeno:recent-persona";
function personaStorage(storage) {
  if (storage) return storage;
  try { return window.localStorage; } catch { return null; }
}
function resolveRecentPersonaId(personas, storage) {
  const items = Array.isArray(personas) ? personas.filter((item) => item?.id) : [];
  if (!items.length) return "";
  const recent = personaStorage(storage)?.getItem(RECENT_PERSONA_STORAGE_KEY) || "";
  return items.some((item) => item.id === recent) ? recent : items[0].id;
}
function rememberPersonaId(personaId, storage) {
  if (!personaId) return;
  try { personaStorage(storage)?.setItem(RECENT_PERSONA_STORAGE_KEY, personaId); } catch { /* localStorage may be unavailable */ }
}
window.PL.chatPreferences = { resolveRecentPersonaId, rememberPersonaId };

// 任务、流程和附件结果会从 SSE、HTTP 结果以及轮询三个入口抵达。
// 使用稳定 ID 做幂等合并，避免同一个 task/file 被重复追加到页面。
function stableTaskId(value) {
  const id = value?.task_id ?? value?.taskId ?? value?.id;
  return id === null || id === undefined || id === "" ? "" : String(id);
}

function uniqueByStableId(items, getId) {
  const output = [];
  const seen = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const id = getId(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    output.push(item);
  }
  return output;
}

function normalizedWaitingInputs(items) {
  return uniqueByStableId(items, (item) => String(item?.id || `${item?.kind || item?.type || "input"}:${item?.key || item?.label || item?.title || "required"}`));
}

function registerChatTask(entry) {
  const taskId = stableTaskId(entry);
  if (!taskId) return entry;
  if (!(state.chatTaskEntries instanceof Map)) state.chatTaskEntries = new Map();
  const merged = { ...(state.chatTaskEntries.get(taskId) || {}), ...(entry || {}), task_id: taskId };
  state.chatTaskEntries.set(taskId, merged);
  return merged;
}

window.PL.chatRendering = { stableTaskId, uniqueByStableId, normalizedWaitingInputs, rvcTaskEntries, resultAttachmentEntries };

let chatGlobalEventsBound = false;
let chatRenderVersion = 0;

function formatMessageTime(iso) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay ? clock : `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${clock}`;
}

function messageActionButton(label, icon, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "message-action";
  button.title = label;
  button.setAttribute("aria-label", label);
  const glyph = document.createElement("i");
  glyph.dataset.lucide = icon;
  const text = document.createElement("span");
  text.textContent = label;
  button.append(glyph, text);
  button.addEventListener("click", onClick);
  return button;
}

async function copyMessageText(text, button) {
  const label = button.querySelector("span");
  const original = label.textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.append(helper);
    helper.select();
    try { document.execCommand("copy"); } catch { /* clipboard unavailable */ }
    helper.remove();
  }
  label.textContent = "已复制";
  setTimeout(() => { label.textContent = original; }, 1200);
}

function bindChatGlobalEvents() {
  if (chatGlobalEventsBound) return;
  chatGlobalEventsBound = true;
  document.addEventListener("click", (event) => { if (!event.target.closest(".chat-persona-picker")) closePersonaMenu(); });
  // 页面背景与工具栏的滚轮统一驱动中央对话区；浮动侧栏保留自己的交互。
  document.addEventListener("wheel", (event) => {
    const view = $("chat-view");
    const region = document.querySelector("#chat-layout .chat-scroll-region");
    if (!view || view.classList.contains("is-hidden") || !region) return;
    const target = event.target;
    if (target?.closest?.("#chat-files-sidebar, #chat-context-sidebar, #chat-settings-sidebar")) return;
    if (region.contains(target)) return;
    if (event.deltaY) region.scrollTop += event.deltaY;
  }, { passive: true });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const insideUtility = target.closest?.("#chat-files-sidebar, #chat-context-sidebar, #chat-settings-sidebar, #chat-files-toggle, #chat-context-peek, #chat-settings-toggle");
    if (insideUtility) return;
    if (!$('chat-settings-sidebar')?.classList.contains("is-hidden")) setChatSettingsOpen(false);
    if (state.chatContextOpen) setChatContextOpen(false);
    if (state.chatAttachmentsOpen) setChatAttachmentsDrawer(false);
  });
}

function chatEmptyState() {
  // 空会话不再生成欢迎卡片；输入区本身就是唯一的起点。
  const node = document.createElement("div");
  node.className = "chat-empty-state";
  node.setAttribute("aria-hidden", "true");
  return node;
}

function clearChatLogContents(emptyLabel = null) {
  const log = $("chat-log");
  if (!log) return;
  // 任务工作区是聊天日志中的稳定节点，清理消息时必须保留它，
  // 否则切换角色、刷新历史或发送第一条消息后任务卡会被一起删除。
  const workspace = $("chat-task-workspace");
  log.replaceChildren();
  if (emptyLabel) log.append(chatEmptyState(emptyLabel));
  if (workspace) log.append(workspace);
}

function initChat() {
  // 对话页每次进入都从轻量状态开始，Live2D 仅由用户主动打开。
  window.PLLive2DHub?.close?.();
  state.voicePlaybackActive = false;
  state.chatAttachments = [];
  state.composerAttachmentIds = [];
  state.chatAttachmentsOpen = false;
  state.attachmentUploadPending = false;
  state.currentMediaFileId = null;
  state.chatLastFocusedElement = null;
  state.chatContextLastFocusedElement = null;
  state.chatSettingsLastFocusedElement = null;
  state.chatContextOpen = false;
  state.currentWorkflow = null;
  state.pendingRvcWorkflowEvent = null;
  state.rvcInline = null;
  state.currentTaskStatus = null;
  state.pendingInput = null;
  state.pendingInputValues = {};
  state.chatTaskEntries = new Map();
  state.voicePlaybackQueue = [];
  state.voicePlayingAudio = null;
  state.voiceStreamAbort = null;
  state.voiceFeed = null;
  state.voiceFeedFailed = false;
  state.voiceFeedFullText = "";
  clearRvcTaskPollers();
  state.rvcTaskPollers = new Map();
  state.rvcTaskPollerGeneration = (state.rvcTaskPollerGeneration || 0) + 1;
  bindChatEvents();
  bindChatGlobalEvents();
  observeChatStatus();
  updateChatStatusCard();
  renderPersonaList();
  renderChatContext();
  if (state.activePersona) {
    loadConversationMessages();
    void loadChatAttachments();
    connectRealtime();
  }
}

function resumeChatView() {
  window.PL.modules.integrations?.releaseLiveStage?.();
  if (!state.personas.length) loadPersonas();
  if (state.activePersona && !state.realtimeSocket) connectRealtime();
  updateComposerControls();
  requestAnimationFrame(() => window.PLLive2DHub?.refreshLayout?.());
}

function bindChatEvents() {
  ensureVoiceChatButton();
  $("question-form").addEventListener("submit", submitQuestion);
  $("question-form").addEventListener("click", () => { state.lastUserGestureAt = Date.now(); });
  $("question").addEventListener("input", resizeComposer);
  $("voice-chat").addEventListener("click", toggleVoiceChat);
  $("confirm-action").addEventListener("click", () => resumeAgent(true));
  $("cancel-action").addEventListener("click", () => resumeAgent(false));
  $("question").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!$("send-question").disabled) $("question-form").requestSubmit();
    }
  });
  $("clear-conversation").addEventListener("click", clearConversation);
  bindChatMaterialUpload();
  bindChatAttachmentDrawer();
  bindChatAttachmentDropzone();
  bindChatContextSidebar();
  $("chat-log")?.addEventListener("click", (event) => { const button = event.target.closest("[data-chat-prompt]"); if (!button) return; const input = $("question"); if (!input) return; input.value = button.dataset.chatPrompt || ""; resizeComposer(); input.focus(); });
  $("chat-persona-toggle").addEventListener("click", togglePersonaDrawer);
  bindChatSettingsSidebar();
}
function scheduleRealtimeReconnect() {
  clearTimeout(state.realtimeReconnectTimer);
  if (!state.activePersona || state.realtimeSocket || state.realtimeReconnectAttempts >= 3) return;
  state.realtimeReconnectAttempts += 1;
  state.realtimeReconnectTimer = setTimeout(() => {
    if (!state.activePersona || state.realtimeSocket) return;
    connectRealtime();
  }, Math.min(500 * state.realtimeReconnectAttempts, 1500));
}
function connectRealtime() {
  if (!state.activePersona) return;
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  const url = `${scheme}://${location.host}/ws/personas/${state.activePersona.id}/conversations/${state.conversationId}`;
  const socket = new WebSocket(url);
  state.realtimeSocket = socket;
  socket.addEventListener("open", () => {
    if (socket !== state.realtimeSocket) return;
    state.realtimeReconnectAttempts = 0;
    clearTimeout(state.realtimeReconnectTimer);
  });
  socket.addEventListener("message", (message) => {
    if (socket !== state.realtimeSocket) return;
    let event;
    try { event = JSON.parse(message.data); } catch { setText("chat-error", "实时会话收到无法解析的数据片段"); return; }
    try { if (event && typeof event === "object") handleRealtimeEvent(event); }
    catch (reason) { console.error("实时会话事件处理失败", reason); setText("chat-error", "实时会话事件处理失败"); }
  });
  socket.addEventListener("close", () => {
    if (socket !== state.realtimeSocket) return;
    state.realtimeSocket = null;
    if (state.realtimeSubmissionPending) failRealtimeSubmission("实时连接在接收请求前中断，请重新操作");
    if (state.realtimeTurnId) {
      state.realtimeTurnId = null;
      state.realtimeAnswerNode = null;
      setRealtimeBusy(false);
      setText("chat-error", "实时连接已中断，请重新发送消息");
    }
    state.realtimeExecutionPending = false;
    setRealtimeBusy(false);
    scheduleRealtimeReconnect();
  });
  socket.addEventListener("error", () => {
    if (socket === state.realtimeSocket) setText("chat-error", "实时连接不可用，将使用普通对话");
  });
}
function clearRvcTaskPollers() {
  state.rvcTaskPollerGeneration = (state.rvcTaskPollerGeneration || 0) + 1;
  for (const timer of state.rvcTaskPollers?.values?.() || []) clearTimeout(timer);
  state.rvcTaskPollers?.clear?.();
}
function closeRealtime() {
  clearRvcTaskPollers();
  const socket = state.realtimeSocket;
  clearTimeout(state.realtimeReconnectTimer);
  state.realtimeReconnectAttempts = 0;
  state.realtimeReconnectTimer = null;
  clearTimeout(state.realtimeAckTimer);
  state.realtimeSocket = null;
  state.realtimeTurnId = null;
  state.realtimeAnswerNode = null;
  state.realtimeExecutionPending = false;
  state.realtimeSubmissionPending = false;
  state.agentRequestPending = false;
  state.realtimePendingQuestion = "";
  state.realtimeAckTimer = null;
  resetPacing();
  setRealtimeBusy(false);
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
}
function setRealtimeBusy(busy) {
  state.realtimeBusy = busy;
  setText("question-status", busy ? "角色正在生成回复…" : "");
  if (!$("question-form")) return;
  $("question-form").classList.toggle("is-generating", busy);
  setSendButton(busy);
  $("confirm-action").disabled = busy;
  $("cancel-action").disabled = busy;
  updateComposerControls();
}
function setSendButton(busy) {
  const button = $("send-question");
  if (!button) return;
  button.classList.toggle("is-stop", busy);
  const icon = button.querySelector("i");
  if (icon) icon.dataset.lucide = busy ? "square" : "send-horizontal";
  button.title = busy ? "停止生成" : "发送";
  button.setAttribute("aria-label", button.title);
  if (window.lucide) window.lucide.createIcons();
}
function resetChatProcess() {
  updateChatStatusCard();
}
function showReplyLoading() {
  if (state.pendingReplyNode?.isConnected) return state.pendingReplyNode;

  // appendMessage 会过滤完全空白的消息；loading 卡片必须先有临时文本，
  // 否则这里拿到 null 会在发送前抛异常，导致 WebSocket 和表单清理都不会执行。
  const node = appendMessage("assistant", "正在分析请求…");
  if (!node) return null;

  node.classList.add("message-loading");
  node.dataset.pendingTurn = "1";
  const body = node.querySelector("p");
  if (body) {
    body.setAttribute("data-role", "voice-reply");
    body.textContent = "";
  }
  const processList = document.createElement("div");
  processList.className = "agent-process-list";
  processList.setAttribute("data-role", "agent-process");
  node.append(processList);
  setReplyStage(node, "正在分析请求…");
  state.pendingReplyNode = node;
  return node;
}
function replaceReplyLoading(node, text) {
  if (!node) return appendMessage("assistant", text);
  finishReply(node);
  const body = node.querySelector("p"); body.textContent = text;
  state.pendingReplyNode = null; return node;
}
function hasVisibleReply(node) {
  return Boolean(node?.querySelector('[data-role="voice-reply"]')?.textContent.trim());
}
function finishPendingReplies() {
  document.querySelectorAll("[data-pending-turn]").forEach((node) => {
    finishReply(node);
  });
}
function nodesContain(parent, child) {
  return parent === child || Boolean(parent?.contains(child));
}
function syncThinkingPreference(open) {
  document.querySelectorAll("details.agent-process-details").forEach((details) => {
    const visible = Boolean(open);
    details.open = visible;
    details.classList.toggle("is-hidden", !visible);
    details.setAttribute("aria-hidden", String(!visible));
  });
}

function syncDebugPreference(open) {
  document.querySelectorAll(".agent-debug-details").forEach((details) => {
    details.open = Boolean(open);
    details.classList.toggle("is-hidden", !open);
  });
}
function syncWorkflowPreference(open) {
  const section = $("chat-workflow-section");
  const detail = $("chat-workflow-detail");
  const toggle = $("chat-workflow-toggle");
  if (!section || !detail || !toggle || section.classList.contains("is-hidden")) return;
  const expanded = Boolean(open);
  detail.classList.toggle("is-hidden", !expanded);
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.classList.toggle("is-expanded", expanded);
}

function collapseReplyStages(node) {
  const list = node?.querySelector(".agent-process-list");
  if (!list || !list.children.length) {
    const emptyList = node?.querySelector(":scope > .agent-process-list");
    if (emptyList) emptyList.remove();
    return;
  }
  if (list.matches("details.agent-process-details") || list.parentNode?.classList?.contains("agent-process-details")) return;
  if (!list.isConnected) return;
  const ownerMessage = list.closest(".message");
  if (ownerMessage && !ownerMessage.isConnected && list.closest("details.agent-process-details")) return;
  const details = document.createElement("details");
  const thinkingVisible = readChatPreference(CHAT_PREFERENCE_KEYS.thinking, false);
  details.className = "agent-process-details" + (thinkingVisible ? "" : " is-hidden");
  details.setAttribute("data-role", "agent-process");
  details.setAttribute("aria-hidden", String(!thinkingVisible));
  details.open = thinkingVisible;
  if (nodesContain(details, list) || nodesContain(list, details)) return;
  completeReplyStages(node);
  const summary = document.createElement("summary");
  summary.textContent = `思考过程 · ${list.children.length} 步`;
  details.append(summary);
  list.replaceWith(details);
  details.append(list);
}

function finishReply(node) {
  if (!node) return;
  node.classList.remove("message-loading");
  delete node.dataset.pendingTurn;
  delete node.querySelector("p")?.dataset.stage;
  node.querySelectorAll(".thinking-indicator").forEach((item) => item.remove());
  collapseReplyStages(node);
  completeReplyStages(node);
  node.removeAttribute("aria-busy");
}
function clearStaleReplyLoading() {
  document.querySelectorAll(".message-loading[data-pending-turn]").forEach((node) => {
    if (!node.isConnected || hasVisibleReply(node) || node.querySelector(".voice-bubble-status")) return;
    node.remove();
  });
}
function handleRealtimeEvent(event) {
  if (consumeWorkflowEvent(event)) return;
  if (event.type === "session.ready") {
    state.realtimeExecutionPending = false;
    setRealtimeBusy(false);
    flushPendingVoiceQuestion();
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    return;
  }
  // 只要服务端已经发出带 turn_id 的阶段事件，就说明提交已被接收。
  // 不再把它误判为“未确认”，避免超时逻辑回填输入框或结束当前 turn。
  if (event.turn_id && state.realtimeSubmissionPending) clearRealtimeSubmission();
  if (event.type === "session.pong" || event.type === "agent.status") return;
  if (event.type === "turn.started") {
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("thinking");
    clearRealtimeSubmission();
    state.realtimeExecutionPending = false;
    state.realtimeTurnId = event.turn_id;
    state.realtimeCompletionEpoch = (state.realtimeCompletionEpoch || 0) + 1;
    state.realtimeStageEpoch = state.realtimeCompletionEpoch;
    const optimisticReply = state.pendingReplyNode?.isConnected ? state.pendingReplyNode : null;
    state.realtimeAnswerNode = optimisticReply;
    state.voiceFeed = null;
    state.voiceFeedFailed = false;
    state.voiceFeedFullText = "";
    resetPacing();
    resetChatProcess();
    if (!optimisticReply) {
      finishPendingReplies();
      state.pendingReplyNode = null;
      state.realtimeAnswerNode = showReplyLoading();
    }
    setRealtimeBusy(true);
    return;
  }
  if (event.turn_id && event.turn_id !== state.realtimeTurnId) return;
  if (event.type === "agent.stage") {
    if (state.realtimeStageEpoch === "closed") return;
    state.realtimeStageEpoch = state.realtimeCompletionEpoch || 0;
    if (!state.realtimeAnswerNode) state.realtimeAnswerNode = showReplyLoading();
    setReplyStage(state.realtimeAnswerNode, event.stage, event.details);
  } else if (event.type === "text.delta") {
    if (state.realtimeStageEpoch === "closed") return;
    state.realtimeStageEpoch = state.realtimeCompletionEpoch || 0;
    if (!state.realtimeAnswerNode) state.realtimeAnswerNode = showReplyLoading();
    if (!state.realtimeAnswerNode) return;
    state.realtimeAnswerNode.classList.remove("message-loading");
    collapseReplyStages(state.realtimeAnswerNode);
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    appendPacedText(event.text, state.realtimeAnswerNode);
    feedVoiceText(event.text);
  } else if (event.type === "text.final") {
    const finalFlow = event.workflow || event.flow;
    // RVC 的正式 handoff 可能在最终 text.final 才到达；此时接管当前
    // “正在分析请求…”气泡，而不是再创建一张顶部任务卡或第二个气泡。
    if (hasFormalRvcHandoff(event, finalFlow)) {
      handleAgentResult({ ...event, workflow: finalFlow, worker: event.worker || event.worker_name });
      state.realtimeStageEpoch = "closed";
      state.realtimeTurnId = null;
      state.realtimeExecutionPending = false;
      clearRealtimeSubmission();
      setRealtimeBusy(false);
      return;
    }
    state.realtimeStageEpoch = "closed";
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    const target = state.realtimeAnswerNode || state.pendingReplyNode || (event.answer ? showReplyLoading() : null);
    try {
      if (target) {
        const body = target.querySelector("p");
        if (body) {
          body.textContent = event.answer || "";
          delete body.dataset.stage;
        }
        finishPacing(target, event.answer || "");
        finishVoiceFeed();
        finishReply(target);
        if (state.voiceFeedFailed) {
          const fullText = (state.voiceFeedFullText || "").trim();
          if (fullText) synthesizeAnswer(fullText, target);
        }
        state.voiceFeedFailed = false;
        state.voiceFeedFullText = "";
        drainPacedText(() => { if (state.realtimeAnswerNode === target) state.realtimeAnswerNode = null; });
        appendResultDetails(target, event);
      }
      if (target && !event.answer && target.isConnected) target.remove();
    } finally {
      finishPendingReplies();
      clearStaleReplyLoading();
      state.pendingReplyNode = null;
      state.realtimeAnswerNode = null;
      state.pendingAction = null;
      state.pendingInput = null;
      state.pendingInputValues = {};
      state.confirmationResponded = false;
      renderConfirmation();
      state.realtimeTurnId = null;
      state.realtimeExecutionPending = false;
      clearRealtimeSubmission();
      setRealtimeBusy(false);
    }
  } else if (event.type === "confirmation.required") {
    state.realtimeStageEpoch = "closed";
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    state.pendingAction = { action: event.pending_action, specialist: event.specialist };
    state.pendingInput = null;
    state.pendingInputValues = {};
    finishPendingReplies();
    clearStaleReplyLoading();
    state.pendingReplyNode = null;
    state.realtimeTurnId = null;
    state.realtimeAnswerNode = null;
    state.realtimeSubmissionPending = false;
    state.agentRequestPending = false;
    clearRealtimeSubmission();
    state.confirmationResponded = false;
    state.lastUploadRequestAt = 0;
    abortVoiceStream();
    resetPacing();
    renderConfirmation();
    setRealtimeBusy(false);
  } else if (event.type === "input.required") {
    state.realtimeStageEpoch = "closed";
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    const waitingResult = { ...event, status: "waiting_input" };
    const waitingFlow = event.workflow || event.flow;
    // realtime 在 waiting_input 时不会走 handleAgentResult，而是直接发 input.required。
    // RVC 的 workflow 仍然必须由 Core Agent 已完成 handoff 后才能进入专用工作区；
    // 这里接管同一个 turn.started 创建的 assistant 气泡，禁止生成通用“缺少信息”卡片。
    if (hasFormalRvcHandoff(event, waitingFlow)) {
      handleAgentResult({ ...waitingResult, workflow: waitingFlow, worker: event.worker || event.worker_name });
      state.pendingReplyNode = null;
      state.realtimeAnswerNode = null;
      state.realtimeTurnId = null;
      state.realtimeSubmissionPending = false;
      state.agentRequestPending = false;
      state.confirmationResponded = false;
      clearRealtimeSubmission();
      abortVoiceStream();
      resetPacing();
      renderConfirmation();
      renderChatContext();
      setRealtimeBusy(false);
      return;
    }
    // 一个孤立的 rvc_worker/等待输入事件不能证明 Agent 已完成正式交接。
    // 不创建通用顶部“缺少信息”卡，也不让它把 RVC UI 提前带出来；保留
    // 原 loading 气泡，等待最终带 workflow.worker + worker 的结果。
    const waitingWorker = String(event.worker || event.worker_name || "").trim().toLowerCase();
    if (waitingWorker === "rvc_worker" || (waitingFlow && String(waitingFlow.worker || "").trim().toLowerCase() === "rvc_worker")) {
      const target = state.realtimeAnswerNode || state.pendingReplyNode;
      if (target) setReplyStage(target, "正在分析请求…");
      return;
    }
    state.pendingInput = waitingResult;
    state.pendingInputValues = { ...(state.pendingInputValues || {}), ...(event.selected_options || {}) };
    state.pendingAction = null;
    if (state.realtimeAnswerNode) finishReply(state.realtimeAnswerNode);
    const node = state.realtimeAnswerNode || state.pendingReplyNode || appendMessage("assistant", event.answer || "");
    state.pendingReplyNode = null;
    state.realtimeAnswerNode = null;
    if (event.answer) {
      const body = node.querySelector("p");
      if (body) body.textContent = event.answer;
    }
    finishReply(node);
    appendWaitingInputCard(node, waitingResult);
    finishPendingReplies();
    clearStaleReplyLoading();
    state.realtimeTurnId = null;
    state.realtimeSubmissionPending = false;
    state.agentRequestPending = false;
    state.confirmationResponded = false;
    clearRealtimeSubmission();
    abortVoiceStream();
    resetPacing();
    renderConfirmation();
    renderChatContext();
    setRealtimeBusy(false);
  } else if (event.type === "turn.cancelled") {
    state.realtimeStageEpoch = "closed";
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    resetPacing();
    finishPendingReplies();
    state.pendingReplyNode = null;
    state.realtimeTurnId = null;
    state.realtimeAnswerNode = null;
    state.realtimeExecutionPending = true;
    state.lastUploadRequestAt = 0;
    setRealtimeBusy(false);
  } else if (event.type === "upload.request") {
    state.lastUploadRequestAt = Date.now();
    state.pendingUploadRequest = { ...event, accepted_file_types: event.accepted_file_types || event.accepted_types || null };
    const uploadInput = $("chat-voice-material");
    if (uploadInput && Array.isArray(state.pendingUploadRequest.accepted_file_types) && state.pendingUploadRequest.accepted_file_types.length) {
      uploadInput.accept = state.pendingUploadRequest.accepted_file_types.join(",");
    }
    if (event.purpose === "voice_material") {
      const sessionId = event.session_id || null;
      state.voiceCloneSessionId = sessionId;
      window.PL.chat = window.PL.chat || {};
      window.PL.chat.voiceCloneSessionId = sessionId;
    }
    const accepted = Array.isArray(state.pendingUploadRequest.accepted_file_types) ? state.pendingUploadRequest.accepted_file_types.join(", ") : "支持图片、音频、视频、文档";
    const target = state.realtimeAnswerNode || state.pendingReplyNode;
    setReplyStage(target, event.message || `等待上传${event.purpose ? `（${event.purpose}）` : "文件"}…`);
    setText("question-status", `请选择文件：${accepted}。也可以点击输入框左侧 + 上传。`);
    if (Date.now() - state.lastUserGestureAt < 5000 && !state.chatVoiceUploadOpen) openChatVoiceUpload();
  } else if (event.type === "error") {
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    if (state.realtimeSubmissionPending) failRealtimeSubmission(event.message || "实时会话未接收消息，请重新发送");
    setText("chat-error", event.message || "实时会话发生错误");
    if (event.code === "turn_in_progress") {
      if (state.realtimeTurnId) setRealtimeBusy(true);
      else {
        state.realtimeExecutionPending = true;
        updateComposerControls();
      }
      return;
    }
    state.realtimeTurnId = null;
    finishPendingReplies();
    state.pendingReplyNode = null;
    state.realtimeAnswerNode = null;
    if ((state.pendingAction || state.pendingInput) && event.code !== "turn_in_progress") {
      state.pendingAction = null;
      state.pendingInput = null;
      state.pendingInputValues = {};
      state.confirmationResponded = false;
      renderConfirmation();
      updateComposerControls();
    }
    state.realtimeExecutionPending = false;
    setRealtimeBusy(false);
  }
}
function sendRealtime(payload) {
  if (state.realtimeSocket?.readyState !== WebSocket.OPEN) return false;
  try { state.realtimeSocket.send(JSON.stringify(payload)); return true; }
  catch { return false; }
}
function clearRealtimeSubmission() {
  clearTimeout(state.realtimeAckTimer);
  state.realtimeAckTimer = null;
  state.realtimeSubmissionPending = false;
  state.agentRequestPending = false;
  state.realtimePendingQuestion = "";
  updateComposerControls();
}
function failRealtimeSubmission(message) {
  // 文本已经在 sendQuestionText 中加入消息流；失败时不要再写回输入框，
  // 否则用户会看到“消息既已发送又仍留在输入框”的重复状态。
  clearRealtimeSubmission();
  setText("chat-error", message);
  setRealtimeBusy(false);
}
function awaitRealtimeAcknowledgement(question) {
  state.realtimeSubmissionPending = true;
  state.agentRequestPending = true;
  state.realtimePendingQuestion = question;
  clearTimeout(state.realtimeAckTimer);
  // 首个模型阶段可能受 provider 冷启动影响。这里只报告连接超时，
  // 不主动关闭 WebSocket：关闭会取消服务端正在执行的 turn，导致永远收不到最终回复。
  state.realtimeAckTimer = setTimeout(() => {
    if (!state.realtimeSubmissionPending) return;
    failRealtimeSubmission("实时会话仍在等待服务端响应，请查看消息流或稍后重试");
  }, 20000);
  updateComposerControls();
}
function cancelRealtimeTurn() {
  stopVoicePlayback();
  if (state.agentStreamController) { state.agentStreamController.abort(); state.agentStreamController = null; }
  if (state.realtimeTurnId) sendRealtime({ type: "generation.cancel" });
}

function setReplyStage(node, stage, details = null) {
  if (!node) return;
  const list = node.querySelector(".agent-process-list");
  if (!list) return;
  const label = stage || "正在分析请求…";
  const stageKey = String(label).replace(/\.{3}/g, "…").replace(/\s+/g, " ").trim();
  const group = stageGroupFor(stageKey);
  const detail = formatStageDetail(details);
  // 同一阶段可能同时来自 turn.started、graph stage 和最终结果。
  // 只更新现有行，不把“正在分析请求…”重复堆叠成两行。
  const existing = Array.from(list.children).find((item) => item.dataset.stageKey === stageKey);
  if (existing) {
    existing.classList.add("is-active");
    existing.querySelector(".agent-process-text")?.replaceChildren(document.createTextNode(stageKey));
    const meta = existing.querySelector(".agent-process-meta");
    if (meta && detail) meta.textContent = detail;
    list.querySelectorAll(".agent-process-item.is-active").forEach((item) => {
      if (item !== existing) {
        item.classList.remove("is-active");
        item.classList.add("is-done");
      }
    });
    list.append(existing);
  } else {
    const item = document.createElement("div");
    item.className = "agent-process-item is-active";
    item.dataset.stage = stageKey;
    item.dataset.stageKey = stageKey;
    item.dataset.group = group;
    item.title = label;
    item.dataset.startedAt = String(performance.now());
    const glyph = document.createElement("span");
    glyph.className = "agent-process-spinner";
    const text = document.createElement("span");
    text.className = "agent-process-text";
    item.append(glyph, text);
    list.querySelectorAll(".agent-process-item.is-active").forEach((previous) => {
      previous.classList.remove("is-active");
      const spinner = previous.querySelector(".agent-process-spinner");
      if (spinner) {
        spinner.classList.remove("agent-process-spinner");
        spinner.classList.add("agent-process-check");
      }
      previous.classList.add("is-done");
    });
    text.textContent = stageKey;
    const meta = document.createElement("span");
    meta.className = "agent-process-meta";
    meta.textContent = detail || group;
    item.append(meta);
    list.append(item);
    while (list.children.length > 6) list.firstElementChild.remove();
  }
  list.lastElementChild?.scrollIntoView({ block: "nearest" });
  list.scrollTop = list.scrollHeight;
}

function stageGroupFor(stage) {
  const value = String(stage || "");
  if (value.includes("已识别")) return "意图";
  if (/知识|检索|搜索|资料|文档/.test(value)) return "检索";
  if (/记忆/.test(value)) return "记忆";
  if (/档案|人设/.test(value)) return "档案";
  if (/声音|音色|克隆/.test(value)) return "声音";
  if (/配置/.test(value)) return "配置";
  return "生成";
}

function formatStageDetail(details) {
  if (details == null) return "";
  if (typeof details === "string") return details.trim();
  if (Array.isArray(details)) return details.map(formatStageDetail).filter(Boolean).join(" · ");
  if (typeof details === "object") {
    return Object.entries(details)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${key}: ${formatStageDetail(value)}`)
      .join(" · ");
  }
  return String(details);
}

function clearReplyStage(node) {
  if (!node) return;
  node.querySelector(".agent-process-list")?.replaceChildren();
}

function completeReplyStages(node) {
  if (!node) return;
  const list = node.querySelector(".agent-process-list");
  if (!list) return;
  list.querySelectorAll(".agent-process-item.is-active").forEach((item) => {
    item.classList.remove("is-active");
    item.classList.add("is-done");
    const spinner = item.querySelector(".agent-process-spinner");
    if (spinner) {
      spinner.classList.remove("agent-process-spinner");
      spinner.classList.add("agent-process-check");
    }
  });
}
function stopVoicePlayback() {
  abortVoiceStream();
  const current = state.voicePlayingAudio;
  if (current) { try { current.pause(); } catch {} }
  state.voicePlayingAudio = null;
  state.voicePlaybackActive = false;
  state.voicePlaybackQueue = [];
  state.voicePlaybackEpoch += 1;
}
window.PL.stopVoicePlayback = stopVoicePlayback;
function appendPacedText(text, node) {
  if (!text) return;
  const target = node || state.paceNode || state.realtimeAnswerNode;
  if (!target) return;
  target.querySelector("p").append(document.createTextNode(text));
}
function drainPacedText(done) {
  done?.();
}
function finishPacing(node, fullAnswer) {
  if (fullAnswer && !node.querySelector("p").textContent && !state.textPaceBuffer) {
    state.textPaceBuffer = fullAnswer;
  }
}
function resetPacing() {
  state.textPaceBuffer = "";
  state.paceCharsPerTick = 1;
  state.paceNode = null;
}
function updateChatStatusCard() {
  const status = $("chat-inline-status");
  if (!status) return;
  const hasStatus = ["audio-status", "question-status", "chat-error"].some((id) => $(id)?.textContent.trim());
  status.classList.toggle("is-hidden", !hasStatus);
}
function observeChatStatus() {
  const targets = ["audio-status", "question-status", "chat-error"].map((id) => $(id)).filter(Boolean);
  if (!targets.length) return;
  const observer = new MutationObserver(() => updateChatStatusCard());
  targets.forEach((node) => observer.observe(node, { childList: true, characterData: true, subtree: true }));
}
function updateComposerControls() {
  if (!$("question-form")) return;
  const conversationBusy = isConversationBusy() && !(state.pendingInput && state.rvcInline);
  const voiceActive = state.voiceActive;
  $("question-form").classList.toggle("is-voice-active", voiceActive);
  if ($("voice-chat")) {
    $("voice-chat").disabled = !state.asrConfigured || !state.activePersona;
  }
  $("send-question").classList.toggle("is-hidden", voiceActive);
  $("send-question").disabled = conversationBusy || !state.activePersona;
  // 等待输入时仍必须允许上传附件；否则 waiting_input 卡片中的“上传文件”无法工作。
  const attachmentBusy = Boolean(state.attachmentUploadPending);
  $("chat-attachment").disabled = attachmentBusy || !state.activePersona;
  $("confirm-action").disabled = state.realtimeBusy || voiceActive;
  $("cancel-action").disabled = state.realtimeBusy || voiceActive;
}
function isConversationBusy() {
  return state.realtimeBusy || state.agentRequestPending || state.realtimeSubmissionPending || state.realtimeExecutionPending || Boolean(state.pendingAction || state.pendingInput);
}
function ensureVoiceChatButton() {
  if ($("voice-chat") || !$("send-question")) return;
  const button = document.createElement("button");
  button.id = "voice-chat";
  button.type = "button";
  button.className = "icon-button";
  button.title = "语音模式";
  button.setAttribute("aria-label", "语音模式");
  button.disabled = true;
  const icon = document.createElement("i");
  icon.dataset.lucide = "audio-lines";
  button.append(icon);
  $("send-question").insertAdjacentElement("beforebegin", button);
  icons();
}
function renderVoiceChatButton() {
  const button = $("voice-chat");
  if (!button) return;
  const active = state.voiceActive;
  button.classList.toggle("is-active", active);
  button.title = active ? "停止语音模式" : "语音模式";
  button.setAttribute("aria-label", button.title);
  const input = $("question");
  if (input) {
    input.readOnly = active;
    input.placeholder = active ? "语音模式：随时说话，说完自动发送" : "输入消息，Enter 发送";
  }
}
async function toggleVoiceChat() {
  if (state.voiceActive) {
    stopVoiceChat();
    return;
  }
  await startVoiceChat();
}
async function startVoiceChat() {
  if (state.voiceActive || !state.asrConfigured || !state.activePersona || isConversationBusy()) return;
  setText("chat-error");
  const stream = new window.PLVoiceStream({
    onState: (voiceState) => {
      if (window.PLLive2DHub) window.PLLive2DHub.setVoiceState(voiceState);
      if (voiceState === "speaking") {
        stopVoicePlayback();
        setText("audio-status", "正在听…");
      }
      else if (voiceState === "ready") setText("audio-status", "就绪，请说话");
      else setText("audio-status", "正在准备语音识别…");
    },
    onPartial: (text) => {
      $("question").value = text;
      resizeComposer();
    },
    onFinal: (message) => {
      const text = (message.text || "").trim();
      if (text) submitVoiceFinal(text);
    },
    onError: (message, code) => {
      if (code === "empty") {
        setText("audio-status", "没听清，请再说一次");
        return;
      }
      setText("chat-error", message);
      stopVoiceChat();
    },
    onClosed: () => {
      state.voiceStream = null;
      state.voiceActive = false;
      renderVoiceChatButton();
      updateComposerControls();
    },
  });
  state.voiceStream = stream;
  const started = await stream.start();
  if (!started) {
    state.voiceStream = null;
    renderVoiceChatButton();
    updateComposerControls();
    return;
  }
  state.voiceActive = true;
  setText("audio-status", "正在准备语音识别…");
  renderVoiceChatButton();
  updateComposerControls();
}
function stopVoiceChat() {
  if (window.PLLive2DHub) window.PLLive2DHub.setVoiceState("idle");
  clearTimeout(state.voiceFlushTimer);
  state.voiceFlushTimer = null;
  const stream = state.voiceStream;
  state.voiceStream = null;
  state.voiceActive = false;
  if (stream) stream.stop();
  const input = $("question");
  if (input) input.value = "";
  resizeComposer();
  setText("audio-status");
  renderVoiceChatButton();
  updateComposerControls();
}
function submitVoiceFinal(text) {
  $("question").value = "";
  resizeComposer();
  if (isConversationBusy()) {
    state.pendingVoiceQuestion = text;
    cancelRealtimeTurn();
    setText("audio-status", "正在打断上一轮回复…");
    schedulePendingVoiceFlush();
    return;
  }
  sendQuestionText(text);
}
function schedulePendingVoiceFlush() {
  clearTimeout(state.voiceFlushTimer);
  state.voiceFlushTimer = setTimeout(() => {
    state.voiceFlushTimer = null;
    if (!state.pendingVoiceQuestion) return;
    if (isConversationBusy()) { schedulePendingVoiceFlush(); return; }
    flushPendingVoiceQuestion();
  }, 400);
}
function flushPendingVoiceQuestion() {
  const question = state.pendingVoiceQuestion;
  if (!question) return;
  state.pendingVoiceQuestion = "";
  sendQuestionText(question);
}function togglePersonaDrawer() {
  const menu = $("chat-persona-menu");
  const open = menu.classList.toggle("is-hidden");
  $("chat-persona-toggle").setAttribute("aria-expanded", String(!open));
}
function closePersonaMenu() { $("chat-persona-menu").classList.add("is-hidden"); $("chat-persona-toggle").setAttribute("aria-expanded", "false"); }
const CHAT_PREFERENCE_KEYS = {
  voice: "yumeno:assistant-voice",
  live2d: "yumeno:chat-live2d",
  thinking: "yumeno:chat-thinking-expanded",
  workflow: "yumeno:chat-workflow-expanded",
  debug: "yumeno:chat-debug-visible",
};
function readChatPreference(key, fallback = false) {
  try { return localStorage.getItem(key) === "on" ? true : localStorage.getItem(key) === "off" ? false : fallback; } catch { return fallback; }
}
function writeChatPreference(key, value) {
  try { localStorage.setItem(key, value ? "on" : "off"); } catch { /* storage may be unavailable */ }
}
function bindChatSettingsSidebar() {
  const button = $("chat-settings-toggle");
  if (!button || button.dataset.bound === "true") return;
  button.dataset.bound = "true";
  const voice = $("assistant-voice-toggle");
  const live2d = $("chat-live2d-setting");
  const thinking = $("chat-thinking-setting");
  const workflow = $("chat-workflow-setting");
  const debug = $("chat-debug-setting");
  if (voice) { voice.checked = readChatPreference(CHAT_PREFERENCE_KEYS.voice, true); voice.addEventListener("change", () => writeChatPreference(CHAT_PREFERENCE_KEYS.voice, voice.checked)); }
  if (live2d) {
    live2d.checked = readChatPreference(CHAT_PREFERENCE_KEYS.live2d, false);
    const setLive2dVisibility = (open) => {
      writeChatPreference(CHAT_PREFERENCE_KEYS.live2d, open);
      if (!open) { window.PLLive2DHub?.close?.(); return; }
      const tryOpen = (attempt = 0) => {
        if (window.PLLive2DHub?.open) window.PLLive2DHub.open();
        else if (attempt < 12) setTimeout(() => tryOpen(attempt + 1), 150);
      };
      requestAnimationFrame(() => tryOpen());
    };
    live2d.addEventListener("change", () => setLive2dVisibility(live2d.checked));
    if (live2d.checked) setLive2dVisibility(true);
  }
  if (thinking) { thinking.checked = readChatPreference(CHAT_PREFERENCE_KEYS.thinking, false); syncThinkingPreference(thinking.checked); thinking.addEventListener("change", () => { writeChatPreference(CHAT_PREFERENCE_KEYS.thinking, thinking.checked); syncThinkingPreference(thinking.checked); }); }
  if (workflow) { workflow.checked = readChatPreference(CHAT_PREFERENCE_KEYS.workflow, false); workflow.addEventListener("change", () => { writeChatPreference(CHAT_PREFERENCE_KEYS.workflow, workflow.checked); syncWorkflowPreference(workflow.checked); }); }
  if (debug) { debug.checked = readChatPreference(CHAT_PREFERENCE_KEYS.debug, false); debug.addEventListener("change", () => { writeChatPreference(CHAT_PREFERENCE_KEYS.debug, debug.checked); syncDebugPreference(debug.checked); }); }
  document.addEventListener("yumeno:live2d-visibility", (event) => {
    const open = Boolean(event.detail?.open);
    if (live2d) live2d.checked = open;
    writeChatPreference(CHAT_PREFERENCE_KEYS.live2d, open);
  });
  $("chat-settings-close")?.addEventListener("click", () => setChatSettingsOpen(false));
  $("chat-settings-backdrop")?.addEventListener("click", () => setChatSettingsOpen(false));
  $("chat-open-full-settings")?.addEventListener("click", () => { setChatSettingsOpen(false); window.switchView?.("settings"); });
  $("chat-open-providers")?.addEventListener("click", () => { setChatSettingsOpen(false); window.switchView?.("providers"); });
  button.addEventListener("click", (event) => { event.stopPropagation(); setChatSettingsOpen($("chat-settings-sidebar")?.classList.contains("is-hidden") ?? true); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("chat-settings-sidebar")?.classList.contains("is-hidden")) setChatSettingsOpen(false); });
  renderChatSettingsStatus();
  void loadChatProviderStatus();
}
function setChatSettingsOpen(open) {
  const sidebar = $("chat-settings-sidebar");
  const button = $("chat-settings-toggle");
  const backdrop = $("chat-settings-backdrop");
  if (!sidebar || !button) return;
  if (open) {
    state.chatSettingsLastFocusedElement = document.activeElement;
  }
  sidebar.classList.toggle("is-hidden", !open);
  sidebar.setAttribute("aria-hidden", String(!open));
  button.setAttribute("aria-expanded", String(Boolean(open)));
  backdrop?.classList.toggle("is-hidden", !open);
  if (open) { renderChatSettingsStatus(); void loadChatProviderStatus(); $("chat-settings-close")?.focus(); }
  else { (state.chatSettingsLastFocusedElement || button)?.focus?.(); state.chatSettingsLastFocusedElement = null; }
}
function renderChatSettingsStatus() {
  const persona = $("chat-setting-persona");
  const attachments = $("chat-setting-attachments");
  const tasks = $("chat-setting-tasks");
  if (persona) persona.textContent = state.activePersona?.name || "未选择";
  if (attachments) attachments.textContent = `${(state.chatAttachments || []).length} 个`;
  if (tasks) {
    const active = [...(state.chatTaskEntries instanceof Map ? state.chatTaskEntries.values() : [])].filter((item) => !CHAT_FLOW_TERMINAL.has(String(item?.status || item?.state || "").toLowerCase()));
    tasks.textContent = active.length ? `${active.length} 个进行中` : state.pendingInput || state.pendingAction ? "等待你的操作" : "无活动任务";
  }
}
function providerEndpointLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "未设置";
  try {
    const url = new URL(text);
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch { return text.length > 42 ? `${text.slice(0, 39)}…` : text; }
}
function activeProvider(providers, type) {
  const list = providers.filter((item) => item?.type === type);
  return list.find((item) => item.is_active) || list.find((item) => item.is_configured) || null;
}
async function loadChatProviderStatus() {
  const stateLabel = $("chat-setting-provider-state");
  const llmProvider = $("chat-setting-llm-provider");
  const llmModel = $("chat-setting-llm-model");
  const llmEndpoint = $("chat-setting-llm-endpoint");
  const embedding = $("chat-setting-embedding");
  const search = $("chat-setting-search");
  if (!stateLabel || !llmProvider) return;
  try {
    const response = await fetch("/api/providers/list", { headers: { "X-YUMENO-Request": "web" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const providers = Array.isArray(payload?.providers) ? payload.providers : [];
    const llm = activeProvider(providers, "llm");
    const embed = activeProvider(providers, "embedding");
    const webSearch = activeProvider(providers, "web_search");
    if (llm) {
      llmProvider.textContent = `${llm.name || llm.id}${llm.is_active ? " · 已启用" : " · 已配置"}`;
      if (llmModel) llmModel.textContent = llm.current_model || llm.default_model || "未设置";
      if (llmEndpoint) llmEndpoint.textContent = providerEndpointLabel(llm.current_base_url || llm.default_base_url);
    } else {
      llmProvider.textContent = "未配置";
      if (llmModel) llmModel.textContent = "未配置";
      if (llmEndpoint) llmEndpoint.textContent = "未配置";
    }
    if (embedding) embedding.textContent = embed ? `${embed.name || embed.id} · ${embed.current_model || embed.default_model || "默认模型"}` : "未启用";
    if (search) search.textContent = webSearch ? `${webSearch.name || webSearch.id}${webSearch.is_active ? " · 已启用" : " · 已配置"}` : "未启用";
    stateLabel.textContent = llm?.is_active ? "运行中" : llm ? "已配置" : "未配置";
  } catch (error) {
    stateLabel.textContent = "读取失败";
    llmProvider.textContent = "无法读取供应商状态";
    if (llmModel) llmModel.textContent = "—";
    if (llmEndpoint) llmEndpoint.textContent = "—";
    if (embedding) embedding.textContent = "—";
    if (search) search.textContent = "—";
    console.warn("读取对话供应商状态失败", error);
  }
}
async function selectPersona(personaId = "") {
  chatRenderVersion += 1;
  stopVoiceChat();
  stopVoicePlayback();
  resetPacing();
  finishPendingReplies();
  setText("audio-status");
  if (state.agentStreamController) {
    state.agentStreamController.abort();
    state.agentStreamController = null;
  }
  state.agentRequestPending = false;
  state.pendingReplyNode = null;
  state.voiceCloneSessionId = null;
  window.PL.chat = window.PL.chat || {};
  window.PL.chat.voiceCloneSessionId = null;
  state.chatAttachments = [];
  state.composerAttachmentIds = [];
  state.currentWorkflow = null;
  state.rvcInline = null;
  state.currentTaskStatus = null;
  setChatContextOpen(false);
  renderChatAttachments();
  clearRvcTaskPollers();
  closeRealtime();
  state.activePersona = state.personas.find((item) => item.id === personaId) || null;
  rememberPersonaId(state.activePersona?.id);
  if (state.activePersona) {
    const key = `yumeno:conversation:${state.activePersona.id}`;
    state.conversationId = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, state.conversationId);
  } else state.conversationId = crypto.randomUUID();
  state.realtimeTurnId = null;
  state.realtimeAnswerNode = null;
  state.agentRequestPending = false;
  state.pendingAction = null;
  state.pendingInput = null;
  state.pendingInputValues = {};
  state.confirmationResponded = false;
  renderConfirmation(); renderChatContext(); renderPersonaList();
  if (window.PLLive2DHub) {
    window.PLLive2DHub.setPersonaModel(state.activePersona?.profile?.live2d?.model || null);
  }
  $("chat-title").textContent = state.activePersona?.name || "选择角色";
  renderChatSettingsStatus();
  $("send-question").disabled = !state.activePersona;
  clearChatLogContents(state.activePersona ? "从一句话开始" : "选择角色后开始聊天");
  $("clear-conversation").disabled = !state.activePersona;
  closePersonaMenu();
  if (state.activePersona) { await loadConversationMessages(); await loadChatAttachments(); connectRealtime(); }
  updateComposerControls();
}
async function submitQuestion(event) {
  event.preventDefault(); if (!state.activePersona) return;
  if ($("send-question")?.classList.contains("is-stop")) {
    void cancelActiveChatTask();
    return;
  }
  const question = $("question").value.trim(); if (!question) return;  // RVC 正在运行时，输入新问题表示放弃当前生成；不要把“什么情况”等新消息
  // 再投递给旧的 waiting checkpoint。等待明确输入（上传/确认/模型）时仍保留
  // 自然语言继续 workflow 的能力。
  const rvcPhaseNow = String(state.rvcInline?.state?.phase || "").toLowerCase();
  if (state.rvcInline && ["processing", "preparing", "extracting", "normalizing", "separating", "converting", "running"].includes(rvcPhaseNow)) {
    await cancelActiveChatTask();
    state.rvcInline = null;
  }  // 新消息优先：上一轮仍在生成且未等待用户输入时，先取消旧 turn。
  if ((state.realtimeBusy || state.agentRequestPending || state.realtimeSubmissionPending || state.realtimeExecutionPending)
      && !state.pendingInput && !state.pendingAction) {
    await cancelActiveChatTask();
    if (!state.activePersona) return;
  }
  // 等待 Worker 输入时允许自然语言回答，继续当前 Agent checkpoint。
  if (state.pendingInput && state.rvcInline && !state.voiceActive) {
    $("question-form").reset();
    appendMessage("user", question);
    state.pendingInputValues = { ...(state.pendingInputValues || {}), user_message: question, text: question };
    state.confirmationResponded = false;
    updateComposerControls();
    try { await resumeAgent(null, { forceHttp: true }); }
    catch (error) { setText("chat-error", error.message || String(error), true); }
    return;
  }
  if (isConversationBusy() || state.voiceActive) return;
  sendQuestionText(question);
}function sendQuestionText(question) {
  // 生成完成后，新的无关话题或“完成”表达会释放当前挂载，避免旧任务污染下一轮对话。
  // 已结束的 RVC 流程只保留在结果/附件中，不应污染下一轮普通对话的任务栏。
  if (state.currentWorkflow && CHAT_FLOW_TERMINAL.has(state.currentWorkflow.status)) {
    state.currentWorkflow = null;
  state.rvcInline = null;
    state.currentTaskStatus = null;
    renderChatContext();
  }
  chatRenderVersion += 1;
  stopVoicePlayback();
  resetPacing();
  state.agentRequestPending = true;
  // 新一轮请求开始时丢弃上一轮尚未完成的 RVC handoff，避免过期事件污染当前对话。
  state.pendingRvcWorkflowEvent = null;
  state.agentStageEpoch = null;
  const selected = selectedAttachments();
  if (selected.some((item) => item.status === "uploading")) {
    setText("chat-error", "附件仍在上传，请稍候再发送。", true);
    return;
  }
  const attachments = selected.filter((item) => ["ready", "selected", "completed"].includes(item.status));
  const attachmentIds = attachments.map((item) => item.file_id).filter((id) => id && !String(id).startsWith("upload-"));
  // 先清空已发送文本，避免后续 UI 渲染异常时把用户输入残留在输入框。
  $("question-form").reset();
  appendMessage("user", question, undefined, attachments);
  resetChatProcess();
  showReplyLoading();
  setText("chat-error");
  updateComposerControls();
  if (/克隆音色|音色克隆|克隆声音|声音克隆|训练音色|音色训练|语音克隆/.test(question)) {
    setReplyStage(state.pendingReplyNode, "已识别为声音克隆，正在准备上传会话…");
  }
  if (sendRealtime({ type: "text.submit", question, attachment_ids: attachmentIds })) {
    awaitRealtimeAcknowledgement(question);
    clearSelectedAttachments(); resizeComposer();
    return;
  }
  void streamAgentQuery(question, attachmentIds);
  clearSelectedAttachments(); resizeComposer();
}

async function streamAgentQuery(question, attachmentIds = []) {
  state.agentRequestPending = true;
  const controller = new AbortController();
  state.agentStreamController = controller;
  setSendButton(true);
  try {
    const response = await fetch(`/api/personas/${state.activePersona.id}/agent/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify({ question, conversation_id: state.conversationId, attachment_ids: attachmentIds }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `HTTP ${response.status}`);
    if (!response.body) throw new Error("浏览器不支持流式响应");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop();
      for (const part of parts) {
        const line = part.split("\n").find((item) => item.startsWith("data: "));
        if (!line) continue;
        let event;
        try { event = JSON.parse(line.slice(6)); } catch { continue; }
        handleAgentStreamEvent(event);
      }
    }
  } catch (reason) {
    if (reason && reason.name !== "AbortError") setText("chat-error", reason.message || reason);
  } finally {
    state.agentStreamController = null;
    state.agentRequestPending = false;
    if (!state.realtimeTurnId) {
      finishPendingReplies();
      state.pendingReplyNode = null;
    }
    setSendButton(false);
    updateComposerControls();
  }
}

function handleAgentStreamEvent(event) {
  if (consumeWorkflowEvent(event)) return;
  if (event.kind === "upload_request" && event.purpose === "voice_material") {
    const sessionId = event.session_id || null;
    state.voiceCloneSessionId = sessionId;
    window.PL.chat = window.PL.chat || {};
    window.PL.chat.voiceCloneSessionId = sessionId;
    state.lastUploadRequestAt = Date.now();
    if (Date.now() - state.lastUserGestureAt < 5000 && !state.chatVoiceUploadOpen) openChatVoiceUpload();
    setReplyStage(state.pendingReplyNode, "已识别为声音克隆，正在准备素材上传…");
    setText("question-status", "请选择视频或音频素材，或点击输入框左侧 + 上传。");
    return;
  }
  if (event.kind === "stage") {
    if (state.agentStageEpoch === "closed") return;
    state.agentStageEpoch = "open";
    if (!state.pendingReplyNode) state.pendingReplyNode = showReplyLoading();
    setReplyStage(state.pendingReplyNode, event.stage, event.details);
  } else if (event.kind === "token") {
    if (state.agentStageEpoch === "closed") return;
    state.agentStageEpoch = "open";
    if (!state.pendingReplyNode) state.pendingReplyNode = showReplyLoading();
    if (!state.pendingReplyNode) return;
    state.pendingReplyNode.classList.remove("message-loading");
    collapseReplyStages(state.pendingReplyNode);
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    appendPacedText(event.text, state.pendingReplyNode);
    feedVoiceText(event.text);
  } else if (event.kind === "result") {
    state.agentStageEpoch = "closed";
    handleAgentResult(event.result);
    clearStaleReplyLoading();
    if (state.pendingReplyNode) {
      finishReply(state.pendingReplyNode);
      state.pendingReplyNode = null;
    }
  } else if (event.kind === "error") {
    state.agentStageEpoch = "closed";
    setText("chat-error", event.message || event.error || "生成失败");
    finishPendingReplies();
    state.pendingReplyNode = null;
  }
}
function resizeComposer() {
  const input = $("question");
  input.style.height = "0px";
  const height = Math.min(Math.max(input.scrollHeight, 40), 200);
  input.style.height = `${height}px`;
  input.style.overflowY = input.scrollHeight > 200 ? "auto" : "hidden";
}
function appendMessage(type, text, createdAt, attachments = []) {
  if (!String(text || "").trim() && !attachments?.length) return null;
  if ($("chat-log").querySelector(".empty-state, .chat-empty-state")) clearChatLogContents();
  const node = document.createElement("article");
  node.className = `message message-${type}`;
  const body = document.createElement("p");
  body.textContent = text;
  node.append(body);
  if (attachments?.length) {
    const attachmentGroup = document.createElement("div");
    attachmentGroup.className = "message-attachments";
    attachments.forEach((item) => attachmentGroup.append(createAttachmentPreview(item, { compact: true })));
    node.append(attachmentGroup);
  }
  const actions = document.createElement("footer");
  actions.className = "message-actions";
  const stamp = document.createElement("time");
  stamp.className = "message-time";
  stamp.dateTime = createdAt || new Date().toISOString();
  stamp.textContent = formatMessageTime(createdAt);
  actions.append(stamp);
  actions.append(messageActionButton("复制", "copy", (event) => {
    copyMessageText(node.querySelector('[data-role="voice-reply"]')?.textContent ?? text, event.currentTarget);
  }));
  if (type === "user") {
    actions.append(messageActionButton("编辑", "pencil", () => {
      const input = $("question");
      if (!input) return;
      input.value = text;
      resizeComposer();
      input.focus();
      input.scrollIntoView({ block: "center" });
    }));
  }
  node.append(actions);
  $("chat-log").append(node);
  node.scrollIntoView({ block: "nearest" });
  icons();
  return node;
}
function loadAudioSource(audio, url) {
  if (!url) return Promise.resolve();
  const key = `${Date.now()}-${Math.random()}`;
  audio.dataset.srcKey = key;
  return fetch(url)
    .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.blob(); })
    .then((blob) => {
      if (audio.dataset.srcKey !== key) return;
      if (audio.srcObjectUrl) URL.revokeObjectURL(audio.srcObjectUrl);
      audio.srcObjectUrl = URL.createObjectURL(blob);
      audio.src = audio.srcObjectUrl;
    })
    .catch(() => { if (audio.dataset.srcKey === key) audio.src = url; });
}
function playAudioRobust(audio) {
  const playOnce = () => audio.play().catch((error) => {
    if (error && error.name === "NotAllowedError") {
      audio.muted = true;
      return audio.play().then(() => { audio.muted = false; }).catch(() => {});
    }
    throw error;
  });
  if (audio.readyState >= 1) return playOnce();
  return new Promise((resolve) => {
    audio.addEventListener("loadedmetadata", () => resolve(playOnce()), { once: true });
    audio.addEventListener("error", () => resolve(Promise.reject(new Error("audio load failed"))), { once: true });
  });
}
function appendVoiceControl(node, audio) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "voice-play-button";
  button.title = "播放语音";
  button.setAttribute("aria-label", "播放语音");
  const icon = document.createElement("i");
  icon.dataset.lucide = "volume-2";
  button.append(icon);
  button.addEventListener("click", () => {
    if (audio.paused) playAudioRobust(audio).catch(() => {});
    else audio.pause();
  });
  audio.addEventListener("play", () => button.classList.add("is-playing"));
  audio.addEventListener("pause", () => button.classList.remove("is-playing"));
  audio.addEventListener("ended", () => button.classList.remove("is-playing"));
  audio.addEventListener("error", () => {
    button.classList.add("is-failed");
    button.title = "语音加载失败，点击重试";
    if (state.voicePlayingAudio === audio) {
      state.voicePlayingAudio = null;
      state.voicePlaybackActive = false;
      playNextVoiceAudio();
    }
  });
  node.append(button, audio);
  icons();
  return button;
}
function appendAudioMessage(message) {
  if ($("chat-log").querySelector(".empty-state")) clearChatLogContents();
  const node = document.createElement("article");
  node.className = `message message-${message.role} message-audio`; node.dataset.messageId = message.id;
  const audio = document.createElement("audio"); audio.controls = false; audio.preload = "metadata"; audio.className = "voice-audio-source"; loadAudioSource(audio, message.audio_url);
  audio.dataset.lipText = message.content || "";
  if (message.role === "assistant") {
    const body = document.createElement("p"); body.textContent = message.content; const status = document.createElement("span"); status.className = "voice-bubble-status"; status.textContent = "语音回复"; audio.controls = false; audio.className = "voice-audio-source"; node.append(body, status); appendVoiceControl(node, audio);
    $("chat-log").append(node); node.scrollIntoView({ block: "nearest" }); return node;
  }
  const voiceLabel = document.createElement("span"); voiceLabel.className = "voice-bubble-label"; voiceLabel.textContent = "语音消息";
  node.append(voiceLabel); appendVoiceControl(node, audio);
  const transcript = document.createElement("details"); transcript.className = "voice-transcript";
  const summary = document.createElement("summary"); summary.textContent = message.status === "failed" ? "识别失败" : "查看转写";
  const text = document.createElement("p"); text.textContent = message.transcript || (message.status === "failed" ? message.error_message : "正在识别…");
  transcript.append(summary, text); node.append(audio, transcript);
  if (message.status === "failed") {
    const retry = document.createElement("button"); retry.type = "button"; retry.className = "voice-retry"; retry.textContent = "重试";
    retry.addEventListener("click", () => retryVoiceMessage(message.id)); node.append(retry);
  }
  $("chat-log").append(node); node.scrollIntoView({ block: "nearest" }); return node;
}
function updateAudioMessage(message) {
  const current = $("chat-log").querySelector(`[data-message-id="${message.id}"]`);
  if (current) current.remove();
  appendAudioMessage(message);
}
async function retryVoiceMessage(messageId) {
  try {
    const result = await api(fetch(`/api/voice-messages/${messageId}/transcribe`, { method: "POST", headers: { "X-YUMENO-Request": "web" } }));
    updateAudioMessage(result.message); handleAgentResult(result.turn);
  } catch (reason) { setText("chat-error", reason); await loadConversationMessages(); }
}
async function loadConversationMessages() {
  if (!state.activePersona) return;
  const version = chatRenderVersion;
  const personaId = state.activePersona.id;
  const conversationId = state.conversationId;
  try {
    const messages = await api(fetch(`/api/personas/${personaId}/conversations/${conversationId}/messages`));
    if (
      version !== chatRenderVersion
      || state.activePersona?.id !== personaId
      || state.conversationId !== conversationId
      || isConversationBusy()
    ) return;
    clearChatLogContents();
    if (!messages.length) {
      clearChatLogContents("从一句话开始");
      return;
    }
    for (const message of messages) message.kind === "audio" ? appendAudioMessage(message) : appendMessage(message.role, message.content, message.created_at, message.attachments || []);
  } catch (reason) { setText("chat-error", reason); }
}
async function clearConversation() {
  if (!state.activePersona || !confirm("永久删除当前对话、消息和会话附件？此操作不可撤销。")) return;
  try {
    const oldConversationId = state.conversationId;
    // 会话删除是主操作；附件接口逐个清理作为兼容兜底，避免后端保留孤儿文件。
    const oldAttachments = [...(state.chatAttachments || [])];
    await api(fetch(`/api/personas/${state.activePersona.id}/conversations/${oldConversationId}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } }));
    await Promise.allSettled(oldAttachments.filter((item) => item?.file_id && !String(item.file_id).startsWith("upload-")).map((item) => api(fetch(`/api/conversations/${encodeURIComponent(oldConversationId)}/attachments/${encodeURIComponent(item.file_id)}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } }))));
    clearRvcTaskPollers();
    closeRealtime();
    state.conversationId = crypto.randomUUID();
    localStorage.setItem(`yumeno:conversation:${state.activePersona.id}`, state.conversationId);
    clearChatLogContents("从一句话开始");
    state.chatAttachments = []; state.composerAttachmentIds = [];
    state.currentWorkflow = null;
  state.pendingRvcWorkflowEvent = null;
  state.rvcInline = null; state.currentTaskStatus = null; state.chatTaskEntries = new Map();
    state.pendingAction = null; state.pendingInput = null; state.pendingInputValues = {};
    setChatContextOpen(false); renderChatAttachments(); renderChatContext();
    connectRealtime();
  } catch (reason) { setText("chat-error", reason); }
}
function handleAgentResult(result) {
  if (!$("chat-log")) return;
  // 某些 HTTP/SSE 时序会把 workflow 只放在前一个 workflow_update 中，
  // 最终 waiting_input 只带 answer/waiting_inputs。沿用同一轮已缓存的 Agent handoff，
  // 不能因此退化成普通“请上传”文本卡片。
  const cachedRvc = state.pendingRvcWorkflowEvent;
  const cachedFlow = cachedRvc?.flow || cachedRvc?.event?.flow;
  const resultFlow = result?.workflow || result?.flow || (cachedFlow?.worker === "rvc_worker" ? cachedFlow : null);
  const handoffResult = resultFlow && cachedFlow && !result?.worker && !result?.result?.worker
    ? { ...cachedRvc.event, ...result, worker: "rvc_worker" } : result;
  const isRvcResult = Boolean(resultFlow && typeof resultFlow === "object" && hasFormalRvcHandoff(handoffResult, resultFlow));
  // 正式 handoff 会接管原 loading assistant 气泡；后续结果必须写回同一节点，
  // 不能再 append 一个普通 assistant 气泡覆盖/分离内嵌工作区。
  const inlineNode = isRvcResult
    ? (state.rvcInline?.node || state.realtimeAnswerNode || state.pendingReplyNode)
    : null;
  applyAgentContextResult(result);
  const waiting = result?.status === "waiting_input";
  state.pendingInput = waiting ? result : null;
  if (waiting) {
    state.pendingInputValues = { ...(state.pendingInputValues || {}), ...(result.selected_options || {}) };
  } else {
    state.pendingInputValues = {};
  }
  state.pendingAction = result.status === "pending_confirmation"
    ? { action: result.pending_action, specialist: result.specialist }
    : null;
  renderConfirmation();
  // Worker 等待用户补充信息时，输入框必须保持可发送；否则用户无法用自然语言继续或纠正当前任务。
  const waitingWorkerReply = Boolean(state.pendingInput && (state.rvcInline || String(state.pendingInput.worker || state.pendingInput.specialist || "").toLowerCase() === "rvc_worker"));
  $("send-question").disabled = ((!state.pendingAction && !waitingWorkerReply) && Boolean(state.pendingInput)) || (state.pendingAction && !waitingWorkerReply) || !state.activePersona;
  if (isRvcResult) {
    const node = state.rvcInline?.node?.isConnected ? state.rvcInline.node : inlineNode;
    if (node) {
      if (result.answer) {
        const body = node.querySelector("p");
        if (body) body.textContent = result.answer;
      }
      finishReply(node);
      state.pendingReplyNode = null;
      appendResultArtifacts(node, result);
    }
    finishPendingReplies();
    renderChatContext();
    return;
  }
  if (result.answer) {
    const node = replaceReplyLoading(state.pendingReplyNode, result.answer);
    state.pendingReplyNode = null;
    appendResultDetails(node, result);
    if (!waiting) synthesizeAnswer(result.answer, node);
    if (waiting) appendWaitingInputCard(node, result);
  } else if (waiting) {
    const node = state.pendingReplyNode;
    state.pendingReplyNode = null;
    if (node) { finishReply(node); appendWaitingInputCard(node, result); }
    else appendWaitingInputCard(null, result);
  } else if (state.pendingReplyNode) {
    state.pendingReplyNode.remove();
    state.pendingReplyNode = null;
  }
  finishPendingReplies();
  renderChatContext();
}
function appendAnswer(result) { const node = replaceReplyLoading(state.pendingReplyNode, ""); appendPacedText(result.answer, node); synthesizeAnswer(result.answer, node); }
const VOICE_FEED_MAX_CHARS = 300;
const VOICE_FEED_FORCE_CHARS = 60;
const VOICE_SENTENCE_MARKS = "。！？!?；;\n";

function startVoiceFeed() {
  const voice = state.activePersona?.profile?.tts;
  const node = state.realtimeAnswerNode;
  if (!state.ttsConfigured || !voice?.enabled || !$("assistant-voice-toggle").checked || !node) return;
  if (state.voiceFeed) return;
  if (typeof WebSocket === "undefined") { state.voiceFeedFailed = true; return; }
  if (window.PL && window.PL.unlockAudio) window.PL.unlockAudio();
  const autoPlay = voice.auto_play !== false;
  const epoch = state.voicePlaybackEpoch;
  const status = document.createElement("span");
  status.className = "voice-bubble-status is-generating";
  status.textContent = "正在生成语音…";
  node.append(status);
  const watchdog = setTimeout(() => {
    if (!status.isConnected || !status.classList.contains("is-generating")) return;
    status.textContent = "语音后台处理中…";
  }, 45000);
  status.addEventListener("DOMNodeRemoved", () => clearTimeout(watchdog), { once: true });
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  const url = `${scheme}://${location.host}/api/tts/personas/${state.activePersona.id}/conversations/${state.conversationId}/synthesize/ws`;
  const ws = new WebSocket(url);
  const feed = {
    ws, node, epoch, autoPlay, status,
    sentChars: 0, buffer: "", closed: false, segments: 0, opened: false, finished: false,
    pendingSends: [],
  };
  state.voiceFeed = feed;
  state.voiceFeedFailed = false;
  ws.addEventListener("open", () => {
    feed.opened = true;
    const pending = feed.pendingSends;
    feed.pendingSends = [];
    for (const payload of pending) {
      if (feed.ws.readyState === WebSocket.OPEN) feed.ws.send(payload);
    }
  });
  ws.addEventListener("message", (message) => {
    let event;
    try { event = JSON.parse(message.data); } catch { return; }
    if (event.type === "segment") {
      feed.segments += 1;
      if (!autoPlay) return;
      const blobUrl = URL.createObjectURL(b64ToWavBlob(event.audio));
      const audio = document.createElement("audio");
      audio.preload = "auto";
      audio.src = blobUrl;
      audio.dataset.lipText = event.text || "";
      voiceQueueHost().append(audio);
      const cleanup = () => { URL.revokeObjectURL(blobUrl); audio.remove(); };
      audio.addEventListener("ended", cleanup, { once: true });
      audio.addEventListener("error", cleanup, { once: true });
      enqueueVoiceAudio(audio);
    } else if (event.type === "done") {
      feed.finished = true;
      if (epoch !== state.voicePlaybackEpoch) { status.remove(); return; }
      status.textContent = "语音已生成";
      status.classList.remove("is-generating");
      const audio = document.createElement("audio");
      audio.controls = false;
      audio.preload = "metadata";
      audio.className = "voice-audio-source";
      audio.loaded = loadAudioSource(audio, event.message.audio_url);
      appendVoiceControl(node, audio);
    } else if (event.type === "error") {
      if (!feed.opened) state.voiceFeedFailed = true;
      status.textContent = "语音生成失败";
      status.classList.remove("is-generating");
      setText("chat-error", `文字回复正常，语音生成失败：${event.message || "语音合成失败"}`);
    }
  });
  ws.addEventListener("close", () => {
    if (state.voiceFeed === feed) state.voiceFeed = null;
    if (!feed.finished && !feed.errored) status.remove();
  });
  ws.addEventListener("error", () => {
    feed.errored = true;
    if (!feed.opened) state.voiceFeedFailed = true;
    status.textContent = "语音生成失败";
    status.classList.remove("is-generating");
    setText("chat-error", "文字回复正常，语音连接失败");
  });
}

function feedVoiceText(text) {
  if (!text) return;
  if (state.voiceFeedFailed) return;
  if (state.voiceFeedFullText.length < VOICE_FEED_MAX_CHARS * 4) state.voiceFeedFullText += text;
  if (!state.voiceFeed) startVoiceFeed();
  const feed = state.voiceFeed;
  if (!feed || feed.closed) return;
  feed.buffer += text;
  let start = 0;
  for (let i = 0; i < feed.buffer.length; i += 1) {
    if (VOICE_SENTENCE_MARKS.includes(feed.buffer[i])) {
      const sentence = feed.buffer.slice(start, i + 1).trim();
      if (sentence) writeVoiceSentence(feed, sentence);
      start = i + 1;
    }
  }
  feed.buffer = feed.buffer.slice(start);
  if (feed.buffer.length >= VOICE_FEED_FORCE_CHARS) {
    const forced = feed.buffer.trim();
    feed.buffer = "";
    if (forced) writeVoiceSentence(feed, forced);
  }
}

function writeVoiceSentence(feed, sentence) {
  if (feed.closed || !sentence) return;
  const room = VOICE_FEED_MAX_CHARS - feed.sentChars;
  if (room <= 0) { finishVoiceFeed(); return; }
  const part = sentence.length > room ? sentence.slice(0, room) : sentence;
  if (!part) { finishVoiceFeed(); return; }
  feed.sentChars += part.length;
  const payload = JSON.stringify({ type: "text", text: part });
  if (feed.ws.readyState === WebSocket.OPEN) feed.ws.send(payload);
  else feed.pendingSends.push(payload);
  if (part.length < sentence.length) finishVoiceFeed();
}

function finishVoiceFeed() {
  const feed = state.voiceFeed;
  if (!feed || feed.closed) return;
  feed.closed = true;
  state.voiceFeed = null;
  const rest = feed.buffer.trim();
  feed.buffer = "";
  if (rest) {
    const room = VOICE_FEED_MAX_CHARS - feed.sentChars;
    if (room > 0) {
      const part = rest.length > room ? rest.slice(0, room) : rest;
      feed.sentChars += part.length;
      const payload = JSON.stringify({ type: "text", text: part });
      if (feed.ws.readyState === WebSocket.OPEN) feed.ws.send(payload);
      else feed.pendingSends.push(payload);
    }
  }
  const donePayload = JSON.stringify({ type: "done" });
  if (feed.ws.readyState === WebSocket.OPEN) feed.ws.send(donePayload);
  else feed.pendingSends.push(donePayload);
}
function enqueueVoiceAudio(audio) {
  state.voicePlaybackQueue.push(audio);
  playNextVoiceAudio();
}
function b64ToWavBlob(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "audio/wav" });
}
function voiceQueueHost() {
  let host = document.getElementById("voice-queue-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "voice-queue-host";
    host.hidden = true;
    document.body.append(host);
  }
  return host;
}
function abortVoiceStream() {
  const feed = state.voiceFeed;
  if (feed) {
    state.voiceFeed = null;
    try { feed.ws.close(); } catch (e) { /* ignore */ }
  }
  if (state.voiceStreamAbort) {
    try { state.voiceStreamAbort.abort(); } catch (e) { /* ignore */ }
    state.voiceStreamAbort = null;
  }
}
function playNextVoiceAudio() {
  if (state.voicePlaybackActive || !state.voicePlaybackQueue.length) return;
  state.voicePlaybackActive = true;
  const audio = state.voicePlaybackQueue.shift();
  if (!audio || !audio.src) {
    state.voicePlaybackActive = false;
    playNextVoiceAudio();
    return;
  }
  state.voicePlayingAudio = audio;
  const advance = () => {
    if (state.voicePlayingAudio === audio) {
      state.voicePlayingAudio = null;
      state.voicePlaybackActive = false;
      playNextVoiceAudio();
    }
  };
  const watchdog = setTimeout(advance, 30000);
  const advanceClean = () => { clearTimeout(watchdog); advance(); };
  audio.addEventListener("ended", advanceClean, { once: true });
  audio.addEventListener("error", advanceClean, { once: true });
  (audio.loaded || Promise.resolve()).then(() => playAudioRobust(audio)).catch(advanceClean);
}
async function synthesizeAnswer(text, node, options = {}) {
  const persona = options.persona || state.activePersona;
  const conversationId = options.conversationId || state.conversationId;
  const voice = persona?.profile?.tts;
  if (!state.ttsConfigured || !voice?.enabled || !$("assistant-voice-toggle").checked || !text) return;
  if (window.PL && window.PL.unlockAudio) window.PL.unlockAudio();
  const epoch = state.voicePlaybackEpoch;
  const autoPlay = voice.auto_play !== false;
  const status = document.createElement("span");
  status.className = "voice-bubble-status is-generating";
  status.textContent = "正在生成语音…";
  node.append(status);
  const synthWatchdog = setTimeout(() => {
    if (!status.isConnected || !status.classList.contains("is-generating")) return;
    status.textContent = "语音后台处理中…";
  }, 45000);
  status.addEventListener("DOMNodeRemoved", () => clearTimeout(synthWatchdog), { once: true });
  const controller = new AbortController();
  state.voiceStreamAbort = controller;
  let segments = 0;
  try {
    const response = await fetch(`/api/tts/personas/${persona.id}/conversations/${conversationId}/synthesize/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error(`语音流式合成失败（HTTP ${response.status}）`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        let event;
        try { event = JSON.parse(line); } catch { continue; }
        if (event.type === "segment") {
          segments += 1;
          if (!autoPlay) continue;
          const url = URL.createObjectURL(b64ToWavBlob(event.audio));
          const audio = document.createElement("audio");
          audio.preload = "auto";
          audio.src = url;
          audio.dataset.lipText = event.text || "";
          // 必须挂进 DOM：Live2D 口型依赖 document 级 play 事件，脱离 DOM 的元素事件不会冒泡
          voiceQueueHost().append(audio);
          const cleanup = () => { URL.revokeObjectURL(url); audio.remove(); };
          audio.addEventListener("ended", cleanup, { once: true });
          audio.addEventListener("error", cleanup, { once: true });
          enqueueVoiceAudio(audio);
        } else if (event.type === "done") {
          if (epoch !== state.voicePlaybackEpoch) { status.remove(); return; }
          status.textContent = "语音已生成";
          status.classList.remove("is-generating");
          const audio = document.createElement("audio");
          audio.controls = false;
          audio.preload = "metadata";
          audio.className = "voice-audio-source";
          audio.loaded = loadAudioSource(audio, event.message.audio_url);
          appendVoiceControl(node, audio);
        } else if (event.type === "error") {
          throw new Error(event.message || "语音合成失败");
        }
      }
    }
    if (epoch !== state.voicePlaybackEpoch) { status.remove(); return; }
    if (!segments && !node.querySelector(".voice-audio-source")) status.remove();
  } catch (reason) {
    if (reason && reason.name === "AbortError") { status.remove(); return; }
    status.textContent = "语音生成失败";
    status.classList.remove("is-generating");
    setText("chat-error", `文字回复正常，语音生成失败：${reason && reason.message ? reason.message : reason}`);
  } finally {
    if (state.voiceStreamAbort === controller) state.voiceStreamAbort = null;
  }
}
function findResourceSetup(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);
  if (value.kind === "resource_setup" && value.resource) return value;
  for (const child of Object.values(value)) { const found = findResourceSetup(child, seen); if (found) return found; }
  return null;
}
function resourceSetupAction(text) {
  const input = $("question");
  if (!input || !String(text || "").trim()) return;
  input.value = text;
  resizeComposer();
  void submitQuestion({ preventDefault() {} });
}
function renderResourceSetupCard(node, resource) {
  if (!node || !resource) return;
  node.querySelectorAll(".resource-setup-inline-card").forEach((item) => item.remove());
  const card = document.createElement("section");
  card.className = "resource-setup-inline-card rvc-inline-workspace";
  card.dataset.resource = String(resource.resource);
  const heading = document.createElement("div"); heading.className = "resource-setup-heading";
  const title = document.createElement("strong"); title.textContent = `${String(resource.resource).toUpperCase()} 运行资源`;
  const badge = document.createElement("span"); badge.className = "resource-setup-status";
  const install = resource.install && typeof resource.install === "object" ? resource.install : resource;
  const status = String(resource.status || install.status || "unknown").toLowerCase();
  badge.textContent = status === "ok" || status === "ready" || install.ready === true ? "已就绪" : status === "failed" ? "检查失败" : status === "accepted" || status === "running" ? "处理中" : "需要处理";
  heading.append(title, badge);
  const detail = document.createElement("p");
  const missing = Array.isArray(resource.missing) ? resource.missing : (Array.isArray(install.missing) ? install.missing : []);
  detail.textContent = resource.error || install.error || (missing.length ? `缺少：${missing.join("、")}` : resource.phase || install.phase || "可通过对话查询或管理此资源。");
  const actions = document.createElement("div"); actions.className = "resource-setup-actions";
  if (!(status === "ok" || status === "ready" || install.ready === true)) {
    actions.append(rvcButton("检查状态", () => resourceSetupAction(`请检查 ${resource.resource} 的配置状态`), true));
    actions.append(rvcButton("开始安装", () => resourceSetupAction(`请安装 ${resource.resource} 所需资源`)));
  }
  if (status === "accepted" || status === "running" || install.installing === true) actions.append(rvcButton("取消安装", () => resourceSetupAction(`请取消 ${resource.resource} 的安装`)));
  card.append(heading, detail, actions);
  node.append(card);
}

function applyAgentContextResult(result) {
  const resultFlow = result?.workflow || result?.flow;
  // 只有 Core Agent 返回的完整 workflow.worker 才能激活 RVC；
  // 顶层 worker/specialist 结果不能单独创建或恢复 RVC 工作区。
  const isRvcResult = Boolean(resultFlow && typeof resultFlow === "object" && hasFormalRvcHandoff(result, resultFlow));
  const isIsolatedRvcResult = !isRvcResult && (
    String(result?.worker || result?.worker_name || "").trim().toLowerCase() === "rvc_worker"
  );
  const tasks = rvcTaskEntries(result);
  const resourceSetup = findResourceSetup(result);
  if (resourceSetup) {
    const resourceNode = state.realtimeAnswerNode || state.pendingReplyNode || appendMessage("assistant", "正在处理资源配置…");
    if (resourceNode) renderResourceSetupCard(resourceNode, resourceSetup);
  }
  // RVC 只能由 Agent 返回的结构化 worker 合同激活。历史兼容 task 不能
  // 在顶部创建旧任务卡，也不能凭 task 字段把普通结果升级成 RVC。
  if (!isRvcResult && !isIsolatedRvcResult) tasks.forEach((entry) => registerChatTask(entry));
  const taskId = stableTaskId(result) || tasks[0]?.task_id || "";
  if (resultFlow && typeof resultFlow === "object") {
    if (isRvcResult) {
      // RVC 的 workflow 只属于当前 assistant 气泡；绝不再写入顶部/右侧通用任务状态。
      activateRvcWorkspaceFromAgent(handoffResult, resultFlow);
      state.pendingRvcWorkflowEvent = null;
    } else {
      setChatWorkflow(resultFlow, taskId || resultFlow.task_id);
    }
  } else if (tasks[0] && !isRvcResult) {
    registerChatTask(tasks[0]);
  }

  const waiting = normalizedWaitingInputs(result?.waiting_inputs || result?.pending_inputs);
  if (!waiting.length) return;
  let flow = state.currentWorkflow;
  if (!flow || (taskId && flow.task_id && flow.task_id !== taskId)) {
    // 任务结果里即使包含旧的 RVC task，也不能把它当成当前 Agent 已委派的
    // worker。只有同一事件显式携带 worker=rvc_worker 时，才允许激活 RVC 工作区。
    // 这条边界避免“正在分析请求…”阶段因历史/兼容 task 提前出现 RVC 卡片。
    if (isRvcResult) {
      activateRvcWorkspaceFromAgent(result, resultFlow);
      flow = state.currentWorkflow;
    }
    if (!flow) {
      flow = {
        flow_id: "task.workflow", task_id: taskId, title: "当前任务", worker: result?.worker || "Agent",
        status: "waiting_input", current_node: "task", progress: 0,
        nodes: [{ id: "task", label: "等待补充信息", description: "完成后继续当前任务", status: "waiting_input" }], edges: [],
      };
    }
  }
  // RVC 的 waiting_inputs 只属于已激活的 assistant 内嵌工作区。
  // 绝不能在此回退成顶部通用任务卡，否则 workflow_update/result 时序稍有
  // 变化就会出现“正在分析请求…”旁边又多出一张卡并卡住。
  if (isRvcResult) {
    if (state.rvcInline) {
      state.rvcInline.agentWorkflow = { ...(state.rvcInline.agentWorkflow || {}), ...flow, waiting_inputs: waiting };
      renderRvcInline();
    }
    return;
  }
  setChatWorkflow({ ...flow, task_id: taskId || flow.task_id, status: "waiting_input", waiting_inputs: waiting }, taskId || flow.task_id);
}

function rvcTaskEntries(result) {
  const found = [];
  const inspect = (value) => {
    if (!value) return;
    if (Array.isArray(value)) { value.forEach(inspect); return; }
    if (typeof value !== "object") return;
    const statusUrl = typeof value.status_url === "string" ? value.status_url : "";
    // 结果只有显式 worker 合同才属于 RVC；不能用 engine、URL 或标题猜测任务类型。
    if (value.task_id && (value.worker === "rvc_worker" || value.worker_name === "rvc_worker")) {
      found.push({
        task_id: String(value.task_id),
        status_url: statusUrl || `/api/voice/rvc/tasks/${encodeURIComponent(value.task_id)}`,
        message: value.message || "RVC 任务已提交",
      });
    }
    Object.values(value).forEach((item) => { if (item && typeof item === "object") inspect(item); });
  };
  // 同一 task 可能同时出现在顶层结果、worker_results 和 artifacts 中。
  inspect(result);
  return uniqueByStableId(found, (item) => item.task_id);
}
function renderRvcTaskCard() {
  // 旧兼容入口保留名称，但 RVC 任务禁止在聊天顶部创建第二张卡。
  // 正式流程只由 Core Agent 的 worker handoff 驱动气泡内工作区。
  return null;
}
function pollRvcTask(card, entry, refs) {
  if (!state.rvcTaskPollers) state.rvcTaskPollers = new Map();
  const generation = state.rvcTaskPollerGeneration || 0;
  const old = state.rvcTaskPollers.get(entry.task_id); if (old) clearTimeout(old);
  const poll = async () => {
    if (!card.isConnected || generation !== (state.rvcTaskPollerGeneration || 0)) return;
    try {
      const task = await api(fetch(entry.status_url, { headers: { "X-YUMENO-Request": "web" } }));
      const data = task.task || task;
      const stateName = data.state || data.status || "running";
      const percent = Number(data.progress ?? data.progress_percent ?? 0);
      refs.progress.value = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
      refs.status.textContent = stateName === "succeeded" || stateName === "done" ? "已完成" : stateName === "failed" ? "失败" : stateName === "cancelled" ? "已取消" : (data.phase || "处理中");
      refs.detail.textContent = data.message || data.error || (stateName === "succeeded" ? "结果已生成，正在刷新会话附件" : entry.message);
      updateWorkflowFromTask(data, entry.task_id);
      if (["succeeded", "done", "failed", "cancelled"].includes(stateName)) {
        refs.cancel.disabled = true; card.classList.add(`is-${stateName}`);
        if (stateName === "succeeded") { await loadChatAttachments(); }
        state.rvcTaskPollers.delete(entry.task_id); return;
      }
      state.rvcTaskPollers.set(entry.task_id, setTimeout(poll, 1200));
    } catch (reason) {
      refs.detail.textContent = `状态查询失败：${reason.message || reason}`;
      state.rvcTaskPollers.set(entry.task_id, setTimeout(poll, 3000));
    }
  };
  void poll();
}
function resultAttachmentEntries(result) {
  const found = [];
  const inspect = (value, attachmentContext = false) => {
    if (!value) return;
    if (Array.isArray(value)) { value.forEach((item) => inspect(item, attachmentContext)); return; }
    if (typeof value !== "object") return;
    const isAttachment = attachmentContext || value.type === "attachment" || value.kind === "attachment" || value.file_id;
    if (isAttachment && (value.file_id || value.id)) found.push(value);
    for (const [key, child] of Object.entries(value)) {
      if (["attachments", "attachment", "artifacts", "outputs", "output", "result_refs"].includes(key)) inspect(child, true);
    }
  };
  inspect(result);
  return uniqueByStableId(found, (item) => String(item.file_id || item.id));
}

function appendResultArtifacts(node, result) {
  if (!node) return;
  const attachments = resultAttachmentEntries(result);
  if (!attachments.length) return;
  let group = node.querySelector('.message-attachments[data-result-attachments="true"]');
  if (!group) { group = document.createElement("div"); group.className = "message-attachments"; group.dataset.resultAttachments = "true"; node.append(group); }
  const existing = new Set(Array.from(group.querySelectorAll("[data-result-file-id]"), (item) => item.dataset.resultFileId));
  attachments.forEach((item) => {
    const fileId = String(item.file_id || item.id);
    if (existing.has(fileId)) return;
    const preview = createAttachmentPreview(item, { compact: true }); preview.dataset.resultFileId = fileId; group.append(preview); existing.add(fileId);
  });
}
function appendResultDetails(node, result) {
  if (!node) return;
  applyAgentContextResult(result);
  appendResultArtifacts(node, result);
  const detailSignature = JSON.stringify({ evidence: result?.evidence || [], metrics: result?.metrics || {} });
  if (node.dataset.resultDetailsSignature === detailSignature) return;
  node.dataset.resultDetailsSignature = detailSignature;
  const debugOpen = readChatPreference(CHAT_PREFERENCE_KEYS.debug, false);
  const debugDetails = document.createElement("details");
  debugDetails.className = "agent-debug-details" + (debugOpen ? "" : " is-hidden");
  debugDetails.open = debugOpen;
  const debugSummary = document.createElement("summary");
  debugSummary.textContent = "调试信息";
  debugDetails.append(debugSummary);
  if (result.evidence?.length) debugDetails.append(details("证据", result.evidence));
  const metrics = result.metrics || {};
  const parts = [];
  if (Number.isFinite(Number(metrics.model_calls))) parts.push(`模型 ${metrics.model_calls} 次`);
  if (Number.isFinite(Number(metrics.tool_calls))) parts.push(`工具 ${metrics.tool_calls} 次`);
  if (Number.isFinite(Number(metrics.first_token_ms))) parts.push(`首字 ${Math.round(metrics.first_token_ms)} ms`);
  if (Number.isFinite(Number(metrics.total_ms))) parts.push(`总计 ${Math.round(metrics.total_ms)} ms`);
  if (Number(metrics.context_dropped_messages) > 0) parts.push(`压缩 ${metrics.context_dropped_messages} 条`);
  if (parts.length) { const summary = document.createElement("div"); summary.className = "agent-turn-metrics"; summary.textContent = parts.join(" · "); debugDetails.append(summary); }
  if (debugDetails.children.length > 1) node.append(debugDetails);
}
function bindChatMaterialUpload() {
  const button = $("chat-attachment");
  const input = $("chat-voice-material");
  if (!button || !input || button.dataset.bound === "true") return;
  button.dataset.bound = "true";
  button.addEventListener("click", () => input.click());
  $("chat-files-upload")?.addEventListener("click", () => input.click());
  $("chat-files-dropzone")?.addEventListener("click", () => input.click());
  $("chat-files-dropzone")?.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    const inlineRvc = input.dataset.rvcInline === "true";
    input.value = "";
    input.dataset.rvcInline = "false";
    input.accept = ".pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.png,.jpg,.jpeg,.webp,.gif,audio/*,video/*";
    files.forEach((file) => void ((inlineRvc || state.pendingUploadRequest?.purpose === "voice_material") ? uploadChatVoiceMaterial(file) : uploadChatAttachment(file)));
  });
}

function openChatVoiceUpload() {
  const input = $("chat-voice-material");
  if (input) input.click();
}
function uploadChatVoiceMaterial(file) { if (!file) { setText("chat-error", "音色素材上传失败：未选择文件", true); return Promise.resolve(null); } return uploadChatAttachment(file, { errorPrefix: "音色素材", inlineRvc: Boolean(state.rvcInline) }); }
function bindChatAttachmentDropzone() {
  const form = $("question-form");
  const dropzones = [form, $("chat-files-dropzone")].filter(Boolean);
  if (!dropzones.length || form?.dataset.dropBound === "true") return;
  if (form) form.dataset.dropBound = "true";
  dropzones.forEach((zone) => {
    ["dragenter", "dragover"].forEach((type) => zone.addEventListener(type, (event) => {
      event.preventDefault();
      if (!isConversationBusy()) zone.classList.add("has-file-drag");
    }));
    ["dragleave", "drop"].forEach((type) => zone.addEventListener(type, (event) => {
      event.preventDefault(); zone.classList.remove("has-file-drag");
    }));
    zone.addEventListener("drop", (event) => {
      if (isConversationBusy()) return;
      Array.from(event.dataTransfer?.files || []).forEach((file) => void uploadChatAttachment(file));
    });
  });
  document.addEventListener("paste", (event) => {
    if (isConversationBusy() || !document.activeElement?.closest("#chat-view")) return;
    const input = $("chat-voice-material");
    const files = Array.from(event.clipboardData?.items || []).map((item) => item.kind === "file" ? item.getAsFile() : null).filter(Boolean);
    files.forEach((file) => void ((input?.dataset.rvcInline === "true" || state.pendingUploadRequest?.purpose === "voice_material") ? uploadChatVoiceMaterial(file) : uploadChatAttachment(file)));
  });
}
function bindChatAttachmentDrawer() {
  const toggle = $("chat-files-toggle");
  if (toggle && toggle.dataset.bound !== "true") {
    toggle.dataset.bound = "true";
    toggle.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); toggleChatAttachmentsDrawer(); });
  }
  $("chat-attachments-close")?.addEventListener("click", () => setChatAttachmentsDrawer(false));
  $("chat-files-close")?.addEventListener("click", () => setChatAttachmentsDrawer(false));
  $("chat-files-backdrop")?.addEventListener("click", () => setChatAttachmentsDrawer(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.chatAttachmentsOpen) setChatAttachmentsDrawer(false);
  });
}
function attachmentApiBase() {
  return `/api/conversations/${encodeURIComponent(state.conversationId)}/attachments`;
}
function getAttachmentUrl(item) {
  return item?.download_url || item?.url || `${attachmentApiBase()}/${encodeURIComponent(item.file_id || item.id)}`;
}
function normalizeAttachment(item) {
  const file = item?.file || item?.attachment || item;
  if (!file) return null;
  const normalized = { ...file, file_id: file.file_id || file.id, name: file.name || file.filename || "未命名附件" };
  normalized.mime_type = normalized.mime_type || normalized.mime || "application/octet-stream";
  normalized.kind = normalized.kind || attachmentKind(normalized);
  normalized.status = ["uploading", "ready", "selected", "processing", "completed", "error", "removed"].includes(normalized.status) ? normalized.status : "ready";
  normalized.progress = Number.isFinite(Number(normalized.progress)) ? Number(normalized.progress) : 0;
  normalized.selected = Boolean(normalized.selected);
  return normalized;
}
function attachmentKind(item) {
  const mime = String(item?.mime_type || item?.mime || "").toLowerCase();
  const name = String(item?.name || item?.filename || "").toLowerCase();
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return "image";
  if (mime.startsWith("audio/") || /\.(wav|mp3|m4a|aac|flac|ogg|opus|wma)$/.test(name)) return "audio";
  if (mime.startsWith("video/") || /\.(mp4|mkv|webm|mov|avi|m4v)$/.test(name)) return "video";
  if (mime === "application/pdf" || /\.pdf$/.test(name)) return "pdf";
  if (/json|csv|text\/|markdown/.test(mime) || /\.(txt|md|markdown|json|csv|log|xml|yaml|yml)$/.test(name)) return "text";
  if (/word|excel|spreadsheet|powerpoint|presentation/.test(mime) || /\.(docx?|xlsx?|pptx?)$/.test(name)) return "office";
  return "file";
}
function attachmentIcon(item) {
  return ({ image: "image", audio: "music-2", video: "film", pdf: "file-text", text: "file-code-2", office: "file-spreadsheet", file: "file" })[attachmentKind(item)] || "file";
}
function attachmentTypeLabel(item) {
  return ({ image: "图片", audio: "音频", video: "视频", pdf: "PDF", text: "文本", office: "办公文档", file: "文件" })[attachmentKind(item)] || "文件";
}
function formatAttachmentSize(size) {
  const value = Number(size);
  if (!Number.isFinite(value) || value <= 0) return "";
  const units = ["B", "KB", "MB", "GB"]; let index = 0; let amount = value;
  while (amount >= 1024 && index < units.length - 1) { amount /= 1024; index += 1; }
  return `${amount >= 10 || index === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[index]}`;
}
function attachmentMeta(item) {
  return [item.mime_type || item.mime, formatAttachmentSize(item.size), item.duration ? `${Math.round(Number(item.duration))} 秒` : ""].filter(Boolean).join(" · ");
}
function getSelectedAttachmentIds() { return Array.from(new Set((state.composerAttachmentIds || []).filter(Boolean))); }
function selectedAttachments() { const ids = new Set(getSelectedAttachmentIds()); return (state.chatAttachments || []).filter((item) => ids.has(item.file_id)); }
function clearSelectedAttachments() { state.composerAttachmentIds = []; renderChatAttachments(); }
function setAttachmentSelected(fileId, selected) {
  const ids = new Set(getSelectedAttachmentIds());
  if (selected) ids.add(fileId); else ids.delete(fileId);
  state.composerAttachmentIds = Array.from(ids);
  const item = state.chatAttachments?.find((entry) => String(entry.file_id) === String(fileId));
  if (item) item.status = selected ? (item.status === "ready" ? "selected" : item.status) : (item.status === "selected" ? "ready" : item.status);
  if (selected) setPendingAttachment(fileId);
  renderChatAttachments(); renderChatContext(); updateComposerControls();
}
function createAttachmentPreview(item, options = {}) {
  const kind = attachmentKind(item); const wrap = document.createElement("div");
  wrap.className = `attachment-preview attachment-preview-${kind}${options.compact ? " attachment-preview-compact" : ""}`;
  const url = getAttachmentUrl(item);
  if (kind === "image") { const image = document.createElement("img"); image.src = url; image.alt = item.name; image.loading = "lazy"; wrap.append(image); }
  else if (kind === "audio" || kind === "video") { const media = document.createElement(kind); media.src = url; media.controls = true; media.preload = "metadata"; wrap.append(media); }
  else {
    const icon = document.createElement("i"); icon.dataset.lucide = attachmentIcon(item);
    const copy = document.createElement("span"); copy.className = "attachment-preview-copy";
    const type = document.createElement("strong"); type.textContent = attachmentTypeLabel(item);
    const meta = document.createElement("small"); meta.textContent = attachmentMeta(item) || "可在对话中使用";
    copy.append(type, meta); wrap.append(icon, copy);
    if (item.file_id && !String(item.file_id).startsWith("upload-")) {
      const open = document.createElement("a"); open.className = "attachment-preview-open"; open.href = url; open.target = "_blank"; open.rel = "noopener noreferrer"; open.textContent = "打开"; open.setAttribute("aria-label", `打开 ${item.name}`); wrap.append(open);
    }
  }
  if (item.status === "processing" || item.status === "uploading") { const state = document.createElement("small"); state.className = "attachment-preview-state"; state.textContent = item.status === "uploading" ? `上传中 ${Math.round(item.progress || 0)}%` : "处理中"; wrap.append(state); }
  return wrap;
}
function renderChatMediaWorkbench(items) {
  const host = $("chat-media-workbench"); if (!host) return;
  if (isInlineRvcActive()) { host.replaceChildren(); host.classList.add("is-hidden"); return; }
  const mediaItems = (items || []).filter((item) => ["audio", "video"].includes(attachmentKind(item)) && ["ready", "selected", "completed"].includes(item.status));
  if (!mediaItems.length) { state.currentMediaFileId = null; host.replaceChildren(); host.classList.add("is-hidden"); return; }
  let current = mediaItems.find((item) => String(item.file_id) === String(state.currentMediaFileId));
  if (!current) { current = mediaItems[mediaItems.length - 1]; state.currentMediaFileId = current.file_id; }
  host.replaceChildren(); host.classList.remove("is-hidden");
  const heading = document.createElement("div"); heading.className = "chat-media-workbench-head";
  const headingCopy = document.createElement("div"); const kicker = document.createElement("span"); kicker.className = "chat-media-kicker"; kicker.textContent = "MEDIA INPUT"; const title = document.createElement("strong"); title.textContent = "当前媒体"; headingCopy.append(kicker, title);
  const close = document.createElement("button"); close.type = "button"; close.className = "icon-button"; close.title = "关闭媒体预览"; close.setAttribute("aria-label", "关闭媒体预览"); close.innerHTML = '<i data-lucide="x"></i>'; close.addEventListener("click", () => { state.currentMediaFileId = null; host.replaceChildren(); host.classList.add("is-hidden"); }); heading.append(headingCopy, close); host.append(heading);
  const switcher = document.createElement("div"); switcher.className = "chat-media-switcher";
  mediaItems.forEach((item) => { const button = document.createElement("button"); button.type = "button"; button.className = `chat-media-switcher-item${item.file_id === current.file_id ? " is-active" : ""}`; button.textContent = item.name; button.title = item.name; button.addEventListener("click", () => { state.currentMediaFileId = item.file_id; renderChatMediaWorkbench(mediaItems); }); switcher.append(button); });
  const card = document.createElement("article"); card.className = "chat-media-card"; const top = document.createElement("div"); top.className = "chat-media-card-top"; const name = document.createElement("strong"); name.textContent = current.name; const meta = document.createElement("small"); meta.textContent = attachmentMeta(current) || "已就绪"; top.append(name, meta); const preview = createAttachmentPreview(current); const actions = document.createElement("div"); actions.className = "chat-media-actions"; const remove = document.createElement("button"); remove.type = "button"; remove.className = "button button-secondary"; remove.innerHTML = '<i data-lucide="minus"></i><span>取消选择</span>'; remove.addEventListener("click", () => setAttachmentSelected(current.file_id, false)); actions.append(remove); card.append(top, preview, actions); host.append(switcher, card); icons();
}

function renderAttachmentChip(item) {
  const chip = document.createElement("div"); chip.className = "chat-attachment-chip";
  const icon = document.createElement("i"); icon.dataset.lucide = attachmentIcon(item);
  const label = document.createElement("span"); label.textContent = item.name;
  const meta = document.createElement("small"); meta.textContent = item.status === "uploading" ? `${item.progress || 0}%` : item.status === "error" ? "上传失败" : (attachmentMeta(item) || "已就绪");
  const remove = document.createElement("button"); remove.type = "button"; remove.className = "chat-attachment-remove"; remove.title = "移出待发送附件"; remove.setAttribute("aria-label", `移出 ${item.name}`); remove.innerHTML = '<i data-lucide="x"></i>'; remove.addEventListener("click", () => setAttachmentSelected(item.file_id, false));
  chip.append(icon, label, meta, remove); return chip;
}
function renderChatAttachments() {
  const strip = $("chat-attachment-strip"); const lists = [$("chat-files-list"), $("chat-attachments-list-mobile")].filter(Boolean); const items = state.chatAttachments || []; const selected = new Set(getSelectedAttachmentIds());
  if (strip) {
    strip.replaceChildren();
    if (isInlineRvcActive()) strip.classList.add("is-hidden");
    else {
      if (selected.size) { const count = document.createElement("span"); count.className = "chat-selection-summary"; count.textContent = `${selected.size} 个待发送`; strip.append(count); }
      strip.classList.toggle("is-hidden", !selected.size);
    }
  }
  lists.forEach((list) => { list.replaceChildren(); if (!items.length) { const empty = document.createElement("p"); empty.className = "chat-attachments-empty"; empty.textContent = "当前会话还没有附件"; list.append(empty); } else items.forEach((item) => list.append(renderAttachmentRow(item))); });
  const count = $("chat-files-count"); if (count) count.textContent = String(items.length); const countLabel = $("chat-files-count-label"); if (countLabel) countLabel.textContent = String(items.length); const summary = $("chat-attachments-summary"); if (summary) summary.textContent = items.length ? `${items.length} 个文件 · ${selected.size} 个待发送` : "当前会话中的文件"; const fileSummary = $("chat-files-summary"); if (fileSummary) fileSummary.textContent = items.length ? `${items.length} 个文件 · ${selected.size} 个待发送` : "上传后可在对话中使用";
  renderChatMediaWorkbench(Array.from(selected).map((id) => items.find((item) => item.file_id === id)).filter(Boolean)); renderChatContext(); icons();
}
function renderAttachmentRow(item) {
  const row = document.createElement("article"); row.className = "chat-attachment-row";
  const head = document.createElement("div"); head.className = "chat-attachment-row-head";
  const title = document.createElement("strong"); title.textContent = item.name;
  const meta = document.createElement("small"); meta.textContent = item.status === "uploading" ? `上传中 ${item.progress || 0}%` : item.status === "error" ? (item.error || "上传失败") : (attachmentMeta(item) || "已就绪");
  head.append(title, meta); row.append(head);
  if (item.status === "uploading") { const progress = document.createElement("progress"); progress.max = 100; progress.value = Number(item.progress) || 0; row.append(progress); return row; }
  if (["ready", "selected", "completed"].includes(item.status)) row.append(createAttachmentPreview(item));
  const actions = document.createElement("div"); actions.className = "chat-attachment-actions";
  if (item.status === "error") actions.append(attachmentAction("重试", "rotate-ccw", () => void retryChatAttachment(item)));
  else {
    const selected = getSelectedAttachmentIds().includes(item.file_id); const select = attachmentAction(selected ? "移出" : "用于本次对话", selected ? "check" : "plus", () => setAttachmentSelected(item.file_id, !selected));
    actions.append(select);
    if (attachmentKind(item) === "audio" || attachmentKind(item) === "video") actions.append(attachmentAction("发送到 RVC", "audio-waveform", () => sendAttachmentTo(item, "rvc")));
    if (["text", "pdf", "office", "file"].includes(attachmentKind(item))) actions.append(attachmentAction("发送到知识库", "library", () => sendAttachmentTo(item, "rag")));
    actions.append(attachmentAction("复制 file_id", "copy", (event) => copyAttachmentId(item.file_id, event.currentTarget)));
    actions.append(attachmentAction("重命名", "pencil", () => renameChatAttachment(item)));
    actions.append(attachmentAction("删除", "trash-2", () => deleteChatAttachment(item), true));
  }
  row.append(actions); return row;
}
function attachmentAction(label, icon, onClick, danger = false) { const button = document.createElement("button"); button.type = "button"; button.className = `chat-attachment-action${danger ? " is-danger" : ""}`; button.title = label; button.setAttribute("aria-label", label); const glyph = document.createElement("i"); glyph.dataset.lucide = icon; button.append(glyph); button.addEventListener("click", onClick); return button; }
async function copyAttachmentId(id, button) { try { await navigator.clipboard.writeText(id); } catch {} button.title = "已复制"; setTimeout(() => { button.title = "复制 file_id"; }, 1200); }
function setChatAttachmentsDrawer(open) {
  const drawer = $("chat-attachments-drawer");
  const sidebar = $("chat-files-sidebar");
  const backdrop = $("chat-files-backdrop");
  if (!drawer && !sidebar) return;
  state.chatAttachmentsOpen = Boolean(open);
  if (open) state.chatLastFocusedElement = document.activeElement;
  sidebar?.classList.toggle("is-open", Boolean(open));
  sidebar?.setAttribute("aria-hidden", String(!open));
  drawer?.classList.toggle("is-hidden", !open);
  backdrop?.classList.toggle("is-hidden", !open);
  $("chat-files-toggle")?.setAttribute("aria-expanded", String(Boolean(open)));
  if (open) {
    renderChatAttachments();
    $("chat-files-upload")?.focus();
  } else state.chatLastFocusedElement?.focus?.();
}
function toggleChatAttachmentsDrawer() { setChatAttachmentsDrawer(!state.chatAttachmentsOpen); }
async function loadChatAttachments() { if (!state.activePersona) return; try { const result = await api(fetch(attachmentApiBase(), { cache: "no-store" })); state.chatAttachments = (Array.isArray(result) ? result : (result.attachments || result.files || [])).map(normalizeAttachment).filter((item) => item?.file_id); state.composerAttachmentIds = state.composerAttachmentIds.filter((id) => state.chatAttachments.some((item) => item.file_id === id)); renderChatAttachments(); } catch (reason) { state.chatAttachments = []; renderChatAttachments(); if (reason?.status !== 404) setText("chat-error", `附件列表加载失败：${reason.message || reason}`); } }
function uploadWithProgress(file, onProgress) { return new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open("POST", attachmentApiBase()); xhr.setRequestHeader("X-YUMENO-Request", "web"); xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); }; xhr.onload = () => { let data = {}; try { data = JSON.parse(xhr.responseText || "{}"); } catch {} if (xhr.status >= 200 && xhr.status < 300) resolve(data); else reject(new Error(data.detail || `HTTP ${xhr.status}`)); }; xhr.onerror = () => reject(new Error("网络错误")); xhr.onabort = () => reject(new Error("上传已取消")); const form = new FormData(); form.append("files", file, file.name); xhr.send(form); }); }
async function uploadChatAttachment(file, options = {}) {
  if (!state.activePersona) return;
  if (file.size > 500 * 1024 * 1024) {
    setText("chat-error", `${file.name} 超过 500 MB 限制`, true);
    return;
  }
  const isRvcSource = Boolean(
    options.inlineRvc ||
    (state.rvcInline && ["audio", "video"].includes(attachmentKind({ name: file.name, mime_type: file.type }))),
  );
  const tempId = `upload-${crypto.randomUUID()}`;
  const item = {
    file_id: tempId,
    name: file.name,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
    status: "uploading",
    progress: 0,
    localFile: file,
  };
  state.chatAttachments.unshift(item);
  state.composerAttachmentIds.unshift(tempId);
  renderChatAttachments();
  try {
    const result = await uploadWithProgress(file, (progress) => {
      item.progress = progress;
      renderChatAttachments();
    });
    const saved = normalizeAttachment((result?.attachments || result?.files || [result])[0]);
    if (!saved?.file_id) throw new Error("服务端未返回 file_id");
    state.chatAttachments = state.chatAttachments.map((entry) => entry.file_id === tempId ? saved : entry);
    state.composerAttachmentIds = state.composerAttachmentIds.filter((id) => id !== tempId);
    renderChatAttachments();

    if (isRvcSource && state.rvcInline) {
      // 更换源文件时切断旧 session，并允许 rvc_worker 重新绑定新附件。
      const inline = state.rvcInline;
      const previousId = inline.source?.file_id;
      if (previousId && String(previousId) !== String(saved.file_id)) {
        if (inline.sessionId) {
          void chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(inline.sessionId)}`, { method: "DELETE" }).catch(() => {});
        }
        inline.sessionId = null;
        inline.source = null;
        inline.state = { phase: "awaiting_source", progress: 0, message: "正在绑定新的 RVC 素材" };
        inline.sourceConfirmed = false;
        inline.attachmentResumeSent = false;
        inline.generation = (inline.generation || 0) + 1;
      }
      inline.attachmentResumeSent = false;
      setText("question-status", `已上传 ${saved.name}，正在交给 RVC 工作流`);
      await resumeRvcWorkerWithAttachment(saved.file_id);
    } else {
      setPendingAttachment(saved.file_id);
      setText("question-status", `已添加附件：${saved.name}`);
    }
    return saved;
  } catch (reason) {
    item.status = "error";
    item.error = reason.message || String(reason);
    state.composerAttachmentIds = state.composerAttachmentIds.filter((id) => id !== tempId);
    renderChatAttachments();
    setText("chat-error", `${options.errorPrefix ? `${options.errorPrefix}上传失败` : `${file.name} 上传失败`}：${item.error}`, true);
    return null;
  }
}
async function retryChatAttachment(item) { if (!item?.localFile) return setText("chat-error", "无法重试：浏览器未保留原文件，请重新上传", true); await uploadChatAttachment(item.localFile); }
async function renameChatAttachment(item) { const name = prompt("输入新的文件名", item.name); if (!name || name === item.name) return; try { const result = await api(fetch(`${attachmentApiBase()}/${encodeURIComponent(item.file_id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ name: name.trim() }) })); const saved = normalizeAttachment(result); Object.assign(item, saved || { name: name.trim() }); renderChatAttachments(); } catch (reason) { setText("chat-error", `重命名失败：${reason.message || reason}`, true); } }
async function deleteChatAttachment(item) { if (!confirm(`删除附件“${item.name}”？`)) return; try { await api(fetch(`${attachmentApiBase()}/${encodeURIComponent(item.file_id)}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } })); state.chatAttachments = state.chatAttachments.filter((entry) => entry.file_id !== item.file_id); state.composerAttachmentIds = state.composerAttachmentIds.filter((id) => id !== item.file_id); renderChatAttachments(); } catch (reason) { setText("chat-error", `删除失败：${reason.message || reason}`, true); } }
async function sendAttachmentTo(item, target) { try { const result = await api(fetch(`${attachmentApiBase()}/${encodeURIComponent(item.file_id)}/send-to-${target}`, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ file_id: item.file_id }) })); setText("question-status", result.message || (target === "rvc" ? "已发送到 RVC" : "已发送到知识库")); } catch (reason) { setText("chat-error", `发送失败：${reason.message || reason}`, true); } }

function renderConfirmation() {
  const panel = $("confirmation-panel");
  if (!panel) return;
  panel.classList.toggle("is-hidden", !state.pendingAction);
  renderChatContext();
  if (!state.pendingAction) return;
  const action = state.pendingAction.action || {};
  $("confirmation-title").textContent = action.title || "确认操作";
  const actionArguments = action.arguments || {};
  const detail = Object.entries(actionArguments)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}：${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ");
  $("confirmation-detail").textContent = `${action.target || "当前角色"}${detail ? ` · ${detail}` : ""}`;
}
function setPendingAttachment(fileId) {
  if (!fileId || !state.pendingInput) return;
  const item = (state.chatAttachments || []).find((entry) => entry.file_id === fileId);
  const values = { ...(state.pendingInputValues || {}) };
  // 通用附件只通过 attachment_ids 进入 worker；只有明确的音频输入才保留旧 audio_file_id 兼容字段。
  if (attachmentKind(item) === "audio") values.audio_file_id = fileId;
  else delete values.audio_file_id;
  values.attachment_ids = Array.from(new Set([...(values.attachment_ids || []), fileId]));
  state.pendingInputValues = values;
  renderChatContext();
}

function setPendingInputValue(inputId, value) {
  if (!inputId || value === undefined || value === null || value === "") return;
  const normalized = String(inputId).toLowerCase();
  const key = normalized.includes("model") ? "model_id"
    : normalized.includes("index") ? "index_id"
      : inputId;
  state.pendingInputValues = { ...(state.pendingInputValues || {}), [key]: value };
  renderChatContext();
}

function pendingResumePayload(approved = null) {
  const pending = state.pendingInput || {};
  const values = { ...(state.pendingInputValues || {}) };
  const inline = state.rvcInline;
  const ids = new Set([
    ...getSelectedAttachmentIds(),
    ...(Array.isArray(values.attachment_ids) ? values.attachment_ids : []),
  ].filter(Boolean));
  delete values.attachment_ids;
  // RVC 的按钮动作必须带上当前气泡绑定的资源；不能依赖 checkpoint
  // 恰好仍保留哪一轮 waiting_input，否则“确认处理”会恢复到旧上传请求。
  if (inline?.source?.file_id) ids.add(inline.source.file_id);
  if (inline?.sessionId) values.rvc_session_id = inline.sessionId;
  if (inline?.workflowId) values.workflow_id = inline.workflowId;
  if (inline?.source?.file_id) { values.source_file_id = inline.source.file_id; values.source_attachment_id = inline.source.file_id; }
  if (inline?.agentWorkflow?.worker === "rvc_worker") values.worker = "rvc_worker";
  return {
    conversation_id: state.conversationId,
    specialist: pending.specialist || state.pendingAction?.specialist || "management",
    approved,
    worker: pending.worker || inline?.agentWorkflow?.worker || state.currentWorkflow?.worker || null,
    task_id: pending.task_id || inline?.agentWorkflow?.task_id || state.currentWorkflow?.task_id || null,
    attachment_ids: Array.from(ids),
    input_values: values,
  };
}
function waitingInputLabel(item) {
  return item?.label || item?.title || "还需要补充信息";
}

function appendWaitingInputCard(node, result) {
  // 等待输入只保留说明消息；唯一的操作卡由中央任务工作区渲染，
  // 避免 assistant 气泡和右侧任务栏各自复制一份上传/选择表单。
  const target = node || state.pendingReplyNode || appendMessage("assistant", result?.answer || "还缺少执行任务所需的信息");
  if (target && result?.answer) {
    const body = target.querySelector("p");
    if (body) body.textContent = result.answer;
  }
  renderChatTaskWorkspace();
}

function appendPendingOptions(select, options) {
  select.replaceChildren();
  options.slice(0, 64).forEach((option) => {
    const value = typeof option === "string" ? option : (option.id || option.model_id || option.index_id || option.name || "");
    if (!value) return;
    const label = typeof option === "string" ? option : (option.label || option.name || option.model_id || option.index_id || value);
    const entry = document.createElement("option"); entry.value = value; entry.textContent = label; select.append(entry);
  });
  if (select.options.length) {
    const inputId = String(select.dataset.pendingInputId || "").toLowerCase();
    const current = state.pendingInputValues?.[inputId.includes("model") ? "model_id" : inputId.includes("index") ? "index_id" : inputId];
    if (current) select.value = current;
  }
}

async function loadPendingRvcOptions(select, item) {
  try {
    const payload = await api(fetch("/api/voice/rvc/models", { headers: { "X-YUMENO-Request": "web" } }));
    const options = /index/.test(String(item.kind || "").toLowerCase()) ? payload.indices : payload.models;
    appendPendingOptions(select, Array.isArray(options) ? options : []);
    if (!select.options.length) {
      select.disabled = true;
      if (!select.options.length) {
        const empty = document.createElement("option"); empty.value = ""; empty.textContent = "暂无可用配置"; select.append(empty);
      }
    }
  } catch {
    const failed = document.createElement("option"); failed.value = ""; failed.textContent = "无法读取配置，请稍后重试"; select.replaceChildren(failed);
    select.disabled = true;
  }
}

function hasResumableInlineRvcAction() {
  const worker = String(state.rvcInline?.agentWorkflow?.worker || state.rvcInline?.agentWorkflow?.worker_name || "").trim().toLowerCase();
  const action = String(state.pendingInputValues?.action || "").trim().toLowerCase();
  return worker === "rvc_worker" && Boolean(action);
}

async function resumeAgent(approved = null, options = {}) {
  // Worker 返回 accepted/running 后，handleAgentResult 会清掉 waiting_input；
  // session 轮询到 separated 时仍需通过同一 checkpoint 恢复一次 session_status。
  // 这是显式的 RVC action，不应因没有旧 pendingInput 而静默 no-op。
  const resumableInlineRvc = Boolean(options.forceHttp && hasResumableInlineRvcAction());
  if (((!state.pendingAction && !state.pendingInput) && !resumableInlineRvc) || !state.activePersona) {
    if (options.forceHttp && !state.activePersona) setText("chat-error", "当前对话角色尚未就绪，请稍后重试", true);
    return null;
  }
  if (state.confirmationResponded) return null;
  state.confirmationResponded = true;
  const payload = pendingResumePayload(approved);
  $("confirm-action").disabled = true; $("cancel-action").disabled = true;
  if (!options.forceHttp && sendRealtime({ type: "confirmation.respond", ...payload })) {
    state.pendingAction = null;
    state.pendingInput = null;
    awaitRealtimeAcknowledgement("");
    renderConfirmation(); renderChatContext();
    return null;
  }
  try {
    const result = await api(fetch(`/api/personas/${state.activePersona.id}/agent/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }));
    handleAgentResult(result);
    return result;
  } catch (reason) {
    state.confirmationResponded = false;
    setText("chat-error", reason?.message || String(reason), true);
    throw reason;
  } finally {
    $("confirm-action").disabled = false; $("cancel-action").disabled = false;
  }
}


// 对话工作台：公开流程只呈现用户可理解的阶段，不暴露内部图节点或本地路径。
const CHAT_FLOW_NS = "http://www.w3.org/2000/svg";
const CHAT_FLOW_TERMINAL = new Set(["completed", "succeeded", "done", "failed", "cancelled"]);

function bindChatContextSidebar() {
  const peek = $("chat-context-peek");
  if (!peek || peek.dataset.bound === "true") return;
  peek.dataset.bound = "true";
  peek.addEventListener("click", () => setChatContextOpen(true));
  $("chat-context-close")?.addEventListener("click", () => setChatContextOpen(false));
  $("chat-context-backdrop")?.addEventListener("click", () => setChatContextOpen(false));
  $("chat-context-files-open")?.addEventListener("click", () => {
    setChatAttachmentsDrawer(true);
  });
  $("chat-workflow-toggle")?.addEventListener("click", () => {
    const detail = $("chat-workflow-detail");
    const button = $("chat-workflow-toggle");
    if (!detail || !button) return;
    const expanded = button.getAttribute("aria-expanded") !== "true";
    writeChatPreference(CHAT_PREFERENCE_KEYS.workflow, expanded);
    syncWorkflowPreference(expanded);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.chatContextOpen) setChatContextOpen(false);
  });
}

function setChatContextOpen(open) {
  const sidebar = $("chat-context-sidebar");
  const peek = $("chat-context-peek");
  const backdrop = $("chat-context-backdrop");
  if (!sidebar || !peek) return;
  if (open) state.chatContextLastFocusedElement = document.activeElement;
  state.chatContextOpen = Boolean(open);
  sidebar.classList.toggle("is-hidden", !open);
  sidebar.setAttribute("aria-hidden", String(!open));
  peek.setAttribute("aria-expanded", String(Boolean(open)));
  backdrop?.classList.toggle("is-hidden", !open);
  if (open) $("chat-context-close")?.focus();
  else {
    const returnTarget = state.chatContextLastFocusedElement || peek;
    returnTarget?.focus?.();
    state.chatContextLastFocusedElement = null;
  }
}

function cleanPublicText(value, fallback = "") {
  const text = String(value ?? fallback)
    .replace(/[A-Za-z]:\\[^\s]+/g, "受管文件")
    .replace(/\/(?:home|Users|tmp|var|opt)\/[^\s]+/g, "受管文件")
    .replace(/\b(?:ToolMessage|Supervisor|LangGraph|handoff)\b/gi, "处理阶段");
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function normalizeFlowStatus(status) {
  const value = String(status || "pending").toLowerCase();
  if (["succeeded", "done", "ready"].includes(value)) return "completed";
  if (["processing", "converting", "queued", "preparing"].includes(value)) return value === "queued" ? "pending" : "running";
  return ["pending", "waiting_input", "running", "completed", "failed", "cancelled", "skipped"].includes(value) ? value : "pending";
}

function normalizePublicWorkflow(flow, taskId = "") {
  if (!flow || typeof flow !== "object") return null;
  const nodes = Array.isArray(flow.nodes) ? flow.nodes.map((node, index) => ({
    id: String(node?.id || `step_${index + 1}`),
    label: cleanPublicText(node?.label, `步骤 ${index + 1}`),
    description: cleanPublicText(node?.description || node?.message || ""),
    status: normalizeFlowStatus(node?.status),
    progress: Math.max(0, Math.min(100, Number(node?.progress) || 0)),
    duration_seconds: Number.isFinite(Number(node?.duration_seconds)) ? Number(node.duration_seconds) : null,
    error: cleanPublicText(node?.error || node?.error_message || ""),
  })) : [];
  const ids = new Set(nodes.map((node) => node.id));
  const edges = (Array.isArray(flow.edges) ? flow.edges : [])
    .map((edge) => ({ from: String(edge?.from || ""), to: String(edge?.to || "") }))
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  const waiting = Array.isArray(flow.waiting_inputs || flow.pending_inputs) ? (flow.waiting_inputs || flow.pending_inputs) : [];
  return {
    flow_id: cleanPublicText(flow.flow_id || "task.workflow"),
    task_id: String(taskId || flow.task_id || ""),
    title: cleanPublicText(flow.title, "任务流程"),
    worker: cleanPublicText(flow.worker || flow.worker_name || ""),
    status: normalizeFlowStatus(flow.status),
    current_node: String(flow.current_node || ""),
    progress: Math.max(0, Math.min(100, Number(flow.progress) || 0)),
    nodes,
    edges,
    message: cleanPublicText(flow.message || flow.description || ""),
    description: cleanPublicText(flow.description || ""),
    result_attachments: flow.result_attachments || flow.result_files || flow.outputs || [],
    waiting_inputs: waiting.map((item, index) => ({
      id: String(item?.id || item?.kind || `input_${index + 1}`),
      kind: String(item?.kind || item?.type || "input"),
      label: cleanPublicText(item?.label || item?.title || item?.message, "需要补充信息"),
      description: cleanPublicText(item?.description || item?.detail || ""),
      resolved: Boolean(item?.resolved),
    })),
  };
}

function isAgentRvcWorkflowDescriptor(event, flow) {
  // RVC UI 只接受正式 workflow.worker 合同。不能用用户文本、specialist、
  // flow_id、标题、engine、URL 或孤立事件字段猜测，更不能绕过 Core Agent。
  const worker = String(flow?.worker || "").trim().toLowerCase();
  return worker === "rvc_worker";
}
function hasFormalRvcHandoff(event, flow) {
  const flowWorker = String(flow?.worker || flow?.worker_name || "").trim().toLowerCase();
  if (flowWorker !== "rvc_worker") return false;
  // Worker 信息可能被 Supervisor 包在 result/worker_results/artifacts 中；递归检查
  // 但仍要求 workflow.worker 明确来自 Agent handoff，禁止关键词直接激活。
  const seen = new Set();
  const containsWorker = (value) => {
    if (!value || typeof value !== "object" || seen.has(value)) return false;
    seen.add(value);
    if ([value.worker, value.worker_name].some((item) => String(item || "").trim().toLowerCase() === "rvc_worker")) return true;
    return Object.values(value).some(containsWorker);
  };
  return containsWorker(event);
}
function findRvcField(value, names, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);
  for (const name of names) {
    if (value[name] !== undefined && value[name] !== null && value[name] !== "") return value[name];
  }
  for (const child of Object.values(value)) {
    const found = findRvcField(child, names, seen);
    if (found !== null && found !== undefined && found !== "") return found;
  }
  return null;
}

function activateRvcWorkspaceFromAgent(event, flow) {
  if (!hasFormalRvcHandoff(event, flow)) return false;
  // 专项工作区激活后，清除通用顶部任务状态，避免同一 workflow 出现两份 UI。
  state.currentWorkflow = null;
  // rvcWorkspaceNode() 会同步接管当前 loading assistant 气泡；不能先启动
  // 一个 async 函数再立即读取 state.rvcInline，否则 workflow 元数据会丢失，
  // 后续 input.required 也会回退成“还缺少执行任务所需的信息”通用卡片。
  rvcWorkspaceNode();
  if (state.rvcInline && flow && typeof flow === "object") {
    const payload = (event?.result && typeof event.result === "object") ? event.result : (event || {});
    const workerFlow = flow || {};
    // worker 结果有时包在 worker_results/artifacts/result 中，不能只读一层，
    // 否则 session 已创建但前端永远拿不到 session_id，只会显示 0%。
    const source = { ...event, ...payload, flow: workerFlow };
    const sessionId = findRvcField(source, ["rvc_session_id", "session_id"]);
    const attachmentIds = [
      ...(Array.isArray(payload.attachment_ids) ? payload.attachment_ids : []),
      ...(Array.isArray(workerFlow.attachment_ids) ? workerFlow.attachment_ids : []),
    ].filter(Boolean);
    const nestedSourceId = findRvcField(source, ["source_file_id", "source_attachment_id", "audio_file_id"]);
    const sourceId = nestedSourceId || attachmentIds[0] || null;
    state.rvcInline.agentWorkflow = workerFlow;
    state.rvcInline.workflowId = String(workerFlow.flow_id || payload.workflow_id || event?.workflow_id || state.rvcInline.workflowId || "");
    state.rvcInline.sessionId = sessionId ? String(sessionId) : (state.rvcInline.sessionId || null);
    if (sourceId) {
      state.rvcInline.source = (state.chatAttachments || []).find((item) => String(item.file_id) === String(sourceId))
        || { file_id: sourceId, name: "RVC 输入文件", kind: "audio", mime_type: "audio/*" };
    }
    const taskId = findRvcField(source, ["task_id", "rvc_task_id"]);
    if (taskId) {
      state.rvcInline.taskId = String(taskId);
      // Worker 可能在同一结果中直接返回 conversion task；必须立刻接上
      // inline 轮询，否则界面会固定显示“正在生成最终音频 · 0%”。
      void pollInlineRvcTask();
    }
    renderRvcInline();
  }
  return true;
}

function consumeWorkflowEvent(event) {
  const kind = String(event?.kind || event?.type || "").replaceAll(".", "_");
  const taskId = stableTaskId(event);
  const flow = event?.flow || event?.workflow;
  const isRvcEvent = isAgentRvcWorkflowDescriptor(event, flow);
  const isFormalRvcEvent = hasFormalRvcHandoff(event, flow);
  const hasIsolatedRvcWorker = !isRvcEvent && !flow && (
    String(event?.worker || event?.worker_name || "").trim().toLowerCase() === "rvc_worker"
  );
  // 顶层孤立 worker 只是一条内部兼容/状态信息，不是 Core Agent 已完成
  // handoff 的公开合同。禁止它落入通用任务卡，否则会在“正在分析请求…”
  // 阶段提前显示 RVC 卡片。
  if (hasIsolatedRvcWorker && (kind === "workflow_update" || kind === "task_status")) return true;
  if (kind === "workflow_update") {
    if (isRvcEvent) {
      // workflow_update 已经明确证明 Core Agent → rvc_worker handoff，
      // 不必再等待一个可能被同步工具调用阻塞的 result 才显示操作入口。
      state.pendingRvcWorkflowEvent = { event, flow: flow || event };
      if (isFormalRvcEvent) {
        activateRvcWorkspaceFromAgent(event, flow || event);
      }
      return true;
    }
    if (taskId) registerChatTask(event);
    setChatWorkflow(flow, taskId);
    return true;
  }
  if (kind === "task_status") {
    state.currentTaskStatus = event;
    // RVC task 状态只有在 Agent 已明确交接给 rvc_worker 后，才进入内嵌工作区；
    // 不允许兼容 task_status 在“正在分析请求…”阶段创建顶部任务卡。
    if (isRvcEvent) {
      // task_status 只有在最终事件明确携带 worker=rvc_worker 时，才能更新已激活的气泡。
      if (!isFormalRvcEvent) return true;
      if (state.rvcInline && flow) {
        state.rvcInline.agentWorkflow = flow;
        renderRvcInline();
      } else {
        state.pendingRvcWorkflowEvent = { event, flow: flow || event };
      }
      return true;
    }
    if (taskId) registerChatTask(event);
    if (flow) setChatWorkflow(flow, taskId);
    else updateWorkflowFromTask(event, taskId);
    return true;
  }
  const waitingItems = event?.waiting_inputs || event?.pending_inputs;
  const hasWaitingItems = Array.isArray(waitingItems) ? waitingItems.length > 0 : Boolean(waitingItems);
  if (event?.type !== "input.required" && (["waiting_input", "waiting_for_input"].includes(kind) || hasWaitingItems)) {
    applyAgentContextResult({ ...event, task_id: taskId, waiting_inputs: waitingItems || [] });
    return true;
  }
  return false;
}
function setChatWorkflow(flow, taskId = "") {
  const normalized = normalizePublicWorkflow(flow, taskId);
  if (!normalized) return;
  // RVC 的唯一主工作区挂在 Agent assistant 气泡内，绝不在聊天顶部
  // 复活“RVC 音频转换”总览卡（包括历史 task 和兼容轮询事件）。
  if (normalized.worker === "rvc_worker") {
    state.currentWorkflow = null;
    const host = $("chat-task-workspace");
    host?.replaceChildren();
    host?.classList.add("is-hidden");
    return;
  }
  const snapshot = (value) => JSON.stringify({
    flow_id: value.flow_id,
    task_id: value.task_id,
    title: value.title,
    worker: value.worker,
    status: value.status,
    current_node: value.current_node,
    progress: value.progress,
    nodes: value.nodes,
    edges: value.edges,
    message: value.message,
    result_attachments: value.result_attachments,
    waiting_inputs: value.waiting_inputs,
  });
  if (state.currentWorkflow && snapshot(state.currentWorkflow) === snapshot(normalized)) return;
  state.currentWorkflow = normalized;
  renderChatContext();
}

function rvcFallbackNodes() {
  return [
    ["prepare_source", "准备音频", "将附件转换为可处理的音频"],
    ["separate_vocals", "分离人声", "提取 Vocals 与 Instrumental"],
    ["load_model", "加载音色模型", "准备 RVC 模型与 Index"],
    ["gpu_inference", "GPU 音色转换", "提取音高与特征并生成目标音色"],
    ["register_result", "保存结果", "将音频登记到当前会话附件"],
  ];
}

function ensureRvcWorkflow(entry) {
  // 旧 task 兼容入口只允许更新已经由 Agent 激活的内嵌工作区。
  if (!state.rvcInline) return null;
  if (state.currentWorkflow?.task_id === String(entry?.task_id || "")) return;
  const nodes = rvcFallbackNodes().map(([id, label, description], index) => ({ id, label, description, status: index === 0 ? "running" : "pending" }));
  setChatWorkflow({
    flow_id: "rvc.audio_conversion",
    task_id: entry?.task_id,
    title: "RVC 音频转换",
    worker: "rvc_worker",
    status: "running",
    current_node: "prepare_source",
    progress: 0,
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => ({ from: node.id, to: nodes[index + 1].id })),
  }, entry?.task_id);
}

function taskPhaseNode(phase) {
  const value = String(phase || "").toLowerCase();
  if (/register|attachment|saving|output|encoding/.test(value)) return "register_result";
  if (/convert|infer|feature|pitch|f0|gpu/.test(value)) return "gpu_inference";
  if (/model|index|load/.test(value)) return "load_model";
  if (/separat|vocal|instrument/.test(value)) return "separate_vocals";
  return "prepare_source";
}

function updateWorkflowFromTask(task, taskId = "") {
  if (!task || typeof task !== "object") return;
  // 旧 task_status 兼容入口不能凭 task 字段生成顶部 RVC 卡片；只有已经
  // 由 Core Agent handoff 激活的 assistant 工作区才允许接收状态更新。
  const worker = String(task.worker || task.worker_name || "").trim().toLowerCase();
  if (worker !== "rvc_worker" || !state.rvcInline) return;
  state.rvcInline.agentWorkflow = task.workflow || task.flow || state.rvcInline.agentWorkflow || null;
  const flow = state.currentWorkflow;
  if (!flow) return;
  if (task.workflow || task.flow) {
    setChatWorkflow(task.workflow || task.flow, taskId);
    return;
  }
  const rawStatus = String(task.status || task.state || "running").toLowerCase();
  const status = normalizeFlowStatus(rawStatus);
  const current = taskPhaseNode(task.phase);
  const currentIndex = flow.nodes.findIndex((node) => node.id === current);
  const nextFlow = { ...flow, nodes: flow.nodes.map((node, index) => ({
    ...node,
    status: status === "failed" && index === currentIndex ? "failed"
      : status === "cancelled" && index === currentIndex ? "cancelled"
      : status === "completed" ? "completed"
      : index < currentIndex ? "completed"
      : index === currentIndex ? "running" : "pending",
    progress: index === currentIndex ? Math.max(0, Math.min(100, Number(task.progress ?? task.progress_percent) || 0)) : node.progress,
    error: status === "failed" && index === currentIndex ? cleanPublicText(task.error || task.message) : "",
  })) };
  nextFlow.current_node = status === "completed" ? nextFlow.nodes.at(-1)?.id || current : current;
  nextFlow.status = status;
  nextFlow.progress = Math.max(0, Math.min(100, Number(task.progress ?? task.progress_percent) || (status === "completed" ? 100 : flow.progress)));
  setChatWorkflow(nextFlow, taskId);
}

function flowStatusLabel(status) {
  return ({ pending: "等待中", waiting_input: "等待输入", running: "进行中", completed: "已完成", failed: "失败", cancelled: "已取消", skipped: "已跳过" })[status] || "等待中";
}

function inferTaskType(flow) {
  // RVC 不是前端关键词识别结果；只有 Agent 明确交接的 worker 才能显示 RVC 标签。
  const worker = String(flow?.worker || flow?.worker_name || "").trim().toLowerCase();
  const value = `${worker} ${flow?.flow_id || ""} ${flow?.title || ""}`.toLowerCase();
  if (worker === "rvc_worker") return "RVC 变声";
  if (/sovit|gpt.?sovits|voice.?material|音色|tts/.test(value)) return "GPT-SoVITS 音色处理";
  if (/rag|knowledge|index|document|文档|知识/.test(value)) return "文档解析 / 知识库";
  if (/media|image|video|audio|媒体/.test(value)) return "媒体分析";
  return "文件任务";
}
async function cancelActiveChatTask() {
  // RVC 主工作区不再写入 currentWorkflow；新消息/停止按钮必须先走同一
  // 个内嵌取消入口，否则旧 Agent turn 会继续占用 checkpoint 和轮询。
  if (state.rvcInline && !state.rvcInline.cancelling) {
    await cancelInlineRvc();
    state.rvcInline = null;
    state.pendingAction = null;
    state.pendingInput = null;
    state.pendingInputValues = {};
    updateComposerControls();
    return;
  }
  const flow = state.currentWorkflow;
  const taskId = flow?.task_id || state.pendingInput?.task_id || "";
  const isRvc = Boolean(taskId && String(flow?.worker || flow?.worker_name || "").trim().toLowerCase() === "rvc_worker");
  try {
    if (isRvc) {
      await api(fetch(`/api/voice/rvc/tasks/${encodeURIComponent(taskId)}`, {
        method: "DELETE", headers: { "X-YUMENO-Request": "web" },
      }));
      state.rvcTaskPollers?.delete?.(String(taskId));
    } else if (state.realtimeTurnId) {
      if (!sendRealtime({ type: "generation.cancel" })) throw new Error("实时连接不可用");
    } else if (state.agentStreamController) {
      state.agentStreamController.abort();
      state.agentStreamController = null;
    }
    state.pendingAction = null;
    state.pendingInput = null;
    state.pendingInputValues = {};
    state.confirmationResponded = false;
    state.realtimeTurnId = null;
    state.realtimeExecutionPending = false;
    state.agentRequestPending = false;
    state.realtimeSubmissionPending = false;
    if (flow) {
      state.currentWorkflow = { ...flow, status: "cancelled", message: "任务已取消", waiting_inputs: [] };
    }
    clearRealtimeSubmission();
    setText("question-status", "任务已取消");
    renderConfirmation();
    renderChatContext();
    updateComposerControls();
  } catch (reason) {
    setText("chat-error", `无法中止任务：${reason?.message || reason}`, true);
  }
}

function renderChatTaskActions(flow) {
  const host = $("chat-task-workspace-actions");
  if (!host) return;
  host.replaceChildren();
  const waiting = state.pendingInput;
  const action = state.pendingAction;
  const items = normalizedWaitingInputs(waiting?.waiting_inputs || waiting?.pending_inputs);
  if (action) {
    const confirm = pendingActionButton("确认并继续", "arrow-right", () => resumeAgent(true), true);
    host.append(confirm);
  }
  items.forEach((item) => {
    const kind = String(item.kind || item.type || "").toLowerCase();
    const row = document.createElement("div");
    row.className = "chat-task-workspace-action-row";
    const label = document.createElement("span");
    label.className = "chat-task-workspace-action-label";
    label.textContent = waitingInputLabel(item);
    row.append(label);
    if (/file|attachment|audio|video|upload/.test(kind)) {
      row.append(pendingActionButton("上传文件", "upload", () => $("chat-voice-material")?.click(), true));
      const choose = pendingActionButton("从会话文件选择", "paperclip", () => {
        setChatAttachmentsDrawer(true);
        setChatContextOpen(false);
      });
      row.append(choose);
    } else if (/model|index|voice_asset|rvc_/.test(kind)) {
      const select = document.createElement("select");
      select.className = "chat-pending-select";
      select.setAttribute("aria-label", waitingInputLabel(item));
      select.dataset.pendingInputId = item.input_id || item.id || item.kind || "input";
      const options = item.options || item.models || item.indices;
      if (Array.isArray(options) && options.length) appendPendingOptions(select, options);
      else {
        const loading = document.createElement("option");
        loading.value = ""; loading.textContent = "正在读取可用配置…"; select.append(loading);
        void loadPendingRvcOptions(select, item);
      }
      select.addEventListener("change", () => setPendingInputValue(select.dataset.pendingInputId, select.value));
      row.append(select);
    }
    const description = item.description || item.detail;
    if (description) {
      const hint = document.createElement("small"); hint.textContent = description; row.append(hint);
    }
    host.append(row);
  });
  if (waiting) {
    const continueButton = pendingActionButton("继续执行", "play", () => resumeAgent(null), true);
    continueButton.disabled = items.some((item) => /file|attachment|audio|video|upload/.test(String(item.kind || item.type || "").toLowerCase()))
      && !getSelectedAttachmentIds().length;
    host.append(continueButton);
  }
  const active = flow && !CHAT_FLOW_TERMINAL.has(flow.status);
  if (active || waiting || action) host.append(pendingActionButton("中止任务", "square", cancelActiveChatTask, false));
  if (flow?.status === "failed") host.append(pendingActionButton("重试任务", "rotate-ccw", () => {
    if (!isConversationBusy()) sendQuestionText("重试刚才的任务");
  }, true));
  icons();
}

function isInlineRvcActive() {
  return Boolean(state.rvcInline?.host?.isConnected || state.currentWorkflow?.worker === "rvc_worker");
}

function renderChatTaskWorkspace() {
  const host = $("chat-task-workspace");
  if (!host) return;
  // RVC 的唯一主工作区挂在 Agent assistant 气泡内；顶部总览只保留在右侧摘要。
  if (isInlineRvcActive()) {
    host.replaceChildren();
    host.classList.add("is-hidden");
    return;
  }
  const flow = state.currentWorkflow;
  const selected = selectedAttachments().filter((item) => !["removed", "error"].includes(item.status));
  const taskFiles = [...selected];
  const resultFiles = (flow?.result_attachments || flow?.result_files || flow?.outputs || []).map(normalizeAttachment).filter(Boolean);
  const hasTask = Boolean(flow) || taskFiles.length > 0;
  host.classList.toggle("is-hidden", !hasTask);
  if (!hasTask) return;
  const title = $("chat-task-workspace-title");
  const type = $("chat-task-workspace-type");
  const stage = $("chat-task-workspace-stage");
  const progressLabel = $("chat-task-workspace-progress-label");
  const bar = $("chat-task-workspace-progress-bar");
  const message = $("chat-task-workspace-message");
  const progress = Math.max(0, Math.min(100, Number(flow?.progress) || (taskFiles.length ? 0 : 100)));
  const current = flow?.nodes?.find((node) => node.id === flow.current_node) || flow?.nodes?.find((node) => node.status === "running");
  if (title) title.textContent = flow?.title || "当前文件";
  if (type) type.textContent = inferTaskType(flow);
  if (stage) stage.textContent = flow ? (current?.label || flowStatusLabel(flow.status)) : "等待发送";
  if (progressLabel) progressLabel.textContent = `${Math.round(progress)}%`;
  if (bar) bar.style.width = `${progress}%`;
  if (message) message.textContent = flow?.message || flow?.description || (taskFiles.length ? "这些文件将作为下一条消息的输入资源。" : "任务会在对话中继续推进。");
  const filesHost = $("chat-task-workspace-files");
  if (filesHost) {
    filesHost.replaceChildren();
    taskFiles.forEach((item) => {
      const card = document.createElement("article"); card.className = "chat-task-file-card";
      const head = document.createElement("div"); head.className = "chat-task-file-head";
      const icon = document.createElement("i"); icon.dataset.lucide = attachmentIcon(item);
      const name = document.createElement("strong"); name.textContent = item.name;
      const meta = document.createElement("small"); meta.textContent = item.status === "uploading" ? `上传中 ${item.progress || 0}%` : (attachmentMeta(item) || attachmentTypeLabel(item));
      head.append(icon, name, meta); card.append(head, createAttachmentPreview(item, { compact: true }));
      filesHost.append(card);
    });
    if (!taskFiles.length && flow) { const empty = document.createElement("p"); empty.className = "chat-task-files-empty"; empty.textContent = "任务尚未关联文件，按对话提示上传或继续。"; filesHost.append(empty); }
  }
  renderChatTaskActions(flow);
  const resultsHost = $("chat-task-workspace-results");
  if (resultsHost) {
    resultsHost.replaceChildren(); resultsHost.classList.toggle("is-hidden", !resultFiles.length);
    if (resultFiles.length) { const label = document.createElement("strong"); label.textContent = "输出结果"; resultsHost.append(label); resultFiles.forEach((item) => resultsHost.append(createAttachmentPreview(item, { compact: true }))); }
  }
  icons();
}

function renderChatContext() {
  const peek = $("chat-context-peek");
  if (!peek) return;
  const flow = state.currentWorkflow;
  // RVC 的状态全部在 assistant 气泡内，不显示右侧通用任务摘要或顶部工作区。
  if (isInlineRvcActive() || flow?.worker === "rvc_worker") {
    renderChatTaskWorkspace();
    ["chat-task-summary-section", "chat-pending-section", "chat-workflow-section", "chat-context-attachments-section"].forEach((id) => $(id)?.classList.add("is-hidden"));
    peek.classList.add("is-hidden");
    return;
  }
  renderChatTaskWorkspace();
  const unresolved = normalizedWaitingInputs((flow?.waiting_inputs || []).filter((item) => !item.resolved));
  if (state.pendingAction) unresolved.push({ id: "confirmation", kind: "confirmation", label: state.pendingAction.action?.title || "确认操作", description: "确认后继续执行当前任务" });
  const uniqueUnresolved = uniqueByStableId(unresolved, (item) => String(item.id || `${item.kind}:${item.label}`));
  const hasTask = Boolean(flow && !["completed", "cancelled"].includes(flow.status));
  const hasAttention = uniqueUnresolved.length > 0 || flow?.status === "failed";
  const showEntry = hasTask || hasAttention;
  peek.classList.toggle("is-hidden", !showEntry);
  if (!showEntry && state.chatContextOpen) setChatContextOpen(false);
  const count = $("chat-context-peek-count");
  if (count) { count.textContent = String(uniqueUnresolved.length || 1); count.classList.toggle("is-hidden", !hasAttention); }
  const label = $("chat-context-peek-label");
  if (label) label.textContent = hasAttention ? "待处理" : "任务";
  renderTaskSummary(flow);
  renderPendingInputs(uniqueUnresolved);
  renderWorkflow(flow);
  renderContextAttachments();
  renderChatSettingsStatus();
  icons();
}
function renderTaskSummary(flow) {
  const section = $("chat-task-summary-section");
  const host = $("chat-task-summary");
  if (!section || !host) return;
  section.classList.toggle("is-hidden", !flow);
  host.replaceChildren();
  if (!flow) return;
  const current = flow.nodes.find((node) => node.id === flow.current_node) || flow.nodes.find((node) => node.status === "running") || flow.nodes.at(-1);
  const title = document.createElement("strong"); title.textContent = flow.title;
  const phase = document.createElement("p"); phase.textContent = current?.label || flowStatusLabel(flow.status);
  const progressRow = document.createElement("div"); progressRow.className = "chat-context-progress-row";
  const progress = document.createElement("progress"); progress.max = 100; progress.value = flow.progress;
  const value = document.createElement("span"); value.textContent = `${Math.round(flow.progress)}%`;
  progressRow.append(progress, value); host.append(title, phase, progressRow);
  // 右侧栏只显示摘要；取消/重试等动作统一放在中央任务工作区。
  const worker = $("chat-task-worker"); if (worker) worker.textContent = flow.worker || "Agent";
}

function pendingActionButton(label, iconName, onClick, primary = false) {
  const button = document.createElement("button"); button.type = "button";
  button.className = `chat-pending-action${primary ? " is-primary" : ""}`;
  const icon = document.createElement("i"); icon.dataset.lucide = iconName;
  const text = document.createElement("span"); text.textContent = label;
  button.append(icon, text); button.addEventListener("click", onClick); return button;
}

function renderPendingInputs(items) {
  // 待处理动作已经迁移到中央任务工作区；右侧栏只保留只读任务摘要。
  const section = $("chat-pending-section");
  const host = $("chat-pending-list");
  if (section) section.classList.add("is-hidden");
  if (host) host.replaceChildren();
  const count = $("chat-pending-count");
  if (count) count.textContent = "0";
}

function renderWorkflow(flow) {
  const section = $("chat-workflow-section"); const canvas = $("chat-workflow-canvas");
  if (!section || !canvas) return;
  section.classList.toggle("is-hidden", !flow?.nodes?.length); canvas.replaceChildren();
  if (!flow?.nodes?.length) return;
  if (flow.status === "waiting_input" || flow.status === "failed") {
    syncWorkflowPreference(true);
  } else {
    syncWorkflowPreference(readChatPreference(CHAT_PREFERENCE_KEYS.workflow, false));
  }
  const meta = $("chat-workflow-meta");
  if (meta) meta.textContent = `${flowStatusLabel(flow.status)} · ${flow.nodes.filter((node) => node.status === "completed").length}/${flow.nodes.length} 阶段`;
  const width = 286; const nodeHeight = 56; const gap = 26; const top = 12; const height = top * 2 + flow.nodes.length * nodeHeight + Math.max(0, flow.nodes.length - 1) * gap;
  const svg = document.createElementNS(CHAT_FLOW_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", `${flow.title}流程，共 ${flow.nodes.length} 个阶段`);
  const indexById = new Map(flow.nodes.map((node, index) => [node.id, index]));
  flow.edges.forEach((edge) => {
    const from = indexById.get(edge.from); const to = indexById.get(edge.to);
    if (from == null || to == null) return;
    const path = document.createElementNS(CHAT_FLOW_NS, "path");
    const x1 = 18; const y1 = top + from * (nodeHeight + gap) + nodeHeight;
    const x2 = 18; const y2 = top + to * (nodeHeight + gap);
    const mid = (y1 + y2) / 2;
    path.setAttribute("d", `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`);
    path.setAttribute("class", `chat-flow-edge${flow.nodes[from]?.status === "completed" ? " is-completed" : ""}`);
    svg.append(path);
  });
  flow.nodes.forEach((node, index) => {
    const y = top + index * (nodeHeight + gap);
    const group = document.createElementNS(CHAT_FLOW_NS, "g");
    group.setAttribute("class", `chat-flow-node is-${node.status}`); group.setAttribute("tabindex", "0"); group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${node.label}，${flowStatusLabel(node.status)}${node.progress ? `，${Math.round(node.progress)}%` : ""}`);
    const rail = document.createElementNS(CHAT_FLOW_NS, "circle"); rail.setAttribute("cx", "18"); rail.setAttribute("cy", String(y + nodeHeight / 2)); rail.setAttribute("r", "6"); rail.setAttribute("class", "chat-flow-dot");
    const rect = document.createElementNS(CHAT_FLOW_NS, "rect"); rect.setAttribute("x", "34"); rect.setAttribute("y", String(y)); rect.setAttribute("width", "244"); rect.setAttribute("height", String(nodeHeight)); rect.setAttribute("rx", "8"); rect.setAttribute("class", "chat-flow-card");
    const title = document.createElementNS(CHAT_FLOW_NS, "text"); title.setAttribute("x", "48"); title.setAttribute("y", String(y + 23)); title.setAttribute("class", "chat-flow-title"); title.textContent = node.label;
    const stateText = document.createElementNS(CHAT_FLOW_NS, "text"); stateText.setAttribute("x", "48"); stateText.setAttribute("y", String(y + 42)); stateText.setAttribute("class", "chat-flow-state"); stateText.textContent = node.status === "running" && node.progress ? `${flowStatusLabel(node.status)} · ${Math.round(node.progress)}%` : flowStatusLabel(node.status);
    group.append(rail, rect, title, stateText);
    const showDetail = () => renderWorkflowNodeDetail(node);
    group.addEventListener("click", showDetail); group.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showDetail(); } });
    svg.append(group);
  });
  canvas.append(svg);
  const active = flow.nodes.find((node) => node.id === flow.current_node) || flow.nodes.find((node) => node.status === "failed") || flow.nodes.at(-1);
  renderWorkflowNodeDetail(active);
}

function renderWorkflowNodeDetail(node) {
  const host = $("chat-workflow-node-detail"); if (!host) return;
  host.replaceChildren(); if (!node) return;
  const head = document.createElement("div"); const title = document.createElement("strong"); title.textContent = node.label;
  const stateLabel = document.createElement("span"); stateLabel.className = `is-${node.status}`; stateLabel.textContent = flowStatusLabel(node.status); head.append(title, stateLabel);
  const detail = document.createElement("p"); detail.textContent = node.error || node.description || "暂无更多详情";
  host.append(head, detail);
}

function renderContextAttachments() {
  const section = $("chat-context-attachments-section");
  if (section) section.classList.add("is-hidden");
}

// RVC 对话工作区：文件先进入会话附件，再复制到受管 RVC session；UI 只呈现一个用户可推进的工作区。
async function startInlineRvcWorkflow(attachments = []) {
  const node = rvcWorkspaceNode();
  if (!node) return;
  const file = attachments.find((item) => ["audio", "video"].includes(attachmentKind(item)));
  if (file) await attachInlineRvcSource(file);
}
function chatRvcHeaders(json = false) { const headers = { "X-YUMENO-Request": "web" }; if (json) headers["Content-Type"] = "application/json"; return headers; }
async function chatRvcApi(url, options = {}) { const response = await fetch(url, { ...options, headers: { ...chatRvcHeaders(Boolean(options.body && typeof options.body === "string")), ...(options.headers || {}) } }); let data = {}; try { data = await response.json(); } catch {} if (!response.ok) throw new Error(data.detail || data.message || `HTTP ${response.status}`); return data; }
function rvcWorkspaceNode() {
  if (state.rvcInline?.node?.isConnected) return state.rvcInline.node;
  const node = state.realtimeAnswerNode?.isConnected
    ? state.realtimeAnswerNode
    : (state.pendingReplyNode || appendMessage("assistant", "请上传需要变声的音频或视频。"));
  if (!node) return null;
  // Agent 先发出的临时阶段在工作区接管后必须清理，避免“正在分析请求…”与卡片叠加。
  node.classList.remove("message-loading");
  delete node.dataset.pendingTurn;
  clearReplyStage(node);
  // 清掉所有历史阶段节点。旧版本可能同时留下列表、详情和独立 stage 行，
  // 不能只删除第一个匹配项，否则“正在分析请求…”仍会出现在卡片旁边。
  node.querySelectorAll(
    ".agent-process-list, .agent-process-details, .thinking-indicator, [data-role=\"agent-stage\"], p[data-stage]",
  ).forEach((item) => item.remove());
  const body = node.querySelector('[data-role="voice-reply"]') || node.querySelector("p");
  if (body) { body.textContent = "请上传需要变声的音频或视频。"; delete body.dataset.stage; }
  node.classList.add("message-rvc-workflow");
  state.pendingReplyNode = null;
  const host = document.createElement("section");
  host.className = "rvc-inline-workspace";
  host.setAttribute("aria-label", "RVC 对话工作区");
  node.append(host);
  state.rvcInline = { node, host, sessionId: null, source: null, state: { phase: "awaiting_source" }, models: null, taskId: null, task: null, result: null, pollTimer: null, generation: 0, cancelling: false, sourceConfirmed: false, configStep: 0, rvcResourceStatus: null, rvcResourcePollTimer: null, rvcResourcePolling: false, configAnswers: { index_id: undefined, pitch: undefined, mix_instrumental: undefined } };
  renderRvcInline();
  return node;
}
function rvcInlineFile() { return state.rvcInline?.source || selectedAttachments().find((item) => ["audio", "video"].includes(attachmentKind(item))); }
function rvcFileUrl(sessionId, fileId) { return `/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}/files/${encodeURIComponent(fileId)}`; }
function rvcButton(label, action, primary = false) { const b = document.createElement("button"); b.type = "button"; b.className = `rvc-inline-button${primary ? " is-primary" : ""}`; b.textContent = label; b.addEventListener("click", action); return b; }
function rvcSessionPayload(value) {
  const payload = value?.session && typeof value.session === "object" ? value.session : value;
  return payload && typeof payload === "object" ? payload : {};
}
function rvcPhase(data) { const session = rvcSessionPayload(data?.state); return String(session.phase || session.status || "idle").toLowerCase(); }
function rvcTerminal(phase) { return ["failed", "cancelled", "separated"].includes(phase); }
function rvcProgress(data) { if (data?.taskId) return Math.max(0, Math.min(100, Number(data.taskProgress) || 0)); const session = rvcSessionPayload(data?.state); return Math.max(0, Math.min(100, Number(session.progress) || 0)); }
function rvcProgressLabel(data, phase) { if (data?.taskId) return `正在生成最终音频 · ${Math.round(rvcProgress(data))}%`; if (["processing", "extracting", "normalizing", "separating"].includes(phase)) return `${phase === "separating" ? "正在分离人声" : "正在准备音频"} · ${Math.round(rvcProgress(data))}%`; return ""; }
function appendRvcCompletionPrompt(data) {
  if (!data?.result || data.completionPromptShown) return;
  // 最终结果已落地后，释放本轮 Agent/实时请求锁；询问消息必须允许用户直接回复。
  state.agentRequestPending = false;
  state.realtimeBusy = false;
  state.realtimeSubmissionPending = false;
  state.realtimeExecutionPending = false;
  state.pendingInput = null;
  state.pendingAction = null;
  state.pendingReplyNode = null;
  state.realtimeTurnId = null;
  data.completionPromptShown = true;
  appendMessage("assistant", "最终音频已经生成，请检查试听结果。本次 RVC 任务是否完成？如果需要重新开始、重新分离，或返回模型与参数配置，请直接告诉我。", undefined, []);
}
function rvcRuntimeReady(status) {
  if (!status || status.installing) return false;
  const missing = Array.isArray(status.missing) ? status.missing : [];
  if (missing.some((item) => ["runtime", "hubert", "rmvpe", "cuda"].includes(String(item).toLowerCase()))) return false;
  if (status.installed === true) return true;
  const components = status.components || {};
  return Boolean(components.runtime?.ready && components.hubert?.ready && components.rmvpe?.ready);
}
function rvcResourceStatusLabel(status) {
  if (!status) return "正在检查 RVC 资源…";
  const phaseLabels = { preparing: "准备运行环境", runtime: "创建 RVC Python 运行时", dependencies: "安装 RVC 推理依赖", verify: "验证推理环境", resources: "下载 Hubert / RMVPE", done: "RVC 基础运行时已就绪", failed: "RVC 下载失败", cancelled: "RVC 下载已取消" };
  const phase = phaseLabels[String(status.phase || "").toLowerCase()] || status.detail || "正在准备 RVC 资源";
  if (status.installing) return `${phase}${status.progress_percent != null ? ` · ${Math.round(Number(status.progress_percent) || 0)}%` : ""}`;
  return status.error || phase;
}
function stopRvcResourcePoll(data = state.rvcInline) {
  if (!data) return;
  if (data.rvcResourcePollTimer) clearTimeout(data.rvcResourcePollTimer);
  data.rvcResourcePollTimer = null;
  data.rvcResourcePolling = false;
}
function pollRvcResourceStatus(data = state.rvcInline) {
  if (!data || data.rvcResourcePolling) return;
  data.rvcResourcePolling = true;
  const tick = async () => {
    data.rvcResourcePollTimer = null;
    try { data.rvcResourceStatus = await chatRvcApi("/api/providers/rvc/status"); }
    catch (error) { data.rvcResourceStatus = { ready: false, installed: false, phase: "failed", error: error?.message || String(error) }; }
    if (state.rvcInline !== data) { stopRvcResourcePoll(data); return; }
    data.rvcResourcePolling = false;
    renderRvcInline();
    if (data.rvcResourceStatus?.installing) {
      data.rvcResourcePolling = true;
      data.rvcResourcePollTimer = setTimeout(() => void tick(), 1000);
    }
  };
  void tick();
}
function startRvcResourceInstall() {
  const data = state.rvcInline; if (!data || data.rvcResourceStatus?.installing) return;
  data.rvcResourceStatus = { ...(data.rvcResourceStatus || {}), installing: true, phase: "preparing", progress_percent: 0, error: "" };
  renderRvcInline();
  void chatRvcApi("/api/providers/rvc/install", { method: "POST" }).then((status) => {
    if (state.rvcInline !== data) return;
    data.rvcResourceStatus = status; renderRvcInline(); pollRvcResourceStatus(data);
  }).catch((error) => {
    if (state.rvcInline !== data) return;
    data.rvcResourceStatus = { ready: false, installed: false, phase: "failed", installing: false, error: error?.message || String(error) }; renderRvcInline();
  });
}
function cancelRvcResourceInstall() {
  const data = state.rvcInline; if (!data) return;
  stopRvcResourcePoll(data);
  data.rvcResourceStatus = { ...(data.rvcResourceStatus || {}), installing: true, cancelling: true, phase: "cancelled", detail: "正在取消下载" };
  renderRvcInline();
  void chatRvcApi("/api/providers/rvc/install/cancel", { method: "DELETE" }).then((status) => {
    if (state.rvcInline !== data) return;
    data.rvcResourceStatus = status; renderRvcInline();
    if (status?.installing) pollRvcResourceStatus(data);
  }).catch((error) => {
    if (state.rvcInline !== data) return;
    data.rvcResourceStatus = { ...(data.rvcResourceStatus || {}), installing: false, cancelling: false, phase: "failed", error: error?.message || String(error) }; renderRvcInline();
  });
}
function renderRvcResourceCard(box, status) {
  const card = document.createElement("section"); card.className = "rvc-inline-resource-card";
  const title = document.createElement("strong"); title.textContent = status?.installing ? "正在准备 RVC 运行环境" : (status?.error ? "RVC 运行环境准备失败" : "RVC 尚未完成配置");
  const detail = document.createElement("p"); detail.textContent = status?.installing ? rvcResourceStatusLabel(status) : (status?.error || "首次使用需要下载推理运行时和基础资源。下载完成后即可继续当前对话。");
  const progress = document.createElement("progress"); progress.max = 100; progress.value = Math.max(0, Math.min(100, Number(status?.progress_percent) || 0)); progress.className = "rvc-inline-progress";
  const actions = document.createElement("div"); actions.className = "rvc-inline-resource-actions";
  if (status?.installing) { const cancel = rvcButton(status?.cancelling ? "正在取消…" : "取消下载", () => cancelRvcResourceInstall()); cancel.disabled = Boolean(status?.cancelling); actions.append(cancel); }
  else actions.append(rvcButton(status?.error ? "重试下载" : "开始下载 RVC 资源", () => startRvcResourceInstall(), true));
  card.append(title, detail, progress, actions); box.append(card);
}
function renderRvcInline() {
  const data = state.rvcInline; const box = data?.host; if (!box) return;
  const session = rvcSessionPayload(data.state); const phase = rvcPhase(data); box.replaceChildren();
  if (!data.rvcResourceStatus) { pollRvcResourceStatus(data); }
  const resourceStatus = data.rvcResourceStatus;
  if (phase !== "awaiting_source" && !resourceStatus?.installing) stopRvcResourcePoll(data);
  const stage = document.createElement("div"); stage.className = "rvc-inline-stage";
  if (phase === "awaiting_source" && resourceStatus && !rvcRuntimeReady(resourceStatus)) renderRvcResourceCard(box, resourceStatus);
  const labels = { awaiting_source: "等待参考音频或视频", uploaded: "文件已上传，请确认是否处理", extracting: "正在准备音频", normalizing: "正在标准化 WAV", ready: "音频已准备，正在进入人声分离", separating: "正在分离 Vocals 与 Instrumental", separated: "分离完成，请逐项确认转换配置", failed: "处理失败", cancelled: "任务已中止" };
  stage.textContent = data.result ? "RVC 变声完成" : (rvcProgressLabel(data, phase) || labels[phase] || session.message || "等待 Agent 提供下一步");
  if (phase !== "awaiting_source" && !data.result) {
    const actionBar = document.createElement("div"); actionBar.className = "rvc-inline-action-bar";
    const stop = rvcButton(data.cancelling ? "正在中止…" : "中止任务", () => void cancelInlineRvc()); stop.disabled = data.cancelling;
    actionBar.append(stop); box.append(actionBar);
  }
  box.append(stage);
  if (data.source) { const file = document.createElement("div"); file.className = "rvc-inline-file"; const icon = document.createElement("i"); icon.dataset.lucide = attachmentIcon(data.source); const copy = document.createElement("span"); const name = document.createElement("strong"); name.textContent = data.source.name; const meta = document.createElement("small"); meta.textContent = attachmentMeta(data.source) || "会话附件"; copy.append(name, meta); file.append(icon, copy); box.append(file); }
  const progressValue = rvcProgress(data);
  if (["processing", "extracting", "normalizing", "separating"].includes(phase) || data.taskId) { const progress = document.createElement("progress"); progress.max = 100; progress.value = progressValue; progress.className = "rvc-inline-progress"; progress.setAttribute("aria-label", stage.textContent); box.append(progress); }
  const stems = [session.vocals, session.instrumental].filter(Boolean);
  if (stems.length) { const list = document.createElement("div"); list.className = "rvc-inline-stems"; stems.forEach((item, index) => { const card = document.createElement("div"); card.className = "rvc-inline-stem"; const label = document.createElement("strong"); label.textContent = index ? "Instrumental" : "Vocals"; const audio = document.createElement("audio"); audio.controls = true; audio.src = rvcFileUrl(data.sessionId, item.file_id || item.id); card.append(label, audio); list.append(card); }); box.append(list); }
  if (!data.source && !data.result && !data.cancelling) box.append(rvcButton("选择参考音频 / 视频", openInlineRvcUpload, true));
  if (data.source && ["uploaded", "awaiting_source"].includes(phase) && !data.sourceConfirmed && !data.cancelling) { const confirm = document.createElement("div"); confirm.className = "rvc-inline-confirm"; const text = document.createElement("p"); text.textContent = "已准备好这个文件。确认处理此音频并分离人声吗？"; confirm.append(text, rvcButton("确认处理", () => { void runInlineRvc("prepare_and_separate").catch((error) => setText("chat-error", `RVC 处理提交失败：${error?.message || error}`, true)); }, true), rvcButton("更换文件", openInlineRvcUpload)); box.append(confirm); }
  if (phase === "separated" && !data.taskId && !data.result && !data.cancelling) renderRvcConversionControls(box);
  if (data.result) { appendRvcCompletionPrompt(data); const resultCard = document.createElement("section"); resultCard.className = "rvc-inline-result rvc-inline-result-final"; const label = document.createElement("strong"); label.textContent = "RVC 变声完成"; const audio = document.createElement("audio"); audio.controls = true; audio.src = data.result.output_url || `/api/voice/rvc/output/${encodeURIComponent(data.result.task_id)}`; const link = document.createElement("a"); link.href = audio.src; link.download = `rvc-${data.result.task_id}.wav`; link.textContent = "下载最终 WAV"; resultCard.append(label, audio, link); box.append(resultCard); }
  icons();
}
function renderRvcConversionControls(box) {
  const data = state.rvcInline; if (!data) return;
  const wrap = document.createElement("div"); wrap.className = "rvc-inline-config";
  const question = document.createElement("p"); question.className = "rvc-inline-config-question";
  const answers = data.configAnswers || (data.configAnswers = {}); const step = Number(data.configStep) || 0;
  const modelItems = data.models?.models || []; const indexItems = data.models?.indices || [];
  if (!data.models) { question.textContent = "正在读取可用音色模型…"; wrap.append(question); box.append(wrap); void chatRvcApi("/api/voice/rvc/models").then((value) => { if (state.rvcInline) { state.rvcInline.models = value; renderRvcInline(); } }).catch((error) => setText("chat-error", `模型读取失败：${error.message}`, true)); return; }
  if (step === 0 && !answers.model_id) {
    question.textContent = "请选择音色模型"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="">选择音色模型</option>'; modelItems.forEach((item) => { const value = item.id || item.name || item.file_id; const option = document.createElement("option"); option.value = value; option.textContent = item.name || value; select.append(option); }); const next = rvcButton("下一步", () => { if (!select.value) return setText("chat-error", "请先选择音色模型", true); answers.model_id = select.value; data.configStep = 1; renderRvcInline(); }, true);
    const modelInput = document.createElement("input"); modelInput.type = "file"; modelInput.accept = ".pth,.index"; modelInput.multiple = true; modelInput.className = "visually-hidden-input";
    const importButton = rvcButton("导入 .pth / .index", () => modelInput.click(), false); importButton.addEventListener("click", () => modelInput.click());
    const directoryButton = rvcButton("打开音色目录", async () => {
      directoryButton.disabled = true;
      try {
        const opened = await chatRvcApi("/api/providers/rvc/open-model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
        setText("chat-error", opened?.opened ? `已打开音色目录：${opened.directory || "RVC 音色目录"}` : `音色目录：${opened?.directory || "RVC 音色目录"}`);
      } catch (error) {
        setText("chat-error", `打开音色目录失败：${error?.message || error}`, true);
      } finally { directoryButton.disabled = false; }
    }, false);
    modelInput.addEventListener("change", async () => { const files = Array.from(modelInput.files || []); if (!files.length) return; const form = new FormData(); files.forEach((file) => form.append("files", file, file.name)); try { await chatRvcApi("/api/providers/rvc/models/import", { method: "POST", body: form }); data.models = await chatRvcApi("/api/voice/rvc/models"); renderRvcInline(); } catch (error) { setText("chat-error", `导入音色文件失败：${error.message || error}`, true); } finally { modelInput.value = ""; } }); wrap.append(question, select, directoryButton, importButton, modelInput, next);
  } else if (step <= 1 && answers.index_id === undefined) {
    question.textContent = "是否使用 Index？"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="">不使用 Index</option>'; indexItems.forEach((item) => { const value = item.id || item.name || item.file_id; const option = document.createElement("option"); option.value = value; option.textContent = item.name || value; select.append(option); }); const next = rvcButton("下一步", () => { answers.index_id = select.value || null; data.configStep = 2; renderRvcInline(); }, true); wrap.append(question, select, next);
  } else if (step <= 2 && answers.pitch === undefined) {
    question.textContent = "请选择音高（半音）"; const input = document.createElement("input"); input.type = "number"; input.min = "-24"; input.max = "24"; input.step = "1"; input.value = "0"; input.className = "rvc-inline-config-input"; const next = rvcButton("下一步", () => { answers.pitch = Number(input.value) || 0; data.configStep = 3; renderRvcInline(); }, true); wrap.append(question, input, next);
  } else if (step <= 3 && answers.mix_instrumental === undefined) {
    question.textContent = "是否合并 Instrumental 背景音？"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="false">不合并</option><option value="true">合并</option>'; const next = rvcButton("下一步", () => { answers.mix_instrumental = select.value === "true"; data.configStep = 4; renderRvcInline(); }, true); wrap.append(question, select, next);
  } else {
    question.textContent = "配置已准备好，请确认后生成最终音频"; const summary = document.createElement("div"); summary.className = "rvc-inline-config-summary"; summary.textContent = `模型：${answers.model_id} · Index：${answers.index_id || "不使用"} · 音高：${answers.pitch || 0} · ${answers.mix_instrumental ? "合并背景音" : "不合并背景音"}`; const confirm = rvcButton("确认生成", () => void runInlineRvc("convert", answers), true); const back = rvcButton("重新配置", () => { data.configStep = 0; data.configAnswers = { index_id: null, pitch: undefined, mix_instrumental: undefined }; renderRvcInline(); }); wrap.append(question, summary, confirm, back);
  }
  box.append(wrap);
}
function openInlineRvcUpload() { const input = $("chat-voice-material"); if (!input) return; input.accept = "audio/*,video/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.webm,.mp4,.mkv,.mov,.avi"; input.multiple = false; input.dataset.rvcInline = "true"; input.click(); }
async function resumeRvcWorkerWithAttachment(fileId) {
  const pending = state.pendingInput;
  const worker = String(pending?.worker || pending?.workflow?.worker || state.rvcInline?.agentWorkflow?.worker || "").trim().toLowerCase();
  if (worker !== "rvc_worker") {
    throw new Error("RVC 工作流尚未完成 Agent 交接，暂不能提交文件");
  }
  if (state.rvcInline) {
    state.rvcInline.source = state.chatAttachments?.find((item) => String(item.file_id) === String(fileId)) || { file_id: fileId };
    state.rvcInline.sourceConfirmed = false;
    state.rvcInline.state = { ...(state.rvcInline.state || {}), phase: "uploaded", message: "文件已上传，等待 RVC Worker 准备" };
    renderRvcInline();
  }
  state.pendingInputValues = {
    ...(state.pendingInputValues || {}),
    attachment_ids: Array.from(new Set([...(state.pendingInputValues?.attachment_ids || []), fileId])),
  };
  // 只恢复一次当前 checkpoint；resumeAgent 会将 attachment_ids 合并进
  // supervisor 的 dispatch_request.input_refs，并重新构建最新附件上下文。
  state.rvcInline = state.rvcInline || {};
  if (state.rvcInline.attachmentResumeSent) return;
  state.rvcInline.attachmentResumeSent = true;
  try {
    await resumeAgent(null);
  } catch (error) {
    state.rvcInline.attachmentResumeSent = false;
    throw error;
  }
}

// 兼容旧调用方，但不再让浏览器直接创建 RVC session；session 由 rvc_worker
// 根据 attachment_id 创建并维护。
async function attachInlineRvcSource(item) {
  if (!item?.file_id) return;
  return resumeRvcWorkerWithAttachment(item.file_id);
}
async function resumeRvcSessionStatus() {
  const data = state.rvcInline;
  if (!data?.sessionId || data.sessionStatusResumeSent || data.cancelling) return;
  data.sessionStatusResumeSent = true;
  state.pendingInputValues = {
    ...(state.pendingInputValues || {}),
    action: "session_status",
    session_id: data.sessionId,
    rvc_session_id: data.sessionId,
  };
  try {
    // 每次结构化恢复都是一次新的提交。上一次“确认处理”的
    // 防重复锁不能阻止 session_status 把 separated 结果交回 Agent。
    state.confirmationResponded = false;
    const result = await resumeAgent(null, { forceHttp: true });
    const flow = result?.workflow || result?.flow;
    if (flow && hasFormalRvcHandoff(result, flow)) activateRvcWorkspaceFromAgent(result, flow);
    if (state.rvcInline === data) renderRvcInline();
  } catch (error) {
    data.sessionStatusResumeSent = false;
    data.state = { ...(data.state || {}), phase: "failed", error: error.message || String(error), message: "RVC Worker 状态恢复失败" };
    renderRvcInline();
  }
}
async function waitInlineRvcSession(targetPhases) {
  const data = state.rvcInline; if (!data?.sessionId) return "failed";
  const targets = new Set(targetPhases); const generation = ++data.generation; clearTimeout(data.pollTimer);
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (!state.rvcInline || generation !== data.generation || data.cancelling) return resolve("cancelled");
      const sourceSize = Number(data.source?.size || data.state?.source?.size || 0);
      const timeoutMs = sourceSize >= 100 * 1024 * 1024 ? 30 * 60 * 1000 : 15 * 60 * 1000;
      if (Date.now() - startedAt > timeoutMs) {
        data.state = { ...(data.state || {}), phase: "failed", message: "RVC Worker 长时间没有返回状态，请重试" };
        renderRvcInline();
        return resolve("failed");
      }
      try {
        const response = await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(data.sessionId)}`);
        data.state = rvcSessionPayload(response);
        if (!state.rvcInline || generation !== data.generation || data.cancelling) return resolve("cancelled");
        renderRvcInline();
        const phase = rvcPhase(data);
        if (targets.has(phase)) {
          // 直接复用 RVC 页面 session API 时只更新当前工作区，避免旧 Agent checkpoint 覆盖结果。
          if (!data.directSessionApi) void resumeRvcSessionStatus();
          return resolve(phase);
        }
        if (["failed", "cancelled"].includes(phase)) return resolve(phase);
        data.pollTimer = setTimeout(tick, 700);
      } catch (error) {
        data.state = { ...(data.state || {}), phase: "failed", message: error.message || String(error) };
        renderRvcInline();
        reject(error);
      }
    }; void tick();
  });
}
async function directRvcConvert(data, answers) {
  const session = rvcSessionPayload(data?.state);
  const inputFileId = session.selected_input || session.vocals?.file_id || session.normalized_wav?.file_id;
  if (!data?.sessionId || !inputFileId) throw new Error("缺少可用于 RVC 推理的分离音频");
  if (!answers?.model_id) throw new Error("请先选择音色模型");
  const result = await chatRvcApi("/api/voice/rvc/convert", {
    method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ session_id: data.sessionId, input_file_id: inputFileId, model_id: answers.model_id, index_id: answers.index_id || null, speaker_id: 0, pitch: Number(answers.pitch || 0), f0_method: "rmvpe", index_rate: answers.index_id ? 0.75 : 0, protect: 0.33, resample_sr: 0, rms_mix_rate: 1, mix_instrumental: Boolean(answers.mix_instrumental) }),
  });
  data.taskId = result.task_id; data.task = null; data.state = { ...session, phase: "converting", progress: 0, message: "正在生成最终音频" };
  renderRvcInline();
  await pollInlineRvcTask();
}

async function directRvcPrepareFromAttachment(data) {
  if (!data) throw new Error("RVC 工作区不存在");
  data.directSessionApi = true;
  if (data.preparePending) return data.sessionId || null;
  data.preparePending = true;
  const attachmentId = data?.source?.file_id;
  if (!attachmentId) throw new Error("缺少 RVC 源文件附件");
  // 幂等：同一气泡/附件已有活动 session 时只恢复轮询，禁止重复创建。
  let sessionId = data.sessionId || data.rvcSessionId || null;
  let current = null;
  if (sessionId) {
    try { current = await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}`); } catch { sessionId = null; }
  }
  // 失败/中止的 session 不能复用，否则会把上一次的 stems 带回下一次处理。
  if (current && ["failed", "cancelled"].includes(String(current.phase || current.status || "").toLowerCase())) {
    sessionId = null; current = null;
    data.state = { phase: "uploaded", progress: 0, message: "将重新创建 RVC 处理会话" };
  }
  if (!sessionId) {
    const created = await chatRvcApi("/api/voice/rvc/sessions", { method: "POST" });
    sessionId = created?.session_id || created?.id;
    if (!sessionId) throw new Error("RVC 会话创建失败");
    const form = new FormData();
    form.append("attachment_id", attachmentId);
    form.append("conversation_id", state.conversationId);
    await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}/attachment`, { method: "POST", body: form });
    data.sessionId = String(sessionId); data.rvcSessionId = String(sessionId);
    current = await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}`);
  }
  data.sessionId = String(sessionId); data.rvcSessionId = String(sessionId);
  const phase = String(current?.phase || data.state?.phase || "uploaded");
  if (phase === "separated") { data.state = current; renderRvcInline(); return sessionId; }
  if (!["extracting", "normalizing", "separating"].includes(phase)) {
    await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}/extract`, { method: "POST" });
  }
  data.state = { ...(current || {}), phase: phase === "uploaded" ? "normalizing" : phase, progress: Math.max(1, Number(current?.progress || 0)), message: "正在标准化音频" };
  renderRvcInline();
  await waitInlineRvcSession(["ready", "separated"]);
  if (rvcPhase(data) === "ready") {
    const latest = rvcSessionPayload(data.state);
    if (!latest.vocals && !latest.instrumental) {
      await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(sessionId)}/separate`, { method: "POST" });
    }
    await waitInlineRvcSession(["separated"]);
  }
  data.preparePending = false;
  return sessionId;
}
async function runInlineRvc(kind, options = {}) {
  const data = state.rvcInline;
  if (!data || data.cancelling) return;

  // 某些恢复时序中，input.required 已经被消费，但内嵌工作区仍然
  // 持有正式的 rvc_worker workflow。按钮不能因为 pendingInput 短暂为空
  // 而静默失效；在确认 worker 身份后重建最小恢复上下文。
  if (!state.pendingInput) {
    const flow = data.agentWorkflow || state.currentWorkflow || {};
    const worker = String(flow.worker || flow.worker_name || "").trim().toLowerCase();
    if (worker !== "rvc_worker") {
      setText("chat-error", "RVC Worker 尚未完成 Agent 交接，请稍后重试", true);
      return;
    }
    state.pendingInput = {
      status: "waiting_input",
      specialist: "management",
      worker: "rvc_worker",
      task_id: flow.task_id || data.taskId || null,
      workflow: flow,
      waiting_inputs: Array.isArray(flow.waiting_inputs) ? flow.waiting_inputs : [],
    };
  }

  const action = kind === "prepare_and_separate" ? "prepare_and_separate"
    : kind === "extract" ? "prepare_source"
      : kind === "separate" ? "separate_vocals" : "convert";
  const values = { action, ...options };
  // 上传恢复已经消耗过一次 confirmation.respond；确认处理是新的 worker action。
  state.confirmationResponded = false;
  data.sourceConfirmed = action !== "prepare_and_separate";
  data.state = { ...(data.state || {}), phase: action === "convert" ? "converting" : "processing", progress: 0, message: "正在提交给 RVC Worker…" };
  state.pendingInputValues = { ...(state.pendingInputValues || {}), ...values };
  renderRvcInline();
  try {
    // 确认处理直接复用 RVC 页面已验证的 session 链路。Agent 负责
    // 识别和交接；这里不再把耗时的准备/分离再次塞回 Agent resume，
    // 避免 Worker 返回旧 confirmation 卡或丢失 session 引用。
    if (action === "prepare_and_separate") {
      await directRvcPrepareFromAttachment(state.rvcInline || data);
      return;
    }
    if (action === "convert") {
      await directRvcConvert(state.rvcInline || data, options);
      return;
    }
    const result = await resumeAgent(null, { forceHttp: true });
    if (!result) throw new Error("RVC Worker 未接受当前操作，请重新点击确认处理");
    // HTTP resume 的返回结构可能把 session_id 放在 workflow、result 或
    // worker_results 内。先把返回结果同步回当前气泡，再开始轮询；否则
    // 旧逻辑会在没有 session_id 时永远停留在乐观的 0%。
    const resultFlow = result?.workflow || result?.flow;
    if (resultFlow && hasFormalRvcHandoff(result, resultFlow)) {
      activateRvcWorkspaceFromAgent(result, resultFlow);
    }
    if (action === "prepare_and_separate" && !data.cancelling) {
      // 确认处理只恢复 rvc_worker；RVC 的 extract/separate 必须由 worker
      // 调用共享 session 服务。浏览器不能再同时 POST extract/separate，
      // 否则会和 worker 的后台线程竞争同一 session，最终表现为 0% 后失败。
      const liveData = state.rvcInline;
      if (!liveData?.sessionId) {
        await directRvcPrepareFromAttachment(liveData || data);
        return;
      }
      // Worker 只负责接受并启动后台 session。前端观察 session，终态后
      // 再用一次明确的 session_status 恢复 Agent，不能在本次 resume 中等待。
      liveData.sessionStatusResumeSent = false;
      liveData.state = { ...(liveData.state || {}), phase: "accepted", message: "已提交 RVC Worker，等待音频处理状态…" };
      renderRvcInline();
      void waitInlineRvcSession(["separated"]);
    }
  } catch (error) {
    data.preparePending = false;
    if (data.cancelling) return;
    data.state = { ...(data.state || {}), phase: "failed", error: error.message || String(error) };
    renderRvcInline();
    setText("chat-error", `RVC 操作提交失败：${error.message || String(error)}`, true);
  }
}
async function pollInlineRvcTask() {
  const data = state.rvcInline; if (!data?.taskId) return; const taskId = data.taskId; const generation = ++data.generation; clearTimeout(data.pollTimer);
  const tick = async () => {
    if (!state.rvcInline || generation !== data.generation || data.cancelling) return;
    try {
      const response = await chatRvcApi(`/api/voice/rvc/tasks/${encodeURIComponent(taskId)}`);
      const task = response?.task && typeof response.task === "object" ? response.task : response;
      if (!state.rvcInline || generation !== data.generation || data.cancelling) return;
      data.task = task; data.taskProgress = task.progress_percent ?? task.progress ?? 0;
      const status = String(task.state || task.status || "running").toLowerCase();
      if (["succeeded", "completed"].includes(status)) {
        const taskIdValue = task.task_id || task.id || taskId;
        const outputs = task.outputs || {};
        const preferred = data.configAnswers?.mix_instrumental ? (outputs.mixed || outputs.rvc_vocal) : (outputs.rvc_vocal || outputs.mixed);
        data.result = { ...task, task_id: taskIdValue, output_url: preferred?.url || preferred?.download_url || task.output_url, output_file: preferred || task.output_file };
        data.taskId = null;
      }
      else if (["failed", "cancelled"].includes(status)) { data.state = { ...(data.state || {}), phase: status, message: task.message || task.error || "任务未完成" }; data.taskId = null; }
      else data.pollTimer = setTimeout(tick, 800);
      renderRvcInline();
    } catch (error) {
      if (!data.cancelling) {
        setText("chat-error", `RVC 任务查询失败：${error.message || error}`, true);
        data.pollTimer = setTimeout(tick, 2000);
      }
    }
  }; await tick();
}
async function cancelInlineRvc() {
  const data = state.rvcInline; if (!data || data.cancelling) return;
  data.cancelling = true; data.generation += 1; clearTimeout(data.pollTimer); data.pollTimer = null; renderRvcInline();
  const errors = [];
  // RVC 的活动状态由 Agent checkpoint 所有；浏览器只能提交取消动作，
  // 不再直接删除 session/task，避免前端状态与 rvc_worker 分叉。
  try {
    // 先取消共享 RVC session，立即终止 FFmpeg/分离线程；Agent checkpoint
    // 取消作为后台补充确认，不阻塞新消息和输入框恢复。
    if (data.sessionId) await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(data.sessionId)}`, { method: "DELETE" });
  } catch (error) { errors.push(error); }
  if (state.pendingInput || state.pendingAction) {
    state.pendingInputValues = { ...(state.pendingInputValues || {}), action: "cancel" };
    void resumeAgent(null, { forceHttp: true }).catch((error) => setText("chat-error", `Agent 取消确认失败：${error.message || error}`, true));
  } else if (state.realtimeTurnId) {
    if (!sendRealtime({ type: "generation.cancel" })) errors.push(new Error("实时连接不可用"));
  }
  data.taskId = null;
  data.state = { ...(data.state || {}), phase: "cancelled", status: "cancelled", message: "任务已中止" };
  data.cancelling = false;
  renderRvcInline();
  if (errors.length) setText("chat-error", `任务已停止，但 Agent 未确认取消：${errors[0].message || errors[0]}`, true);
}

