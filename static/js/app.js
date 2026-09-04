"use strict";

const MODULES = {
  chat: { view: "chat", init: window.PL.modules.chat?.init, onShow: window.PL.modules.chat?.onShow, onHide: window.PL.modules.chat?.onHide },
  role: { view: "role", init: initRoleWorkbench },
  voice: { view: "voice-workbench", init: initVoiceWorkbench, onShow: showVoiceWorkbench },
  knowledge: { view: "knowledge", init: initKnowledgeWorkbench, onShow: showKnowledgeWorkbench, onHide: hideKnowledgeWorkbench },
  integrations: { view: "integrations-workbench", init: initIntegrationsWorkbench, onShow: showIntegrationsWorkbench, onHide: hideIntegrationsWorkbench },
  capabilities: { view: "capabilities", init: initCapabilitiesWorkbench, onShow: showCapabilitiesWorkbench, onHide: hideCapabilitiesWorkbench },
  system: { view: "system", init: initSystemWorkbench, onShow: showSystemWorkbench },
};

const VIEW_ALIASES = {
  create: "role", manage: "role", rvc: "voice", providers: "system", settings: "system",
  plugins: "capabilities", test: "knowledge", napcat: "integrations",
};
const VIEW_TAB_ALIASES = {
  create: "role-create", manage: "role-manage", rvc: "voice-rvc", providers: "system-providers",
  settings: "system-overview", plugins: "capabilities", test: "knowledge-eval", napcat: "integration-qq",
};
const LEGACY_TAB_ALIASES = {
  "role-overview": "role-create",
  "voice-service": "voice-gpt-sovits", "voice-asset": "voice-gpt-sovits", "voice-library": "voice-gpt-sovits",
  "knowledge-documents": "knowledge-overview", "knowledge-space": "knowledge-overview", "knowledge-retrieval": "knowledge-overview",
  "integration-overview": "integration-qq",
  "capabilities-overview": "capabilities-skills",
  "capabilities-tools": "capabilities-tools",
  "capabilities-catalog": "capabilities-catalog",
  "system-runtime": "system-overview", "system-storage": "system-overview",
};
const TAB_VIEW_ALIASES = {
  "role-overview": "role", "role-create": "role", "role-manage": "role",
  "voice-gpt-sovits": "voice", "voice-service": "voice", "voice-asset": "voice", "voice-rvc": "voice", "voice-library": "voice",
  "knowledge-overview": "knowledge", "knowledge-documents": "knowledge", "knowledge-space": "knowledge", "knowledge-retrieval": "knowledge", "knowledge-eval": "knowledge",
  "integration-overview": "integrations", "integration-bili": "integrations", "integration-qq": "integrations",
  "capabilities": "capabilities", "capabilities-overview": "capabilities", "capabilities-skills": "capabilities", "capabilities-mcp": "capabilities", "capabilities-tools": "capabilities", "capabilities-catalog": "capabilities", "capabilities-catalog": "capabilities",
  "system-overview": "system", "system-runtime": "system", "system-providers": "system", "system-storage": "system",
};

async function callModule(name, method = "init") {
  const fn = window.PL?.modules?.[name]?.[method];
  if (typeof fn === "function") await fn();
}
async function initRoleWorkbench() { await callModule("create"); await callModule("manage"); }
async function initVoiceWorkbench() { await callModule("voice"); await callModule("rvc"); }
async function showVoiceWorkbench() { await callModule("voice", "onShow"); }
async function initKnowledgeWorkbench() { await callModule("test"); await callModule("knowledgeDashboard"); }
async function showKnowledgeWorkbench() { await callModule("test", "onShow"); await callModule("knowledgeDashboard", "onShow"); }
async function hideKnowledgeWorkbench() { await callModule("test", "onHide"); }
async function initIntegrationsWorkbench() { await callModule("integrations"); await callModule("napcat"); }
async function showIntegrationsWorkbench() { await callModule("integrations", "onShow"); await callModule("napcat", "onShow"); }
async function hideIntegrationsWorkbench() { await callModule("integrations", "releaseLiveStage"); await callModule("napcat", "onHide"); }
async function initCapabilitiesWorkbench() { await callModule("plugins"); }
async function showCapabilitiesWorkbench() { await callModule("plugins", "onShow"); }
async function hideCapabilitiesWorkbench() { await callModule("plugins", "onHide"); }
async function initSystemWorkbench() { await callModule("settings"); await callModule("providers"); await callModule("systemStorage"); }
async function showSystemWorkbench() { await callModule("settings", "onShow"); await callModule("providers", "onShow"); await callModule("systemStorage", "onShow"); }

const VIEW_NODES = {};
let viewSwitchEpoch = 0;
let currentView = null;

