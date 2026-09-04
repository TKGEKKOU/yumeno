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
  state.pendingVoiceWorkflowEvent = null;
  state.rvcInline = null;
  state.voiceInline = null;
  state.currentTaskStatus = null;
  state.pendingInput = null;
  state.pendingInputValues = {};
  state.confirmationRequestKey = "";
  state.confirmationResponded = false;
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
  // lucide.createIcons() 会把 <i> 替换成 <svg>；只查询 i 会导致
  // 第二轮以后图标永远停留在箭头。每次状态变化都重建一个语义图标节点。
  const icon = document.createElement("i");
  if (icon) {
    if (typeof icon.setAttribute === "function") icon.setAttribute("data-lucide", busy ? "square" : "arrow-up");
    else if (icon.dataset) icon.dataset.lucide = busy ? "square" : "arrow-up";
    const current = button.querySelector("i, svg");
    if (current?.replaceWith) current.replaceWith(icon);
    else if (!current && button.append) button.append(icon);
  }
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

// confirmation.required 可能同时从实时事件和 HTTP resume 结果到达。
// 用动作指纹区分“新的确认请求”和“同一确认未被服务端消费”，避免旧确认无限重放。
function confirmationActionKey(action, specialist = "") {
  const normalize = (value) => {
    if (Array.isArray(value)) return value.map(normalize);
    if (!value || typeof value !== "object") return value;
    return Object.keys(value).sort().reduce((output, key) => {
      output[key] = normalize(value[key]);
      return output;
    }, {});
  };
  try {
    return JSON.stringify({ specialist: String(specialist || ""), action: normalize(action || null) });
  } catch {
    return `${String(specialist || "")}:${String(action?.tool || action?.name || action?.title || "confirmation")}`;
  }
}

function resetConfirmationResponseLock() {
  state.confirmationResponded = false;
  state.confirmationRequestKey = "";
}

function resetConfirmationState() {
  state.pendingAction = null;
  resetConfirmationResponseLock();
}

function releaseFailedConfirmation(message = "") {
  resetConfirmationState();
  state.pendingInput = null;
  state.pendingInputValues = {};
  finishPendingReplies();
  clearStaleReplyLoading();
  state.pendingReplyNode = null;
  state.realtimeAnswerNode = null;
  state.realtimeTurnId = null;
  state.realtimeExecutionPending = false;
  clearRealtimeSubmission();
  renderConfirmation();
  if (message) setText("chat-error", message, true);
  // 清理必须优先于 UI 更新；即使某个页面/测试环境缺少可选控件，
  // 也不能让一次失效确认阻断新消息。
  try { setRealtimeBusy(false); } catch (error) { console.warn("确认状态 UI 清理失败", error); }
  try { updateComposerControls(); } catch (error) { console.warn("对话控件刷新失败", error); }
}

