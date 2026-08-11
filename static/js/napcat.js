"use strict";

(() => {
window.PL = window.PL || { modules: {} };
window.PL.modules.napcat = { init, onShow, onHide };

let napcatTimer = null;
let lastFrequency = "0.05";
let napcatConnected = false;

function createConfigSyncState() {
  let dirty = false;
  return {
    markDirty() { dirty = true; },
    markSaved() { dirty = false; },
    shouldApplyRemote(force = false) { return force || !dirty; },
  };
}

const configSync = createConfigSyncState();

function el(id) {
  return document.getElementById(id);
}

function feedback(message, error = false) {
  el("napcat-feedback").textContent = error ? "" : String(message || "");
  el("napcat-error").textContent = error ? String(message || "") : "";
}

function headers(json = false) {
  return json
    ? { "Content-Type": "application/json", "X-YUMENO-Request": "web" }
    : { "X-YUMENO-Request": "web" };
}

function selectedTarget() {
  const targetId = (el("napcat-target-id")?.value || el("napcat-target")?.value || "").trim();
  return { targetType: el("napcat-target-type")?.value || "private", targetId };
}

function selectedReplyMode() {
  return document.querySelector('input[name="napcat-reply-mode"]:checked')?.value || "text";
}

function selectedFrequency() {
  return document.querySelector('input[name="napcat-frequency"]:checked')?.value || "0.05";
}

function updateTargetActions() {
  const { targetType, targetId } = selectedTarget();
  const valid = /^\d+$/.test(targetId) && Number(targetId) > 0;
  const clearMemory = el("napcat-clear-memory");
  if (clearMemory && clearMemory.dataset.busy !== "true") clearMemory.disabled = !valid;
  const observe = el("napcat-authorize-observation");
  if (!observe || observe.dataset.busy === "true") return;
  const group = targetType === "group" && valid;
  const authorized = (window.napcatAuthorizedGroups || []).includes(targetId);
  observe.disabled = !group;
  observe.classList.toggle("button-danger", authorized);
  observe.classList.toggle("button-secondary", !authorized);
  observe.innerHTML = authorized
    ? '<i data-lucide="eye-off"></i><span>撤销主动观察</span>'
    : '<i data-lucide="eye"></i><span>允许主动观察</span>';
  window.lucide?.createIcons();
}

function updatePrefixVisibility() {
  const field = el("napcat-prefix-field");
  if (field) field.hidden = el("napcat-group-trigger")?.value !== "prefix";
}

function syncLegacyModeFields() {
  const mode = selectedReplyMode();
  if (el("napcat-auto-voice")) el("napcat-auto-voice").checked = mode !== "text";
  if (el("napcat-voice-only")) el("napcat-voice-only").checked = mode === "voice_only";
}

function renderRecentMessages(messages) {
  const log = el("napcat-log");
  if (!log) return;
  log.replaceChildren();
  const entries = (Array.isArray(messages) ? messages : []).filter((item) => String(item?.content || "").trim());
  if (!entries.length) {
    log.innerHTML = '<p class="empty-state">暂无已发送文字</p>';
    return;
  }
  entries.forEach((item) => {
    const row = document.createElement("article");
    row.className = "napcat-log-item";
    const meta = document.createElement("div");
    meta.className = "napcat-log-meta";
    const target = item.target_type === "group" ? "群聊" : "私聊";
    const source = item.source === "auto" ? "自动回复" : "手动发送";
    meta.textContent = `${source} · ${target} ${item.target_id || ""}`;
    const content = document.createElement("p");
    content.textContent = item.content;
    row.append(meta, content);
    log.append(row);
  });
}

function render(status) {
  const connected = Boolean(status?.connected);
  napcatConnected = connected;
  window.napcatAuthorizedGroups = (status?.authorized_group_ids || []).map(String);
  el("napcat-dot").classList.toggle("is-live", connected);
  el("napcat-state").textContent = connected ? "已连接" : (status?.enabled ? "等待 NapCat" : "已关闭");
  el("napcat-uin").textContent = status?.bot_uin ? `账号 ${status.bot_uin}` : "未识别账号";
  el("napcat-clients").textContent = String(status?.client_count || 0);
  el("napcat-event-time").textContent = status?.last_event_at ? new Date(status.last_event_at).toLocaleTimeString() : "暂无";
  el("napcat-error-time").textContent = status?.last_error_at ? new Date(status.last_error_at).toLocaleTimeString() : "暂无";
  el("napcat-token-state").textContent = status?.access_token_configured ? "Token 已配置" : "Token 未配置";
  if (el("napcat-token")) {
    el("napcat-token").placeholder = status?.access_token_configured
      ? "已配置；留空表示不修改"
      : "默认不使用 Token";
  }
  if (configSync.shouldApplyRemote()) {
    if (el("napcat-persona")) el("napcat-persona").value = status?.default_persona_id || "";
    if (el("napcat-auto-reply")) el("napcat-auto-reply").checked = Boolean(status?.auto_reply_enabled);
    if (el("napcat-chinese-text")) el("napcat-chinese-text").checked = Boolean(status?.chinese_text);
    if (el("napcat-group-trigger")) el("napcat-group-trigger").value = status?.group_trigger || "at";
    if (el("napcat-prefix")) el("napcat-prefix").value = status?.prefix || "";
    const mode = status?.reply_mode || (status?.voice_only ? "voice_only" : (status?.auto_voice_reply ? "text_voice" : "text"));
    const modeInput = document.querySelector(`input[name="napcat-reply-mode"][value="${mode}"]`);
    if (modeInput) modeInput.checked = true;
    const frequency = String(status?.spontaneous_reply_probability ?? "0.05");
    const frequencyInput = document.querySelector(`input[name="napcat-frequency"][value="${frequency}"]`);
    if (frequencyInput) frequencyInput.checked = true;
    lastFrequency = frequency;
    syncLegacyModeFields();
    updatePrefixVisibility();
  }
  ["napcat-send-text", "napcat-send-record", "napcat-send-both"].forEach((id) => {
    if (el(id)) el(id).disabled = !connected;
  });
  updateTargetActions();
  renderRecentMessages(status?.recent_messages);
}

async function loadStatus() {
  try {
    render(await api(fetch("/api/integrations/onebot11")));
  } catch (error) {
    feedback(error.message, true);
  }
}

async function loadPersonas() {
  try {
    const personas = await api(fetch("/api/personas"));
    const select = el("napcat-persona");
    select.replaceChildren(new Option("请选择角色", ""));
    (Array.isArray(personas) ? personas : []).forEach((persona) => select.append(new Option(persona.name, persona.id)));
    await loadStatus();
  } catch (error) {
    feedback(`角色加载失败：${error.message}`, true);
  }
}

async function saveConfig() {
  const probability = Number(selectedFrequency());
  const token = el("napcat-token")?.value.trim() || "";
  const payload = {
    enabled: true,
    default_persona_id: el("napcat-persona").value,
    auto_reply_enabled: Boolean(el("napcat-auto-reply")?.checked),
    reply_mode: selectedReplyMode(),
    chinese_text: Boolean(el("napcat-chinese-text")?.checked),
    group_trigger: el("napcat-group-trigger")?.value || "at",
    prefix: el("napcat-prefix")?.value || "",
    spontaneous_reply_probability: probability,
  };
  if (token) payload.access_token = token;
  try {
    const result = await api(fetch("/api/integrations/onebot11", {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify(payload),
    }));
    el("napcat-token").value = "";
    configSync.markSaved();
    render(result);
    feedback("消息配置已保存，NapCat 可以重新连接。 ");
  } catch (error) {
    feedback(`保存失败：${error.message}`, true);
  }
}

async function testConnection() {
  feedback("正在测试 OneBot API…");
  try {
    const result = await api(fetch("/api/integrations/onebot11/test", { method: "POST", headers: headers() }));
    feedback(`连接测试成功：${result.nickname || result.user_id || "NapCat 已响应"}`);
    await loadStatus();
  } catch (error) {
    feedback(`连接测试失败：${error.message}`, true);
    await loadStatus();
  }
}

async function loadTargets() {
  if (!napcatConnected) {
    feedback("连接 NapCat 后即可刷新联系人");
    return;
  }
  try {
    const data = await api(fetch("/api/integrations/onebot11/targets"));
    const select = el("napcat-target");
    select.replaceChildren(new Option("手动输入或刷新联系人", ""));
    (data.friends || []).forEach((item) => select.append(new Option(`私聊 ${item.nickname || item.user_id}`, item.user_id)));
    (data.groups || []).forEach((item) => select.append(new Option(`群聊 ${item.group_name || item.group_id}`, item.group_id)));
    feedback(data.available ? "联系人已刷新" : (data.error || "联系人暂不可用"), !data.available);
  } catch (error) {
    feedback(`联系人刷新失败：${error.message}`, true);
  }
}

async function send(kind) {
  const { targetType, targetId } = selectedTarget();
  const text = el("napcat-text").value.trim();
  const recordPath = el("napcat-record-path").value.trim();
  if (!/^\d+$/.test(targetId) || Number(targetId) <= 0) return feedback("请填写有效的目标 ID", true);
  if (kind !== "record" && !text) return feedback("请输入文字", true);
  if (kind !== "text" && !recordPath) return feedback("请输入语音文件路径", true);
  try {
    await api(fetch("/api/integrations/napcat/send", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ target_type: targetType, target_id: targetId, text: kind === "record" ? null : text, record_path: kind === "text" ? null : recordPath }),
    }));
    await loadStatus();
    feedback(kind === "record" ? "语音已发送" : "文字已发送");
  } catch (error) {
    feedback(`发送失败：${error.message}`, true);
  }
}