(function unlockAudioOnGesture() {
  let unlocked = false;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    } catch (e) { /* 浏览器不支持音频解锁时不影响页面 */ }
  };
  ["pointerdown", "keydown", "touchstart", "click"].forEach((type) => {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  });
  window.PL = window.PL || {};
  window.PL.unlockAudio = unlock;
})();

(function enforceSingleAudio() {
  document.addEventListener("play", (event) => {
    const el = event.target;
    if (!el || el.tagName !== "AUDIO") return;
    document.querySelectorAll("audio").forEach((other) => {
      if (other !== el && !other.paused && !other.ended) {
        try { other.pause(); } catch (e) { /* ignore */ }
      }
    });
  }, true);
  window.PL = window.PL || {};
  window.PL.audio = {
    host: null,
    hostEl() {
      if (!this.host) {
        this.host = document.createElement("div");
        this.host.id = "audio-single-host";
        this.host.hidden = true;
        document.body.append(this.host);
      }
      return this.host;
    },
    play(el) {
      if (el && !el.isConnected) this.hostEl().append(el);
      return el.play();
    },
  };
})();

function bindShellEvents() {
  $("sidebar-toggle").addEventListener("click", () => setSidebarPinned(!document.body.classList.contains("sidebar-pinned")));
  $("settings-confirm-cancel").addEventListener("click", () => $("settings-confirm-dialog").close());
  $("settings-confirm-submit").addEventListener("click", confirmSettingsAction);
  document.addEventListener("click", (event) => {
    const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
    const dynamicView = clickTarget?.closest?.("[data-view]");
    if (dynamicView) {
      event.preventDefault();
      const targetView = VIEW_ALIASES[dynamicView.dataset.view] || dynamicView.dataset.view;
      // 先同步更新地址，避免异步模块初始化期间旧 hash 与已显示页面脱节。
      if (MODULES[targetView] && location.hash !== canonicalHash(targetView)) {
        history.replaceState(null, "", canonicalHash(targetView));
      }
      void switchView(targetView).catch((error) => reportViewError(error));
      return;
    }
    const capabilityTab = clickTarget?.closest?.("[data-capability-tab]");
    if (capabilityTab) {
      const capabilityId = capabilityTab.dataset.capabilityTab;
      if (capabilityId && location.hash !== `#capabilities-${capabilityId}`) {
        history.replaceState(null, "", `#capabilities-${capabilityId}`);
      }
      return;
    }
    const tab = clickTarget?.closest?.("[data-workbench-tab]");
    if (!tab) return;
    const workbench = tab.closest("[data-workbench]");
    if (!workbench) return;
    const target = tab.dataset.workbenchTab;
    if (!applyWorkbenchTab(workbench, target)) {
      const targetView = TAB_VIEW_ALIASES[target];
      if (targetView) void switchView(targetView, target).catch((error) => reportViewError(error));
      return;
    }
    const view = workbench.dataset.workbench;
    if (view) history.replaceState(null, "", canonicalHash(view, target));
  });
}

function setSidebarPinned(pinned) {
  document.body.classList.toggle("sidebar-pinned", pinned);
  $("sidebar-toggle").setAttribute("aria-pressed", String(pinned));
}

function applyWorkbenchTab(workbench, target) {
  if (!workbench || !target) return false;
  const capabilityId = target.replace(/^capabilities-/, "");
  const capabilityTab = [...workbench.querySelectorAll("[data-capability-tab]")].find((item) => item.dataset.capabilityTab === capabilityId);
  if (capabilityTab) {
    capabilityTab.click();
    return true;
  }
  const tab = [...workbench.querySelectorAll("[data-workbench-tab]")].find((item) => item.dataset.workbenchTab === target);
  if (!tab) return false;
  workbench.querySelectorAll("[data-workbench-tab]").forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.setAttribute("tabindex", active ? "0" : "-1");
  });
  workbench.querySelectorAll("[data-workbench-panel]").forEach((panel) => {
    const active = panel.dataset.workbenchPanel === target;
    panel.classList.toggle("is-active", active);
    panel.classList.toggle("is-hidden", !active);
    panel.querySelectorAll(":scope > .view").forEach((viewNode) => viewNode.classList.toggle("is-hidden", !active));
  });
  return true;
}

function activateWorkbenchTab(target) {
  if (!target) return;
  const workbench = document.querySelector("[data-workbench].view:not(.is-hidden)");
  if (workbench) applyWorkbenchTab(workbench, target);
}

