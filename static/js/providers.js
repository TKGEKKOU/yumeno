"use strict";

window.PL = window.PL || { modules: {} };

let currentCategory = "llm";
let providersData = [];
let currentSettings = {};

const CATEGORY_LABELS = {
  llm: "LLM",
  embedding: "嵌入 (Embedding)",
  reranker: "重排序 (Reranker)",
  stt: "语音转文字 (STT)",
  tts: "文字转语音 (TTS)",
  web_search: "联网搜索"
};

async function initProviders() {
  bindProvidersEvents();
  await loadProviders();
}

function bindProvidersEvents() {
  document.querySelectorAll(".category-nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchCategory(btn.dataset.category));
  });
  const refreshBtn = document.getElementById("providers-refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", () => loadProviders());
}

async function loadProviders() {
  const loadingEl = document.getElementById("providers-loading");
  const errorEl = document.getElementById("providers-error");
  const gridEl = document.getElementById("providers-grid");
  if (loadingEl) loadingEl.classList.remove("is-hidden");
  if (errorEl) errorEl.classList.add("is-hidden");
  if (gridEl) gridEl.innerHTML = "";
  try {
    const response = await fetch("/api/providers/list");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    providersData = data.providers || [];
    updateCategoryCounts();
    renderProvidersByCategory(currentCategory);
    if (loadingEl) loadingEl.classList.add("is-hidden");
  } catch (error) {
    console.error("Failed to load providers:", error);
    if (loadingEl) loadingEl.classList.add("is-hidden");
    if (errorEl) {
      errorEl.classList.remove("is-hidden");
      const msgEl = errorEl.querySelector(".error-message");
      if (msgEl) msgEl.textContent = error.message || "加载失败";
    }
  }
}

function updateCategoryCounts() {
  const counts = {};
  providersData.forEach(p => counts[p.type] = (counts[p.type] || 0) + 1);
  document.querySelectorAll(".category-nav-item").forEach(btn => {
    const category = btn.dataset.category;
    const countEl = btn.querySelector(".category-count");
    if (countEl) countEl.textContent = counts[category] || 0;
  });
}

function switchCategory(category) {
  currentCategory = category;
  document.querySelectorAll(".category-nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  const breadcrumbEl = document.querySelector(".breadcrumb-category");
  if (breadcrumbEl) breadcrumbEl.textContent = CATEGORY_LABELS[category] || category;
  const countEl = document.querySelector(".breadcrumb-count strong");
  const categoryProviders = providersData.filter(p => p.type === category);
  if (countEl) countEl.textContent = categoryProviders.length;
  renderProvidersByCategory(category);
}
function renderProvidersByCategory(category) {
  const gridEl = document.getElementById("providers-grid");
  if (!gridEl) return;
  const categoryProviders = providersData.filter(p => p.type === category);
  if (categoryProviders.length === 0) {
    gridEl.innerHTML = '<div class="providers-empty"><i data-lucide="inbox"></i><p>暂无提供商</p></div>';
    lucide.createIcons();
    return;
  }
  gridEl.innerHTML = categoryProviders.map(provider => {
    const activeClass = provider.is_active ? 'is-active' : '';
    const configuredClass = provider.is_configured ? 'is-configured' : '';
    const icon = provider.icon || 'box';
    const activeBadge = provider.is_active ? '<span class="badge badge-success"><i data-lucide="check"></i> 激活</span>' : '';
    const configuredBadge = provider.is_configured && !provider.is_active ? '<span class="badge badge-info">已配置</span>' : '';
    const unconfiguredBadge = !provider.is_configured ? '<span class="badge badge-default">未配置</span>' : '';
    const modelMeta = provider.default_model ? `<div class="meta-item"><span class="meta-label">默认模型:</span><code>${escapeHtml(provider.default_model)}</code></div>` : '';
    const keyMeta = provider.requires_api_key ? '<div class="meta-item"><i data-lucide="key"></i><span>需要 API Key</span></div>' : '<div class="meta-item"><i data-lucide="unlock"></i><span>无需密钥</span></div>';
    const testButton = provider.is_configured ? `<button class="button button-primary provider-test" data-provider-id="${provider.id}"><i data-lucide="wifi"></i> 测试</button>` : '';
    return `<article class="provider-card ${activeClass} ${configuredClass}" data-provider-id="${provider.id}">
      <div class="provider-card-header">
        <div class="provider-icon-wrapper"><i data-lucide="${icon}" class="provider-icon"></i></div>
        <div class="provider-title-group">
          <h3 class="provider-name">${escapeHtml(provider.name)}</h3>
          <div class="provider-badges">${activeBadge}${configuredBadge}${unconfiguredBadge}</div>
        </div>
      </div>
      <p class="provider-description">${escapeHtml(provider.description)}</p>
      <div class="provider-meta">${modelMeta}${keyMeta}</div>
      <div class="provider-actions">
        <button class="button button-secondary provider-configure" data-provider-id="${provider.id}"><i data-lucide="settings"></i> 配置</button>
        ${testButton}
      </div>
    </article>`;
  }).join('');
  lucide.createIcons();
  gridEl.querySelectorAll(".provider-configure").forEach(btn => {
    btn.addEventListener("click", () => openProviderConfig(btn.dataset.providerId));
  });
  gridEl.querySelectorAll(".provider-test").forEach(btn => {
    btn.addEventListener("click", () => testProvider(btn.dataset.providerId));
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.PL.modules.providers = {
  init: initProviders,
  onShow: () => { if (providersData.length === 0) loadProviders(); }
};