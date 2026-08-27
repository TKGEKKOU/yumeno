<script setup lang="ts">
import { Check, X, Settings, RefreshCw, Power } from "lucide-vue-next";
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
  current_api_key: string;
  current_base_url: string;
  current_model: string;
}

interface ProviderConfig {
  provider_type: string;
  provider_id: string;
  api_key?: string;
  base_url?: string;
  model?: string;
  enabled: boolean;
}

const providers = ref<Provider[]>([]);
const activeTab = ref<string>("llm");
const loading = ref(false);
const error = ref("");
const configuring = ref<string | null>(null);
const testing = ref<string | null>(null);
const saveStatus = ref<string>("");

const configForm = ref<ProviderConfig>({
  provider_type: "",
  provider_id: "",
  api_key: "",
  base_url: "",
  model: "",
  enabled: false,
});

const tabs = [
  { id: "llm", label: "大语言模型", count: 0 },
  { id: "embedding", label: "向量模型", count: 0 },
  { id: "reranker", label: "重排序", count: 0 },
  { id: "stt", label: "语音转文字", count: 0 },
  { id: "tts", label: "文字转语音", count: 0 },
  { id: "web_search", label: "联网搜索", count: 0 },
];

const filteredProviders = computed(() => 
  providers.value.filter(p => p.type === activeTab.value)
);

async function fetchProviders() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch("/api/providers/list");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
  saveStatus.value = "";
  configForm.value = {
    provider_type: provider.type,
    provider_id: provider.id,
    api_key: provider.current_api_key || "",
    base_url: provider.current_base_url || provider.default_base_url,
    model: provider.current_model || provider.default_model,
    enabled: provider.is_active,
  };
}

function closeConfig() {
  configuring.value = null;
  saveStatus.value = "";
  configForm.value = {
    provider_type: "",
    provider_id: "",
    api_key: "",
    base_url: "",
    model: "",
    enabled: false,
  };
}

async function saveConfig() {
  if (!configForm.value.provider_id) return;
  loading.value = true;
  error.value = "";
  saveStatus.value = "";
  try {
    const response = await fetch("/api/providers/configure", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-YUMENO-Request": "web" 
      },
      body: JSON.stringify(configForm.value),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${response.status}`);
    }
    const result = await response.json();
    saveStatus.value = result.message || "配置已保存";
    await fetchProviders();
    setTimeout(closeConfig, 1500);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "配置失败";
  } finally {
    loading.value = false;
  }
}

async function toggleProvider(provider: Provider) {
  loading.value = true;
  error.value = "";
  try {
    const newEnabled = !provider.is_active;
    const response = await fetch("/api/providers/configure", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-YUMENO-Request": "web" 
      },
      body: JSON.stringify({
        provider_type: provider.type,
        provider_id: provider.id,
        api_key: provider.current_api_key,
        base_url: provider.current_base_url || provider.default_base_url,
        model: provider.current_model || provider.default_model,
        enabled: newEnabled,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await fetchProviders();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "切换失败";
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
        api_key: provider.current_api_key,
        base_url: provider.current_base_url,
        model: provider.current_model,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.ok) {
      alert(`✓ 连接成功 (${result.latency_ms}ms)`);
    } else {
      alert("✗ 连接失败: " + (result.message || "未知错误"));
    }
  } catch (e) {
    alert("✗ 连接失败: " + (e instanceof Error ? e.message : "网络错误"));
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
      <p class="settings-help">统一管理所有 AI 服务提供商，每个类别只能激活一个提供商</p>
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
            <button
              :class="['toggle-btn', { active: provider.is_active }]"
              @click="toggleProvider(provider)"
              :disabled="loading"
              :title="provider.is_active ? '停用' : '启用'"
            >
              <Power :size="16" />
            </button>
          </div>
          <p class="provider-description">{{ provider.description }}</p>
        </div>

        <div class="provider-meta">
          <div v-if="provider.default_model" class="meta-item">
            <span class="meta-label">默认模型:</span>
            <code>{{ provider.default_model }}</code>
          </div>
          <div v-if="provider.current_model && provider.current_model !== provider.default_model" class="meta-item">
            <span class="meta-label">当前模型:</span>
            <code>{{ provider.current_model }}</code>
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
            class="button button-test"
            @click="testProvider(provider.id)"
            :disabled="testing === provider.id"
          >
            <RefreshCw :size="16" :class="{ spin: testing === provider.id }" />
            {{ testing === provider.id ? '测试中' : '测试' }}
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
              type="text"
              v-model="configForm.api_key"
              placeholder="输入 API Key"
              required
            />
          </label>

          <label class="field">
            <span>Base URL</span>
            <input
              type="text"
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
            <input type="checkbox" v-model="configForm.enabled" />
            <span>设为当前激活提供商（会自动停用同类其他提供商）</span>
          </label>

          <div class="modal-actions">
            <button type="button" class="button button-secondary" @click="closeConfig">取消</button>
            <button type="submit" class="button button-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>

          <p v-if="saveStatus" class="config-success">{{ saveStatus }}</p>
          <p v-if="error" class="config-error">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.providers-settings {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.settings-header {
  margin-bottom: 32px;
  text-align: center;
}

.settings-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.settings-help {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.provider-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 12px;
  border-bottom: 2px solid #dee2e6;
  overflow-x: auto;
  justify-content: center;
}

.tab-button {
  padding: 10px 20px;
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.tab-button:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.tab-button.active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
}

.tab-count {
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  gap: 16px;
  color: #666;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.provider-card {
  padding: 24px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.2s;
}

.provider-card:hover {
  border-color: #007AFF;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.15);
  transform: translateY(-2px);
}

.provider-card.active {
  border-color: #34C759;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
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
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s;
}

.toggle-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.toggle-btn.active {
  background: #34C759;
  border-color: #34C759;
  color: white;
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.provider-description {
  margin: 0;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.5;
}

.provider-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.meta-label {
  color: #6c757d;
  font-weight: 500;
}

.meta-item code {
  padding: 3px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 11px;
  color: #495057;
}

.provider-actions {
  display: flex;
  gap: 10px;
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 20px;
  border-bottom: 2px solid #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s;
  line-height: 1;
}

.modal-close:hover {
  background: #e9ecef;
  color: #495057;
}

.config-form {
  padding: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.field > span {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.required {
  color: #FF3B30;
}

.field input[type="text"],
.field input[type="password"] {
  padding: 11px 14px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.field input:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.checkbox-field input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #007AFF;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

.config-success {
  margin: 16px 0 0;
  padding: 12px;
  background: #d1fae5;
  color: #059669;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
}

.config-error {
  margin: 16px 0 0;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.button {
  padding: 11px 18px;
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
  background: #007AFF;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: #0051D5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.button-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #dee2e6;
}

.button-secondary:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.button-test {
  background: #34C759;
  color: white;
}

.button-test:hover:not(:disabled) {
  background: #28a745;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}
</style>