function parseLocation() {
  const raw = location.hash.replace(/^#/, "") || "chat";
  const canonicalTab = LEGACY_TAB_ALIASES[raw] || raw;
  const rawView = VIEW_ALIASES[canonicalTab] || TAB_VIEW_ALIASES[canonicalTab] || canonicalTab;
  const view = VIEW_ALIASES[rawView] || rawView;
  const tab = VIEW_TAB_ALIASES[raw] || VIEW_TAB_ALIASES[canonicalTab] || (TAB_VIEW_ALIASES[canonicalTab] ? canonicalTab : null);
  return { raw, view, tab };
}

function canonicalHash(view, tab = null) {
  return tab ? `#${tab}` : `#${view}`;
}

function closeTransientOverlays() {
  // SPA 切页时清理旧页面残留的抽屉/遮罩，避免透明层继续拦截新工作台的点击。
  ["preview-backdrop", "chat-files-backdrop", "chat-context-backdrop", "chat-settings-backdrop"].forEach((id) => {
    const node = $(id);
    node?.classList.add("is-hidden");
    node?.classList.remove("is-open");
    node?.setAttribute("aria-hidden", "true");
  });
  ["preview-drawer", "chat-attachments-drawer", "chat-context-sidebar", "chat-settings-sidebar"].forEach((id) => {
    $(id)?.classList.add("is-hidden");
  });
  document.querySelectorAll("dialog[open]").forEach((dialog) => {
    try { dialog.close(); } catch (_) { dialog.removeAttribute("open"); }
  });
}

function reportViewError(error) {
  console.error("[YUMENO] 页面切换失败", error);
  const message = error?.message || "页面加载失败，请重试";
  if (typeof window.showToast === "function") window.showToast(message, "error");
}

async function switchView(view, tabTarget = null) {
  view = VIEW_ALIASES[view] || view;
  const entry = MODULES[view];
  if (!entry) return false;
  const switchEpoch = ++viewSwitchEpoch;
  closeTransientOverlays();
  const previousView = currentView;
  if (previousView && previousView !== view) {
    const previousEntry = MODULES[previousView];
    await previousEntry?.onHide?.();
  }
  document.querySelectorAll(".primary-nav [data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    if (button.closest(".primary-nav")) {
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
  });
  const root = $("view-root");
  if (!root) return false;
  let node = VIEW_NODES[view];
  if (!node) {
    const response = await fetch(`/static/views/${entry.view}.html`, { headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error(`加载页面失败（${response.status}）`);
    const template = document.createElement("template");
    template.innerHTML = await response.text();
    if (switchEpoch !== viewSwitchEpoch) return false;
    node = template.content.firstElementChild;
    if (!node) throw new Error(`页面 ${entry.view} 没有根节点`);
    VIEW_NODES[view] = node;
    root.append(node);
  }
  if (switchEpoch !== viewSwitchEpoch) return false;
  Object.entries(VIEW_NODES).forEach(([key, viewNode]) => viewNode.classList.toggle("is-hidden", key !== view));
  currentView = view;
  if (!node.dataset.yumenoInitialized) {
    node.dataset.yumenoInitialized = "pending";
    try {
      await entry.init?.();
      node.dataset.yumenoInitialized = "true";
    } catch (error) {
      node.dataset.yumenoInitialized = "error";
      console.error(`[${view}.init]`, error);
      reportViewError(new Error(`${entry.view} 页面初始化失败：${error?.message || "未知错误"}`));
    }
  }
  if (switchEpoch !== viewSwitchEpoch) return false;
  if (location.hash !== canonicalHash(view, tabTarget)) history.replaceState(null, "", canonicalHash(view, tabTarget));
  try {
    await entry.onShow?.();
  } catch (error) {
    console.error(`[${view}.onShow]`, error);
    reportViewError(error);
  }
  if (switchEpoch !== viewSwitchEpoch) return false;
  activateWorkbenchTab(tabTarget);
  icons();
  return true;
}

window.switchView = switchView;
window.setWorkbenchTab = (target) => {
  const workbench = document.querySelector("[data-workbench].view:not(.is-hidden)");
  return applyWorkbenchTab(workbench, target);
};

window.addEventListener("hashchange", () => {
  const { view, tab } = parseLocation();
  if (MODULES[view]) void switchView(view, tab);
});

document.addEventListener("DOMContentLoaded", async () => {
  bindShellEvents();
  const initial = parseLocation();
  // 首屏只启动一次目标页面；避免先加载对话再切回初始 hash 覆盖用户的快速点击。
  const initialViewTask = MODULES[initial.view]
    ? switchView(initial.view, initial.tab).catch((error) => reportViewError(error))
    : switchView("chat").catch((error) => reportViewError(error));
  await Promise.all([initialViewTask, loadStatus(), loadPersonas(), loadAsrStatus(), loadGptSoVitsStatus()]);
  if (location.hash === "#docker-exit") {
    await switchView("system");
    const anchor = $("docker-exit-anchor");
    if (anchor) { anchor.open = true; anchor.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  icons();
});
