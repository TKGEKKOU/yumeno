"use strict";
window.PL = window.PL || { modules: {} };
window.PL.modules.plugins = { init: initPlugins };
let editingSkillName = null;
const pluginState = { skills: [], servers: [], tools: [] };
const extensionCatalogState = { items: [], selected: null };

function pluginViewNames() {
  return ["overview", "skills", "mcp", "tools", "catalog"];
}

function derivePluginOverview(state) {
  const skills = Array.isArray(state?.skills) ? state.skills : [];
  const servers = Array.isArray(state?.servers) ? state.servers : [];
  const tools = Array.isArray(state?.tools) ? state.tools : [];
  const enabledSkills = skills.filter((skill) => skill.enabled).length;
  const mcpOnline = servers.filter((server) => server.enabled && server.status?.status === "connected").length;
  const mcpIssues = servers.filter((server) => server.status?.status === "error" || (server.enabled && server.status?.status !== "connected")).length;
  const untrustedSkills = skills.filter((skill) => !skill.builtin && !skill.trusted).length;
  return {
    enabledSkills,
    mcpOnline,
    mcpIssues,
    toolCount: tools.length,
    attentionCount: mcpIssues + untrustedSkills,
  };
}

function currentPluginTab() {
  return document.querySelector(".plugin-tab.is-active")?.dataset.pluginTab || "overview";
}

function setPluginTab(tab) {
  if (!pluginViewNames().includes(tab)) return;
  document.querySelectorAll("[data-plugin-tab]").forEach((node) =>
    node.classList.toggle("is-active", node.dataset.pluginTab === tab)
  );
  document.querySelectorAll("[data-plugin-panel]").forEach((node) => {
    node.hidden = node.dataset.pluginPanel !== tab;
  });
  if (tab === "tools") renderMCPTools();
  if (tab === "catalog") renderExtensionCatalog();
}

function renderPluginOverview() {
  const summary = derivePluginOverview(pluginState);
  const set = (id, value) => { const node = $(id); if (node) node.textContent = value; };
  set("plugins-stat-skills", summary.enabledSkills);
  set("plugins-stat-skills-note", `共 ${pluginState.skills.length} 个技能`);
  set("plugins-stat-mcp", `${summary.mcpOnline} / ${summary.mcpIssues}`);
  set("plugins-stat-mcp-note", `${pluginState.servers.length} 台已配置`);
  set("plugins-stat-tools", summary.toolCount);
  set("plugins-stat-attention", summary.attentionCount);
  set("plugin-attention-count", summary.attentionCount);
  set("mcp-count", `${pluginState.servers.length} 台服务器`);
  set("mcp-count-detail", `${pluginState.servers.length} 台服务器`);
  set("mcp-tool-count", `${pluginState.tools.length} 个工具`);
  const overall = $("plugins-overall-status");
  if (overall) {
    overall.textContent = summary.attentionCount ? `${summary.attentionCount} 项待处理` : "运行正常";
    overall.className = `status-pill ${summary.attentionCount ? "status-pill-warn" : "status-pill-ok"}`;
  }
  renderOverviewHealth();
  renderAttention(summary);
}

function renderOverviewHealth() {
  const list = $("plugin-overview-health");
  if (!list) return;
  list.innerHTML = "";
  if (!pluginState.servers.length) {
    list.append(empty("还没有 MCP 服务。前往 MCP 服务视图添加一个连接。"));
    return;
  }
  pluginState.servers.forEach((server) => {
    const row = document.createElement("div");
    row.className = "plugin-health-row";
    const icon = document.createElement("span");
    icon.className = `plugin-health-dot ${server.status?.status === "connected" ? "is-ok" : server.status?.status === "error" ? "is-error" : "is-muted"}`;
    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = server.name;
    const meta = document.createElement("span");
    meta.textContent = `${MCP_TRANSPORT_LABELS[server.transport] || server.transport} · ${server.status?.tool_count || 0} 个工具`;
    body.append(title, meta);
    const status = document.createElement("span");
    status.className = `status-pill ${mcpStatusPillClass(server.status?.status)}`;
    status.textContent = mcpStatusText(server.status || {});
    row.append(icon, body, status);
    list.append(row);
  });
}

