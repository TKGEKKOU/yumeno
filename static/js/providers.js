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
function openProviderConfig(providerId) {
  const provider = providersData.find(p => p.id === providerId);
  if (!provider) return;
  const template = document.getElementById("provider-config-modal-template");
  if (!template) return;
  const modal = template.content.cloneNode(true).querySelector("[data-provider-modal]");
  const iconEl = modal.querySelector(".provider-icon");
  if (iconEl) iconEl.setAttribute("data-lucide", provider.icon || "box");
  const titleEl = modal.querySelector(".modal-title");
  if (titleEl) titleEl.textContent = provider.name;
  const descEl = modal.querySelector(".provider-description");
  if (descEl) descEl.textContent = provider.description;
  const form = modal.querySelector(".provider-config-form");
  const baseUrlInput = form.querySelector('[name="base_url"]');
  const modelInput = form.querySelector('[name="model"]');
  const activeCheckbox = form.querySelector('[name="is_active"]');
  if (baseUrlInput) baseUrlInput.placeholder = provider.default_base_url || "留空使用默认地址";
  if (modelInput) modelInput.placeholder = provider.default_model || "留空使用默认模型";
  if (activeCheckbox) activeCheckbox.checked = provider.is_active;
  const toggleBtn = modal.querySelector(".toggle-visibility");
  const apiKeyInput = form.querySelector('[name="api_key"]');
  if (toggleBtn && apiKeyInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = apiKeyInput.type === "password";
      apiKeyInput.type = isPassword ? "text" : "password";
      toggleBtn.querySelector("i").setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
      lucide.createIcons();
    });
  }
  if (!provider.requires_api_key) {
    const apiKeyField = form.querySelector('[name="api_key"]')?.closest(".field");
    if (apiKeyField) apiKeyField.style.display = "none";
  }
  const testBtn = modal.querySelector(".test-connection");
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const formData = new FormData(form);
      await testProviderConnection(provider, formData, modal);
    });
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    await saveProviderConfig(provider, formData, modal);
  });
  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  lucide.createIcons();
}

async function testProviderConnection(provider, formData, modal) {
  const testBtn = modal.querySelector(".test-connection");
  const resultEl = modal.querySelector(".test-result");
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i data-lucide="loader-circle" class="spin"></i> 测试中...';
    lucide.createIcons();
  }
  try {
    const payload = {
      provider_type: provider.type,
      provider_id: provider.id,
      api_key: formData.get("api_key") || null,
      base_url: formData.get("base_url") || provider.default_base_url,
      model: formData.get("model") || provider.default_model
    };
    const response = await fetch("/api/providers/test", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (resultEl) {
      resultEl.classList.remove("is-hidden", "is-success", "is-error");
      resultEl.classList.add(result.ok ? "is-success" : "is-error");
      const latencyText = result.latency_ms ? `<span class="latency">(${result.latency_ms}ms)</span>` : '';
      resultEl.innerHTML = `<i data-lucide="${result.ok ? 'check-circle' : 'alert-circle'}"></i><span>${result.message}</span>${latencyText}`;
      lucide.createIcons();
    }
  } catch (error) {
    if (resultEl) {
      resultEl.classList.remove("is-hidden", "is-success");
      resultEl.classList.add("is-error");
      resultEl.innerHTML = `<i data-lucide="alert-circle"></i><span>${error.message || '测试失败'}</span>`;
      lucide.createIcons();
    }
  } finally {
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i data-lucide="wifi"></i> 测试连接';
      lucide.createIcons();
    }
  }
}

async function saveProviderConfig(provider, formData, modal) {
  const submitBtn = modal.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "保存中...";
  }
  try {
    const payload = {
      provider_type: provider.type,
      provider_id: provider.id,
      api_key: formData.get("api_key") || null,
      base_url: formData.get("base_url") || null,
      model: formData.get("model") || null,
      enabled: formData.get("is_active") === "on"
    };
    const response = await fetch("/api/providers/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadProviders();
    modal.remove();
  } catch (error) {
    const resultEl = modal.querySelector(".test-result");
    if (resultEl) {
      resultEl.classList.remove("is-hidden", "is-success");
      resultEl.classList.add("is-error");
      resultEl.innerHTML = `<i data-lucide="alert-circle"></i><span>${error.message || '保存失败'}</span>`;
      lucide.createIcons();
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "保存配置";
    }
  }
}

async function testProvider(providerId) {
  const provider = providersData.find(p => p.id === providerId);
  if (!provider) return;
  const cardEl = document.querySelector(`[data-provider-id="${providerId}"]`);
  const testBtn = cardEl?.querySelector(".provider-test");
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i data-lucide="loader-circle" class="spin"></i> 测试中';
    lucide.createIcons();
  }
  try {
    const payload = { provider_type: provider.type, provider_id: providerId };
    const response = await fetch("/api/providers/test", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.ok) {
      alert(`✓ ${result.message}${result.latency_ms ? ` (${result.latency_ms}ms)` : ''}`);
    } else {
      alert(`✗ ${result.message}`);
    }
  } catch (error) {
    alert(`✗ 测试失败: ${error.message}`);
  } finally {
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i data-lucide="wifi"></i> 测试';
      lucide.createIcons();
    }
  }
}