function beginConfirmation(action, specialist) {
  const key = confirmationActionKey(action, specialist);
  const previousKey = state.confirmationRequestKey
    || confirmationActionKey(state.pendingAction?.action, state.pendingAction?.specialist);
  if (state.confirmationResponded && key && key === previousKey) {
    releaseFailedConfirmation("确认未被服务端接受，请重新发送");
    return false;
  }
  state.pendingAction = { action, specialist };
  state.confirmationRequestKey = key;
  state.confirmationResponded = false;
  return true;
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
    // workflow.update 可能先于最终结果到达；它只对当前 turn 有效。
    // 新一轮请求必须丢弃旧的 RVC handoff，避免“检查配置”等请求复活旧工作区。
    state.pendingRvcWorkflowEvent = null;
    state.pendingVoiceWorkflowEvent = null;
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
    // RVC handoff 后，专用工作区是唯一活动进度源；后续 Core/Worker 阶段
    // 只作为调试信息保留（若用户开启思考内容），不能重新创建 spinner。
    if (state.rvcInline?.node?.isConnected || state.voiceInline?.node?.isConnected) {
      const processList = state.realtimeAnswerNode?.querySelector(".agent-process-list");
      processList?.querySelectorAll(".agent-process-item.is-active").forEach((item) => {
        item.classList.remove("is-active");
        item.classList.add("is-done");
        const spinner = item.querySelector(".agent-process-spinner");
        if (spinner) {
          spinner.classList.remove("agent-process-spinner");
          spinner.classList.add("agent-process-check");
        }
      });
      return;
    }
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
    if (hasFormalRvcHandoff(event, finalFlow) || hasFormalVoiceHandoff(event, finalFlow)) {
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
      state.confirmationRequestKey = "";
      renderConfirmation();
      state.realtimeTurnId = null;
      state.realtimeExecutionPending = false;
      clearRealtimeSubmission();
      setRealtimeBusy(false);
    }
  } else if (event.type === "confirmation.required") {
    state.realtimeStageEpoch = "closed";
    if (window.PLLive2DHub) window.PLLive2DHub.setAgentState("idle");
    if (!beginConfirmation(event.pending_action, event.specialist)) return;
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
    if (hasFormalRvcHandoff(event, waitingFlow) || hasFormalVoiceHandoff(event, waitingFlow)) {
      handleAgentResult({ ...waitingResult, workflow: waitingFlow, worker: event.worker || event.worker_name });
      state.pendingReplyNode = null;
      state.realtimeAnswerNode = null;
      state.realtimeTurnId = null;
      state.realtimeSubmissionPending = false;
      state.agentRequestPending = false;
      resetConfirmationResponseLock();
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
    if (waitingWorker === "rvc_worker" || waitingWorker === "voice_worker" || (waitingFlow && ["rvc_worker", "voice_worker"].includes(String(waitingFlow.worker || "").trim().toLowerCase()))) {
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
      resetConfirmationResponseLock();
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
  // 停止键必须立即释放前端锁；不能等待服务端 turn.cancelled，
  // 否则网络延迟期间发送键仍是 disabled，用户会误以为页面卡死。
  stopVoicePlayback();
  if (state.agentStreamController) { state.agentStreamController.abort(); state.agentStreamController = null; }
  if (state.realtimeTurnId) sendRealtime({ type: "generation.cancel" });
  clearTimeout(state.realtimeAckTimer);
  state.realtimeAckTimer = null;
  state.realtimeTurnId = null;
  state.realtimeSubmissionPending = false;
  state.realtimeExecutionPending = false;
  state.agentRequestPending = false;
  state.realtimePendingQuestion = "";
  state.pendingAction = null;
  state.pendingInput = null;
  state.pendingInputValues = {};
  resetConfirmationResponseLock();
  state.realtimeStageEpoch = "closed";
  finishPendingReplies();
  state.pendingReplyNode = null;
  state.realtimeAnswerNode = null;
  setText("question-status", "已停止本轮回复");
  setRealtimeBusy(false);
  renderConfirmation();
  renderChatContext();
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
    // 重复阶段只更新原节点，不能重新 append；append 会把旧步骤移到末尾，
    // 使视觉顺序与真实事件到达顺序相反。
  } else {
    const item = document.createElement("div");
    item.className = "agent-process-item is-active";
    item.dataset.stage = stageKey;
    item.dataset.stageKey = stageKey;
    item.dataset.group = group;
    item.title = label;
    item.dataset.startedAt = String(performance.now());
    item.dataset.sequence = String(list.children.length + 1);
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
    // 保留事件的原始顺序。过程内容是调试/思考记录，不应通过删除前置步骤
    // 伪造“最近步骤”顺序；消息本身由中央聊天区统一滚动。
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
  const conversationBusy = isConversationBusy() && !(state.pendingInput && (state.rvcInline || state.voiceInline));
  const rvcPhase = String(state.rvcInline?.state?.phase || "").toLowerCase();
  const rvcBusy = Boolean(state.rvcInline && (state.rvcInline.taskId || state.rvcInline.preparePending
    || ["accepted", "processing", "preparing", "extracting", "normalizing", "separating", "converting", "running"].includes(rvcPhase)));
  const voiceStatus = String(state.voiceInline?.lastResult?.status || state.voiceInline?.agentWorkflow?.status || "").toLowerCase();
  const voiceBusy = Boolean(state.voiceInline && (state.voiceInline.cancelling || ["accepted", "running", "processing", "queued"].includes(voiceStatus)));
  const stopAvailable = Boolean(state.realtimeBusy || state.agentRequestPending || state.realtimeSubmissionPending || state.realtimeExecutionPending || rvcBusy || voiceBusy);
  const voiceActive = state.voiceActive;
  $("question-form").classList.toggle("is-voice-active", voiceActive);
  if ($("voice-chat")) {
    $("voice-chat").disabled = !state.asrConfigured || !state.activePersona;
  }
  $("send-question").classList.toggle("is-hidden", voiceActive);
  // 忙碌时发送按钮就是停止按钮，必须可点击；只有等待不可编辑的
  // confirmation/input 状态才保持 disabled。
  $("send-question").disabled = !state.activePersona || (!stopAvailable && conversationBusy);
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
  const toggle = $("chat-persona-toggle");
  if (!menu || !toggle) return;
  const open = menu.classList.toggle("is-hidden");
  toggle.setAttribute("aria-expanded", String(!open));
  if (!open && (!Array.isArray(state.personas) || !state.personas.length)) {
    const list = $("persona-list");
    if (list) list.textContent = "正在加载角色…";
    void loadPersonas();
  }
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
async function promptVoiceServiceStartup() {
  const dialog = $("chat-voice-service-dialog");
  if (!dialog) return;
  const status = $("chat-voice-service-status");
  const start = $("chat-voice-service-start");
  const open = $("chat-voice-service-open");
  const readStatus = async () => resourceSnapshot(await chatRvcApi("/api/resources/gpt_sovits/status", { cache: "no-store" }));
  const waitUntilReady = async (attempts = 20) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const snapshot = await readStatus();
      if (snapshot.service_running === true || snapshot.ready === true) return true;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return false;
  };
  try {
    const snapshot = await readStatus();
    if (snapshot.service_running === true || snapshot.ready === true) return;
    if (status) status.textContent = snapshot.installation_ready === false ? "运行环境尚未完整安装，请先到声音页检查。" : "服务未启动，这是按需运行的正常状态。";
  } catch (error) {
    if (status) status.textContent = "暂时无法检查服务状态，请稍后重试。";
  }
  if (!dialog.open) dialog.showModal();
  start?.focus();
  if (start && start.dataset.bound !== "true") {
    start.dataset.bound = "true";
    start.addEventListener("click", async () => {
      start.disabled = true;
      if (status) status.textContent = "正在启动 GPT-SoVITS…";
      try {
        await chatRvcApi("/api/gpt-sovits/service/start", { method: "POST" });
        const ready = await waitUntilReady();
        if (!ready) throw new Error("启动请求已发送，但服务尚未就绪，请到声音页查看状态。");
        if (status) status.textContent = "服务已就绪，可以播放语音了。";
        setTimeout(() => { if (dialog.open) dialog.close("start"); }, 500);
      } catch (error) {
        if (status) status.textContent = `启动失败：${error?.message || error}`;
        start.disabled = false;
      }
    });
  }
  if (open && open.dataset.bound !== "true") {
    open.dataset.bound = "true";
    open.addEventListener("click", () => { if (dialog.open) dialog.close("settings"); setChatSettingsOpen(false); window.switchView?.("voice"); });
  }
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
  if (voice) {
    voice.checked = readChatPreference(CHAT_PREFERENCE_KEYS.voice, true);
    voice.addEventListener("change", () => {
      writeChatPreference(CHAT_PREFERENCE_KEYS.voice, voice.checked);
      if (voice.checked) void promptVoiceServiceStartup();
    });
  }
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
  state.voiceInline = null;
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
  resetConfirmationResponseLock();
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
    // stop 按钮是 form submit 的唯一入口；阻止继续读取 textarea，
    // 让“停止”永远不会误发一条空/旧消息。
    void cancelActiveChatTask();
    return;
  }
  const question = $("question").value.trim(); if (!question) return;
  // 如果上一次确认已经发出但服务端没有消费，允许新消息清掉这条失效确认，
  // 不让旧 pendingAction 永久占住发送入口；尚未响应的真实确认仍需用户明确处理。
  if (state.pendingAction && state.confirmationResponded) releaseFailedConfirmation();
  // RVC 正在运行时，输入新问题表示放弃当前生成；不要把“什么情况”等新消息
  // 再投递给旧的 waiting checkpoint。等待明确输入（上传/确认/模型）时仍保留
  // 自然语言继续 workflow 的能力。
  const rvcPhaseNow = String(state.rvcInline?.state?.phase || "").toLowerCase();
  if (state.rvcInline && ["processing", "preparing", "extracting", "normalizing", "separating", "converting", "running"].includes(rvcPhaseNow)) {
    await cancelActiveChatTask();
    state.rvcInline = null;
  }
  const voiceStatusNow = String(state.voiceInline?.lastResult?.status || state.voiceInline?.agentWorkflow?.status || "").toLowerCase();
  if (state.voiceInline && ["accepted", "running", "processing", "queued"].includes(voiceStatusNow) && !state.pendingInput) {
    await cancelActiveChatTask();
    state.voiceInline = null;
  }  // 新消息优先：上一轮仍在生成且未等待用户输入时，先取消旧 turn。
  if ((state.realtimeBusy || state.agentRequestPending || state.realtimeSubmissionPending || state.realtimeExecutionPending)
      && !state.pendingInput && !state.pendingAction) {
    await cancelActiveChatTask();
    if (!state.activePersona) return;
  }
  // 等待 Worker 输入时允许自然语言回答，继续当前 Agent checkpoint。
  if (state.pendingInput && (state.rvcInline || state.voiceInline) && !state.voiceActive) {
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
    const terminalWorker = String(state.currentWorkflow.worker || state.currentWorkflow.worker_name || "").trim().toLowerCase();
    state.currentWorkflow = null;
    if (terminalWorker === "rvc_worker") state.rvcInline = null;
    else if (terminalWorker === "voice_worker") state.voiceInline = null;
    state.currentTaskStatus = null;
    renderChatContext();
  }
  chatRenderVersion += 1;
  stopVoicePlayback();
  resetPacing();
  state.agentRequestPending = true;
  // 新一轮请求开始时丢弃上一轮尚未完成的 RVC handoff，避免过期事件污染当前对话。
  state.pendingRvcWorkflowEvent = null;
  state.pendingVoiceWorkflowEvent = null;
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
    state.pendingVoiceWorkflowEvent = null;
    state.rvcInline = null;
    state.voiceInline = null;
    state.currentTaskStatus = null; state.chatTaskEntries = new Map();
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
  const resourceSetup = findResourceSetup(result);
  const resultWorker = String(result?.worker || result?.worker_name || "").trim().toLowerCase();
  const activeRvcTurn = resultWorker === "rvc_worker"
    || String(state.pendingInput?.worker || state.pendingInput?.specialist || "").trim().toLowerCase() === "rvc_worker";
  const activeVoiceTurn = resultWorker === "voice_worker"
    || String(state.pendingInput?.worker || state.pendingInput?.specialist || "").trim().toLowerCase() === "voice_worker";
  const cachedRvc = activeRvcTurn ? state.pendingRvcWorkflowEvent : null;
  const cachedFlow = cachedRvc?.flow || cachedRvc?.event?.flow;
  const cachedVoice = activeVoiceTurn ? state.pendingVoiceWorkflowEvent : null;
  const cachedVoiceFlow = cachedVoice?.flow || cachedVoice?.event?.flow;
  // 缓存的 workflow 只能补全同一个仍在活动的 RVC 回合，不能作为新请求的路由依据。
  const resultFlow = result?.workflow || result?.flow || (activeRvcTurn && cachedFlow?.worker === "rvc_worker" ? cachedFlow : null);
  const voiceFlow = result?.workflow || result?.flow || (activeVoiceTurn && cachedVoiceFlow?.worker === "voice_worker" ? cachedVoiceFlow : null);
  const handoffResult = resultFlow && cachedFlow && !result?.workflow && !result?.flow && resultWorker === "rvc_worker"
    ? { ...cachedRvc.event, ...result, worker: "rvc_worker" } : result;
  const voiceHandoffResult = voiceFlow && cachedVoiceFlow && !result?.workflow && !result?.flow && resultWorker === "voice_worker"
    ? { ...cachedVoice.event, ...result, worker: "voice_worker" } : result;
  // 配置资源结果与 RVC 业务 workflow 彻底隔离。
  const isRvcResult = !resourceSetup && Boolean(resultFlow && typeof resultFlow === "object" && hasFormalRvcHandoff(handoffResult, resultFlow));
  const isVoiceResult = !resourceSetup && !isRvcResult && Boolean(voiceFlow && typeof voiceFlow === "object" && hasFormalVoiceHandoff(voiceHandoffResult, voiceFlow));
  // 正式 handoff 会接管原 loading assistant 气泡；后续结果必须写回同一节点，
  // 不能再 append 一个普通 assistant 气泡覆盖/分离内嵌工作区。
  const inlineNode = isRvcResult
    ? (state.rvcInline?.node || state.realtimeAnswerNode || state.pendingReplyNode)
    : (isVoiceResult ? (state.voiceInline?.node || state.realtimeAnswerNode || state.pendingReplyNode) : null);
  applyAgentContextResult(result);
  const waiting = result?.status === "waiting_input";
  state.pendingInput = waiting ? result : null;
  if (waiting) {
    state.pendingInputValues = { ...(state.pendingInputValues || {}), ...(result.selected_options || {}) };
  } else {
    state.pendingInputValues = {};
  }
  const pendingConfirmation = result.status === "pending_confirmation";
  if (pendingConfirmation) {
    if (!beginConfirmation(result.pending_action, result.specialist)) return;
  } else {
    state.confirmationResponded = false;
    state.confirmationRequestKey = "";
    state.pendingAction = null;
  }
  renderConfirmation();
  // Worker 等待用户补充信息时，输入框必须保持可发送；否则用户无法用自然语言继续或纠正当前任务。
  const waitingWorkerReply = Boolean(state.pendingInput && (state.rvcInline || state.voiceInline || ["rvc_worker", "voice_worker"].includes(String(state.pendingInput.worker || state.pendingInput.specialist || "").toLowerCase())));
  $("send-question").disabled = ((!state.pendingAction && !waitingWorkerReply) && Boolean(state.pendingInput)) || (state.pendingAction && !waitingWorkerReply) || !state.activePersona;
  // pending_confirmation 的 answer 可能仍是旧版内部预览（例如“执行能力 manage_resource_install”）。
  // 它不是用户消息，不能再写进对话气泡；确认入口只由统一任务工作区承载，避免旧文案、空气泡和重复确认。
  if (pendingConfirmation) {
    if (state.pendingReplyNode) {
      state.pendingReplyNode.remove();
      state.pendingReplyNode = null;
    }
    finishPendingReplies();
    renderChatContext();
    return;
  }
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
  if (isVoiceResult) {
    activateVoiceWorkspaceFromAgent(voiceHandoffResult, voiceFlow);
    const node = state.voiceInline?.node?.isConnected ? state.voiceInline.node : inlineNode;
    if (node) {
      if (result.answer) {
        const body = node.querySelector("p");
        if (body) body.textContent = result.answer;
      }
      finishReply(node);
      state.pendingReplyNode = null;
      appendResultArtifacts(node, result);
    }
    if (state.voiceInline) {
      state.voiceInline.lastResult = result;
      state.voiceInline.agentWorkflow = voiceFlow;
      renderVoiceInline();
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
const resourcePhaseLabels = {
  preparing: "准备中", downloading: "下载中",
  installing: "安装中", probing: "检查中",
  verifying: "验证中", ready: "已就绪",
  failed: "失败", idle: "等待操作"
};
function findExistingResourceCard(key) {
  return [...document.querySelectorAll(".resource-setup-inline-card")].find((card) => card.dataset.resource === key)?.parentElement || null;
}
async function resourceSetupAction(resource, action, options = {}) {
  const key = canonicalResourceKey(resource?.resource || resource || "");
  const normalized = String(action || "status").trim().toLowerCase();
  if (!key) return;
  if (normalized === "clean" && options.confirmed !== true && !window.confirm(`确定卸载该运行环境？不会删除你的模型、附件和历史结果。`)) return;
  if ((normalized === "cancel" || normalized === "clean") && window.__yumenoResourceInstallTimer) { clearInterval(window.__yumenoResourceInstallTimer); window.__yumenoResourceInstallTimer = null; }
  // 卡片上的明确资源动作不再绕一圈生成工具确认卡；它调用同一个受保护
  // provider API，仍由后端资源管理器执行，避免 Core Agent 在 UI 操作中阻塞。
  if (key === "gpt_sovits" && ["start_service", "stop_service", "detect", "open_directory"].includes(normalized)) {
    const endpoints = {
      start_service: ["/api/gpt-sovits/service/start", "POST"],
      stop_service: ["/api/gpt-sovits/service/stop", "POST"],
      detect: ["/api/gpt-sovits/detect", "POST"],
      open_directory: ["/api/gpt-sovits/model-directory", "POST"],
    };
    try {
      const [url, method] = endpoints[normalized];
      const result = await chatRvcApi(url, { method });
      const node = findExistingResourceCard(key) || (state.realtimeAnswerNode?.isConnected ? state.realtimeAnswerNode : appendMessage("assistant", "资源状态已更新。"));
      if (node && normalized !== "open_directory") renderResourceSetupCard(node, { ...result, resource: key });
      if (normalized === "open_directory") setText("question-status", result.opened_directory ? "已打开 GPT-SoVITS 目录" : "目录已就绪");
    } catch (error) {
      setText("chat-error", `GPT-SoVITS 操作失败：${error?.message || error}`, true);
    }
    return;
  }
  const resourceApiBase = "/api/resources/" + encodeURIComponent(key);
  const endpointSet = {
    status: resourceApiBase + "/status",
    install: resourceApiBase + "/install",
    cancel: resourceApiBase + "/install/cancel",
    clean: resourceApiBase + "/install",
  };
  const supportedResources = new Set(["rvc", "separator", "asr", "embedding", "gpt_sovits", "ffmpeg", "reranker"]);
  const api = supportedResources.has(key) ? endpointSet : null;
  if (!api) {
    const input = $("question"); if (!input) return;
    input.value = `请${({status:"检查",install:"下载",cancel:"取消安装",clean:"卸载"})[normalized] || "检查"} ${key} 受管资源`;
    resizeComposer(); void submitQuestion({ preventDefault() {} }); return;
  }
  const node = findExistingResourceCard(key) || (state.realtimeAnswerNode?.isConnected ? state.realtimeAnswerNode : appendMessage("assistant", "资源状态已更新。"));
  try {
    const options = { method: normalized === "status" ? "GET" : normalized === "clean" || normalized === "cancel" ? "DELETE" : "POST" };
    let result = await chatRvcApi(api[normalized], options);
    if (result?.status && typeof result.status === "object") result = { ...result.status, resource: key };
    if (node) renderResourceSetupCard(node, { ...result, resource: key, kind: "resource_setup", install: result });
    if (normalized === "install") {
      if (window.__yumenoResourceInstallTimer) clearInterval(window.__yumenoResourceInstallTimer);
      const timer = setInterval(async () => {
        try {
          result = await chatRvcApi(api.status, { cache: "no-store" });
          if (result?.status && typeof result.status === "object") result = { ...result.status, resource: key };
          if (node) renderResourceSetupCard(node, { ...result, resource: key, kind: "resource_setup", install: result });
          const phase = String(result.phase || "").toLowerCase();
          const terminal = !result.installing && !["preparing", "downloading", "installing", "running"].includes(phase);
          if (terminal) {
            clearInterval(timer);
            window.__yumenoResourceInstallTimer = null;
            const success = result.ready === true || (result.installed === true && !(result.missing || []).length);
            if (!node.dataset.resourceCompletionNotified) {
              node.dataset.resourceCompletionNotified = "1";
              appendMessage("assistant", success ? `${resourceSetupDescriptor(key).title}已就绪。` : `${resourceSetupDescriptor(key).title}下载失败：${result.error || result.detail || "请重试。"}`);
            }
            if (node) renderResourceSetupCard(node, { ...result, resource: key, kind: "resource_setup", install: result });
          }
        } catch (error) {
          clearInterval(timer);
          appendMessage("assistant", `${resourceSetupDescriptor(key).title}状态查询失败：${error?.message || error}`);
        }
      }, 500);
      window.__yumenoResourceInstallTimer = timer;
    }
  } catch (error) {
    if (node) renderResourceSetupCard(node, { resource: key, kind: "resource_setup", status: "failed", error: error?.message || String(error) });
  }
}
function canonicalResourceKey(resourceKey) {
  const raw = String(resourceKey || "").trim().toLowerCase().replace(/-/g, "_");
  if (["gpt_sovits", "gptsovits", "gsv_tts_local", "gpt_sovits_runtime", "gpt_sovits_resource"].includes(raw)) return "gpt_sovits";
  if (["rvc", "rvc_runtime", "rvc_resource"].includes(raw)) return "rvc";
  if (["reranker", "rerank", "local_rerank"].includes(raw)) return "reranker";
  return raw;
}
function resourceSetupDescriptor(resourceKey) {
  const key = canonicalResourceKey(resourceKey);
  const descriptors = {
    rvc: { title: "RVC 运行环境", ready: "已就绪", fallback: "未就绪" },
    gpt_sovits: { title: "GPT-SoVITS 运行环境", ready: "已就绪", fallback: "未就绪" },
    separator: { title: "人声分离模型", ready: "已就绪", fallback: "未就绪" },
    asr: { title: "语音识别", ready: "已就绪", fallback: "未就绪" },
    embedding: { title: "检索模型", ready: "已就绪", fallback: "未就绪" },
    ffmpeg: { title: "FFmpeg", ready: "已就绪", fallback: "未就绪" },
  };  return descriptors[key] || {
    title: `${String(resourceKey || "应用")} 运行资源`,
    ready: "已就绪",
    fallback: "未就绪",
  };
}
function resourceSnapshot(item) {
  if (!item || typeof item !== "object") return {};
  const nested = [item.status, item.install, item.resource_status]
    .find((value) => value && typeof value === "object" && !Array.isArray(value)) || {};
  return { ...nested, ...item, ...(item.status && typeof item.status === "object" ? item.status : {}), ...(item.install && typeof item.install === "object" ? item.install : {}) };
}
function resourceStatusText(item) {
  const install = resourceSnapshot(item);
  // config_worker 的外层 status 是协议状态（ok/accepted），不是资源状态。
  // 资源是否就绪只能由标准化 install/status 快照决定，避免“查询成功”被显示成“已就绪”。
  const status = String(install.status || "unknown").toLowerCase();
  if (install.ready === true || status === "ready") return "已就绪";
  if (install.installing === true || status === "accepted" || status === "running") {
    return resourcePhaseLabels[String(install.phase || "").toLowerCase()] || "处理中";
  }
  if (status === "failed" || install.error) return install.installed === false ? "下载失败" : "检查失败";
  return "未就绪";
}
function resourceStatusDetail(item) {
  const install = resourceSnapshot(item);
  const missing = Array.isArray(install.missing) ? install.missing : [];
  return [item?.error, install.error, item?.detail, item?.message, install.detail, install.message]
    .find((value) => String(value || "").trim())
    || (missing.length ? `缺少：${missing.join("、")}` : (install.ready ? "运行所需组件完整" : (install.next_action === "start_service" ? "安装完整，服务尚未启动" : "等待检查")));
}
function appendResourceOverviewRow(grid, item) {
  const key = canonicalResourceKey(item?.resource || item?.provider_id || item?.resource_kind);
  const descriptor = resourceSetupDescriptor(key);
  const row = document.createElement("div");
  row.className = "resource-setup-overview-row";
  row.dataset.resource = key;
  const identity = document.createElement("div");
  identity.className = "resource-setup-overview-identity";
  const name = document.createElement("strong");
  name.textContent = descriptor.title;
  const detail = document.createElement("span");
  detail.textContent = resourceStatusDetail(item);
  identity.append(name, detail);
  const state = document.createElement("span");
  state.className = "resource-setup-overview-state";
  const stateText = resourceStatusText(item);
  state.textContent = stateText;
  if (stateText === "已就绪") state.classList.add("is-ready");
  else if (stateText === "检查失败") state.classList.add("is-failed");
  else if (stateText === "未就绪") state.classList.add("is-missing");
  const action = document.createElement("div");
  action.className = "resource-setup-overview-action";
  const install = resourceSnapshot(item);
  const capabilities = item?.capabilities || install.capabilities || {};
  const ready = stateText === "已就绪";
  const installing = install.installing === true || ["accepted", "running"].includes(String(item?.status || install.status || "").toLowerCase());
  const canClean = capabilities.clean === true || capabilities.uninstall === true;
  if (installing && capabilities.cancel !== false) {
    action.append(rvcButton("停止", () => resourceSetupAction({ ...item, resource: key }, "cancel"), true));
  } else if (!ready && capabilities.install !== false) {
    action.append(rvcButton("下载", () => resourceSetupAction({ ...item, resource: key }, "install"), true));
  } else if (ready && canClean) {
    action.append(rvcButton("卸载", () => resourceSetupAction({ ...item, resource: key }, "clean"), true));
  }
  row.append(identity, state, action);
  grid.append(row);
}
function renderResourceOverviewCard(node, resource) {
  const card = document.createElement("section");
  card.className = "resource-setup-inline-card resource-setup-overview";
  card.dataset.resource = "all";
  const heading = document.createElement("div");
  heading.className = "resource-setup-heading";
  const title = document.createElement("strong");
  title.textContent = "全部运行资源";
  const items = Array.isArray(resource.items) ? resource.items : [];
  const readyCount = items.filter((item) => resourceStatusText(item) === "已就绪").length;
  const badge = document.createElement("span");
  badge.className = "resource-setup-status";
  badge.textContent = items.length ? `${readyCount}/${items.length} 已就绪` : "暂无可用资源";
  heading.append(title, badge);
  const summary = document.createElement("p");
  summary.textContent = items.length ? "应用受管运行资源状态。用户模型、附件和历史结果不在此范围内。" : resourceStatusDetail(resource);
  card.append(heading, summary);
  const grid = document.createElement("div");
  grid.className = "resource-setup-overview-grid";
  items.forEach((item) => appendResourceOverviewRow(grid, item));
  card.append(grid);
  node.append(card);
}
function renderResourceSetupCard(node, resource) {
  if (!node || !resource) return;
  node.querySelectorAll(".resource-setup-inline-card").forEach((item) => item.remove());
  const key = canonicalResourceKey(resource.resource);
  if (key === "all") {
    renderResourceOverviewCard(node, resource);
    return;
  }
  const descriptor = resourceSetupDescriptor(key);
  const card = document.createElement("section");
  card.className = "resource-setup-inline-card";
  if (key === "gpt_sovits") card.classList.add("resource-setup-diagnostic-card");
  card.dataset.resource = key;
  const heading = document.createElement("div");
  heading.className = "resource-setup-heading";
  const title = document.createElement("strong");
  title.textContent = descriptor.title;
  const badge = document.createElement("span");
  badge.className = "resource-setup-status";
  const install = resourceSnapshot(resource);
  const status = String(install.status || "unknown").toLowerCase();
  const ready = install.ready === true || status === "ready";
  const installing = status === "accepted" || status === "running" || install.installing === true;
  badge.textContent = resourceStatusText(resource);
  heading.append(title, badge);
  const detail = document.createElement("p");
  detail.textContent = resourceStatusDetail(resource);
  card.append(heading, detail);
  if (key === "gpt_sovits") {
    const components = document.createElement("div");
    components.className = "resource-setup-components";
    const rows = [
      ["安装文件", install.installed ? (install.installation_ready ? "完整" : "已发现，待检查") : "未发现"],
      ["运行状态", install.ready ? "可用" : (install.next_action === "start_service" ? "等待启动" : "未就绪")],
      ["服务状态", install.service_running ? "运行中" : "未启动"],
      ["API", install.api_version ? `API ${install.api_version}` : "未检测"],
      ["目录", install.install_dir || "未配置"],
    ];
    rows.forEach(([label, value]) => {
      const row = document.createElement("div"); row.className = "resource-setup-component";
      const name = document.createElement("span"); name.textContent = label;
      const state = document.createElement("span"); state.textContent = String(value);
      row.append(name, state); components.append(row);
    });
    card.append(components);
  }
  const progress = Number(install.progress_percent ?? install.progress);
  if (installing) {
    const progressWrap = document.createElement("div");
    progressWrap.className = "resource-setup-progress";
    const phase = String(install.phase || "preparing").toLowerCase();
    const phaseText = resourcePhaseLabels[phase] || `正在准备${descriptor.title}`;
    const hasProgress = Number.isFinite(progress) && progress >= 0;
    progressWrap.innerHTML = `<div class="resource-setup-progress-head"><span>${phaseText}</span><b>${hasProgress ? `${Math.max(0, Math.min(100, progress))}%` : "处理中"}</b></div><div class="resource-setup-progress-track"><i style="width:${hasProgress ? Math.max(0, Math.min(100, progress)) : 35}%"></i></div>`;
    card.append(progressWrap);
  }
  const actions = document.createElement("div");
  actions.className = "resource-setup-actions";
  const capabilities = resource.capabilities || install.capabilities || {};
  const managedResourceKeys = ["rvc", "asr", "ffmpeg", "embedding", "gpt_sovits", "separator"].includes(key) || key === "reranker";
  const canClean = capabilities.clean === true || capabilities.uninstall === true || managedResourceKeys;
  if (installing) actions.append(rvcButton("停止", () => resourceSetupAction(resource, "cancel"), true));
  else if (key === "gpt_sovits" && install.installation_ready === true && install.ready !== true) {
    actions.append(rvcButton(install.service_running ? "停止服务" : "启动服务", () => resourceSetupAction(resource, install.service_running ? "stop_service" : "start_service"), true));
    actions.append(rvcButton("检查环境", () => resourceSetupAction(resource, "detect"), false));
    actions.append(rvcButton("打开目录", () => resourceSetupAction(resource, "open_directory"), false));
  } else if (!ready) actions.append(rvcButton(install.next_action === "check" ? "检查环境" : "下载", () => resourceSetupAction(resource, install.next_action === "check" ? "detect" : "install"), true));
  else if (key === "gpt_sovits") {
    actions.append(rvcButton(install.service_running ? "停止服务" : "启动服务", () => resourceSetupAction(resource, install.service_running ? "stop_service" : "start_service"), true));
    actions.append(rvcButton("打开目录", () => resourceSetupAction(resource, "open_directory"), false));
    if (canClean) actions.append(rvcButton("卸载", () => resourceSetupAction(resource, "clean"), false));
  } else if (canClean) actions.append(rvcButton("卸载", () => resourceSetupAction(resource, "clean"), true));
  card.append(actions);
  node.append(card);
}
function applyAgentContextResult(result) {
  const resultFlow = result?.workflow || result?.flow;
  const resourceSetup = findResourceSetup(result);
  // 只有 Core Agent 返回的完整 workflow.worker 才能激活 RVC；
  // 顶层 worker/specialist 结果不能单独创建或恢复 RVC 工作区。
  const isRvcResult = Boolean(resultFlow && typeof resultFlow === "object" && hasFormalRvcHandoff(result, resultFlow));
  const tasks = rvcTaskEntries(result);
  if (resourceSetup) {
    const resourceNode = state.realtimeAnswerNode || state.pendingReplyNode || appendMessage("assistant", "正在检查运行环境…");
    if (resourceNode) renderResourceSetupCard(resourceNode, resourceSetup);
  }
  // RVC 只能由 Agent 返回的结构化 worker 合同激活。历史兼容 task 不能
  // 在顶部创建旧任务卡，也不能凭 task 字段把普通结果升级成 RVC。
  if (!isRvcResult) tasks.forEach((entry) => registerChatTask(entry));
  const taskId = stableTaskId(result) || tasks[0]?.task_id || "";
  if (resultFlow && typeof resultFlow === "object") {
    if (isRvcResult) {
      // RVC 的 workflow 只属于当前 assistant 气泡；绝不再写入顶部/右侧通用任务状态。
      activateRvcWorkspaceFromAgent(result, resultFlow);
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
    const inlineVoice = input.dataset.voiceInline === "true";
    input.value = "";
    input.dataset.rvcInline = "false";
    input.dataset.voiceInline = "false";
    input.accept = ".pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.png,.jpg,.jpeg,.webp,.gif,audio/*,video/*";
    files.forEach((file) => void ((inlineRvc || inlineVoice || state.pendingUploadRequest?.purpose === "voice_material") ? uploadChatVoiceMaterial(file) : uploadChatAttachment(file)));
  });
}

function openChatVoiceUpload() {
  const input = $("chat-voice-material");
  if (input) input.click();
}
function uploadChatVoiceMaterial(file) { if (!file) { setText("chat-error", "音色素材上传失败：未选择文件", true); return Promise.resolve(null); } return uploadChatAttachment(file, { errorPrefix: "音色素材", inlineRvc: Boolean(state.rvcInline), inlineVoice: Boolean(state.voiceInline) }); }
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
    files.forEach((file) => void ((input?.dataset.rvcInline === "true" || input?.dataset.voiceInline === "true" || state.pendingUploadRequest?.purpose === "voice_material") ? uploadChatVoiceMaterial(file) : uploadChatAttachment(file)));
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
  if (isInlineRvcActive() || isInlineVoiceActive()) { host.replaceChildren(); host.classList.add("is-hidden"); return; }
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
    if (isInlineRvcActive() || isInlineVoiceActive()) strip.classList.add("is-hidden");
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
  const isVoiceSource = Boolean(
    options.inlineVoice ||
    (state.voiceInline && ["audio", "video"].includes(attachmentKind({ name: file.name, mime_type: file.type }))),
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
      setText("question-status", `已上传 ${saved.name}`);
      await resumeRvcWorkerWithAttachment(saved.file_id);
    } else if (isVoiceSource && state.voiceInline) {
      state.voiceInline.attachmentResumeSent = false;
      setText("question-status", `已上传 ${saved.name}`);
      await resumeVoiceWorkerWithAttachment(saved.file_id);
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

function pendingResourceAction() {
  const pending = state.pendingAction;
  const action = pending?.action || {};
  const tool = String(action.tool || action.name || "").trim();
  const args = action.arguments && typeof action.arguments === "object" ? action.arguments : {};
  if (tool !== "manage_resource_install" || !args.resource || !args.action) return null;
  return { resource: canonicalResourceKey(args.resource), action: String(args.action).toLowerCase() };
}

function renderResourceConfirmation() {
  document.querySelectorAll(".resource-setup-confirmation").forEach((item) => item.remove());
  const pending = pendingResourceAction();
  if (!pending) return false;
  const node = findExistingResourceCard(pending.resource);
  const card = node?.querySelector(`.resource-setup-inline-card[data-resource="${CSS.escape(pending.resource)}"]`);
  if (!card) return false;
  const operationLabels = { install: "下载", clean: "卸载", cancel: "停止下载" };
  const label = operationLabels[pending.action] || "执行";
  const panel = document.createElement("div");
  panel.className = "resource-setup-confirmation";
  const copy = document.createElement("div");
  const title = document.createElement("strong"); title.textContent = `确认${label}`;
  const detail = document.createElement("small");
  detail.textContent = pending.action === "clean" ? "只清理应用受管资源，不会删除用户模型、附件或历史结果。" : `确认后立即${label}此资源。`;
  copy.append(title, detail);
  const actions = document.createElement("div"); actions.className = "resource-setup-confirmation-actions";
  actions.append(
    rvcButton("取消", () => { resetConfirmationState(); renderConfirmation(); updateComposerControls(); }, false),
    rvcButton(`确认${label}`, () => void confirmPendingTaskAction(), true),
  );
  panel.append(copy, actions);
  card.append(panel);
  card.scrollIntoView({ block: "nearest", behavior: "smooth" });
  icons();
  return true;
}

function renderConfirmation() {
  // 资源安装等操作由 config_worker 负责；确认只作为当前任务的一部分展示，
  // 不再显示会脱离任务上下文的旧版黄色页脚条。
  const panel = $("confirmation-panel");
  if (panel) {
    // 保留兼容 DOM 的可读摘要，实际页脚面板继续隐藏；确认入口只显示在任务工作区。
    const action = state.pendingAction?.action || {};
    const actionArguments = action.arguments && typeof action.arguments === "object" ? action.arguments : {};
    const argumentText = Object.entries(actionArguments)
      .filter(([key]) => !["tool", "name", "internal"].includes(String(key).toLowerCase()))
      .map(([key, value]) => `${key}：${typeof value === "object" ? JSON.stringify(value) : value}`)
      .join("；");
    const title = panel.querySelector("#confirmation-title");
    const detail = panel.querySelector("#confirmation-detail");
    if (title) title.textContent = state.pendingAction ? "需要确认" : "确认操作";
    if (detail) detail.textContent = state.pendingAction ? (argumentText || "确认后继续当前操作") : "";
    panel.classList.add("is-hidden");
    panel.setAttribute("aria-hidden", "true");
  }
  renderResourceConfirmation();
  renderChatTaskWorkspace();
  renderChatContext();
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
  const voice = state.voiceInline;
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
  if (voice?.source?.file_id) {
    ids.add(voice.source.file_id);
    values.source_file_id = voice.source.file_id;
    values.source_attachment_id = voice.source.file_id;
    values.attachment_id = voice.source.file_id;
  }
  if (voice?.agentWorkflow?.worker === "voice_worker") values.worker = "voice_worker";
  return {
    conversation_id: state.conversationId,
    specialist: pending.specialist || state.pendingAction?.specialist || "management",
    approved,
    worker: pending.worker || inline?.agentWorkflow?.worker || voice?.agentWorkflow?.worker || state.currentWorkflow?.worker || null,
    task_id: pending.task_id || inline?.agentWorkflow?.task_id || voice?.agentWorkflow?.task_id || state.currentWorkflow?.task_id || null,
    attachment_ids: Array.from(ids),
    input_values: values,
  };
}
function waitingInputLabel(item) {
  return item?.label || item?.title || "请继续";
}

function appendWaitingInputCard(node, result) {
  // 等待输入只保留说明消息；唯一的操作卡由中央任务工作区渲染，
  // 避免 assistant 气泡和右侧任务栏各自复制一份上传/选择表单。
  const target = node || state.pendingReplyNode || appendMessage("assistant", result?.answer || "请按提示继续");
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
        const empty = document.createElement("option"); empty.value = ""; empty.textContent = "暂无可用项"; select.append(empty);
      }
    }
  } catch {
    const failed = document.createElement("option"); failed.value = ""; failed.textContent = "加载失败，请重试"; select.replaceChildren(failed);
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
  if (state.pendingAction) {
    state.confirmationRequestKey = confirmationActionKey(
      state.pendingAction.action,
      state.pendingAction.specialist,
    );
  }
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
    resetConfirmationResponseLock();
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
      label: cleanPublicText(item?.label || item?.title || item?.message, "请继续"),
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
  // workflow.update 本身就是 Supervisor 发出的结构化交接凭据。
  // 如果继续等待最终自然语言结果，通用 Agent 阶段会和 RVC 工作区同时呈现，
  // 且慢任务会看起来像“两个流程都在转”。配置请求不会携带 rvc_worker flow，
  // 因此不会因为历史 worker_results 被误唤起。
  const eventType = String(event?.type || event?.kind || "").trim().toLowerCase();
  if (eventType === "workflow.update" || eventType === "workflow_update") return true;
  // 其它事件仍要求直接 worker 字段，禁止递归扫描 worker_results/artifacts。
  const directWorkers = [
    event?.worker, event?.worker_name,
    event?.result?.worker, event?.result?.worker_name,
    event?.agent_result?.worker, event?.agent_result?.worker_name,
  ];
  return directWorkers.some((item) => String(item || "").trim().toLowerCase() === "rvc_worker");
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
  const isVoiceEvent = isAgentVoiceWorkflowDescriptor(event, flow);
  const isFormalVoiceEvent = hasFormalVoiceHandoff(event, flow);
  const hasIsolatedRvcWorker = !isRvcEvent && !flow && (
    String(event?.worker || event?.worker_name || "").trim().toLowerCase() === "rvc_worker"
  );
  const hasIsolatedVoiceWorker = !isVoiceEvent && !flow && (
    String(event?.worker || event?.worker_name || "").trim().toLowerCase() === "voice_worker"
  );
  // 顶层孤立 worker 只是一条内部兼容/状态信息，不是 Core Agent 已完成
  // handoff 的公开合同。禁止它落入通用任务卡，否则会在“正在分析请求…”
  // 阶段提前显示 RVC 卡片。
  if ((hasIsolatedRvcWorker || hasIsolatedVoiceWorker) && (kind === "workflow_update" || kind === "task_status")) return true;
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
    if (isVoiceEvent) {
      state.pendingVoiceWorkflowEvent = { event, flow: flow || event };
      if (isFormalVoiceEvent) {
        activateVoiceWorkspaceFromAgent(event, flow || event);
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
    if (isVoiceEvent) {
      if (!isFormalVoiceEvent) return true;
      if (state.voiceInline && flow) {
        state.voiceInline.agentWorkflow = flow;
        renderVoiceInline();
      } else {
        state.pendingVoiceWorkflowEvent = { event, flow: flow || event };
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
  if (normalized.worker === "rvc_worker" || normalized.worker === "voice_worker") {
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
    ["prepare_source", "准备音频", "整理上传的音频"],
    ["separate_vocals", "分离人声", "分出人声和伴奏"],
    ["load_model", "选择音色", "选择音色模型和 Index"],
    ["gpu_inference", "变声", "按所选音色生成结果"],
    ["register_result", "保存结果", "保存到当前会话"],
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
    title: "变声",
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
  if (worker === "rvc_worker") return "变声";
  if (/sovit|gpt.?sovits|voice.?material|音色|tts/.test(value) || worker === "voice_worker") return "声音";
  if (/rag|knowledge|index|document|文档|知识/.test(value)) return "知识库";
  if (/media|image|video|audio|媒体/.test(value)) return "媒体分析";
  return "文件任务";
}
async function cancelActiveChatTask() {
  // RVC 主工作区不再写入 currentWorkflow；新消息/停止按钮必须先走同一
  // 个内嵌取消入口，否则旧 Agent turn 会继续占用 checkpoint 和轮询。
  if (state.rvcInline && !state.rvcInline.cancelling) {
    const inline = state.rvcInline;
    await cancelInlineRvc();
    // 取消卡保留在历史气泡中，但不再作为活动 workflow；下一条消息
    // 必须从干净状态开始，且不能复活旧上传入口。
    inline.workflowActive = false;
    inline.cancelled = true;
    state.rvcInline = null;
    state.pendingAction = null;
    state.pendingInput = null;
    state.pendingInputValues = {};
    updateComposerControls();
    return;
  }
  if (state.voiceInline && !state.voiceInline.cancelling) {
    const inline = state.voiceInline;
    await cancelInlineVoice();
    inline.workflowActive = false;
    inline.cancelled = true;
    state.voiceInline = null;
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
    setText("chat-error", `无法停止：${reason?.message || reason}`, true);
  }
}

async function confirmPendingTaskAction() {
  const pending = state.pendingAction;
  const action = pending?.action || {};
  const tool = String(action.tool || action.name || "").trim();
  const args = action.arguments && typeof action.arguments === "object" ? action.arguments : {};
  // 资源卡已经有受保护的确定性 API。用户在任务卡确认后直接调用同一资源
  // 管理链路，不再恢复 Agent checkpoint，避免重复确认、空回复和无动作。
  if (tool === "manage_resource_install" && args.resource && args.action) {
    const resource = args.resource;
    const operation = args.action;
    resetConfirmationState();
    state.pendingInput = null;
    state.pendingInputValues = {};
    renderConfirmation();
    setText("question-status", "正在执行资源操作…");
    try {
      await resourceSetupAction(resource, operation, { confirmed: true });
      setText("question-status", "资源操作已提交");
    } catch (error) {
      setText("chat-error", `资源操作失败：${error?.message || error}`, true);
    } finally {
      updateComposerControls();
    }
    return;
  }
  await resumeAgent(true);
}

function renderChatTaskActions(flow) {
  const host = $("chat-task-workspace-actions");
  if (!host) return;
  host.replaceChildren();
  const waiting = state.pendingInput;
  const action = state.pendingAction;
  const items = normalizedWaitingInputs(waiting?.waiting_inputs || waiting?.pending_inputs);
  if (action) {
    const confirm = pendingActionButton("确认", "arrow-right", () => void confirmPendingTaskAction(), true);
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
      row.append(pendingActionButton("上传", "upload", () => $("chat-voice-material")?.click(), true));
      const choose = pendingActionButton("选用已有", "paperclip", () => {
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
        loading.value = ""; loading.textContent = "正在加载…"; select.append(loading);
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
    const continueButton = pendingActionButton("继续", "play", () => resumeAgent(null), true);
    continueButton.disabled = items.some((item) => /file|attachment|audio|video|upload/.test(String(item.kind || item.type || "").toLowerCase()))
      && !getSelectedAttachmentIds().length;
    host.append(continueButton);
  }
  const active = flow && !CHAT_FLOW_TERMINAL.has(flow.status);
  if (active || waiting || action) host.append(pendingActionButton("停止", "square", cancelActiveChatTask, false));
  if (flow?.status === "failed") host.append(pendingActionButton("重试", "rotate-ccw", () => {
    if (!isConversationBusy()) sendQuestionText("重试刚才的任务");
  }, true));
  icons();
}

function isAgentVoiceWorkflowDescriptor(event, flow) {
  return String(flow?.worker || "").trim().toLowerCase() === "voice_worker";
}
function hasFormalVoiceHandoff(event, flow) {
  const flowWorker = String(flow?.worker || flow?.worker_name || "").trim().toLowerCase();
  if (flowWorker !== "voice_worker") return false;
  const eventType = String(event?.type || event?.kind || "").trim().toLowerCase();
  if (eventType === "workflow.update" || eventType === "workflow_update") return true;
  const directWorkers = [
    event?.worker, event?.worker_name,
    event?.result?.worker, event?.result?.worker_name,
    event?.agent_result?.worker, event?.agent_result?.worker_name,
  ];
  return directWorkers.some((item) => String(item || "").trim().toLowerCase() === "voice_worker");
}
function isInlineVoiceActive() {
  return Boolean(state.voiceInline?.host?.isConnected || state.currentWorkflow?.worker === "voice_worker");
}
function voiceWorkspaceNode() {
  if (state.voiceInline?.node?.isConnected) return state.voiceInline.node;
  const node = state.realtimeAnswerNode?.isConnected
    ? state.realtimeAnswerNode
    : (state.pendingReplyNode || appendMessage("assistant", "\u58f0\u97f3\u4efb\u52a1\u5df2\u5c31\u7eea\u3002"));
  if (!node) return null;
  node.classList.remove("message-loading");
  delete node.dataset.pendingTurn;
  clearReplyStage(node);
  node.querySelectorAll(
    ".agent-process-list, .agent-process-details, .thinking-indicator, [data-role=\"agent-stage\"], p[data-stage]",
  ).forEach((item) => item.remove());
  const body = node.querySelector('[data-role="voice-reply"]') || node.querySelector("p");
  if (body) { body.textContent = "\u58f0\u97f3\u4efb\u52a1\u5df2\u5c31\u7eea\uff0c\u8bf7\u6309\u63d0\u793a\u7ee7\u7eed\u3002"; delete body.dataset.stage; }
  node.classList.add("message-voice-workflow");
  state.pendingReplyNode = null;
  const host = document.createElement("section");
  host.className = "voice-inline-workspace rvc-inline-workspace";
  host.setAttribute("aria-label", "\u58f0\u97f3\u5bf9\u8bdd\u5de5\u4f5c\u533a");
  node.append(host);
  state.voiceInline = {
    node, host, agentWorkflow: null, lastResult: null, source: null, attachmentResumeSent: false,
    sessionId: null, pollTimer: null, generation: 0, cancelling: false, sourceConfirmed: false, polling: false,
  };
  renderVoiceInline();
  return node;
}
function activateVoiceWorkspaceFromAgent(event, flow) {
  if (!hasFormalVoiceHandoff(event, flow)) return false;
  state.currentWorkflow = null;
  voiceWorkspaceNode();
  if (state.voiceInline && flow && typeof flow === "object") {
    const payload = (event?.result && typeof event.result === "object") ? event.result : (event || {});
    state.voiceInline.agentWorkflow = flow;
    state.voiceInline.lastResult = payload;
    const attachmentIds = [
      ...(Array.isArray(payload.attachment_ids) ? payload.attachment_ids : []),
      ...(Array.isArray(flow.attachment_ids) ? flow.attachment_ids : []),
    ].filter(Boolean);
    const sourceId = payload.attachment_id || payload.attachment?.file_id || attachmentIds[0] || null;
    if (sourceId) {
      state.voiceInline.source = (state.chatAttachments || []).find((item) => String(item.file_id) === String(sourceId))
        || payload.attachment
        || { file_id: sourceId, name: "\u97f3\u9891\u9644\u4ef6", kind: "audio", mime_type: "audio/*" };
    }
    state.voiceInline.sessionId = state.voiceInline.sessionId || payload.session_id || payload.voice_session_id || payload.session?.session_id || null;
    renderVoiceInline();
    maybePollVoiceSession();
  }
  return true;
}
function voiceWaitingItems(data) {
  const result = data?.lastResult || {};
  const flow = data?.agentWorkflow || {};
  const pending = state.pendingInput || {};
  const items = result.waiting_inputs || flow.waiting_inputs || pending.waiting_inputs || [];
  return Array.isArray(items) ? items : [];
}
function voiceSessionPayload(data) {
  const result = data?.lastResult || {};
  const session = (result.session && typeof result.session === "object") ? result.session : {};
  return session;
}
function voiceStageLabel(data) {
  const result = data?.lastResult || {};
  const session = voiceSessionPayload(data);
  const waiting = voiceWaitingItems(data);
  const inputId = String(waiting[0]?.input_id || waiting[0]?.id || "");
  const phase = String(session.phase || "").toLowerCase();
  const status = String(result.status || data?.agentWorkflow?.status || "").toLowerCase();
  if (data?.cancelling || status === "cancelled" || phase === "cancelled") return "\u5df2\u505c\u6b62";
  if (status === "failed" || phase === "failed") return result.reason || "\u5904\u7406\u5931\u8d25";
  if (result.attachment && (result.attachment.url || result.attachment.file_id || result.attachment.id)) return "\u5df2\u5b8c\u6210";
  if (status === "completed" || phase === "done") return "\u5df2\u5b8c\u6210";
  if (["accepted", "running", "processing", "queued"].includes(status) || session.running || ["queued", "convert", "separating", "audio_ready"].includes(phase)) return "\u5904\u7406\u4e2d";
  if (inputId === "voice_material") return "\u4e0a\u4f20\u7d20\u6750";
  if (inputId === "audio_attachment") return "\u4e0a\u4f20\u97f3\u9891";
  if (inputId === "segment_indices") return "\u9009\u62e9\u7247\u6bb5";
  if (inputId === "save_voice") return "\u4fdd\u5b58\u97f3\u8272";
  if (inputId === "tts_text") return "\u8f93\u5165\u6587\u672c";
  if (inputId === "asset_id") return "\u9009\u62e9\u97f3\u8272";
  if (inputId === "asset_name" || inputId === "voice_name") return "\u547d\u540d\u97f3\u8272";
  return waiting[0]?.label || "\u58f0\u97f3";
}
function maybePollVoiceSession() {
  const data = state.voiceInline;
  if (!data || data.cancelling || data.polling || data.pollTimer) return;
  const result = data.lastResult || {};
  const session = voiceSessionPayload(data);
  data.sessionId = data.sessionId || result.session_id || result.voice_session_id || session.session_id || session.id || null;
  const status = String(result.status || "").toLowerCase();
  const running = ["accepted", "running", "processing", "queued"].includes(status) || Boolean(session.running);
  if (running && data.sessionId) void waitInlineVoiceSession(["segments", "reference", "done", "failed", "cancelled"]);
}
async function resumeVoiceSessionStatus() {
  const data = state.voiceInline;
  if (!data?.sessionId || data.sessionStatusResumeSent || data.cancelling) return;
  data.sessionStatusResumeSent = true;
  state.pendingInputValues = {
    ...(state.pendingInputValues || {}),
    action: "session_status",
    session_id: data.sessionId,
    voice_session_id: data.sessionId,
  };
  try {
    resetConfirmationResponseLock();
    const result = await resumeAgent(null, { forceHttp: true });
    const flow = result?.workflow || result?.flow;
    if (flow && hasFormalVoiceHandoff(result, flow)) activateVoiceWorkspaceFromAgent(result, flow);
    if (state.voiceInline === data) renderVoiceInline();
  } catch (error) {
    data.sessionStatusResumeSent = false;
    setText("chat-error", error.message || String(error), true);
    renderVoiceInline();
  }
}
async function waitInlineVoiceSession(targetPhases) {
  const data = state.voiceInline;
  if (!data?.sessionId || data.polling || data.cancelling) return "failed";
  data.polling = true;
  const targets = new Set(targetPhases);
  const generation = ++data.generation;
  clearTimeout(data.pollTimer);
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const tick = async () => {
      if (!state.voiceInline || generation !== data.generation || data.cancelling) {
        data.polling = false;
        data.pollTimer = null;
        return resolve("cancelled");
      }
      if (Date.now() - startedAt > 15 * 60 * 1000) {
        data.polling = false;
        data.pollTimer = null;
        data.lastResult = { ...(data.lastResult || {}), status: "failed", reason: "\u5904\u7406\u8d85\u65f6" };
        renderVoiceInline();
        return resolve("failed");
      }
      try {
        const response = await chatRvcApi(`/api/voice-studio/sessions/${encodeURIComponent(data.sessionId)}`);
        const session = response?.session && typeof response.session === "object" ? response.session : response;
        data.lastResult = { ...(data.lastResult || {}), session, session_id: data.sessionId, voice_session_id: data.sessionId, status: session?.running ? "running" : (data.lastResult?.status || "running") };
        if (!state.voiceInline || generation !== data.generation || data.cancelling) {
          data.polling = false;
          data.pollTimer = null;
          return resolve("cancelled");
        }
        renderVoiceInline();
        const phase = String(session?.phase || "").toLowerCase();
        if (targets.has(phase) || ["failed", "cancelled", "done"].includes(phase)) {
          data.polling = false;
          data.pollTimer = null;
          if (["segments", "reference", "failed", "cancelled"].includes(phase) && !data.cancelling) {
            data.sessionStatusResumeSent = false;
            void resumeVoiceSessionStatus();
          }
          return resolve(phase || "done");
        }
        data.pollTimer = setTimeout(tick, 700);
      } catch (error) {
        data.polling = false;
        data.pollTimer = null;
        data.lastResult = { ...(data.lastResult || {}), status: "failed", reason: error.message || String(error) };
        renderVoiceInline();
        resolve("failed");
      }
    };
    void tick();
  });
}
function renderVoiceInline() {
  const data = state.voiceInline; const box = data?.host; if (!box) return;
  const result = data.lastResult || {};
  const waiting = voiceWaitingItems(data);
  const first = waiting[0] || null;
  const inputId = String(first?.input_id || first?.id || "");
  const session = voiceSessionPayload(data);
  const status = String(result.status || data.agentWorkflow?.status || (first ? "waiting_input" : "ok")).toLowerCase();
  const running = ["accepted", "running", "processing", "queued"].includes(status) || Boolean(session.running);
  data.sessionId = data.sessionId || result.session_id || result.voice_session_id || session.session_id || session.id || null;
  box.replaceChildren();
  if ((running || data.cancelling) && !["completed", "cancelled", "failed"].includes(status)) {
    const actionBar = document.createElement("div");
    actionBar.className = "rvc-inline-action-bar";
    const stop = rvcButton(data.cancelling ? "\u6b63\u5728\u505c\u6b62\u2026" : "\u505c\u6b62", () => void cancelInlineVoice());
    stop.disabled = Boolean(data.cancelling);
    actionBar.append(stop);
    box.append(actionBar);
  }
  const stage = document.createElement("div");
  stage.className = "rvc-inline-stage";
  stage.textContent = voiceStageLabel(data);
  box.append(stage);
  if (String(result.handoff || "") === "config_worker") {
    const hint = document.createElement("p");
    hint.className = "rvc-hint";
    hint.textContent = "\u8fd0\u884c\u73af\u5883\u672a\u5c31\u7eea\uff0c\u8bf7\u5148\u4e0b\u8f7d";
    box.append(hint);
  }
  if (data.source) {
    const file = document.createElement("div");
    file.className = "rvc-inline-file";
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = data.source.name || "\u4f1a\u8bdd\u9644\u4ef6";
    const meta = document.createElement("small");
    meta.textContent = attachmentMeta(data.source) || "\u4f1a\u8bdd\u9644\u4ef6";
    copy.append(name, meta);
    file.append(copy);
    box.append(file);
  }
  const progressValue = Math.max(0, Math.min(100, Number(session.progress ?? result.progress ?? (status === "completed" ? 100 : 0)) || 0));
  if (running || data.cancelling) {
    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = progressValue;
    progress.className = "rvc-inline-progress";
    box.append(progress);
  }
  if (!running && !data.cancelling && result.text) {
    const card = document.createElement("div");
    card.className = "rvc-inline-confirm";
    const title = document.createElement("strong");
    title.textContent = "\u8bc6\u522b\u6587\u672c";
    const body = document.createElement("p");
    body.textContent = String(result.text);
    card.append(title, body);
    box.append(card);
  }
  const attachment = result.attachment;
  if (!running && !data.cancelling && attachment && (attachment.url || attachment.file_id || attachment.id)) {
    const card = document.createElement("div");
    card.className = "rvc-inline-result-final";
    const title = document.createElement("strong");
    title.textContent = "\u5408\u6210\u97f3\u9891";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = getAttachmentUrl(attachment);
    card.append(title, audio);
    box.append(card);
  }
  if (first && !running && !data.cancelling) {
    if (inputId === "segment_indices") {
      const wrap = document.createElement("div");
      wrap.className = "rvc-inline-config";
      const segments = Array.isArray(session.segments) ? session.segments : [];
      const chosen = new Set((state.pendingInputValues?.segment_indices || []).map((item) => Number(item)));
      segments.forEach((segment, offset) => {
        const index = Number(segment.index ?? offset);
        const label = document.createElement("label");
        label.className = "rvc-inline-config-question";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = chosen.has(index);
        input.addEventListener("change", () => {
          const current = new Set((state.pendingInputValues?.segment_indices || []).map((item) => Number(item)));
          if (input.checked) current.add(index);
          else current.delete(index);
          state.pendingInputValues = { ...(state.pendingInputValues || {}), segment_indices: Array.from(current) };
        });
        label.append(input, document.createTextNode(` \u7247\u6bb5 ${index + 1}${segment.seconds ? ` \u00b7 ${segment.seconds}s` : ""}`));
        wrap.append(label);
      });
      wrap.append(rvcButton("\u786e\u8ba4", () => void resumeVoiceWorkerValues({
        action: "confirm_segments",
        segment_indices: state.pendingInputValues?.segment_indices || [],
        indices: state.pendingInputValues?.segment_indices || [],
      }), true));
      box.append(wrap);
    } else if (inputId === "tts_text") {
      const wrap = document.createElement("div");
      wrap.className = "rvc-inline-config";
      const area = document.createElement("textarea");
      area.rows = 3;
      area.placeholder = "\u8f93\u5165\u6587\u672c";
      area.value = state.pendingInputValues?.tts_text || state.pendingInputValues?.text || "";
      wrap.append(area, rvcButton("\u5408\u6210", () => void resumeVoiceWorkerValues({ action: "synthesize", tts_text: area.value, text: area.value }), true));
      box.append(wrap);
    } else if (inputId === "asset_name" || inputId === "voice_name") {
      const wrap = document.createElement("div");
      wrap.className = "rvc-inline-config";
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "\u7ed9\u97f3\u8272\u8d77\u4e2a\u540d\u5b57";
      input.value = state.pendingInputValues?.[inputId] || "";
      wrap.append(input, rvcButton("\u4fdd\u5b58", () => void resumeVoiceWorkerValues({ action: "save_voice", [inputId]: input.value, name: input.value, voice_name: input.value, asset_name: input.value }), true));
      box.append(wrap);
    } else if (inputId === "asset_id") {
      const wrap = document.createElement("div");
      wrap.className = "rvc-inline-config";
      const select = document.createElement("select");
      select.className = "rvc-inline-config-select";
      (Array.isArray(result.items) ? result.items : []).forEach((assetItem) => {
        const option = document.createElement("option");
        option.value = assetItem.id;
        option.textContent = assetItem.name || assetItem.id;
        select.append(option);
      });
      wrap.append(select, rvcButton("\u4f7f\u7528\u8be5\u97f3\u8272", () => void resumeVoiceWorkerValues({ action: "bind", asset_id: select.value, voice_asset_id: select.value }), true));
      box.append(wrap);
    } else if (inputId === "save_voice") {
      const confirm = document.createElement("div");
      confirm.className = "rvc-inline-confirm";
      const textNode = document.createElement("p");
      textNode.textContent = "\u4fdd\u5b58\u5230\u5f53\u524d\u89d2\u8272\uff1f";
      confirm.append(textNode, rvcButton("\u4fdd\u5b58", () => void resumeVoiceWorkerValues({ action: "save_voice", save_voice: true, voice_name: state.pendingInputValues?.voice_name || data.source?.name || "voice" }), true));
      box.append(confirm);
    } else if (inputId === "voice_material") {
      box.append(rvcButton("\u4e0a\u4f20\u7d20\u6750", () => openInlineVoiceUpload("voice_material"), true));
    } else if (inputId === "audio_attachment") {
      box.append(rvcButton("\u4e0a\u4f20\u97f3\u9891", () => openInlineVoiceUpload("audio_attachment"), true));
    } else {
      const hint = document.createElement("p");
      hint.className = "rvc-hint";
      hint.textContent = "\u5728\u4e0b\u65b9\u8f93\u5165\u6846\u7ee7\u7eed";
      box.append(hint);
    }
  }
  maybePollVoiceSession();
}
function openInlineVoiceUpload(kind = "audio_attachment") {
  const input = $("chat-voice-material");
  if (!input) return;
  const material = kind === "voice_material";
  input.accept = material
    ? "audio/*,video/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.webm,.mp4,.mkv,.mov,.avi"
    : "audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.webm";
  input.multiple = false;
  input.dataset.voiceInline = "true";
  input.dataset.voiceKind = kind;
  input.click();
}
async function resumeVoiceWorkerValues(values) {
  state.pendingInputValues = { ...(state.pendingInputValues || {}), ...(values || {}) };
  resetConfirmationResponseLock();
  try {
    await resumeAgent(null, { forceHttp: true });
    maybePollVoiceSession();
  } catch (error) {
    setText("chat-error", error.message || String(error), true);
  }
}
async function cancelInlineVoice() {
  const data = state.voiceInline;
  if (!data || data.cancelling) return;
  data.generation = (data.generation || 0) + 1;
  clearTimeout(data.pollTimer);
  data.pollTimer = null;
  data.polling = false;
  const shouldResumeAgent = Boolean(state.pendingInput || state.pendingAction);
  const realtimeTurnWasActive = Boolean(state.realtimeTurnId);
  data.cancelling = true;
  state.realtimeBusy = false;
  state.agentRequestPending = false;
  state.realtimeSubmissionPending = false;
  state.realtimeExecutionPending = false;
  state.realtimeTurnId = null;
  renderVoiceInline();
  const sessionId = data.sessionId || data.lastResult?.session_id || data.lastResult?.voice_session_id || data.lastResult?.session?.session_id;
  if (shouldResumeAgent) {
    state.pendingInputValues = { action: "cancel", session_id: sessionId, voice_session_id: sessionId };
    void resumeAgent(null, { forceHttp: true }).catch((error) => setText("chat-error", `停止失败：${error.message || error}`, true));
  } else if (realtimeTurnWasActive) {
    sendRealtime({ type: "generation.cancel" });
  }
  data.lastResult = { ...(data.lastResult || {}), status: "cancelled", session: { ...(data.lastResult?.session || {}), phase: "cancelled", running: false } };
  data.cancelling = false;
  renderVoiceInline();
}
async function resumeVoiceWorkerWithAttachment(fileId) {
  const pending = state.pendingInput;
  const worker = String(pending?.worker || pending?.workflow?.worker || state.voiceInline?.agentWorkflow?.worker || "").trim().toLowerCase();
  if (worker !== "voice_worker") {
    throw new Error("\u58f0\u97f3\u4efb\u52a1\u8fd8\u6ca1\u51c6\u5907\u597d\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5");
  }
  if (state.voiceInline) {
    state.voiceInline.source = state.chatAttachments?.find((item) => String(item.file_id) === String(fileId)) || { file_id: fileId };
    renderVoiceInline();
  }
  const taskType = String(pending?.task_type || state.voiceInline?.agentWorkflow?.task_type || "").trim().toLowerCase();
  const action = taskType === "voice_transcribe" ? "transcribe" : "analyze";
  state.pendingInputValues = {
    ...(state.pendingInputValues || {}),
    attachment_ids: Array.from(new Set([...(state.pendingInputValues?.attachment_ids || []), fileId])),
    attachment_id: fileId,
    audio_file_id: fileId,
    action,
  };
  state.voiceInline = state.voiceInline || {};
  if (state.voiceInline.attachmentResumeSent) return;
  state.voiceInline.attachmentResumeSent = true;
  try {
    await resumeAgent(null);
  } catch (error) {
    state.voiceInline.attachmentResumeSent = false;
    throw error;
  }
}

function isInlineRvcActive() {
  return Boolean(state.rvcInline?.host?.isConnected || state.currentWorkflow?.worker === "rvc_worker");
}

function renderChatTaskWorkspace() {
  const host = $("chat-task-workspace");
  if (!host) return;
  // RVC 的唯一主工作区挂在 Agent assistant 气泡内；顶部总览只保留在右侧摘要。
  if (isInlineRvcActive() || isInlineVoiceActive()) {
    host.replaceChildren();
    host.classList.add("is-hidden");
    return;
  }
  const flow = state.currentWorkflow;
  const selected = selectedAttachments().filter((item) => !["removed", "error"].includes(item.status));
  const taskFiles = [...selected];
  const resultFiles = (flow?.result_attachments || flow?.result_files || flow?.outputs || []).map(normalizeAttachment).filter(Boolean);
  const resourceConfirmation = pendingResourceAction();
  const hasTask = Boolean(flow) || taskFiles.length > 0 || (Boolean(state.pendingAction) && !resourceConfirmation);
  host.classList.toggle("is-hidden", !hasTask);
  if (!hasTask) return;
  const title = $("chat-task-workspace-title");
  const type = $("chat-task-workspace-type");
  const stage = $("chat-task-workspace-stage");
  const progressLabel = $("chat-task-workspace-progress-label");
  const bar = $("chat-task-workspace-progress-bar");
  const message = $("chat-task-workspace-message");
  const progress = state.pendingAction && !flow ? 0 : Math.max(0, Math.min(100, Number(flow?.progress) || (taskFiles.length ? 0 : 100)));
  const current = flow?.nodes?.find((node) => node.id === flow.current_node) || flow?.nodes?.find((node) => node.status === "running");
  if (title) title.textContent = state.pendingAction && !flow ? "需要确认" : (flow?.title || "当前文件");
  if (type) type.textContent = state.pendingAction && !flow ? "确认后继续当前操作" : inferTaskType(flow);
  if (stage) stage.textContent = state.pendingAction && !flow ? "等待确认" : (flow ? (current?.label || flowStatusLabel(flow.status)) : "等待发送");
  if (progressLabel) progressLabel.textContent = `${Math.round(progress)}%`;
  if (bar) bar.style.width = `${progress}%`;
  if (message) {
    const action = state.pendingAction?.action || {};
    const tool = String(action.tool || action.name || "").trim();
    message.textContent = state.pendingAction && !flow
      ? (tool === "manage_resource_install" ? "资源操作需要确认，确认后才会开始执行。" : "请确认后继续当前操作。")
      : (flow?.message || flow?.description || (taskFiles.length ? "将随下一条消息发送" : "按提示继续"));
  }
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
    if (!taskFiles.length && flow) { const empty = document.createElement("p"); empty.className = "chat-task-files-empty"; empty.textContent = "上传文件或继续"; filesHost.append(empty); }
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
  // 任务统一显示在对话中的中央工作卡片。右侧任务栏目前不能承载完整
  // 的多步骤控制状态，因此不再显示“待处理”入口，避免打开后出现空白面板。
  peek.classList.add("is-hidden");
  if (state.chatContextOpen) setChatContextOpen(false);
  const flow = state.currentWorkflow;
  const taskEntry = state.currentTaskStatus || (state.chatTaskEntries instanceof Map ? Array.from(state.chatTaskEntries.values()).at(-1) : null);
  // 没有完整 workflow 时，仍展示结构化 task_status 的摘要，避免右侧“任务”面板空白。
  // 它只作为只读概览；继续/取消等操作仍由中央任务工作区负责。
  const summaryFlow = flow || taskEntry;
  // RVC 的状态全部在 assistant 气泡内，不显示右侧通用任务摘要或顶部工作区.
  if (isInlineRvcActive() || isInlineVoiceActive() || flow?.worker === "rvc_worker" || flow?.worker === "voice_worker") {
    renderChatTaskWorkspace();
    ["chat-task-summary-section", "chat-pending-section", "chat-workflow-section", "chat-context-attachments-section"].forEach((id) => $(id)?.classList.add("is-hidden"));
    peek.classList.add("is-hidden");
    return;
  }
  renderChatTaskWorkspace();
  const unresolved = normalizedWaitingInputs((flow?.waiting_inputs || []).filter((item) => !item.resolved));
  if (state.pendingAction) unresolved.push({ id: "confirmation", kind: "confirmation", label: state.pendingAction.action?.title || "确认操作", description: "确认后继续执行当前任务" });
  const uniqueUnresolved = uniqueByStableId(unresolved, (item) => String(item.id || `${item.kind}:${item.label}`));
  const hasTask = Boolean(summaryFlow && !["completed", "cancelled"].includes(normalizeFlowStatus(summaryFlow.status || summaryFlow.state)));
  const hasAttention = uniqueUnresolved.length > 0 || summaryFlow?.status === "failed";
  const showEntry = hasTask || hasAttention;
  peek.classList.toggle("is-hidden", !showEntry);
  if (!showEntry && state.chatContextOpen) setChatContextOpen(false);
  const count = $("chat-context-peek-count");
  if (count) { count.textContent = String(uniqueUnresolved.length || 1); count.classList.toggle("is-hidden", !hasAttention); }
  const label = $("chat-context-peek-label");
  if (label) label.textContent = hasAttention ? "待处理" : "任务";
  renderTaskSummary(summaryFlow);
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
  const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
  const current = nodes.find((node) => node.id === flow.current_node) || nodes.find((node) => node.status === "running") || nodes.at(-1);
  const title = document.createElement("strong");
  title.textContent = cleanPublicText(flow.title || flow.name, "当前任务");
  const phase = document.createElement("p");
  phase.textContent = cleanPublicText(current?.label || flow.phase || flow.message, flowStatusLabel(flow.status || flow.state));
  const progressValue = Math.max(0, Math.min(100, Number(flow.progress ?? flow.progress_percent) || 0));
  const progressRow = document.createElement("div"); progressRow.className = "chat-context-progress-row";
  const progress = document.createElement("progress"); progress.max = 100; progress.value = progressValue;
  const value = document.createElement("span"); value.textContent = `${Math.round(progressValue)}%`;
  progressRow.append(progress, value); host.append(title, phase, progressRow);
  const taskId = flow.task_id || flow.id;
  if (taskId) { const meta = document.createElement("small"); meta.className = "chat-task-summary-id"; meta.textContent = `任务 ${String(taskId).slice(0, 12)}`; host.append(meta); }
  const worker = $("chat-task-worker"); if (worker) worker.textContent = flow.worker || flow.worker_name || "Agent";
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
function rvcProgressLabel(data, phase) { if (data?.taskId) return `变声 ${Math.round(rvcProgress(data))}%`; if (["processing", "extracting", "normalizing", "separating"].includes(phase)) return `${phase === "separating" ? "分离人声" : phase === "normalizing" ? "整理音频" : "提取音频"} ${Math.round(rvcProgress(data))}%`; return ""; }
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
  state.currentWorkflow = null;
  state.currentTaskStatus = null;
  data.workflowActive = false;
  data.completed = true;
  data.completionPromptShown = true;
  appendMessage("assistant", "变声完成。要重做直接说。", undefined, []);
  setRealtimeBusy(false);
  renderConfirmation();
  renderChatContext();
}
function chatRvcRuntimeReady(status) {
  if (!status || status.installing) return false;
  const missing = Array.isArray(status.missing) ? status.missing : [];
  if (missing.some((item) => ["runtime", "hubert", "rmvpe", "cuda"].includes(String(item).toLowerCase()))) return false;
  if (status.installed === true) return true;
  const components = status.components || {};
  return Boolean(components.runtime?.ready && components.hubert?.ready && components.rmvpe?.ready);
}
function rvcResourceStatusLabel(status) {
  if (!status) return "正在检查运行环境";
  const phaseLabels = { preparing: "准备中", runtime: "安装中", dependencies: "安装中", verify: "验证中", resources: "下载中", done: "已就绪", failed: "下载失败", cancelled: "已停止" };
  const phase = phaseLabels[String(status.phase || "").toLowerCase()] || status.detail || "正在准备运行环境";
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
  const ready = chatRvcRuntimeReady(status);
  const title = document.createElement("strong"); title.textContent = status?.installing ? "下载中" : (status?.error ? "下载失败" : (ready ? "已就绪" : "未就绪"));
  const detail = document.createElement("p"); detail.textContent = status?.installing ? rvcResourceStatusLabel(status) : (status?.error || (ready ? "已就绪" : "运行环境未就绪，请先下载"));
  const progress = document.createElement("progress"); progress.max = 100; progress.value = Math.max(0, Math.min(100, Number(status?.progress_percent) || 0)); progress.className = "rvc-inline-progress";
  const actions = document.createElement("div"); actions.className = "rvc-inline-resource-actions";
  if (status?.installing) { const cancel = rvcButton(status?.cancelling ? "正在停止…" : "停止", () => cancelRvcResourceInstall()); cancel.disabled = Boolean(status?.cancelling); actions.append(cancel); }
  else actions.append(rvcButton(status?.error ? "下载" : "下载", () => startRvcResourceInstall(), true));
  card.append(title, detail, progress, actions); box.append(card);
}
function renderRvcInline() {
  const data = state.rvcInline; const box = data?.host; if (!box) return;
  const session = rvcSessionPayload(data.state); const phase = rvcPhase(data); box.replaceChildren();
  if (!data.rvcResourceStatus) { pollRvcResourceStatus(data); }
  const resourceStatus = data.rvcResourceStatus;
  if (phase !== "awaiting_source" && !resourceStatus?.installing) stopRvcResourcePoll(data);
  const stage = document.createElement("div"); stage.className = "rvc-inline-stage";
  if (phase === "awaiting_source" && resourceStatus && !chatRvcRuntimeReady(resourceStatus)) renderRvcResourceCard(box, resourceStatus);
  const labels = { awaiting_source: "上传音频或视频", uploaded: "开始分离", extracting: "提取音频", normalizing: "整理音频", ready: "分离人声", separating: "分离人声", separated: "选择音色", failed: "处理失败", cancelled: "已停止" };
  const answers = data.configAnswers || {}; const step = Number(data.configStep) || 0;
  const separatedGuide = (!answers.model_id) ? "选择音色" : (answers.index_id === undefined) ? "选择 Index" : (answers.pitch === undefined) ? "设置音高" : (answers.mix_instrumental === undefined) ? "合并伴奏" : "开始变声";
  stage.textContent = data.result ? "变声结果" : (phase === "separated" && !data.taskId ? separatedGuide : (rvcProgressLabel(data, phase) || labels[phase] || session.message || "等待下一步"));
  if (phase !== "awaiting_source" && !data.result) {
    const actionBar = document.createElement("div"); actionBar.className = "rvc-inline-action-bar";
    const stop = rvcButton(data.cancelling ? "正在停止…" : "停止", () => void cancelInlineRvc()); stop.disabled = data.cancelling;
    actionBar.append(stop); box.append(actionBar);
  }
  box.append(stage);
  if (data.source) { const file = document.createElement("div"); file.className = "rvc-inline-file"; const icon = document.createElement("i"); icon.dataset.lucide = attachmentIcon(data.source); const copy = document.createElement("span"); const name = document.createElement("strong"); name.textContent = data.source.name; const meta = document.createElement("small"); meta.textContent = attachmentMeta(data.source) || "会话附件"; copy.append(name, meta); file.append(icon, copy); box.append(file); }
  const progressValue = rvcProgress(data);
  if (["processing", "extracting", "normalizing", "separating"].includes(phase) || data.taskId) { const progress = document.createElement("progress"); progress.max = 100; progress.value = progressValue; progress.className = "rvc-inline-progress"; progress.setAttribute("aria-label", stage.textContent); box.append(progress); }
  const stems = [session.vocals, session.instrumental].filter(Boolean);
  if (stems.length) { const list = document.createElement("div"); list.className = "rvc-inline-stems"; stems.forEach((item, index) => { const card = document.createElement("div"); card.className = "rvc-inline-stem"; const label = document.createElement("strong"); label.textContent = index ? "伴奏" : "人声"; const audio = document.createElement("audio"); audio.controls = true; audio.src = rvcFileUrl(data.sessionId, item.file_id || item.id); card.append(label, audio); list.append(card); }); box.append(list); }
  if (!data.source && !data.result && !data.cancelling) box.append(rvcButton("上传音频或视频", openInlineRvcUpload, true));
  if (data.source && ["uploaded", "awaiting_source"].includes(phase) && !data.sourceConfirmed && !data.cancelling) { const confirm = document.createElement("div"); confirm.className = "rvc-inline-confirm"; const text = document.createElement("p"); text.textContent = "确认后开始分离"; confirm.append(text, rvcButton("开始分离", () => { void runInlineRvc("prepare_and_separate").catch((error) => setText("chat-error", `提交失败：${error?.message || error}`, true)); }, true), rvcButton("换文件", openInlineRvcUpload)); box.append(confirm); }
  if (phase === "separated" && !data.taskId && !data.result && !data.cancelling) renderRvcConversionControls(box);
  if (data.result) { appendRvcCompletionPrompt(data); const resultCard = document.createElement("section"); resultCard.className = "rvc-inline-result rvc-inline-result-final"; const label = document.createElement("strong"); label.textContent = "变声结果"; const audio = document.createElement("audio"); audio.controls = true; audio.src = data.result.output_url || `/api/voice/rvc/output/${encodeURIComponent(data.result.task_id)}`; const link = document.createElement("a"); link.href = audio.src; link.download = `rvc-${data.result.task_id}.wav`; link.textContent = "下载"; resultCard.append(label, audio, link); box.append(resultCard); }
  icons();
}
function renderRvcConversionControls(box) {
  const data = state.rvcInline; if (!data) return;
  const wrap = document.createElement("div"); wrap.className = "rvc-inline-config";
  const question = document.createElement("p"); question.className = "rvc-inline-config-question";
  const answers = data.configAnswers || (data.configAnswers = {}); const step = Number(data.configStep) || 0;
  const modelItems = data.models?.models || []; const indexItems = data.models?.indices || [];
  if (!data.models) { question.textContent = "选择音色"; wrap.append(question); box.append(wrap); void chatRvcApi("/api/voice/rvc/models").then((value) => { if (state.rvcInline) { state.rvcInline.models = value; renderRvcInline(); } }).catch((error) => setText("chat-error", `模型读取失败：${error.message}`, true)); return; }
  if (step === 0 && !answers.model_id) {
    question.textContent = "选择音色"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="">选择音色</option>'; modelItems.forEach((item) => { const value = item.id || item.name || item.file_id; const option = document.createElement("option"); option.value = value; option.textContent = item.name || value; select.append(option); }); const next = rvcButton("下一步", () => { if (!select.value) return setText("chat-error", "请选择音色", true); answers.model_id = select.value; data.configStep = 1; renderRvcInline(); }, true);
    const modelInput = document.createElement("input"); modelInput.type = "file"; modelInput.accept = ".pth,.index"; modelInput.multiple = true; modelInput.className = "visually-hidden-input";
    const importButton = rvcButton("导入", () => modelInput.click(), false); importButton.addEventListener("click", () => modelInput.click());
    const directoryButton = rvcButton("打开文件夹", async () => {
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
    question.textContent = "Index（可跳过）"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="">不使用 Index</option>'; indexItems.forEach((item) => { const value = item.id || item.name || item.file_id; const option = document.createElement("option"); option.value = value; option.textContent = item.name || value; select.append(option); }); const next = rvcButton("下一步", () => { answers.index_id = select.value || null; data.configStep = 2; renderRvcInline(); }, true); wrap.append(question, select, next);
  } else if (step <= 2 && answers.pitch === undefined) {
    question.textContent = "音高"; const input = document.createElement("input"); input.type = "number"; input.min = "-24"; input.max = "24"; input.step = "1"; input.value = "0"; input.className = "rvc-inline-config-input"; const next = rvcButton("下一步", () => { answers.pitch = Number(input.value) || 0; data.configStep = 3; renderRvcInline(); }, true); wrap.append(question, input, next);
  } else if (step <= 3 && answers.mix_instrumental === undefined) {
    question.textContent = "合并伴奏？"; const select = document.createElement("select"); select.className = "rvc-inline-config-select"; select.innerHTML = '<option value="false">不合并</option><option value="true">合并</option>'; const next = rvcButton("下一步", () => { answers.mix_instrumental = select.value === "true"; data.configStep = 4; renderRvcInline(); }, true); wrap.append(question, select, next);
  } else {
    question.textContent = "开始变声"; const summary = document.createElement("div"); summary.className = "rvc-inline-config-summary"; summary.textContent = `音色：${answers.model_id} · Index：${answers.index_id || "不使用"} · 音高：${answers.pitch || 0} · ${answers.mix_instrumental ? "合并伴奏" : "不合并"}`; const confirm = rvcButton("开始变声", () => void runInlineRvc("convert", answers), true); const back = rvcButton("重选", () => { data.configStep = 0; data.configAnswers = { index_id: null, pitch: undefined, mix_instrumental: undefined }; renderRvcInline(); }); wrap.append(question, summary, confirm, back);
  }
  box.append(wrap);
}
function openInlineRvcUpload() { const input = $("chat-voice-material"); if (!input) return; input.accept = "audio/*,video/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.opus,.webm,.mp4,.mkv,.mov,.avi"; input.multiple = false; input.dataset.rvcInline = "true"; input.click(); }
async function resumeRvcWorkerWithAttachment(fileId) {
  const pending = state.pendingInput;
  const worker = String(pending?.worker || pending?.workflow?.worker || state.rvcInline?.agentWorkflow?.worker || "").trim().toLowerCase();
  if (worker !== "rvc_worker") {
    throw new Error("变声任务还没准备好，请稍后再试");
  }
  if (state.rvcInline) {
    state.rvcInline.source = state.chatAttachments?.find((item) => String(item.file_id) === String(fileId)) || { file_id: fileId };
    state.rvcInline.sourceConfirmed = false;
    state.rvcInline.state = { ...(state.rvcInline.state || {}), phase: "uploaded", message: "文件已上传" };
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
    resetConfirmationResponseLock();
    const result = await resumeAgent(null, { forceHttp: true });
    const flow = result?.workflow || result?.flow;
    if (flow && hasFormalRvcHandoff(result, flow)) activateRvcWorkspaceFromAgent(result, flow);
    if (state.rvcInline === data) renderRvcInline();
  } catch (error) {
    data.sessionStatusResumeSent = false;
    data.state = { ...(data.state || {}), phase: "failed", error: error.message || String(error), message: "状态同步失败，请重试" };
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
        data.state = { ...(data.state || {}), phase: "failed", message: "处理超时，请重试" };
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
  if (!data?.sessionId || !inputFileId) throw new Error("还没有可用来变声的人声");
  if (!answers?.model_id) throw new Error("请选择音色");
  const result = await chatRvcApi("/api/voice/rvc/convert", {
    method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
    body: JSON.stringify({ session_id: data.sessionId, input_file_id: inputFileId, model_id: answers.model_id, index_id: answers.index_id || null, speaker_id: 0, pitch: Number(answers.pitch || 0), f0_method: "rmvpe", index_rate: answers.index_id ? 0.75 : 0, protect: 0.33, resample_sr: 0, rms_mix_rate: 1, mix_instrumental: Boolean(answers.mix_instrumental) }),
  });
  data.taskId = result.task_id; data.task = null; data.state = { ...session, phase: "converting", progress: 0, message: "正在变声" };
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
    data.state = { phase: "uploaded", progress: 0, message: "正在重新处理" };
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
      setText("chat-error", "变声任务还没准备好，请稍后再试", true);
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
  resetConfirmationResponseLock();
  data.sourceConfirmed = action !== "prepare_and_separate";
  data.state = { ...(data.state || {}), phase: action === "convert" ? "converting" : "processing", progress: 0, message: "正在开始处理" };
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
    if (!result) throw new Error("没有开始处理，请再点一次");
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
      liveData.state = { ...(liveData.state || {}), phase: "accepted", message: "正在处理" };
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
  const shouldResumeAgent = Boolean(state.pendingInput || state.pendingAction);
  const realtimeTurnWasActive = Boolean(state.realtimeTurnId);
  data.cancelling = true; data.generation += 1; clearTimeout(data.pollTimer); data.pollTimer = null;
  // 先释放浏览器侧回合锁，再等待 session DELETE / Agent resume；否则
  // 长音频取消期间停止键和输入框都会被旧 pending 状态锁死。
  state.realtimeBusy = false;
  state.agentRequestPending = false;
  state.realtimeSubmissionPending = false;
  state.realtimeExecutionPending = false;
  state.realtimeTurnId = null;
  state.pendingAction = null;
  state.pendingInput = null;
  state.pendingInputValues = {};
  setRealtimeBusy(false);
  renderRvcInline();
  const errors = [];
  // RVC 的活动状态由 Agent checkpoint 所有；浏览器只能提交取消动作，
  // 不再直接删除 session/task，避免前端状态与 rvc_worker 分叉。
  try {
    // 先取消共享 RVC session，立即终止 FFmpeg/分离线程；Agent checkpoint
    // 取消作为后台补充确认，不阻塞新消息和输入框恢复。
    if (data.sessionId) await chatRvcApi(`/api/voice/rvc/sessions/${encodeURIComponent(data.sessionId)}`, { method: "DELETE" });
  } catch (error) { errors.push(error); }
  if (shouldResumeAgent) {
    state.pendingInputValues = { action: "cancel" };
    void resumeAgent(null, { forceHttp: true }).catch((error) => setText("chat-error", `停止失败：${error.message || error}`, true));
  } else if (realtimeTurnWasActive) {
    if (!sendRealtime({ type: "generation.cancel" })) errors.push(new Error("实时连接不可用"));
  }
  data.taskId = null;
  data.state = { ...(data.state || {}), phase: "cancelled", status: "cancelled", message: "任务已中止" };
  data.cancelling = false;
  renderRvcInline();
  if (errors.length) setText("chat-error", `任务已停止：${errors[0].message || errors[0]}`, true);
}