function renderAttention(summary) {
  const panel = $("plugin-attention-panel");
  const list = $("plugin-attention-list");
  if (!panel || !list) return;
  list.innerHTML = "";
  const items = [];
  pluginState.servers.filter((server) => server.status?.status === "error").forEach((server) => items.push({ label: `${server.name} 连接失败`, detail: server.status.error || "请在 MCP 服务视图测试连接。", tab: "mcp" }));
  pluginState.skills.filter((skill) => !skill.builtin && !skill.trusted).forEach((skill) => items.push({ label: `${skill.name} 尚未信任`, detail: "信任后才能把指令和工具交给角色。", tab: "skills" }));
  panel.hidden = !items.length;
  items.forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "plugin-attention-item";
    row.innerHTML = `<span><strong></strong><small></small></span><i data-lucide="arrow-up-right"></i>`;
    row.querySelector("strong").textContent = item.label;
    row.querySelector("small").textContent = item.detail;
    row.addEventListener("click", () => setPluginTab(item.tab));
    list.append(row);
  });
  set("plugin-attention-count", summary.attentionCount);
  icons();
}

function set(id, value) { const node = $(id); if (node) node.textContent = value; }

async function initPlugins() {
  window.clearInterval(window.__mcpPollTimer);
  document.querySelectorAll("[data-plugin-tab]").forEach((button) => button.addEventListener("click", () => setPluginTab(button.dataset.pluginTab)));
  document.querySelectorAll("[data-open-plugin-drawer]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.openPluginDrawer === "skill") resetSkillForm();
    openPluginDrawer(button.dataset.openPluginDrawer);
  }));
  $("plugins-refresh")?.addEventListener("click", () => refreshPluginData());
  $("plugin-drawer-close")?.addEventListener("click", closePluginDrawer);
  $("plugin-drawer")?.addEventListener("click", (event) => { if (event.target === event.currentTarget) closePluginDrawer(); });
  $("mcp-tool-filter")?.addEventListener("input", () => renderMCPTools());
  $("extension-catalog-refresh")?.addEventListener("click", () => loadExtensionCatalog(true));
  $("extension-catalog-search")?.addEventListener("input", () => renderExtensionCatalog());
  $("extension-catalog-kind")?.addEventListener("change", () => loadExtensionCatalog(false));
  $("extension-catalog-close")?.addEventListener("click", closeExtensionDetails);
  $("extension-catalog-drawer")?.addEventListener("click", (event) => { if (event.target === event.currentTarget) closeExtensionDetails(); });
  $("extension-catalog-install")?.addEventListener("click", installSelectedExtension);
  await renderSkillList();
  renderToolOptions(await loadSkillTools());
  $("skill-create-submit").addEventListener("click", createSkill);
  $("skill-upload-btn").addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    $("skill-upload-input").click();
  });
  $("skill-upload-input").addEventListener("change", (event) =>
    uploadSkillPackage(event.target.files?.[0])
  );
  bindMCPTransport();
  await renderMCPServers();
  await renderMCPTools();
  await loadExtensionCatalog(false);
  $("mcp-create-submit").addEventListener("click", createMCPServer);
  window.__mcpPollTimer = window.setInterval(() => {
    refreshPluginData().catch(() => {});
  }, 30000);
  setPluginTab("overview");
}

async function refreshPluginData() {
  await Promise.all([renderSkillList(), renderMCPServers(), renderMCPTools()]);
  renderPluginOverview();
  if (currentPluginTab() === "catalog") await loadExtensionCatalog(false);
}

function openPluginDrawer(type) {
  const drawer = $("plugin-drawer");
  const skill = $("skill-create-form");
  const mcp = $("mcp-create-form");
  if (!drawer || !skill || !mcp) return;
  skill.hidden = type !== "skill";
  mcp.hidden = type !== "mcp";
  $("plugin-drawer-title").textContent = type === "skill" ? (editingSkillName ? `编辑技能：${editingSkillName}` : "新增技能") : "新增 MCP 服务";
  $("plugin-drawer-error").textContent = "";
  if (!drawer.open) drawer.showModal();
  icons();
}

