<script setup lang="ts">
import { Check, X, Settings, RefreshCw } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

interface Provider {
  id: string;
  name: string;
  type: string;
  description: string;
  default_base_url: string;
  default_model: string;
  requires_api_key: boolean;
  supports_streaming: boolean;
  is_configured: boolean;
  is_active: boolean;
}

interface ProviderConfig {
  provider_id: string;
  api_key?: string;
  base_url?: string;
  model?: string;
  is_active: boolean;
}

const providers = ref<Provider[]>([]);
const activeTab = ref<string>("llm");
const loading = ref(false);
const error = ref("");
const configuring = ref<string | null>(null);
const testing = ref<string | null>(null);

const configForm = ref<ProviderConfig>({
  provider_id: "",
  api_key: "",
  base_url: "",
  model: "",
  is_active: false,
});

const tabs = [
  { id: "llm", label: "大语言模型", count: 0 },
  { id: "embedding", label: "向量模型", count: 0 },
  { id: "tts", label: "语音合成", count: 0 },
  { id: "asr", label: "语音识别", count: 0 },
  { id: "reranker", label: "重排序", count: 0 },
  { id: "web_search", label: "网络搜索", count: 0 },
];

const filteredProviders = computed(() => 
  providers.value.filter(p => p.type === activeTab.value)
);

async function fetchProviders() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch("/api/providers/list");
    if (!response.ok) throw new Error(\HTTP \\);
    const data = await response.json();
    providers.value = data.providers || [];
    
    // 更新计数
    tabs.forEach(tab => {
      tab.count = providers.value.filter(p => p.type === tab.id).length;
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "加载失败";
  } finally {
    loading.value = false;
  }
}

function openConfig(provider: Provider) {
  configuring.value = provider.id;
  configForm.value = {
    provider_id: provider.id,
    api_key: "",
    base_url: provider.default_base_url,
    model: provider.default_model,
    is_active: provider.is_active,
  };
}

function closeConfig() {
  configuring.value = null;
  configForm.value = {
    provider_id: "",
    api_key: "",
    base_url: "",
    model: "",
    is_active: false,
  };
}

async function saveConfig() {
  if (!configForm.value.provider_id) return;
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch("/api/providers/configure", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-YUMENO-Request": "web" 
      },
      body: JSON.stringify(configForm.value),
    });
    if (!response.ok) throw new Error(\HTTP \\);
    await fetchProviders();
    closeConfig();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "配置失败";
  } finally {
    loading.value = false;
  }
}

async function testProvider(providerId: string) {
  testing.value = providerId;
  error.value = "";
  try {
    const provider = providers.value.find(p => p.id === providerId);
    if (!provider) return;
    
    const response = await fetch("/api/providers/test", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-YUMENO-Request": "web" 
      },
      body: JSON.stringify({
        provider_type: provider.type,
        provider_id: providerId,
      }),
    });
    if (!response.ok) throw new Error(\HTTP \\);
    const result = await response.json();
    if (result.success) {
      alert("✓ 测试成功");
    } else {
      alert("✗ 测试失败: " + (result.message || "未知错误"));
    }
  } catch (e) {
    alert("✗ 测试失败: " + (e instanceof Error ? e.message : "网络错误"));
  } finally {
    testing.value = null;
  }
}

onMounted(() => {
  void fetchProviders();
});
</script>