async function clearWindowMemory() {
  const { targetType, targetId } = selectedTarget();
  if (!/^\d+$/.test(targetId)) return feedback("请先选择有效的目标 ID", true);
  const label = targetType === "group" ? `群聊 ${targetId}` : `私聊 ${targetId}`;
  if (!window.confirm(`确定清空 ${label} 下所有角色的对话记忆吗？`)) return;
  const button = el("napcat-clear-memory");
  button.dataset.busy = "true";
  button.disabled = true;
  try {
    const result = await api(fetch("/api/integrations/onebot11/conversation/clear", { method: "POST", headers: headers(true), body: JSON.stringify({ target_type: targetType, target_id: targetId }) }));
    feedback(`${label} 的对话记忆已清空（${result.persona_count || 0} 个角色线程）`);
  } catch (error) {
    feedback(`清空失败：${error.message}`, true);
  } finally {
    button.dataset.busy = "false";
    updateTargetActions();
  }
}

async function toggleObservation() {
  const { targetType, targetId } = selectedTarget();
  if (targetType !== "group" || !/^\d+$/.test(targetId)) return;
  const authorized = (window.napcatAuthorizedGroups || []).includes(targetId);
  const next = !authorized;
  if (!window.confirm(next ? `允许角色主动观察群聊 ${targetId} 吗？` : `撤销群聊 ${targetId} 的主动观察吗？`)) return;
  const button = el("napcat-authorize-observation");
  button.dataset.busy = "true";
  button.disabled = true;
  try {
    const result = await api(fetch("/api/integrations/onebot11/observation", { method: "PUT", headers: headers(true), body: JSON.stringify({ target_type: "group", target_id: targetId, enabled: next }) }));
    render(result);
    feedback(next ? `已允许群聊 ${targetId} 主动观察` : `已撤销群聊 ${targetId} 主动观察`);
  } catch (error) {
    feedback(`授权操作失败：${error.message}`, true);
  } finally {
    button.dataset.busy = "false";
    updateTargetActions();
  }
}