function closePluginDrawer() {
  const drawer = $("plugin-drawer");
  if (drawer?.open) drawer.close();
}


async function renderSkillList() {
  const list = $("skill-list");
  list.innerHTML = "";
  let skills = [];
  try {
    skills = await api(fetch("/api/skills"));
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
    return;
  }
  pluginState.skills = skills;
  renderPluginOverview();
  $("skills-count").textContent = `${skills.length} 个技能`;
  if (!skills.length) {
    list.append(empty("还没有技能。在上方新增一个提示词技能，或把 JSON 放入 data/skills/。"));
    return;
  }
  const groups = new Map();
  for (const skill of skills) {
    const category = (skill.metadata && skill.metadata.category) || "其他";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(skill);
  }
  for (const [category, items] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh"))) {
    const heading = document.createElement("div");
    heading.className = "section-heading";
    const label = document.createElement("b");
    label.textContent = category;
    heading.append(label);
    list.append(heading);
    for (const skill of items.sort((a, b) => a.name.localeCompare(b.name))) {
      list.append(renderSkillCard(skill));
    }
  }
}

function renderSkillCard(skill) {
  const card = document.createElement("div");
  card.className = "plugin-card";
  const head = document.createElement("div");
  head.className = "plugin-card-head";
  const title = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = skill.name;
  const meta = document.createElement("span");
  meta.textContent = `${skill.builtin ? "内置" : "自定义"} · ${skill.format === "skillmd" ? "标准包" : "JSON"}`;
  title.append(name, meta);
  head.append(title);
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "toggle-switch";
  toggle.classList.toggle("is-on", skill.enabled);
  toggle.setAttribute("aria-label", `启用 ${skill.name}`);
  toggle.title = skill.enabled ? "已启用，点击停用" : "已停用，点击启用";
  toggle.addEventListener("click", () => toggleSkill(skill.name, !skill.enabled));
  head.append(toggle);
  if (!skill.builtin) {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "button button-secondary";
    edit.textContent = "编辑";
    edit.addEventListener("click", () => editSkill(skill));
    head.append(edit);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "button button-danger";
    remove.textContent = "删除";
    remove.addEventListener("click", () => deleteSkill(skill.name));
    head.append(remove);
  }
  if (!skill.enabled) {
    const disabled = document.createElement("span");
    disabled.className = "status-pill status-pill-warn";
    disabled.textContent = "已停用";
    card.append(disabled);
  }
  if (!skill.builtin && !skill.trusted) {
    const trust = document.createElement("button");
    trust.type = "button";
    trust.className = "button button-secondary";
    trust.textContent = "信任此技能";
    trust.title = "确认后才允许把该技能的指令和工具交给角色";
    trust.addEventListener("click", () => updateSkillState(skill.name, { trusted: true }));
    head.append(trust);
  }
  if (skill.scripts && skill.scripts.length) {
    const scripts = document.createElement("label");
    scripts.className = "toggle-field";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(skill.scripts_enabled);
    input.disabled = !skill.trusted;
    input.addEventListener("change", () =>
      updateSkillState(skill.name, { scripts_enabled: input.checked })
    );
    const text = document.createElement("span");
    text.textContent = "允许脚本";
    scripts.append(input, text);
    head.append(scripts);
  }
  card.append(head);
  if (skill.description) {
    const description = document.createElement("p");
    description.className = "plugin-description";
    description.textContent = skill.description;
    card.append(description);
  }
  if (skill.instructions) {
    const details = document.createElement("details");
    details.className = "plugin-config";
    const summary = document.createElement("summary");
    summary.textContent = "提示词";
    details.append(summary);
    const prompt = document.createElement("pre");
    prompt.className = "skill-prompt";
    prompt.textContent = skill.instructions;
    details.append(prompt);
    card.append(details);
  }
  if (skill.tool_names && skill.tool_names.length) {
    const tools = document.createElement("div");
    tools.className = "skill-tools";
    for (const tool of skill.tool_names) {
      const tag = document.createElement("span");
      tag.className = "skill-tool";
      tag.textContent = tool;
      tools.append(tag);
    }
    card.append(tools);
  }
  return card;
}

