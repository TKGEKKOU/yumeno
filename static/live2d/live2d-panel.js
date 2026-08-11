"use strict";

/*
 * YUMENO Live2D dock panel.
 * Wires the chat toolbar toggle, the character dock UI, lazy-loads the
 * heavy renderer (PIXI + Cubism cores), and forwards state/volume to the
 * desktop floating window (pywebview bridge) or browser popup
 * (BroadcastChannel).
 */
(function () {
  const LS_ENABLED = "yumeno:live2d:enabled";
  const HEAVY_SCRIPTS = [
    "/static/vendor/live2d/pixi.min.js",
    "/static/vendor/live2d/live2d.min.js",
    "/static/vendor/live2d/live2dcubismcore.min.js",
    "/static/vendor/live2d/pixi-live2d-display.min.js",
    "/static/live2d/viseme.js",
    "/static/live2d/live2d-core.js",
  ];

  const STATE_TEXT = {
    idle: "空闲",
    talking: "应答中",
    listening: "聆听中",
    thinking: "思考中",
    connecting: "连接中",
  };

  let dock = null;
  let heavyPromise = null;
  let controllerReady = false;
  let dockOpening = false;
  let stageResize = null;
  let stageResizeRaf = 0;
  let focusMode = false;
  let focusHintTimer = 0;

  const STAGE_HEIGHT_KEY = "yumeno:live2d:stageh";
  const FOCUS_KEY = "yumeno:live2d:focus";
  const FOCUS_THRESHOLD = 6;

  const $ = (id) => document.getElementById(id);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing && existing.dataset.loaded === "1") { resolve(); return; }
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = () => { script.dataset.loaded = "1"; resolve(); };
      script.onerror = () => reject(new Error("加载失败: " + src));
      document.head.appendChild(script);
    });
  }

  function loadHeavy() {
    if (!heavyPromise) {
      heavyPromise = HEAVY_SCRIPTS.reduce(
        (chain, src) => chain.then(() => loadScript(src)),
        Promise.resolve()
      );
    }
    return heavyPromise;
  }

  function isEnabled() {
    return localStorage.getItem(LS_ENABLED) === "1";
  }

  function setEnabled(value) {
    localStorage.setItem(LS_ENABLED, value ? "1" : "0");
  }

  async function openDock() {
    dock = $("live2d-dock");
    if (!dock || dockOpening) return;
    if (!dock.hidden && controllerReady) return; // 已打开且已就绪
    dockOpening = true;
    dock.hidden = false;
    const panel = document.querySelector(".chat-panel");
    if (panel) panel.classList.add("is-live2d-open");
    setEnabled(true);
    syncToggleButton();
    setStatus("loading", "正在唤醒角色…");
    try {
      const staleCanvas = controllerReady
        && (!window.PLLive2D.canvas || !window.PLLive2D.canvas.isConnected);
      if (staleCanvas) {
        // 视图切换后旧 canvas 已被移除，重建渲染器（模型走缓存，重载很快）
        try { window.PLLive2D.destroy(); } catch (e) { /* ignore */ }
        controllerReady = false;
      }
      if (controllerReady) {
        window.PLLive2D.show();
      } else {
        await loadHeavy();
        await window.PLLive2D.init($("live2d-stage"), $("live2d-canvas"), "stage");
        controllerReady = true;
      }
      renderModelSelect();
      syncControls();
      restoreStageHeight();
      syncPersonaModel();
    } catch (e) {
      setStatus("error", "Live2D 初始化失败：" + (e && e.message ? e.message : e));
    } finally {
      dockOpening = false;
    }
  }

  function closeDock() {
    if (focusMode) exitFocusMode(true);
    dock = $("live2d-dock");
    if (dock) dock.hidden = true;
    const panel = document.querySelector(".chat-panel");
    if (panel) panel.classList.remove("is-live2d-open");
    setEnabled(false);
    syncToggleButton();
    if (controllerReady) window.PLLive2D.hide();
  }

  function toggleDock() {
    const node = $("live2d-dock");
    if (node && !node.hidden && !dockOpening) closeDock();
    else if (!dockOpening) openDock();
  }

  function syncToggleButton() {
    const toggle = $("live2d-toggle");
    if (!toggle) return;
    const node = $("live2d-dock");
    const open = Boolean(node && !node.hidden);
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-pressed", String(open));
    toggle.title = open ? "关闭角色面板" : "打开角色面板";
    toggle.setAttribute("aria-label", toggle.title);
  }

  function syncPersonaModel() {
    const persona = (typeof state !== "undefined" && state.activePersona) || null;
    if (!window.PLLive2D || !persona) return;
    const bound = persona.profile?.live2d?.model;
    if (bound) window.PLLive2D.setPreferredModel(bound);
  }

  function setStatus(state, message) {
    const text = $("live2d-status-text");
    const line = $("live2d-status");
    if (!text || !line) return;
    text.textContent = message || STATE_TEXT[state] || state;
    line.dataset.state = state || "idle";
    line.classList.toggle("is-active", Boolean(message) || (state && state !== "idle"));
  }

  function renderModelSelect() {
    const select = $("live2d-model");
    if (!select || !window.PLLive2D) return;
    select.replaceChildren();
    for (const model of window.PLLive2D.models) {
      const option = document.createElement("option");
      option.value = model.id;
      option.textContent = model.compatible === false
        ? `${model.name}（MOC3 v${model.moc_version} 不兼容）`
        : model.name;
      option.disabled = model.compatible === false;
      select.append(option);
    }
    if (window.PLLive2D.currentId) select.value = window.PLLive2D.currentId;
    select.hidden = select.options.length === 0;
  }

  function syncControls() {
    const flip = $("live2d-flip");
    if (flip && window.PLLive2D) flip.classList.toggle("is-active", window.PLLive2D.flip);
  }

  function renderVtsStatus(detail) {
    const card = $("vts-connection-card");
    if (!card) return;
    const dot = $("vts-connection-dot");
    const title = $("vts-connection-detail");
    const menuState = $("vts-menu-state");
    const message = $("vts-connection-message");
    const connect = $("vts-connect");
    const state = detail?.level || window.PLVTS?.status || "offline";
    const labels = { connecting: "连接中", auth: "等待授权", ok: "已连接", error: "连接失败", offline: "未连接" };
    card.dataset.state = state;
    if (dot) dot.title = labels[state] || state;
    if (title) title.textContent = labels[state] || state;
    if (menuState) menuState.textContent = labels[state] || state;
    if (message && detail?.message) message.textContent = detail.message;
    if (connect) {
      const active = state === "connecting" || state === "auth";
      connect.disabled = active;
      connect.querySelector("span").textContent = state === "ok" ? "断开" : active ? "连接中" : "连接";
    }
    if (state === "ok") setStatus("idle", "VTube Studio 已连接");
    else if (state === "error") setStatus("error", detail.message);
    if ((state === "offline" || state === "error") && window.PLLive2D?.mode === "vts") {
      window.PLLive2D.setMode("embedded");
    }
  }

  async function loadVtsConfig() {
    try {
      const response = await fetch("/api/live2d/vts");
      const config = await response.json();
      const endpoint = $("vts-endpoint-input");
      if (endpoint) endpoint.value = window.PLVTS?.url || config.url || endpoint.value;
      renderVtsStatus({ level: "offline", message: "当前为内嵌模式；连接仅在本次会话有效。" });
    } catch (e) {
      renderVtsStatus({ level: "error", message: "无法读取连接配置，请确认 YUMENO 后端正在运行" });
    }
  }

  /* ---------- 舞台高度（拖底边自由调节，最小 1/3，最大到输入框） ---------- */

  function panelMetrics() {
    const panel = document.querySelector(".chat-panel");
    if (!panel) return null;
    const toolbar = document.querySelector(".chat-toolbar");
    const footer = document.querySelector(".chat-footer");
    const rect = panel.getBoundingClientRect();
    return {
      panel,
      rect,
      toolbarH: toolbar ? toolbar.offsetHeight : 64,
      footerH: footer ? footer.offsetHeight : 74,
    };
  }

  function stageBounds(metrics) {
    metrics = metrics || panelMetrics();
    if (!metrics) return null;
    const min = Math.round(metrics.rect.height * 0.33);
    const max = Math.max(min, Math.round(metrics.rect.height - metrics.toolbarH - metrics.footerH - 8));
    return { min, max, metrics };
  }

  function scheduleStageResize() {
    if (!window.PLLive2D) return;
    if (stageResizeRaf) cancelAnimationFrame(stageResizeRaf);
    stageResizeRaf = requestAnimationFrame(() => {
      stageResizeRaf = 0;
      window.PLLive2D.resize();
    });
  }

  function applyStageHeight(px, metrics) {
    const bounds = stageBounds(metrics);
    if (!bounds) return null;
    const final = Math.min(bounds.max, Math.max(bounds.min, Math.round(px)));
    bounds.metrics.panel.style.setProperty("--l2d-stage-h", final + "px");
    scheduleStageResize();
    return final;
  }

  function animateStageHeight(fromPx, toPx, ms) {
    const bounds = stageBounds();
    if (!bounds) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      applyStageHeight(fromPx + (toPx - fromPx) * eased, bounds.metrics);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- 专注模式：舞台拉满、聊天记录淡出 ---------- */

  function showFocusHint() {
    const hint = $("live2d-focus-hint");
    if (!hint) return;
    clearTimeout(focusHintTimer);
    hint.classList.remove("is-leaving", "is-hidden");
    hint.classList.add("is-showing");
    focusHintTimer = setTimeout(() => {
      hint.classList.remove("is-showing");
      hint.classList.add("is-leaving");
      focusHintTimer = setTimeout(() => hint.classList.add("is-hidden"), 420);
    }, 2600);
  }

  function enterFocusMode(animated = true) {
    if (focusMode) return;
    focusMode = true;
    localStorage.setItem(FOCUS_KEY, "1");
    const panel = document.querySelector(".chat-panel");
    if (panel) panel.classList.add("is-focus");
    showFocusHint();
    const bounds = stageBounds();
    if (!bounds) return;
    if (animated) {
      const current = parseFloat(panel.style.getPropertyValue("--l2d-stage-h"))
        || Math.round(bounds.metrics.rect.height * 0.65);
      animateStageHeight(current, bounds.max, 240);
    } else {
      applyStageHeight(bounds.max, bounds.metrics);
    }
  }

  function exitFocusMode(restoreDefault = false) {
    if (!focusMode) return;
    focusMode = false;
    localStorage.removeItem(FOCUS_KEY);
    const panel = document.querySelector(".chat-panel");
    if (panel) panel.classList.remove("is-focus");
    const hint = $("live2d-focus-hint");
    if (hint) {
      clearTimeout(focusHintTimer);
      hint.classList.remove("is-showing");
      hint.classList.add("is-leaving");
      focusHintTimer = setTimeout(() => hint.classList.add("is-hidden"), 420);
    }
    if (restoreDefault && panel) {
      const bounds = stageBounds();
      if (bounds) {
        const current = parseFloat(panel.style.getPropertyValue("--l2d-stage-h")) || bounds.max;
        animateStageHeight(current, Math.round(bounds.metrics.rect.height * 0.65), 240);
      }
    }
  }

  function restoreStageHeight() {
    const metrics = panelMetrics();
    if (!metrics) return;
    if (localStorage.getItem(FOCUS_KEY) === "1") {
      focusMode = true;
      const panel = document.querySelector(".chat-panel");
      if (panel) panel.classList.add("is-focus");
      const bounds = stageBounds(metrics);
      if (bounds) applyStageHeight(bounds.max, metrics);
      return;
    }
    const saved = parseFloat(localStorage.getItem(STAGE_HEIGHT_KEY));
    if (Number.isFinite(saved) && saved > 0) {
      applyStageHeight(saved, metrics);
    } else {
      metrics.panel.style.removeProperty("--l2d-stage-h");
    }
  }

  function bindStageResize() {
    document.addEventListener("pointerdown", (event) => {
      if (!event.target.closest("#live2d-resize")) return;
      const metrics = panelMetrics();
      if (!metrics) return;
      const current = parseFloat(metrics.panel.style.getPropertyValue("--l2d-stage-h"))
        || Math.round(metrics.rect.height * 0.65);
      stageResize = { startY: event.clientY, metrics, startHeight: current };
      try { event.target.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    });
    document.addEventListener("pointermove", (event) => {
      if (!stageResize) return;
      // 以按下时的初始高度为基准计算，避免每次从吸附值累加导致档位跳动
      const { startY, metrics, startHeight } = stageResize;
      const final = applyStageHeight(startHeight + (event.clientY - startY), metrics);
      if (final == null) return;
      const bounds = stageBounds(metrics);
      if (bounds && final >= bounds.max - FOCUS_THRESHOLD) {
        enterFocusMode(true);
      } else if (focusMode) {
        exitFocusMode(false);
      }
      localStorage.setItem(STAGE_HEIGHT_KEY, String(final));
    });
    const endResize = () => { stageResize = null; };
    document.addEventListener("pointerup", endResize);
    document.addEventListener("pointercancel", endResize);
    window.addEventListener("resize", () => {
      const metrics = panelMetrics();
      if (!metrics) return;
      if (focusMode) {
        const bounds = stageBounds(metrics);
        if (bounds) applyStageHeight(bounds.max, metrics);
        return;
      }
      const current = parseFloat(metrics.panel.style.getPropertyValue("--l2d-stage-h"));
      if (Number.isFinite(current) && current > 0) applyStageHeight(current, metrics);
    });
  }

  function bindEvents() {
    // 事件委托：聊天视图是异步挂载的，直接绑定时按钮还不存在；
    // 委托到 document 后无论视图何时渲染都能响应。
    document.addEventListener("click", async (event) => {
      const outsideMenu = !event.target.closest("#live2d-more") && !event.target.closest("#live2d-more-menu");
      const more = event.target.closest("#live2d-more");
      if (more) {
        const menu = $("live2d-more-menu");
        const open = menu.classList.toggle("is-hidden") === false;
        more.setAttribute("aria-expanded", String(open));
        if (!open) closeMoreMenu();
        return;
      }
      const focusHint = event.target.closest("#live2d-focus-hint");
      if (focusHint) { exitFocusMode(true); return; }
      if (outsideMenu) {
        const menu = $("live2d-more-menu");
        if (menu && !menu.classList.contains("is-hidden")) {
          closeMoreMenu();
        }
      }
      const toggle = event.target.closest("#live2d-toggle");
      if (toggle) { toggleDock(); return; }
      const close = event.target.closest("#live2d-close");
      if (close) { closeDock(); return; }
      const flip = event.target.closest("#live2d-flip");
      if (flip) {
        if (window.PLLive2D) window.PLLive2D.setFlip(!window.PLLive2D.flip);
        syncControls();
        return;
      }
      const modelToggle = event.target.closest("#live2d-model-toggle");
      if (modelToggle) {
        toggleMoreSubpanel("live2d-model-toggle", "live2d-model-panel", "vts-details-toggle", "vts-connection-card");
        return;
      }
      const vtsToggle = event.target.closest("#vts-details-toggle");
      if (vtsToggle) {
        toggleMoreSubpanel("vts-details-toggle", "vts-connection-card", "live2d-model-toggle", "live2d-model-panel");
        return;
      }
      const manage = event.target.closest("#live2d-manage");
      if (manage) {
        closeMoreMenu();
        sessionStorage.setItem("yumeno.manage.node", "module:live2d");
        const nav = $("nav-manage");
        if (nav) nav.click();
        document.dispatchEvent(new CustomEvent("yumeno:manage-select-node", { detail: { nodeId: "module:live2d" } }));
        return;
      }
      const openFolder = event.target.closest("#live2d-open-folder");
      if (openFolder) {
        setStatus("loading", "正在打开模型文件夹...");
        try {
          const response = await fetch("/api/live2d/model-directory", { method: "POST", headers: { "X-YUMENO-Request": "web" } });
          if (!response.ok) throw new Error("无法打开模型文件夹");
          setStatus("idle", "已打开模型文件夹；复制模型后点击刷新");
        } catch (error) { setStatus("error", error.message); }
        return;
      }
      const refreshModels = event.target.closest("#live2d-refresh-models");
      if (refreshModels && window.PLLive2D) {
        setStatus("loading", "正在扫描模型...");
        try {
          const models = await window.PLLive2D.refreshModels();
          renderModelSelect();
          setStatus("idle", `已发现 ${models.length} 个模型`);
        } catch (error) { setStatus("error", "刷新模型失败：" + error.message); }
        return;
      }
      const connect = event.target.closest("#vts-connect");
      if (connect && window.PLVTS) {
        const input = $("vts-endpoint-input");
        try { if (input) window.PLVTS.setUrl(input.value); }
        catch (error) { renderVtsStatus({ level: "error", message: error.message }); return; }
        if (window.PLVTS.connected) {
          window.PLVTS.disconnect();
          if (window.PLLive2D) window.PLLive2D.setMode("embedded");
        } else {
          if (window.PLLive2D) window.PLLive2D.setMode("vts");
          else window.PLVTS.connect();
        }
        return;
      }
      const clearToken = event.target.closest("#vts-clear-token");
      if (clearToken && window.PLVTS) {
        const input = $("vts-endpoint-input");
        try { if (input) window.PLVTS.setUrl(input.value); }
        catch (error) { renderVtsStatus({ level: "error", message: error.message }); return; }
        if (window.PLLive2D) window.PLLive2D.setMode("vts");
        window.PLVTS.clearToken(); window.PLVTS.connect(); return;
      }
    });
    document.addEventListener("change", (event) => {
      if (event.target && event.target.id === "live2d-model" && window.PLLive2D) {
        window.PLLive2D.setModel(event.target.value);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const menu = $("live2d-more-menu");
        if (menu && !menu.classList.contains("is-hidden")) { closeMoreMenu(); return; }
        const node = $("live2d-dock");
        if (node && !node.hidden) closeDock();
      }
    });
    document.addEventListener("yumeno:live2d", (event) => {
      const detail = event.detail || {};
      if (detail.type === "state") setStatus(detail.state);
      if (detail.type === "models") renderModelSelect();
      if (detail.type === "model") {
        const selectNode = $("live2d-model");
        if (selectNode && detail.id) selectNode.value = detail.id;
        const nameNode = $("live2d-name");
        if (nameNode && detail.name) nameNode.textContent = detail.name;
        syncToggleButton();
      }
      if (detail.type === "vts") setStatus(detail.level === "ok" ? "idle" : detail.level, detail.message);
      if (detail.type === "vts") renderVtsStatus(detail);
      if (detail.type === "status") setStatus(detail.level === "ok" ? "idle" : detail.level, detail.message);
    });
  }

  function setSubpanel(buttonId, panelId, open) {
    const button = $(buttonId);
    const panel = $(panelId);
    if (button) button.setAttribute("aria-expanded", String(open));
    if (panel) panel.classList.toggle("is-hidden", !open);
  }

  function toggleMoreSubpanel(buttonId, panelId, otherButtonId, otherPanelId) {
    const panel = $(panelId);
    const open = Boolean(panel && panel.classList.contains("is-hidden"));
    setSubpanel(otherButtonId, otherPanelId, false);
    setSubpanel(buttonId, panelId, open);
  }

  function closeMoreMenu() {
    const menu = $("live2d-more-menu");
    const more = $("live2d-more");
    if (menu) menu.classList.add("is-hidden");
    if (more) more.setAttribute("aria-expanded", "false");
    setSubpanel("live2d-model-toggle", "live2d-model-panel", false);
    setSubpanel("vts-details-toggle", "vts-connection-card", false);
  }

  function autoOpenWhenReady() {
    const tryOpen = () => {
      const deepLink = new URLSearchParams(location.search).get("live2d") === "1";
      const node = $("live2d-dock");
      if (node && (isEnabled() || deepLink)) openDock();
      else if (!node && controllerReady && window.PLLive2D) window.PLLive2D.hide();
    };
    tryOpen();
    const root = $("view-root");
    if (root) {
      const observer = new MutationObserver(tryOpen);
      observer.observe(root, { childList: true, subtree: false });
    }
  }

  /* Expose hub for chat.js state notifications (agent / voice). */
  window.PLLive2DHub = {
    setAgentState: (state) => { if (window.PLLive2D) window.PLLive2D.setAgentState(state); },
    setVoiceState: (state) => { if (window.PLLive2D) window.PLLive2D.setVoiceState(state); },
    setPersonaModel: (id) => { if (window.PLLive2D) window.PLLive2D.setPreferredModel(id); },
    open: () => openDock(),
    refreshLayout: () => requestAnimationFrame(() => {
      if (!controllerReady || !window.PLLive2D) return;
      window.PLLive2D.show();
      window.PLLive2D.resize();
    }),
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    bindStageResize();
    loadVtsConfig();
    autoOpenWhenReady();
  });
})();