async function clearRecentMessages() {
  try {
    const result = await api(fetch("/api/integrations/onebot11/recent/clear", { method: "POST", headers: headers() }));
    renderRecentMessages(result.recent_messages);
    feedback("最近发送记录已清空");
  } catch (error) {
    feedback(`清空记录失败：${error.message}`, true);
  }
}

async function clearToken() {
  try {
    render(await api(fetch("/api/integrations/onebot11/token", { method: "DELETE", headers: headers() })));
    el("napcat-token").value = "";
    feedback("Token 已清除");
  } catch (error) {
    feedback(`清除 Token 失败：${error.message}`, true);
  }
}

async function disconnect() {
  if (!window.confirm("关闭 YUMENO 与 NapCat 的连接吗？NapCat 若开启自动重连，可能继续出现连接拒绝记录。")) return;
  const button = el("napcat-disconnect");
  button.disabled = true;
  try {
    render(await api(fetch("/api/integrations/onebot11/disconnect", { method: "POST", headers: headers() })));
    feedback("连接已关闭");
  } catch (error) {
    feedback(`关闭连接失败：${error.message}`, true);
  } finally {
    button.disabled = false;
  }
}

function bindEvents() {
  el("napcat-copy").onclick = () => navigator.clipboard?.writeText(el("napcat-ws-url").value).then(() => feedback("连接地址已复制"));
  el("napcat-save").onclick = saveConfig;
  el("napcat-test").onclick = testConnection;
  el("napcat-refresh").onclick = loadStatus;
  el("napcat-disconnect").onclick = disconnect;
  el("napcat-clear-token").onclick = clearToken;
  el("napcat-refresh-targets").onclick = loadTargets;
  el("napcat-target").onchange = () => { if (el("napcat-target").value) el("napcat-target-id").value = el("napcat-target").value; updateTargetActions(); };
  el("napcat-target-id").oninput = updateTargetActions;
  el("napcat-target-type").onchange = updateTargetActions;
  el("napcat-authorize-observation").onclick = toggleObservation;
  el("napcat-clear-memory").onclick = clearWindowMemory;
  el("napcat-send-text").onclick = () => send("text");
  el("napcat-send-record").onclick = () => send("record");
  el("napcat-send-both").onclick = () => send("both");
  el("napcat-clear-log").onclick = clearRecentMessages;
  ["napcat-persona", "napcat-auto-reply", "napcat-chinese-text"].forEach((id) => {
    el(id)?.addEventListener("change", () => configSync.markDirty());
  });
  el("napcat-prefix")?.addEventListener("input", () => configSync.markDirty());
  el("napcat-token")?.addEventListener("input", () => configSync.markDirty());
  el("napcat-group-trigger").onchange = () => {
    configSync.markDirty();
    updatePrefixVisibility();
  };
  document.querySelectorAll('input[name="napcat-reply-mode"]').forEach((input) => input.addEventListener("change", () => {
    configSync.markDirty();
    syncLegacyModeFields();
  }));
  document.querySelectorAll('input[name="napcat-frequency"]').forEach((input) => input.addEventListener("change", () => {
    const value = input.value;
    if (Number(value) >= 0.3 && !window.confirm(value === "1" ? "总是主动回复会显著增加消息量，确定继续吗？" : "高频主动回复会增加消息量，确定继续吗？")) {
      const previous = document.querySelector(`input[name="napcat-frequency"][value="${lastFrequency}"]`);
      if (previous) previous.checked = true;
      return;
    }
    lastFrequency = value;
    configSync.markDirty();
  }));
}

function init() {
  bindEvents();
  window.lucide?.createIcons();
  loadStatus();
  loadPersonas();
}

function onShow() {
  if (!napcatTimer) napcatTimer = setInterval(loadStatus, 2500);
  loadStatus();
  loadTargets();
}

function onHide() {
  if (napcatTimer) {
    clearInterval(napcatTimer);
    napcatTimer = null;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createConfigSyncState };
}
})();