async function loadSkillTools() {
  try {
    return await api(fetch("/api/skills/tools"));
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
    return [];
  }
}

function renderToolOptions(tools) {
  const container = $("skill-tools");
  container.innerHTML = "";
  if (!tools.length) {
    const note = document.createElement("p");
    note.className = "inline-status";
    note.textContent = "没有可附加的工具。";
    container.append(note);
    return;
  }
  for (const tool of tools) {
    const label = document.createElement("label");
    label.className = "toggle-field skill-tool-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tool.name;
    const span = document.createElement("span");
    span.textContent = tool.requires_confirmation ? `${tool.name}（需确认）` : tool.name;
    label.append(checkbox, span);
    container.append(label);
  }
}

async function createSkill() {
  const name = $("skill-name").value.trim();
  const instructions = $("skill-instructions").value.trim();
  const toolNames = Array.from($("skill-tools").querySelectorAll("input:checked")).map((input) => input.value);
  if (!name || !instructions) {
    setSkillStatus("名称与提示词不能为空。", true);
    return;
  }
  try {
    if (editingSkillName) {
      await api(fetch(`/api/skills/${encodeURIComponent(editingSkillName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions,
          description: $("skill-description").value.trim(),
          prompt_hint: $("skill-prompt-hint").value.trim(),
          tool_names: toolNames,
        }),
      }));
      setSkillStatus("技能已保存修改。", false);
    } else {
      await api(fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          instructions,
          description: $("skill-description").value.trim(),
          prompt_hint: $("skill-prompt-hint").value.trim(),
          tool_names: toolNames,
        }),
      }));
      setSkillStatus("技能已保存。", false);
    }
    resetSkillForm();
    closePluginDrawer();
    renderToolOptions(await loadSkillTools());
    await renderSkillList();
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
  }
}

async function toggleSkill(name, enabled) {
  try {
    await api(fetch(`/api/skills/${encodeURIComponent(name)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }));
    await renderSkillList();
    setSkillStatus(enabled ? "已启用" : "已停用", false);
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
  }
}

async function updateSkillState(name, state) {
  try {
    await api(fetch(`/api/skills/${encodeURIComponent(name)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }));
    await renderSkillList();
    setSkillStatus("技能安全状态已更新。", false);
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
  }
}

function editSkill(skill) {
  editingSkillName = skill.name;
  $("skill-name").value = skill.name;
  $("skill-name").readOnly = true;
  $("skill-description").value = skill.description || "";
  $("skill-instructions").value = skill.instructions || "";
  $("skill-prompt-hint").value = skill.prompt_hint || "";
  $("skill-tools").querySelectorAll("input").forEach((input) => {
    input.checked = skill.tool_names.includes(input.value);
  });
  const title = $("skill-create-title");
  if (title) title.textContent = `编辑技能：${skill.name}`;
  $("skill-create-submit").textContent = "保存修改";
  openPluginDrawer("skill");
}

function resetSkillForm() {
  editingSkillName = null;
  $("skill-name").value = "";
  $("skill-name").readOnly = false;
  $("skill-description").value = "";
  $("skill-instructions").value = "";
  $("skill-prompt-hint").value = "";
  $("skill-tools").querySelectorAll("input").forEach((input) => { input.checked = false; });
  const title = $("skill-create-title");
  if (title) title.textContent = "新增技能";
  $("skill-create-submit").textContent = "保存技能";
}

async function deleteSkill(name) {
  if (!window.confirm(`删除技能 ${name}？`)) return;
  try {
    await api(fetch(`/api/skills/${encodeURIComponent(name)}`, { method: "DELETE" }));
    await renderSkillList();
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
  }
}

function setSkillStatus(message, isError) {
  [$("skills-status"), $("skills-drawer-status")].filter(Boolean).forEach((node) => {
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(isError));
  });
}

async function uploadSkillPackage(file) {
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  setSkillStatus("正在上传…", false);
  try {
    const result = await api(fetch("/api/skills/upload", { method: "POST", body: form }));
    const parts = [];
    if (result.installed?.length) parts.push(`已安装：${result.installed.join("、")}`);
    if (result.skipped?.length) {
      parts.push(`跳过：${result.skipped.map((item) => `${item.name}（${item.reason}）`).join("；")}`);
    }
    setSkillStatus(parts.join("。") || "上传完成，没有可安装的技能。", Boolean(result.skipped?.length));
    await renderSkillList();
  } catch (reason) {
    setSkillStatus(reason.message || reason, true);
  }
  $("skill-upload-input").value = "";
}

/* ---- MCP 服务器面板 ---- */

const MCP_TRANSPORT_LABELS = {
  stdio: "本地进程",
  streamable_http: "远程 HTTP",
  sse: "远程 SSE",
};

function bindMCPTransport() {
  document.querySelectorAll('input[name="mcp-transport"]').forEach((radio) => {
    radio.addEventListener("change", updateMCPTransportFields);
  });
}

function updateMCPTransportFields() {
  const value = document.querySelector('input[name="mcp-transport"]:checked')?.value || "stdio";
  $("mcp-stdio-fields").hidden = value !== "stdio";
  $("mcp-remote-fields").hidden = value === "stdio";
}

async function renderMCPServers() {
  const list = $("mcp-server-list");
  list.innerHTML = "";
  let servers = [];
  try {
    servers = await api(fetch("/api/mcp/servers"));
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
    return;
  }
  pluginState.servers = servers;
  renderPluginOverview();
  $("mcp-count").textContent = `${servers.length} 台服务器`;
  $("mcp-count-detail").textContent = `${servers.length} 台服务器`;
  if (!servers.length) {
    list.append(empty("还没有配置 MCP 服务器。在上方新增一个服务器，重启应用后其工具会自动注册。"));
    return;
  }
  for (const server of servers) {
    list.append(renderMCPServerCard(server));
  }
}

function renderMCPServerCard(server) {
  const card = document.createElement("div");
  card.className = "plugin-card";
  const head = document.createElement("div");
  head.className = "plugin-card-head";
  const title = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = server.name;
  const meta = document.createElement("span");
  meta.textContent = `${MCP_TRANSPORT_LABELS[server.transport] || server.transport} · ${server.enabled ? "已启用" : "已停用"}`;
  title.append(name, meta);
  const pill = document.createElement("span");
  pill.className = `status-pill ${mcpStatusPillClass(server.status.status)}`;
  pill.textContent = mcpStatusText(server.status);
  const toggle = document.createElement("label");
  toggle.className = "toggle-field";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(server.enabled);
  checkbox.addEventListener("change", () =>
    setMCPServerEnabled(server.name, checkbox.checked)
  );
  const toggleText = document.createElement("span");
  toggleText.textContent = server.enabled ? "启用" : "停用";
  toggle.append(checkbox, toggleText);
  head.append(title, pill, toggle);
  card.append(head);
  if (server.description) {
    const description = document.createElement("p");
    description.className = "plugin-description";
    description.textContent = server.description;
    card.append(description);
  }
  if (server.status.status === "error" && server.status.error) {
    const error = document.createElement("p");
    error.className = "inline-error";
    error.textContent = `连接失败：${server.status.error}`;
    card.append(error);
  }
  const grantsRow = document.createElement("div");
  grantsRow.className = "mcp-grants-row";
  const grantsLabel = document.createElement("span");
  grantsLabel.textContent = "授权角色";
  const grantsInput = document.createElement("input");
  grantsInput.className = "mcp-grants-input";
  grantsInput.value = (server.allowed_persona_ids || []).join(",");
  grantsInput.placeholder = "*（所有角色）或角色ID，逗号分隔";
  const grantsSave = document.createElement("button");
  grantsSave.type = "button";
  grantsSave.className = "button button-secondary";
  grantsSave.textContent = "保存";
  grantsSave.addEventListener("click", () => saveMCPGrants(server.name, grantsInput.value));
  grantsRow.append(grantsLabel, grantsInput, grantsSave);
  card.append(grantsRow);
  const actions = document.createElement("div");
  actions.className = "asr-actions";
  const test = document.createElement("button");
  test.type = "button";
  test.className = "button button-secondary";
  test.textContent = "测试连接";
  test.addEventListener("click", () => testMCPServer(server.name));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "button button-danger";
  remove.textContent = "删除";
  remove.addEventListener("click", () => deleteMCPServer(server.name));
  actions.append(test, remove);
  card.append(actions);
  return card;
}

async function saveMCPGrants(name, value) {
  const ids = value.split(",").map((item) => item.trim()).filter(Boolean);
  try {
    await api(fetch(`/api/mcp/servers/${encodeURIComponent(name)}/grants`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify({ allowed_persona_ids: ids }),
    }));
    await renderMCPServers();
    setMCPStatus(`已更新 ${name} 的授权`);
  } catch (reason) {
    setMCPStatus(`授权保存失败：${reason.message || reason}`, true);
  }
}

function mcpStatusPillClass(status) {
  if (status === "connected") return "status-pill-ok";
  if (status === "error") return "status-pill-err";
  if (status === "disabled") return "status-pill-warn";
  return "";
}

function mcpStatusText(status) {
  if (status.status === "connected") return `${status.tool_count} 个工具`;
  if (status.status === "error") return "连接失败";
  if (status.status === "disabled") return "已停用";
  return "等待重启";
}

async function setMCPServerEnabled(name, enabled) {
  try {
    await api(
      fetch(`/api/mcp/servers/${encodeURIComponent(name)}/${enabled ? "enable" : "disable"}`, {
        method: "POST",
      })
    );
    await renderMCPServers();
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
    await renderMCPServers();
  }
}

async function testMCPServer(name) {
  setMCPStatus(`正在测试 ${name}…`, false);
  try {
    const result = await api(fetch(`/api/mcp/servers/${encodeURIComponent(name)}/test`, { method: "POST" }));
    if (result.ok) {
      const tools = result.tools.map((tool) => tool.name).join("、") || "（无工具）";
      setMCPStatus(`${name} 连接正常：${result.tool_count} 个工具（${tools}），耗时 ${result.elapsed_ms}ms。`, false);
    } else {
      setMCPStatus(`${name} 连接失败：${result.error}`, true);
    }
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
  }
}

async function createMCPServer() {
  const name = $("mcp-name").value.trim();
  const transport = document.querySelector('input[name="mcp-transport"]:checked')?.value || "stdio";
  const command = $("mcp-command").value.trim();
  const args = $("mcp-args").value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const env = parseKeyValueLines($("mcp-env").value);
  const url = $("mcp-url").value.trim();
  const headers = parseKeyValueLines($("mcp-headers").value);
  if (!name) {
    setMCPStatus("服务器名称不能为空。", true);
    return;
  }
  try {
    await api(fetch("/api/mcp/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        transport,
        command,
        args,
        env,
        url,
        headers,
        enabled: true,
        description: $("mcp-description").value.trim(),
      }),
    }));
    closePluginDrawer();
    resetMCPForm();
    await renderMCPServers();
    setMCPStatus("已保存并连接。", false);
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
  }
}

function parseKeyValueLines(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    const colon = trimmed.indexOf(":");
    const sep = eq > 0 && (colon < 0 || eq < colon) ? eq : colon;
    if (sep > 0) {
      result[trimmed.slice(0, sep).trim()] = trimmed.slice(sep + 1).trim();
    }
  }
  return result;
}

function resetMCPForm() {
  $("mcp-name").value = "";
  $("mcp-description").value = "";
  $("mcp-command").value = "";
  $("mcp-args").value = "";
  $("mcp-env").value = "";
  $("mcp-url").value = "";
  $("mcp-headers").value = "";
}

async function deleteMCPServer(name) {
  if (!window.confirm(`删除 MCP 服务器 ${name}？其工具将立即不可用。`)) return;
  try {
    await api(fetch(`/api/mcp/servers/${encodeURIComponent(name)}`, { method: "DELETE" }));
    await renderMCPServers();
    setMCPStatus(`已删除 ${name}。`, false);
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
  }
}

async function renderMCPTools() {
  const container = $("mcp-tool-list");
  container.innerHTML = "";
  let tools = [];
  try {
    tools = await api(fetch("/api/mcp/tools"));
  } catch (reason) {
    setMCPStatus(reason.message || reason, true);
    return;
  }
  pluginState.tools = tools;
  renderPluginOverview();
  const filter = $("mcp-tool-filter")?.value.trim().toLowerCase() || "";
  const visibleTools = tools.filter((tool) => !filter || [tool.name, tool.server, tool.description].some((value) => String(value || "").toLowerCase().includes(filter)));
  $("mcp-tool-count").textContent = `${tools.length} 个工具`;
  if (!tools.length) {
    const note = document.createElement("p");
    note.className = "inline-status";
    note.textContent = "暂无已注册的 MCP 工具。配置服务器并重启应用后，工具会出现在这里，并可在上方技能中勾选引用。";
    container.append(note);
    return;
  }
  for (const tool of visibleTools) {
    const row = document.createElement("article");
    row.className = "plugin-tool-row";
    const name = document.createElement("strong");
    name.textContent = tool.name;
    const server = document.createElement("span");
    server.textContent = tool.server;
    const description = document.createElement("p");
    description.textContent = tool.description || "无描述";
    const status = document.createElement("span");
    status.className = `status-pill ${tool.requires_confirmation ? "status-pill-warn" : "status-pill-ok"}`;
    status.textContent = tool.requires_confirmation ? "需确认" : "只读";
    row.append(name, server, description, status);
    container.append(row);
  }
}

function setMCPStatus(message, isError) {
  [$("mcp-status"), $("mcp-drawer-status")].filter(Boolean).forEach((node) => {
    node.textContent = message || "";
    node.classList.toggle("is-error", Boolean(isError));
  });
}

/* ---- 在线扩展目录 ---- */
async function loadExtensionCatalog(refresh) {
  const kind = $("extension-catalog-kind")?.value || "all";
  const status = $("extension-catalog-status");
  if (status) status.textContent = "加载中";
  try {
    const suffix = `?kind=${encodeURIComponent(kind)}${refresh ? "&refresh=true" : ""}`;
    const snapshot = await api(fetch(`/api/extensions/catalog${suffix}`));
    extensionCatalogState.items = Array.isArray(snapshot.items) ? snapshot.items : [];
    if (status) {
      status.textContent = snapshot.stale ? "缓存目录" : `${extensionCatalogState.items.length} 个条目`;
      status.className = `status-pill ${snapshot.stale ? "status-pill-warn" : "status-pill-ok"}`;
    }
    const notice = $("extension-catalog-notice");
    if (notice) {
      notice.textContent = snapshot.stale ? "在线目录暂时不可用，当前展示上次成功缓存。" : "目录已更新。安装前请检查来源、运行时和权限。";
      notice.classList.remove("is-error");
    }
    renderExtensionCatalog();
  } catch (reason) {
    if (status) { status.textContent = "目录不可用"; status.className = "status-pill status-pill-err"; }
    const notice = $("extension-catalog-notice");
    if (notice) { notice.textContent = reason.message || String(reason); notice.classList.add("is-error"); }
    const list = $("extension-catalog-list");
    if (list) { list.innerHTML = ""; list.append(empty("无法加载在线目录。可检查网络，或稍后重试。")); }
  }
}

function renderExtensionCatalog() {
  const list = $("extension-catalog-list");
  if (!list) return;
  const query = ($("extension-catalog-search")?.value || "").trim().toLowerCase();
  const installedSkills = new Set(pluginState.skills.map((item) => item.name));
  const installedMCP = new Set(pluginState.servers.map((item) => item.name));
  const visible = extensionCatalogState.items.filter((item) => {
    const haystack = [item.id, item.name, item.description, ...(item.categories || [])].join(" ").toLowerCase();
    return !query || haystack.includes(query);
  });
  list.innerHTML = "";
  if (!visible.length) { list.append(empty("没有匹配的扩展。")); return; }
  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "extension-catalog-card";
    const head = document.createElement("div"); head.className = "extension-catalog-card-head";
    const title = document.createElement("strong"); title.textContent = item.name || item.id;
    const kind = document.createElement("span"); kind.className = "status-pill"; kind.textContent = item.kind.toUpperCase();
    head.append(title, kind);
    const version = document.createElement("small"); version.textContent = `v${item.version || "未知"} · ${item.id}`;
    const description = document.createElement("p"); description.textContent = item.description || "暂无说明";
    const tags = document.createElement("div"); tags.className = "extension-catalog-tags";
    (item.categories || []).forEach((category) => { const tag = document.createElement("span"); tag.textContent = category; tags.append(tag); });
    const installed = item.kind === "skill" ? installedSkills.has(item.id) : installedMCP.has(item.id);
    const action = document.createElement("button"); action.type = "button"; action.className = "button button-secondary";
    action.textContent = installed ? "已安装" : "查看详情"; action.disabled = installed;
    action.addEventListener("click", () => openExtensionDetails(item));
    card.append(head, version, description, tags, action); list.append(card);
  });
}

function openExtensionDetails(item) {
  extensionCatalogState.selected = item;
  const drawer = $("extension-catalog-drawer");
  const detail = $("extension-catalog-detail");
  if (!drawer || !detail) return;
  $("extension-catalog-title").textContent = item.name || item.id;
  $("extension-catalog-install-status").textContent = "";
  $("extension-catalog-install").disabled = false;
  detail.innerHTML = "";
  const summary = document.createElement("p"); summary.className = "plugin-description"; summary.textContent = item.description || "暂无说明"; detail.append(summary);
  const rows = [["类型", item.kind.toUpperCase()], ["版本", item.version || "未知"], ["来源", item.source?.type || "未知"], ["运行要求", Object.keys(item.requires || {}).join(", ") || "无"]];
  const list = document.createElement("dl"); list.className = "extension-catalog-detail-list";
  rows.forEach(([label, value]) => { const dt = document.createElement("dt"); dt.textContent = label; const dd = document.createElement("dd"); dd.textContent = value; list.append(dt, dd); });
  detail.append(list);
  if (!drawer.open) drawer.showModal();
  icons();
}

function closeExtensionDetails() { const drawer = $("extension-catalog-drawer"); if (drawer?.open) drawer.close(); }

async function installSelectedExtension() {
  const item = extensionCatalogState.selected;
  if (!item) return;
  const status = $("extension-catalog-install-status"); const button = $("extension-catalog-install");
  button.disabled = true; status.classList.remove("is-error"); status.textContent = "正在检查安装条件…";
  try {
    const preview = await api(fetch(`/api/extensions/catalog/${encodeURIComponent(item.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: false }) }));
    if (preview.status === "awaiting_confirmation" && preview.preview?.conflicts?.length) throw new Error(preview.preview.conflicts.join("；"));
    status.textContent = "已完成预览，正在安装…";
    const result = await api(fetch(`/api/extensions/catalog/${encodeURIComponent(item.id)}/install`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: true }) }));
    if (result.status === "installed") {
      status.textContent = item.kind === "skill" ? "安装完成。请前往 Skill 列表手动启用并信任。" : "安装完成。请前往 MCP 服务手动启用并授权角色。";
      await refreshPluginData();
      renderExtensionCatalog();
    } else {
      throw new Error(result.message || "安装未完成");
    }
  } catch (reason) {
    status.textContent = reason.message || String(reason); status.classList.add("is-error");
  } finally { button.disabled = false; }
}

if (typeof module !== "undefined") {
  module.exports = { derivePluginOverview, pluginViewNames };
}
