"use strict";
window.PL = window.PL || { modules: {} };

const knowledgeState = { personas: [], selectedId: "", documents: [], report: null, loading: false, uploading: false };
let knowledgePollTimer = 0;
const knowledgeRoot = () => document.querySelector("#knowledge-dashboard-root");
const knowledgeApi = async (url, options = {}) => {
  const response = await fetch(url, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.message || `请求失败（${response.status}）`);
  return payload;
};
const text = (value, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const failedStatus = (status) => ["failed", "error", "index_failed"].includes(String(status));
const processingStatus = (status) => ["pending", "converting", "preview_ready", "indexing", "processing"].includes(String(status));
const statusLabel = (status) => ({ pending: "等待处理", converting: "解析中", preview_ready: "待确认", indexing: "建立索引", indexed: "已就绪", index_failed: "索引失败", failed: "处理失败", error: "处理失败" }[status] || text(status, "状态未知"));
function card(title, value, detail, tone = "") {
  const node = document.createElement("article"); node.className = `knowledge-stat-card ${tone}`;
  const label = document.createElement("span"); label.className = "card-eyebrow"; label.textContent = title;
  const strong = document.createElement("strong"); strong.textContent = value;
  const small = document.createElement("small"); small.textContent = detail;
  node.append(label, strong, small); return node;
}
function button(label, action, primary = false) { const b = document.createElement("button"); b.type = "button"; b.className = `button ${primary ? "button-primary" : "button-secondary"}`; b.textContent = label; b.addEventListener("click", action); return b; }
function messageNode(message, error = false) { const p = document.createElement("p"); p.className = `inline-status ${error ? "is-error" : ""}`; p.textContent = message; return p; }
function selectedPersona() { return knowledgeState.personas.find((p) => p.id === knowledgeState.selectedId) || null; }
function startKnowledgePolling() { stopKnowledgePolling(); knowledgePollTimer = window.setInterval(() => { if (knowledgeState.documents.some((doc) => processingStatus(doc.status))) void loadKnowledge(true); }, 5000); }
function stopKnowledgePolling() { if (knowledgePollTimer) window.clearInterval(knowledgePollTimer); knowledgePollTimer = 0; }
async function loadKnowledge(silent = false) {
  const root = knowledgeRoot(); if (!root) return;
  knowledgeState.loading = true;
  if (!silent) root.replaceChildren(messageNode("正在读取当前角色知识状态…"));
  try {
    knowledgeState.personas = await knowledgeApi("/api/personas");
    if (!knowledgeState.selectedId || !knowledgeState.personas.some((p) => p.id === knowledgeState.selectedId)) knowledgeState.selectedId = window.PL.state?.activePersona?.id || knowledgeState.personas[0]?.id || "";
    const persona = selectedPersona();
    knowledgeState.documents = persona ? await knowledgeApi(`/api/personas/${encodeURIComponent(persona.id)}/documents`) : [];
    knowledgeState.report = persona?.knowledge_space_id ? await knowledgeApi(`/api/knowledge-spaces/${encodeURIComponent(persona.knowledge_space_id)}/documents/report`) : null;
    renderKnowledge(); startKnowledgePolling();
  } catch (error) { if (!silent) root.replaceChildren(messageNode(`知识状态读取失败：${error.message || error}`, true)); }
  finally { knowledgeState.loading = false; }
}
async function uploadKnowledgeFiles(files, statusNode) {
  const persona = selectedPersona();
  if (!persona) { statusNode.replaceWith(messageNode("请先选择角色", true)); return; }
  if (!persona.knowledge_space_id) { statusNode.replaceWith(messageNode("当前角色还没有可用的知识空间", true)); return; }
  const selected = [...files].filter(Boolean); if (!selected.length) return;
  knowledgeState.uploading = true; statusNode.textContent = `正在上传 ${selected.length} 个文件…`;
  try {
    const form = new FormData(); selected.forEach((file) => form.append("files", file));
    const jobs = await knowledgeApi(`/api/knowledge-spaces/${encodeURIComponent(persona.knowledge_space_id)}/documents/upload`, { method: "POST", body: form });
    await Promise.all((Array.isArray(jobs) ? jobs : []).map((job) => knowledgeApi(`/api/documents/${encodeURIComponent(job.id)}/confirm`, { method: "POST" })));
    statusNode.textContent = "资料已提交，解析和索引将在后台继续"; await loadKnowledge(true);
  } catch (error) { statusNode.textContent = `上传失败：${error.message || error}`; statusNode.classList.add("is-error"); }
  finally { knowledgeState.uploading = false; }
}
async function retryKnowledgeDocument(doc, statusNode) {
  try { statusNode.textContent = "正在重新提交…"; await knowledgeApi(`/api/documents/${encodeURIComponent(doc.id)}/retry-index`, { method: "POST" }); await loadKnowledge(true); }
  catch (error) { statusNode.textContent = `重试失败：${error.message || error}`; statusNode.classList.add("is-error"); }
}
async function deleteKnowledgeDocument(doc, statusNode) {
  const name = text(doc.filename || doc.name || doc.original_filename, "这份资料");
  if (!window.confirm(`确定删除“${name}”？这会同时移除其知识库索引。`)) return;
  try { statusNode.textContent = "正在删除…"; await knowledgeApi(`/api/documents/${encodeURIComponent(doc.id)}`, { method: "DELETE" }); await loadKnowledge(true); }
  catch (error) { statusNode.textContent = `删除失败：${error.message || error}`; statusNode.classList.add("is-error"); }
}
function renderKnowledge() {
  const root = knowledgeRoot(); if (!root) return;
  const persona = selectedPersona(); const report = knowledgeState.report || {};
  const indexed = Number(report.indexed_count ?? report.indexed ?? knowledgeState.documents.filter((d) => ["indexed", "completed", "ready"].includes(d.status)).length) || 0;
  const processing = knowledgeState.documents.filter((d) => processingStatus(d.status)).length;
  const failed = knowledgeState.documents.filter((d) => failedStatus(d.status)).length;
  const shell = document.createElement("div"); shell.className = "knowledge-dashboard";
  const head = document.createElement("div"); head.className = "knowledge-dashboard-head";
  const title = document.createElement("div"); const h = document.createElement("h2"); h.textContent = "当前角色知识"; const p = document.createElement("p"); p.textContent = persona ? `${persona.name} · 知识空间 ${text(persona.knowledge_space_id, "未绑定")}` : "还没有角色，先创建一个角色再导入资料。"; title.append(h, p);
  const select = document.createElement("select"); select.className = "knowledge-persona-select"; select.setAttribute("aria-label", "选择角色"); const empty = document.createElement("option"); empty.value = ""; empty.textContent = "选择角色"; select.append(empty); knowledgeState.personas.forEach((item) => { const o = document.createElement("option"); o.value = item.id; o.textContent = item.name; o.selected = item.id === knowledgeState.selectedId; select.append(o); }); select.addEventListener("change", () => { knowledgeState.selectedId = select.value; void loadKnowledge(); }); head.append(title, select); shell.append(head);
  const stats = document.createElement("div"); stats.className = "knowledge-stats-grid"; stats.append(card("资料", String(knowledgeState.documents.length), "当前角色已登记的文档"), card("已索引", String(indexed), "可参与检索", indexed === knowledgeState.documents.length ? "good" : ""), card("处理中", String(processing), "后台任务", processing ? "warn" : ""), card("需处理", String(failed), failed ? "bad" : "good", failed ? "请查看失败原因" : "当前无失败任务")); shell.append(stats);
  const actionRow = document.createElement("div"); actionRow.className = "knowledge-action-row";
  const fileInput = document.createElement("input"); fileInput.type = "file"; fileInput.multiple = true; fileInput.accept = ".txt,.md,.pdf,.docx,.html,.csv,.json"; fileInput.className = "is-hidden";
  const uploadStatus = messageNode(persona ? "支持 TXT、Markdown、PDF、DOCX、HTML、CSV 和 JSON；上传后自动解析并建立索引。" : "选择角色后才能上传资料。");
  fileInput.addEventListener("change", () => { void uploadKnowledgeFiles(fileInput.files || [], uploadStatus); fileInput.value = ""; });
  actionRow.append(fileInput, persona ? button("上传资料", () => fileInput.click(), true) : button("创建第一个角色", () => { window.location.hash = "#role-create"; }, true), button("刷新状态", () => void loadKnowledge())); shell.append(actionRow, uploadStatus);
  const list = document.createElement("section"); list.className = "section-card knowledge-document-card"; const lh = document.createElement("h3"); lh.textContent = "资料与处理状态"; list.append(lh);
  if (!knowledgeState.documents.length) list.append(messageNode(persona ? "当前角色还没有资料。上传后，解析和索引任务会在这里显示真实状态。" : "选择或创建角色后，这里会显示资料处理状态。"));
  else { const ul = document.createElement("ul"); ul.className = "knowledge-document-list"; knowledgeState.documents.forEach((doc) => { const li = document.createElement("li"); const left = document.createElement("div"); const name = document.createElement("strong"); name.textContent = text(doc.filename || doc.name || doc.original_filename); const meta = document.createElement("small"); meta.textContent = [statusLabel(doc.status), doc.error_message || doc.error || "", doc.updated_at ? `更新于 ${doc.updated_at}` : ""].filter(Boolean).join(" · "); left.append(name, meta); const actions = document.createElement("div"); actions.className = "knowledge-document-actions"; const status = document.createElement("span"); status.className = `status-pill ${failedStatus(doc.status) ? "status-error" : ""}`; status.textContent = statusLabel(doc.status); actions.append(status); if (failedStatus(doc.status)) actions.append(button("重试", () => void retryKnowledgeDocument(doc, meta))); actions.append(button("删除", () => void deleteKnowledgeDocument(doc, meta))); li.append(left, actions); ul.append(li); }); list.append(ul); } shell.append(list);
  const retrieval = document.createElement("section"); retrieval.className = "section-card knowledge-retrieval-card"; const rh = document.createElement("h3"); rh.textContent = "检索测试"; const form = document.createElement("form"); form.className = "knowledge-retrieval-form"; const input = document.createElement("textarea"); input.rows = 2; input.placeholder = persona ? "输入一个问题，查看角色知识库能否给出依据" : "请先选择角色"; input.disabled = !persona; const result = document.createElement("div"); result.className = "knowledge-retrieval-result"; const submit = button("开始检索", async () => { if (!persona || !input.value.trim()) return; submit.disabled = true; result.replaceChildren(messageNode("正在检索…")); try { const data = await knowledgeApi(`/api/personas/${encodeURIComponent(persona.id)}/rag/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: input.value.trim() }) }); const answer = document.createElement("p"); answer.textContent = data.answer || "没有返回答案"; const evidence = document.createElement("small"); evidence.textContent = `依据 ${Array.isArray(data.evidence) ? data.evidence.length : 0} 条 · 置信度 ${text(data.confidence)}`; result.replaceChildren(answer, evidence); } catch (error) { result.replaceChildren(messageNode(`检索失败：${error.message || error}`, true)); } finally { submit.disabled = false; } }, true); form.append(input, submit); retrieval.append(rh, form, result); shell.append(retrieval); root.replaceChildren(shell);
}
async function initKnowledgeDashboard() { await loadKnowledge(); }
async function showKnowledgeDashboard() { await loadKnowledge(); }
function hideKnowledgeDashboard() { stopKnowledgePolling(); }
window.PL.modules.knowledgeDashboard = { init: initKnowledgeDashboard, onShow: showKnowledgeDashboard, onHide: hideKnowledgeDashboard };
