"use strict";

window.PL = window.PL || { modules: {} };

let currentCategory = "llm";
let providersData = [];

async function initProviders() {
  bindProvidersEvents();
  await loadProviders();
}

function bindProvidersEvents() {
  document.querySelectorAll(".providers-tab").forEach(btn => {
    btn.addEventListener("click", () => switchCategory(btn.dataset.category));
  });
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

function switchCategory(category) {
  currentCategory = category;
  document.querySelectorAll(".providers-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  renderProvidersByCategory(category);
}

function renderProvidersByCategory(category) {
  const gridEl = document.getElementById("providers-grid");
  if (!gridEl) return;
  const categoryProviders = providersData.filter(p => p.type === category);
  if (categoryProviders.length === 0) {
    gridEl.innerHTML = '<div class="providers-loading"><i data-lucide="inbox"></i><p>暂无提供商</p></div>';
    lucide.createIcons();
    return;
  }
  gridEl.innerHTML = categoryProviders.map(provider => {
    const activeClass = provider.is_active ? 'is-active' : '';
    const statusIcon = provider.is_configured ? 'check-circle' : 'circle';
    const statusText = provider.is_configured ? '已配置' : '未配置';
    const statusClass = provider.is_configured ? 'is-configured' : 'is-unconfigured';
    return `<article class="provider-card ${activeClass}" data-provider-id="${provider.id}">
      <div class="provider-card-header">
        <h3 class="provider-name">${escapeHtml(provider.name)}</h3>
        <label class="provider-toggle" onclick="event.stopPropagation()">
          <input type="checkbox" ${provider.is_active ? 'checked' : ''} ${!provider.is_configured ? 'disabled' : ''} data-provider-id="${provider.id}">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="provider-description">${escapeHtml(provider.description)}</p>
      <div class="provider-status ${statusClass}">
        <i data-lucide="${statusIcon}"></i>
        <span>${statusText}</span>
      </div>
    </article>`;
  }).join('');
  lucide.createIcons();
  gridEl.querySelectorAll(".provider-card").forEach(card => {
    card.addEventListener("click", () => openProviderConfig(card.dataset.providerId));
  });
  gridEl.querySelectorAll(".provider-toggle input").forEach(toggle => {
    toggle.addEventListener("change", (e) => handleToggleChange(e.target.dataset.providerId, e.target.checked));
  });
}

async function handleToggleChange(providerId, enabled) {
  const provider = providersData.find(p => p.id === providerId);
  if (!provider) return;
  try {
    const payload = {
      provider_type: provider.type,
      provider_id: providerId,
      enabled: enabled
    };
    const response = await fetch("/api/providers/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadProviders();
  } catch (error) {
    console.error("Failed to toggle provider:", error);
    alert(`切换失败: ${error.message}`);
    await loadProviders();
  }
}

function openProviderConfig(providerId) {
  const provider = providersData.find(p => p.id === providerId);
  if (!provider) return;
  const template = document.getElementById("provider-config-modal-template");
  if (!template) return;
  const modal = template.content.cloneNode(true).querySelector("[data-provider-modal]");
  const titleEl = modal.querySelector(".modal-title");
  if (titleEl) titleEl.textContent = provider.name;
  const descEl = modal.querySelector(".provider-description");
  if (descEl) descEl.textContent = provider.description;
  const form = modal.querySelector(".provider-config-form");
  const apiKeyInput = form.querySelector('[name="api_key"]');
  const baseUrlInput = form.querySelector('[name="base_url"]');
  const modelInput = form.querySelector('[name="model"]');
  
  // 填充已有配置值
  if (apiKeyInput) {
    apiKeyInput.value = provider.current_api_key || "";
    apiKeyInput.placeholder = "请输入 API Key";
  }
  if (baseUrlInput) {
    baseUrlInput.value = provider.current_base_url || "";
    baseUrlInput.placeholder = provider.default_base_url || "留空使用默认地址";
  }
  if (modelInput) {
    modelInput.value = provider.current_model || "";
    modelInput.placeholder = provider.default_model || "留空使用默认模型";
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
  // 已禁用点击外部关闭弹窗
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
      const latencyText = result.latency_ms ? `<span class="latency">${result.latency_ms}ms</span>` : '';
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
      enabled: true
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.PL.modules.providers = {
  init: initProviders,
  onShow: () => { if (providersData.length === 0) loadProviders(); }
};