<template>
  <div class="providers-settings">
    <div class="settings-header">
      <h2>提供商配置</h2>
      <p class="settings-help">统一管理所有 AI 服务提供商的 API 配置</p>
    </div>

    <div class="provider-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading && providers.length === 0" class="loading-state">
      <RefreshCw :size="24" class="spin" />
      <p>加载中...</p>
    </div>

    <div v-else-if="error && providers.length === 0" class="error-state">
      <X :size="24" />
      <p>{{ error }}</p>
      <button class="button button-primary" @click="fetchProviders">重试</button>
    </div>

    <div v-else class="providers-grid">
      <div
        v-for="provider in filteredProviders"
        :key="provider.id"
        :class="['provider-card', { configured: provider.is_configured, active: provider.is_active }]"
      >
        <div class="provider-header">
          <div class="provider-title">
            <h3>{{ provider.name }}</h3>
            <div class="provider-badges">
              <span v-if="provider.is_active" class="badge badge-success">
                <Check :size="12" /> 激活
              </span>
              <span v-else-if="provider.is_configured" class="badge badge-info">已配置</span>
              <span v-else class="badge badge-default">未配置</span>
            </div>
          </div>
          <p class="provider-description">{{ provider.description }}</p>
        </div>

        <div class="provider-meta">
          <div v-if="provider.default_model" class="meta-item">
            <span class="meta-label">默认模型:</span>
            <code>{{ provider.default_model }}</code>
          </div>
          <div v-if="provider.requires_api_key" class="meta-item">
            <span class="meta-label">需要 API Key</span>
          </div>
        </div>

        <div class="provider-actions">
          <button
            class="button button-secondary"
            @click="openConfig(provider)"
            :disabled="configuring === provider.id"
          >
            <Settings :size="16" /> 配置
          </button>
          <button
            v-if="provider.is_configured"
            class="button button-primary"
            @click="testProvider(provider.id)"
            :disabled="testing === provider.id"
          >
            <RefreshCw :size="16" :class="{ spin: testing === provider.id }" />
            {{ testing === provider.id ? '测试中' : '测试连接' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 配置弹窗 -->
    <div v-if="configuring" class="modal-overlay" @click="closeConfig">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>配置 {{ providers.find(p => p.id === configuring)?.name }}</h3>
          <button class="modal-close" @click="closeConfig">×</button>
        </div>

        <form @submit.prevent="saveConfig" class="config-form">
          <label v-if="providers.find(p => p.id === configuring)?.requires_api_key" class="field">
            <span>API Key <span class="required">*</span></span>
            <input
              type="password"
              v-model="configForm.api_key"
              placeholder="输入 API Key"
              required
            />
          </label>

          <label class="field">
            <span>Base URL</span>
            <input
              type="url"
              v-model="configForm.base_url"
              :placeholder="providers.find(p => p.id === configuring)?.default_base_url"
            />
          </label>

          <label class="field">
            <span>模型名称</span>
            <input
              type="text"
              v-model="configForm.model"
              :placeholder="providers.find(p => p.id === configuring)?.default_model"
            />
          </label>

          <label class="field checkbox-field">
            <input type="checkbox" v-model="configForm.is_active" />
            <span>设为当前激活提供商</span>
          </label>

          <div class="modal-actions">
            <button type="button" class="button button-secondary" @click="closeConfig">取消</button>
            <button type="submit" class="button button-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>

        <p v-if="error" class="config-error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.providers-settings {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.settings-help {
  margin: 0 0 24px;
  color: var(--text-secondary, #666);
  font-size: 14px;
}

.provider-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  overflow-x: auto;
}

.tab-button {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--primary-color, #007AFF);
}

.tab-button.active {
  color: var(--primary-color, #007AFF);
  border-bottom-color: var(--primary-color, #007AFF);
}

.tab-count {
  padding: 2px 8px;
  background: var(--surface-secondary, #f5f5f5);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: var(--primary-light, #E3F2FF);
  color: var(--primary-color, #007AFF);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 12px;
  color: var(--text-secondary, #666);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.provider-card {
  padding: 20px;
  background: var(--surface-primary, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  transition: all 0.2s;
}

.provider-card:hover {
  border-color: var(--primary-color, #007AFF);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

.provider-card.active {
  border-color: var(--success-color, #34C759);
  background: var(--success-light, #F0FDF4);
}

.provider-header {
  margin-bottom: 16px;
}

.provider-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.provider-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.provider-badges {
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-success {
  background: var(--success-light, #D1FAE5);
  color: var(--success-color, #059669);
}

.badge-info {
  background: var(--info-light, #DBEAFE);
  color: var(--info-color, #3B82F6);
}

.badge-default {
  background: var(--surface-secondary, #f5f5f5);
  color: var(--text-secondary, #666);
}

.provider-description {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary, #666);
  line-height: 1.5;
}

.provider-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--surface-secondary, #f5f5f5);
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.meta-label {
  color: var(--text-secondary, #666);
}

.meta-item code {
  padding: 2px 6px;
  background: var(--surface-primary, #fff);
  border-radius: 4px;
  font-size: 11px;
}

.provider-actions {
  display: flex;
  gap: 8px;
}

.provider-actions button {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: var(--surface-primary, #fff);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--surface-secondary, #f5f5f5);
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--surface-tertiary, #e0e0e0);
}

.config-form {
  padding: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field span {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #000);
}

.required {
  color: var(--error-color, #FF3B30);
}

.field input[type="password"],
.field input[type="url"],
.field input[type="text"] {
  padding: 10px 12px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.field input:focus {
  outline: none;
  border-color: var(--primary-color, #007AFF);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

.config-error {
  margin: 16px 24px 24px;
  padding: 12px;
  background: var(--error-light, #FEE2E2);
  color: var(--error-color, #DC2626);
  border-radius: 8px;
  font-size: 13px;
}

.button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-primary {
  background: var(--primary-color, #007AFF);
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: var(--primary-dark, #0051D5);
}

.button-secondary {
  background: var(--surface-secondary, #f5f5f5);
  color: var(--text-primary, #000);
}

.button-secondary:hover:not(:disabled) {
  background: var(--surface-tertiary, #e0e0e0);
}
</style>
