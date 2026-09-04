<script setup lang="ts">
import { Check, Download, ExternalLink, FolderOpen, Power, RefreshCw, Settings, Trash2, X } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

interface ResourceComponent {
  ready?: boolean;
  label?: string;
  path?: string;
  count?: number;
}

interface ResourceStatus {
  installed?: boolean;
  ready?: boolean;
  installing?: boolean;
  service_running?: boolean;
  model_id?: string;
  source?: string;
  device?: string;
  actual_device?: string;
  model_dir?: string;
  install_dir?: string;
  error?: string;
  phase?: string;
  install?: { installed?: boolean; installing?: boolean; service_running?: boolean; error?: string };
  components?: Record<string, ResourceComponent>;
  [key: string]: unknown;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  description: string;
  default_base_url: string;
  default_model: string;
  requires_api_key: boolean;
  supports_streaming: boolean;
  mode: "api" | "local";
  resource_kind?: string;
  resource_status?: ResourceStatus | null;
  runtime_supported: boolean;
  runtime_note: string;
  is_configured: boolean;
  is_active: boolean;
  current_api_key: string;
  current_base_url: string;
  current_model: string;
}

interface DownloadTask {
  task_id: string; provider_id: string; resource_kind?: string; resource_name?: string;
  status: string; phase?: string; progress_percent?: number | null;
  downloaded_bytes?: number; total_bytes?: number; speed_bytes_per_second?: number;
  eta_seconds?: number | null; current_file?: string; error_message?: string;
  retry_count?: number; updated_at?: string;
  [key: string]: unknown;
}

interface ProviderConfig {
  provider_type: string;
  provider_id: string;
  api_key?: string;
  base_url?: string;
  model?: string;
  source?: string;
  device?: string;
  enabled: boolean;
}

const providers = ref<Provider[]>([]);
const activeTab = ref<string>("llm");
const loading = ref(false);
const error = ref("");
const configuring = ref<string | null>(null);
const testing = ref<string | null>(null);
const resourceAction = ref<string | null>(null);
const saveStatus = ref("");
const testStatus = ref("");
const FIXED_GPT_SOVITS_URL = "https://huggingface.co/lj1995/GPT-SoVITS-windows-package/resolve/main/GPT-SoVITS-v3lora-20250228.7z?download=true";
const installUrl = ref(FIXED_GPT_SOVITS_URL);
const downloadTasks = ref<DownloadTask[]>([]);
const downloadsOpen = ref(false);
const rvcWorkspaceOpen = ref(false);
const downloadsLoading = ref(false);
let downloadsTimer: number | undefined;

const configForm = ref<ProviderConfig>({
  provider_type: "", provider_id: "", api_key: "", base_url: "", model: "",
  source: "modelscope", device: "auto", enabled: false,
});

const tabs = [
  { id: "llm", label: "对话模型", count: 0 },
  { id: "embedding", label: "知识库向量化", count: 0 },
  { id: "reranker", label: "检索重排", count: 0 },
  { id: "stt", label: "语音识别", count: 0 },
  { id: "tts", label: "对话语音", count: 0 },
  { id: "web_search", label: "联网搜索", count: 0 },
  { id: "audio", label: "音频", count: 0 },
];

const filteredProviders = computed(() => providers.value.filter(p => p.type === activeTab.value));
const rvcProvider = computed(() => providers.value.find(p => p.id === "rvc"));
const separatorProvider = computed(() => providers.value.find(p => p.id === "separator"));
const ffmpegStatus = ref<Record<string, unknown>>({});
const selectedProvider = computed(() => providers.value.find(p => p.id === configuring.value));
const resourceConfigKind = computed(() => {
  const id = selectedProvider.value?.id;
  if (id === "local_embedding") return "embedding";
  if (id === "local_rerank") return "reranker";
  if (id === "local_stt") return "stt";
  if (id === "gsv_tts_local") return "gpt_sovits";
  if (id === "separator") return "separator";
  return "none";
});
function resourceConfigHint() {
  switch (resourceConfigKind.value) {
    case "embedding": return "用于知识库向量化；安装前可选择模型来源和运行设备。";
    case "reranker": return "用于检索结果重排；未安装时仍可使用 RRF 融合，不会阻断检索。";
    case "stt": return "本地语音识别由系统按固定清单准备，不需要在此重复填写模型参数。";
    case "gpt_sovits": return "引擎按需启动；安装完成后，声音资产仍在“声音”模块管理。";
    case "separator": return "人声分离使用应用已验证的固定模型，不需要填写通用模型来源或设备。";
    default: return "";
  }
}


const resourceHandlers: Record<string, { status: string; install?: string; cancel?: string; remove?: string; directory?: string; start?: string; stop?: string }> = {
  local_embedding: { status: "/api/embedding/status", install: "/api/embedding/install", cancel: "/api/embedding/install/cancel", remove: "/api/embedding/model", directory: "/api/embedding/model-directory" },
  local_rerank: { status: "/api/reranker/status", install: "/api/reranker/install", cancel: "/api/reranker/install/cancel", remove: "/api/reranker/model", directory: "/api/reranker/model-directory" },
  local_stt: { status: "/api/stt/status", install: "/api/stt/install", cancel: "/api/stt/install/cancel", remove: "/api/stt/install", directory: "/api/stt/model-directory" },
  gsv_tts_local: { status: "/api/gpt-sovits/status", install: "/api/gpt-sovits/install", cancel: "/api/gpt-sovits/install/cancel", remove: "/api/gpt-sovits/install", directory: "/api/gpt-sovits/model-directory", start: "/api/gpt-sovits/service/start", stop: "/api/gpt-sovits/service/stop" },
  // RVC 是音色转换资源，不计入 TTS 供应商数量；后端未实现时由抽屉显示可读错误。
  rvc: { status: "/api/providers/rvc/status", install: "/api/providers/rvc/install", cancel: "/api/providers/rvc/install/cancel", remove: "/api/providers/rvc/install", directory: "/api/providers/rvc/directory" },
  separator: { status: "/api/providers/resources/separator", install: "/api/providers/resources/separator/install", cancel: "/api/providers/resources/tasks", remove: "/api/providers/resources/separator", directory: "/api/providers/resources/separator" },
};

function isActiveDownload(task: DownloadTask) {
  return ["queued", "preparing", "downloading", "verifying", "installing"].includes(task.status);
}
const activeDownloads = computed(() => downloadTasks.value.filter(isActiveDownload));
const finishedDownloadCount = computed(() => downloadTasks.value.filter(task => !isActiveDownload(task)).length);
function formatBytes(value?: number) {
  if (!value || value < 1024) return `${value || 0} B`;
  const units = ["KB", "MB", "GB", "TB"]; let n = value; let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}
function formatEta(value?: number | null) {
  if (value == null || value < 0) return "—";
  if (value < 60) return `${Math.round(value)} 秒`;
  return `${Math.floor(value / 60)} 分 ${Math.round(value % 60)} 秒`;
}
function taskStatusLabel(task: DownloadTask) {
  const labels: Record<string, string> = { queued: "排队中", preparing: "准备中", downloading: "下载中", verifying: "校验中", installing: "安装中", ready: "已完成", failed: "失败", cancelled: "已取消", interrupted: "已中断" };
  return labels[task.status] || task.status;
}
async function fetchDownloadTasks() {
  downloadsLoading.value = true;
  try {
    const response = await fetch("/api/resources/tasks?limit=30", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.tasks || data.items || []);
    downloadTasks.value = items.map((task: DownloadTask) => ({
      ...task,
      progress_percent: task.progress_percent ?? (typeof task.progress === "number" ? task.progress : 0),
      error_message: task.error_message ?? task.error,
      current_file: task.current_file ?? task.detail,
    }));
  } catch { /* 旧后端没有统一任务接口时，保留供应商状态显示 */ }
  finally { downloadsLoading.value = false; }
}
async function cancelDownload(task: DownloadTask) {
  try {
    await fetch(`/api/resources/tasks/${encodeURIComponent(task.task_id)}`, { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
    await fetchDownloadTasks();
  } catch (e) { error.value = e instanceof Error ? e.message : "取消下载失败"; }
}
async function clearFinishedDownloads() {
  try {
    const response = await fetch("/api/resources/tasks?finished=true", { method: "DELETE", headers: { "X-YUMENO-Request": "web" } });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || `HTTP ${response.status}`); }
    await fetchDownloadTasks();
  } catch (e) { error.value = e instanceof Error ? e.message : "清理下载记录失败"; }
}

async function retryDownload(task: DownloadTask) {
  try {
    const response = await fetch(`/api/resources/tasks/${encodeURIComponent(task.task_id)}/retry`, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" } });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || `HTTP ${response.status}`); }
    await fetchDownloadTasks();
  } catch (e) { error.value = e instanceof Error ? e.message : "重试下载失败"; }
}

async function fetchFfmpegStatus() {
  try {
    const response = await fetch("/api/providers/resources/ffmpeg/status", { headers: { "X-YUMENO-Request": "web" }, cache: "no-store" });
    if (response.ok) ffmpegStatus.value = await response.json();
  } catch { /* 音频资源接口不可用时保留已有状态 */ }
}
async function callFfmpeg(action: "install" | "remove" | "directory") {
  const urls = { install: "/api/providers/resources/ffmpeg/install", remove: "/api/providers/resources/ffmpeg", directory: "/api/providers/resources/ffmpeg/directory" };
  resourceAction.value = `ffmpeg:${action}`; error.value = "";
  try {
    const response = await fetch(urls[action], { method: action === "remove" ? "DELETE" : action === "directory" ? "GET" : "POST", headers: { "X-YUMENO-Request": "web" } });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || `HTTP ${response.status}`); }
    ffmpegStatus.value = await response.json();
  } catch (e) { error.value = e instanceof Error ? e.message : "FFmpeg 操作失败"; }
  finally { resourceAction.value = null; }
}

async function fetchProviders() {
  loading.value = true; error.value = "";
  try {
    const response = await fetch("/api/providers/list", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    providers.value = data.providers || [];
    await fetchFfmpegStatus();
    tabs.forEach(tab => { tab.count = providers.value.filter(p => p.type === tab.id).length; });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "加载失败";
  } finally { loading.value = false; }
}

function openConfig(provider: Provider) {
  if (provider.id === "rvc") {
    rvcWorkspaceOpen.value = true;
    void fetchProviders();
    return;
  }
  configuring.value = provider.id; saveStatus.value = ""; testStatus.value = ""; error.value = "";
  const status = provider.resource_status || {};
  configForm.value = {
    provider_type: provider.type, provider_id: provider.id,
    api_key: provider.current_api_key || "",
    base_url: provider.current_base_url || provider.default_base_url,
    model: provider.current_model || String(status.model_id || provider.default_model || ""),
    source: String(status.source || "modelscope"), device: String(status.device || "auto"),
    enabled: provider.is_active,
  };
  installUrl.value = FIXED_GPT_SOVITS_URL;
}

function closeRvcWorkspace() {
  rvcWorkspaceOpen.value = false;
  error.value = "";
}

function rvcComponent(key: string) {
  const components = rvcProvider.value?.resource_status?.components as Record<string, Record<string, unknown>> | undefined;
  return components?.[key] || {};
}
function rvcComponentReady(key: string) { return Boolean(rvcComponent(key).ready); }
function rvcComponentLabel(key: string) {
  return rvcComponentReady(key) ? "已就绪" : key === "indices" ? "可选" : "待准备";
}
function rvcProgressPercent() {
  const value = rvcProvider.value?.resource_status?.progress_percent;
  return typeof value === "number" ? Math.min(100, Math.max(0, value)) : 0;
}

function closeConfig() {
  configuring.value = null; saveStatus.value = ""; testStatus.value = ""; installUrl.value = "";
  configForm.value = { provider_type: "", provider_id: "", api_key: "", base_url: "", model: "", source: "modelscope", device: "auto", enabled: false }; installUrl.value = FIXED_GPT_SOVITS_URL;
}

async function saveConfig() {
  if (!configForm.value.provider_id) return;
  loading.value = true; error.value = ""; saveStatus.value = "";
  try {
    const response = await fetch("/api/providers/configure", {
      method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify(providerConfigPayload()),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${response.status}`);
    }
    const result = await response.json(); saveStatus.value = result.message || "配置已保存";
    await fetchProviders();
  } catch (e) { error.value = e instanceof Error ? e.message : "配置失败"; }
  finally { loading.value = false; }
}

function resourcePayload() {
  switch (resourceConfigKind.value) {
    case "embedding":
    case "reranker":
      return { model_id: configForm.value.model, source: configForm.value.source || "modelscope", device: configForm.value.device || "auto" };
    case "gpt_sovits": return { url: installUrl.value.trim() };
    default: return {};
  }
}
function providerConfigPayload() {
  const value = { ...configForm.value };
  if (selectedProvider.value?.mode === "local") {
    if (!["embedding", "reranker"].includes(resourceConfigKind.value)) {
      delete value.model; delete value.source; delete value.device;
    }
    delete value.api_key; delete value.base_url;
  }
  return value;
}

async function callResource(provider: Provider, action: "install" | "cancel" | "remove" | "directory" | "start" | "stop") {
  const handler = resourceHandlers[provider.id]; const url = handler?.[action];
  if (!url) return;
  resourceAction.value = `${provider.id}:${action}`; error.value = "";
  try {
    const method = action === "remove" || action === "cancel" ? "DELETE" : action === "directory" && provider.id === "rvc" ? "GET" : action === "install" || action === "directory" || action === "start" || action === "stop" ? "POST" : "GET";
    let body: string | undefined;
    if (action === "install") body = provider.id === "gsv_tts_local" ? JSON.stringify({ url: installUrl.value.trim() }) : provider.id === "local_stt" ? undefined : JSON.stringify(resourcePayload());
    let response: Response;
    if (action === "install" && provider.mode === "local") {
      const unifiedUrl = `/api/resources/${encodeURIComponent(provider.id)}/install`;
      response = await fetch(unifiedUrl, { method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body: JSON.stringify({ parameters: provider.id === "gsv_tts_local" ? { url: installUrl.value.trim() } : resourcePayload() }) });
      // 老版本后端没有统一资源路由时，回退到原 Provider 安装接口。
      if (response.status === 404 || response.status === 405) response = await fetch(url, { method, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body });
    } else {
      response = await fetch(url, { method, headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" }, body });
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({})); throw new Error(data.detail || `HTTP ${response.status}`);
    }
    await fetchProviders(); await fetchDownloadTasks();
  } catch (e) { error.value = e instanceof Error ? e.message : "资源操作失败"; }
  finally { resourceAction.value = null; }
}

async function toggleProvider(provider: Provider) {
  loading.value = true; error.value = "";
  try {
    const response = await fetch("/api/providers/configure", {
      method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify({ provider_type: provider.type, provider_id: provider.id, api_key: provider.current_api_key, base_url: provider.current_base_url || provider.default_base_url, model: provider.current_model || provider.default_model, source: provider.resource_status?.source, device: provider.resource_status?.device, enabled: !provider.is_active }),
    });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.detail || `HTTP ${response.status}`); }
    await fetchProviders();
  } catch (e) { error.value = e instanceof Error ? e.message : "切换失败"; }
  finally { loading.value = false; }
}

async function testProvider(provider: Provider) {
  testing.value = provider.id; error.value = ""; testStatus.value = "";
  try {
    const response = await fetch("/api/providers/test", {
      method: "POST", headers: { "Content-Type": "application/json", "X-YUMENO-Request": "web" },
      body: JSON.stringify({ provider_type: provider.type, provider_id: provider.id, api_key: provider.current_api_key, base_url: provider.current_base_url, model: provider.current_model }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    testStatus.value = result.ok ? `连接成功 · ${result.latency_ms}ms` : `连接失败 · ${result.message || "未知错误"}`;
  } catch (e) { testStatus.value = `连接失败 · ${e instanceof Error ? e.message : "网络错误"}`; }
  finally { testing.value = null; }
}

function resourceReady(provider: Provider) {
  const status = provider.resource_status || {};
  return Boolean(status.ready || status.service_running || status.installed || status.install?.installed);
}
function resourceInstalling(provider: Provider) {
  const status = provider.resource_status || {};
  return Boolean(status.installing || status.install?.installing);
}
function resourceLabel(provider: Provider) {
  if (resourceInstalling(provider)) return `安装中${provider.resource_status?.phase ? ` · ${provider.resource_status.phase}` : ""}`;
  if (provider.id === "gsv_tts_local" && provider.resource_status?.service_running) return "服务运行中";
  if (resourceReady(provider)) return "资源就绪";
  return "未安装";
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && configuring.value) closeConfig();
}

onMounted(() => {
  void fetchProviders(); void fetchDownloadTasks();
  downloadsTimer = window.setInterval(() => { void fetchDownloadTasks(); void fetchProviders(); void fetchFfmpegStatus(); }, 2500);
  window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
  if (downloadsTimer) window.clearInterval(downloadsTimer);
  window.removeEventListener("keydown", handleKeydown);
});
</script>


<template>
  <div class="providers-settings">
    <nav class="provider-tabs" role="tablist" aria-label="供应商类型">
      <button v-for="tab in tabs" :key="tab.id" :class="['tab-button', { active: activeTab === tab.id }]" role="tab" :aria-selected="activeTab === tab.id" @click="activeTab = tab.id">
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <section v-if="activeDownloads.length" class="download-center" aria-label="资源下载中心">
      <button class="download-summary" type="button" @click="downloadsOpen = true" :aria-expanded="downloadsOpen">
        <span class="download-summary-icon"><Download :size="16" :class="{ spin: activeDownloads.length > 0 }" /></span>
        <span class="download-summary-copy"><strong>{{ activeDownloads.length ? `正在处理 ${activeDownloads.length} 个资源` : '资源任务中心' }}</strong><span>{{ activeDownloads[0] ? `${activeDownloads[0].resource_name || activeDownloads[0].provider_id} · ${taskStatusLabel(activeDownloads[0])}` : '查看最近的安装、校验与失败记录' }}</span></span>
        <span class="download-summary-progress" v-if="activeDownloads[0]"><b>{{ Math.round(activeDownloads[0].progress_percent || 0) }}%</b><i><em :style="{ width: `${Math.min(100, Math.max(0, activeDownloads[0].progress_percent || 0))}%` }"></em></i></span>
        <span class="download-summary-arrow">查看详情 →</span>
      </button>
    </section>

    <div v-if="downloadsOpen" class="drawer-overlay" @click.self="downloadsOpen = false">
      <aside class="config-drawer download-drawer" role="dialog" aria-modal="true" aria-label="资源下载任务">
        <div class="drawer-header"><div><p class="eyebrow">RESOURCE TASKS</p><h3>下载中心</h3><p>只在有活动任务时显示入口；已结束任务可在这里重试或清理。</p></div><div class="drawer-header-actions"><button v-if="finishedDownloadCount" class="button button-quiet" type="button" @click="clearFinishedDownloads">清理已结束</button><button class="modal-close" type="button" @click="downloadsOpen = false" aria-label="关闭下载中心"><X :size="18" /></button></div></div>
        <div class="drawer-body download-list">
          <p v-if="downloadsLoading && !downloadTasks.length" class="empty-state">加载任务中…</p>
          <p v-else-if="!downloadTasks.length" class="empty-state">暂无资源任务</p>
          <article v-for="task in downloadTasks" :key="task.task_id" class="download-task" :class="`task-${task.status}`">
            <div class="download-task-head"><div><strong>{{ task.resource_name || task.provider_id }}</strong><span>{{ taskStatusLabel(task) }}<template v-if="task.phase"> · {{ task.phase }}</template></span></div><b>{{ task.progress_percent == null ? '—' : `${Math.round(task.progress_percent)}%` }}</b></div>
            <div class="task-progress"><i :style="{ width: `${Math.min(100, Math.max(0, task.progress_percent || 0))}%` }"></i></div>
            <div class="download-task-meta"><span v-if="task.current_file">当前文件：{{ task.current_file }}</span><span v-if="task.total_bytes">{{ formatBytes(task.downloaded_bytes) }} / {{ formatBytes(task.total_bytes) }}</span><span v-if="isActiveDownload(task)">速度 {{ formatBytes(task.speed_bytes_per_second) }}/秒 · 剩余 {{ formatEta(task.eta_seconds) }}</span><span v-if="task.error_message" class="task-error">{{ task.error_message }}</span></div>
            <div v-if="isActiveDownload(task)" class="download-task-actions"><button class="button button-secondary" type="button" @click="cancelDownload(task)">取消</button></div><div v-else-if="task.status === 'failed'" class="download-task-actions"><button class="button button-secondary" type="button" @click="retryDownload(task)"><RefreshCw :size="14" />重试</button></div>
          </article>
        </div>
      </aside>
    </div>

    <section v-if="activeTab === 'audio' && (rvcProvider || separatorProvider)" class="local-production-zone" aria-labelledby="local-production-title">
      <div class="section-heading"><div><span class="section-label">LOCAL AUDIO PRODUCTION</span><h3 id="local-production-title">本地音频生产</h3></div><span class="section-note">不参与角色对话，只用于素材处理和文件生成</span></div>
      <div class="production-grid">
        <article v-if="rvcProvider" class="production-card production-card-rvc">
          <div class="production-card-head"><div><span class="production-kicker">RVC</span><h3>RVC 音频生产</h3></div><span :class="['status-chip', { on: rvcProvider.resource_status?.ready }]">{{ rvcProvider.resource_status?.ready ? '可用于音频生产' : rvcProvider.resource_status?.installing ? '准备中' : '资源未就绪' }}</span></div>
          <p>使用已有音频和训练好的 .pth 音色模型生成新的变声音频文件。RVC 不作为 TTS，也不改变角色对话音色。</p>
          <div class="production-facts"><span>内置核心：{{ rvcProvider.resource_status?.components?.source?.ready ? '已就绪' : '待准备' }}</span><span>Hubert：{{ rvcProvider.resource_status?.hubert_ready ? '已就绪' : '待准备' }}</span><span>RMVPE：{{ rvcProvider.resource_status?.rmvpe_ready ? '已就绪' : '待准备' }}</span><span>模型由 RVC 页面管理</span></div>
          <div class="production-actions"><button class="button button-primary" type="button" @click="openConfig(rvcProvider)"><Settings :size="15" />管理 RVC 资源</button></div>
        </article>
        <article v-if="separatorProvider" class="production-card"><div class="production-card-head"><div><span class="production-kicker">COMMON AUDIO</span><h3>人声分离</h3></div><span :class="['status-chip', { on: separatorProvider.resource_status?.ready }]">{{ separatorProvider.resource_status?.ready ? '已就绪' : '待准备' }}</span></div><p>通用声音前处理资源，供 GPT-SoVITS 数据集流程和其他音频处理任务使用。</p><div class="production-actions"><button class="button button-secondary" type="button" @click="openConfig(separatorProvider)"><Settings :size="15" />管理人声分离</button></div></article>
        <article class="production-card production-card-ffmpeg"><div class="production-card-head"><div><span class="production-kicker">MEDIA RUNTIME</span><h3>FFmpeg</h3></div><span :class="['status-chip', { on: ffmpegStatus.ready }]">{{ ffmpegStatus.ready ? '可用' : '未安装' }}</span></div><p>音视频抽取、格式转换和声音工作流的基础运行时。使用独立受管副本，不复用 RVC 的来源或设备配置。</p><div class="production-facts"><span>受管副本：{{ ffmpegStatus.installed ? '已存在' : '未准备' }}</span><span>系统命令：{{ ffmpegStatus.system_path ? '已发现' : '未发现' }}</span></div><div class="production-actions"><button v-if="!ffmpegStatus.installed" class="button button-primary" type="button" @click="callFfmpeg('install')" :disabled="resourceAction !== null"><Download :size="15" />下载 FFmpeg</button><button v-else class="button button-secondary" type="button" @click="callFfmpeg('remove')" :disabled="resourceAction !== null"><Trash2 :size="15" />移除受管副本</button><button class="button button-secondary" type="button" @click="callFfmpeg('directory')" :disabled="resourceAction !== null"><FolderOpen :size="15" />打开目录</button></div></article>
      </div>
    </section>

    <main v-if="activeTab !== 'audio'" class="providers-main">
      <div v-if="loading && providers.length === 0" class="loading-state"><RefreshCw :size="22" class="spin" /><p>加载中...</p></div>
      <div v-else-if="error && providers.length === 0" class="error-state"><X :size="22" /><p>{{ error }}</p><button class="button button-primary" @click="fetchProviders">重试</button></div>
      <div v-else-if="filteredProviders.length === 0" class="empty-state"><p>这个分类暂时没有可用供应商。</p></div>
      <div v-else :class="['providers-grid', { compact: activeTab === 'llm' }]">
        <article v-for="provider in filteredProviders" :key="provider.type + ':' + provider.id" :class="['provider-card', { configured: provider.is_configured, active: provider.is_active, local: provider.mode === 'local' }]" tabindex="0" @click="openConfig(provider)" @keydown.enter="openConfig(provider)" @keydown.space.prevent="openConfig(provider)">
          <div class="provider-header"><div class="provider-title"><span class="provider-mark" :class="{ local: provider.mode === 'local' }"></span><h3>{{ provider.name }}</h3><span v-if="provider.mode === 'local'" class="mode-badge">本地</span><span v-else class="mode-badge api">API</span></div><span :class="['active-label', { on: provider.is_active }]">{{ provider.is_active ? '已启用' : provider.runtime_supported ? '可启用' : '仅配置' }}</span></div>
          <p class="provider-description">{{ provider.description }}</p>
          <div :class="['runtime-status', { supported: provider.runtime_supported }]" :title="provider.runtime_note"><span class="runtime-dot"></span>{{ provider.runtime_supported ? '已接入运行链路' : '暂未接入运行链路' }}</div>
          <div v-if="provider.mode === 'local'" class="provider-meta resource-meta"><span class="meta-label">资源状态</span><strong>{{ resourceLabel(provider) }}</strong><code>{{ provider.resource_status?.model_id || '尚未选择资源' }}</code></div>
          <div v-else-if="provider.type === 'web_search'" class="provider-meta"><span class="meta-label">搜索服务</span><code>{{ provider.name }}</code><span>{{ provider.current_api_key ? 'API Key 已配置' : '需要 API Key' }}</span></div><div v-else class="provider-meta"><span class="meta-label">当前模型</span><code>{{ provider.current_model || provider.default_model || '按接口默认' }}</code><span v-if="provider.current_base_url" class="meta-url">{{ provider.current_base_url }}</span></div>
          <footer class="provider-actions"><button class="button button-secondary" type="button" @click.stop="openConfig(provider)"><Settings :size="15" />配置</button><button v-if="provider.mode === 'api' && provider.is_configured && provider.runtime_supported" class="button button-test" type="button" @click.stop="testProvider(provider)" :disabled="testing === provider.id"><RefreshCw :size="15" :class="{ spin: testing === provider.id }" />{{ testing === provider.id ? '测试中' : '测试连接' }}</button><button v-if="provider.runtime_supported" :class="['button', provider.is_active ? 'button-active' : 'button-primary']" type="button" @click.stop="toggleProvider(provider)" :disabled="loading">{{ provider.is_active ? '停用' : '启用' }}</button></footer>
        </article>
      </div>
    </main>

    <div v-if="rvcWorkspaceOpen && rvcProvider" class="drawer-overlay" @click.self="closeRvcWorkspace">
      <aside class="config-drawer rvc-workspace-drawer" role="dialog" aria-modal="true" aria-label="RVC 音频生产资源管理">
        <div class="drawer-header"><div><p class="eyebrow">LOCAL AUDIO PRODUCTION / RVC</p><h3>RVC 音频生产</h3><p>只管理 RVC 音频到音频推理所需的运行时和模型，不参与角色对话或 TTS。</p></div><button class="modal-close" type="button" @click="closeRvcWorkspace" aria-label="关闭 RVC 管理"><X :size="18" /></button></div>
        <div class="drawer-body rvc-workspace-body">
          <div class="rvc-workspace-summary"><div><span class="section-label">推理可用性</span><strong>{{ rvcProvider.resource_status?.ready ? '可以开始生成变声音频' : '还需要补完资源' }}</strong></div><span :class="['status-chip', { on: rvcProvider.resource_status?.ready }]">{{ rvcProvider.resource_status?.ready ? 'READY' : 'INCOMPLETE' }}</span></div>
          <div class="rvc-component-list" aria-label="RVC 资源状态">
            <div v-for="item in [{ key: 'source', title: 'YUMENO 内置 RVC 核心', detail: '项目内置推理核心' }, { key: 'runtime', title: '独立 Python 运行时', detail: 'YUMENO/runtime/rvc' }, { key: 'hubert', title: 'Hubert 特征模型', detail: '用于音频特征提取' }, { key: 'rmvpe', title: 'RMVPE 音高模型', detail: '用于 F0 提取' }]" :key="item.key" class="rvc-component-row">
              <div class="rvc-component-icon"><Check v-if="rvcComponentReady(item.key)" :size="16" /><span v-else>·</span></div><div class="rvc-component-copy"><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></div><b :class="{ ready: rvcComponentReady(item.key) }">{{ rvcComponentLabel(item.key) }}</b>
            </div>
          </div>
          <div class="rvc-install-block"><div><strong>{{ rvcProvider.resource_status?.installing ? '正在准备 RVC 运行时' : '补完推理环境' }}</strong><p>{{ rvcProvider.resource_status?.detail || rvcProvider.resource_status?.note }}</p></div><div v-if="rvcProvider.resource_status?.installing" class="rvc-progress"><span>{{ Math.round(rvcProgressPercent()) }}%</span><i><em :style="{ width: `${rvcProgressPercent()}%` }"></em></i></div><div class="production-actions"><button v-if="rvcProvider.resource_status?.installing" class="button button-secondary" type="button" @click="callResource(rvcProvider, 'cancel')" :disabled="resourceAction !== null">取消准备</button><button v-else-if="!rvcProvider.resource_status?.ready" class="button button-primary" type="button" @click="callResource(rvcProvider, 'install')" :disabled="resourceAction !== null"><Download :size="15" />准备运行时与基础模型</button><button v-if="rvcProvider.resource_status?.ready" class="button button-secondary" type="button" @click="callResource(rvcProvider, 'remove')" :disabled="resourceAction !== null"><Trash2 :size="15" />移除 YUMENO 运行时</button><button class="button button-secondary" type="button" @click="callResource(rvcProvider, 'directory')" :disabled="resourceAction !== null"><FolderOpen :size="15" />查看资源目录</button></div></div>

          <p v-if="rvcProvider.resource_status?.error" class="config-error">{{ rvcProvider.resource_status.error }}</p><p v-if="error" class="config-error">{{ error }}</p>
          <div class="rvc-workspace-note"><strong>下一步</strong><span>将自己的 .pth 音色模型放入受管的 weights 目录；.index 文件不是必需项。完成后到独立的“RVC”页面上传音频并生成文件。</span></div>
        </div>
      </aside>
    </div>

    <div v-if="configuring" class="drawer-overlay" @click.self="closeConfig">
      <aside class="config-drawer" role="dialog" aria-modal="true" :aria-label="`配置 ${selectedProvider?.name || '供应商'}`">
        <div class="drawer-header"><div><p class="eyebrow">CONFIGURE</p><h3>{{ selectedProvider?.name }}</h3><p>{{ selectedProvider?.description }}</p></div><button class="modal-close" type="button" @click="closeConfig" aria-label="关闭配置"><X :size="18" /></button></div>
        <div class="drawer-body"><div class="drawer-status"><span :class="['status-chip', { on: selectedProvider?.is_active }]">{{ selectedProvider?.is_active ? '当前启用' : selectedProvider?.runtime_supported ? '可用' : '仅保存配置' }}</span><span>{{ selectedProvider?.mode === 'local' ? '本地资源' : 'API 接口' }}</span></div>
          <form @submit.prevent="saveConfig" class="config-form">
            <template v-if="selectedProvider?.mode === 'api' && selectedProvider?.type === 'web_search'"><div class="resource-config-intro"><span class="meta-label">搜索服务</span><p class="config-hint">为 Agent 提供实时互联网检索能力，不是模型配置。</p></div><label v-if="selectedProvider.requires_api_key" class="field"><span>搜索服务 API Key <span class="required">*</span></span><input type="password" v-model="configForm.api_key" placeholder="输入搜索服务 API Key" required autocomplete="off" /></label><label v-if="selectedProvider.id === 'custom_search'" class="field"><span>搜索接口地址</span><input type="url" v-model="configForm.base_url" placeholder="https://your-search-endpoint" /></label><div v-else class="resource-config-readonly"><span>接口地址</span><strong>{{ selectedProvider.id === 'tavily' ? 'Tavily 官方服务' : '博查官方服务' }}</strong></div></template><template v-else-if="selectedProvider?.mode === 'api'"><label v-if="selectedProvider.requires_api_key" class="field"><span>API Key <span class="required">*</span></span><input type="password" v-model="configForm.api_key" placeholder="输入 API Key" required autocomplete="off" /></label><label class="field"><span>服务接口地址</span><input type="url" v-model="configForm.base_url" :placeholder="selectedProvider.default_base_url" /></label><label class="field"><span>模型名称</span><input type="text" v-model="configForm.model" :placeholder="selectedProvider.default_model" /></label></template>
            <template v-else><div class="resource-config-intro"><span class="meta-label">资源配置</span><p v-if="resourceConfigHint()" class="config-hint">{{ resourceConfigHint() }}</p></div><template v-if="resourceConfigKind === 'embedding' || resourceConfigKind === 'reranker'"><label class="field"><span>{{ resourceConfigKind === 'embedding' ? '向量模型 ID' : '精排模型 ID' }}</span><input type="text" v-model="configForm.model" :placeholder="selectedProvider?.default_model" /></label><div class="form-row"><label class="field"><span>模型来源</span><select v-model="configForm.source"><option value="modelscope">ModelScope</option><option value="huggingface">Hugging Face</option></select></label><label class="field"><span>运行设备</span><select v-model="configForm.device"><option value="auto">自动（GPU 优先）</option><option value="cuda">CUDA</option><option value="cpu">CPU</option></select></label></div></template><div v-else-if="resourceConfigKind === 'gpt_sovits'" class="resource-install-form"><div class="resource-config-readonly"><span>固定运行环境</span><strong>GPT-SoVITS v3lora Windows 整合包</strong><small>应用内置下载源 · Hugging Face · 约 8 GB · 服务按需启动</small></div></div><div v-else-if="resourceConfigKind === 'stt'" class="resource-config-readonly"><span>固定资源清单</span><strong>Qwen3-ASR-0.6B + FFmpeg</strong></div><div v-else-if="resourceConfigKind === 'separator'" class="resource-config-readonly"><span>固定资源</span><strong>HT-Demucs 人声分离模型 · 约 165 MB</strong></div><div class="resource-controls"><div><span class="meta-label">资源状态</span><strong>{{ selectedProvider ? resourceLabel(selectedProvider) : '未知' }}</strong></div><div class="resource-control-actions"><button v-if="resourceInstalling(selectedProvider!)" type="button" class="button button-secondary" @click="callResource(selectedProvider!, 'cancel')" :disabled="resourceAction !== null">取消安装</button><button v-else-if="!resourceReady(selectedProvider!)" type="button" class="button button-primary" @click="callResource(selectedProvider!, 'install')" :disabled="resourceAction !== null || (selectedProvider?.id === 'gsv_tts_local' && !installUrl)"><Download :size="15" /> 安装运行环境</button><button v-if="resourceReady(selectedProvider!)" type="button" class="button button-secondary" @click="callResource(selectedProvider!, 'remove')" :disabled="resourceAction !== null"><Trash2 :size="15" /> 删除</button><button type="button" class="button button-secondary" @click="callResource(selectedProvider!, 'directory')" :disabled="resourceAction !== null"><FolderOpen :size="15" /> 打开目录</button><button v-if="selectedProvider?.id === 'gsv_tts_local' && selectedProvider.resource_status?.service_running" type="button" class="button button-secondary" @click="callResource(selectedProvider, 'stop')" :disabled="resourceAction !== null">停止服务</button><button v-else-if="selectedProvider?.id === 'gsv_tts_local' && resourceReady(selectedProvider)" type="button" class="button button-primary" @click="callResource(selectedProvider, 'start')" :disabled="resourceAction !== null"><ExternalLink :size="15" /> 启动服务</button></div></div></template>
            <label class="field checkbox-field"><input type="checkbox" v-model="configForm.enabled" :disabled="!selectedProvider?.runtime_supported" /><span>{{ selectedProvider?.type === 'web_search' ? '允许 Agent 联网搜索' : selectedProvider?.type === 'llm' ? '启用此对话模型' : selectedProvider?.type === 'embedding' ? '启用知识库向量化' : selectedProvider?.type === 'reranker' ? '启用检索重排' : selectedProvider?.type === 'stt' ? '启用语音识别' : selectedProvider?.type === 'tts' ? '启用对话语音' : '启用此服务' }}</span></label><p v-if="selectedProvider && !selectedProvider.runtime_supported" class="config-hint">当前运行时还没有这个 Provider 的适配器，因此这里只保存配置，不会自动调用。</p><div class="modal-actions"><button type="button" class="button button-secondary" @click="closeConfig">取消</button><button type="submit" class="button button-primary" :disabled="loading">{{ loading ? '保存中...' : '保存并应用' }}</button></div><p v-if="saveStatus" class="config-success"><Check :size="16" /> {{ saveStatus }}</p><p v-if="testStatus" :class="['config-message', testStatus.startsWith('连接成功') ? 'success' : 'error']">{{ testStatus }}</p><p v-if="error" class="config-error">{{ error }}</p>
          </form>
        </div>
      </aside>
    </div>
  </div>
</template><style scoped>
:global(*) { box-sizing: border-box; }
:global(.page-shell:has(.providers-settings)) { width:100%; max-width:none; margin:0; padding:0; }
.providers-settings { --ink:#142027; --muted:#71808a; --line:#d8e2e6; --paper:#f5f8f9; --cyan:#009fc6; --cyan-soft:#e9f8fb; --ok:#12745e; --danger:#b3261e; min-height:100%; width:100%; max-width:none; padding:36px clamp(24px,4vw,72px) 64px; color:var(--ink); background:var(--paper); background-image:linear-gradient(rgba(20,32,39,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(20,32,39,.028) 1px,transparent 1px); background-size:32px 32px; display:block; }
.settings-header { display:flex; align-items:end; justify-content:space-between; gap:24px; padding-bottom:22px; border-bottom:1px solid var(--ink); }
.eyebrow { margin:0 0 8px; color:var(--cyan); font:11px/1.2 "Cascadia Mono",Consolas,monospace; letter-spacing:.12em; }
.settings-header h2 { margin:0; font-size:clamp(25px,3vw,36px); line-height:1; letter-spacing:-.04em; font-weight:760; }
.settings-help { margin:10px 0 0; color:var(--muted); font-size:13px; }
.refresh-button { display:inline-flex; align-items:center; gap:8px; min-height:36px; padding:8px 12px; border:1px solid var(--line); background:#fff; color:var(--ink); cursor:pointer; font:12px inherit; }
.refresh-button:hover:not(:disabled) { border-color:var(--cyan); color:var(--cyan); }
.provider-tabs { position:sticky; top:0; z-index:10; display:flex; align-items:stretch; gap:0; margin:0 calc(-1 * clamp(24px,4vw,72px)) 34px; padding:0 clamp(24px,4vw,72px); border-bottom:1px solid var(--line); background:rgba(245,248,249,.94); backdrop-filter:blur(10px); }
.tab-button { appearance:none; display:flex; align-items:center; justify-content:center; gap:9px; min-height:52px; padding:0 16px; border:0; border-bottom:2px solid transparent; background:transparent; color:var(--muted); cursor:pointer; text-align:center; white-space:nowrap; font:13px inherit; }
.tab-button:hover { color:var(--ink); background:rgba(255,255,255,.62); }
.tab-button.active { border-bottom-color:var(--cyan); background:#fff; color:var(--ink); box-shadow:0 3px 0 var(--cyan); }

.local-production-zone { margin:0 0 42px; padding:24px; border:1px solid var(--line); background:linear-gradient(135deg,#fff,#eefafd); }.production-grid { display:grid; grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr); gap:18px; }.production-card { padding:22px; border:1px solid var(--line); background:#fff; }.production-card-rvc { border-color:#74cad8; box-shadow:0 12px 30px rgba(0,159,198,.08); }.production-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; }.production-card h3 { margin:4px 0 0; font-size:20px; }.production-kicker { color:var(--cyan); font:11px "Cascadia Mono",Consolas,monospace; letter-spacing:.12em; }.production-card p { max-width:66ch; color:var(--muted); font-size:13px; line-height:1.7; }.production-facts { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin:18px 0; color:var(--muted); font:11px "Cascadia Mono",Consolas,monospace; }.production-facts span { padding:10px; background:var(--paper); border:1px solid var(--line); }.production-actions { display:flex; flex-wrap:wrap; gap:8px; }
.providers-main { min-width:0; width:100%; }
.section-heading { display:flex; align-items:end; justify-content:space-between; gap:16px; margin-bottom:14px; }
.section-label { color:var(--cyan); font:11px "Cascadia Mono",Consolas,monospace; }
.section-heading h3 { margin:4px 0 0; font-size:19px; letter-spacing:-.02em; }
.section-note { color:var(--muted); font-size:12px; }
.providers-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:18px; }.providers-grid.compact { grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); gap:12px; }.providers-grid.compact .provider-card { padding:15px 16px; }.providers-grid.compact .provider-description { min-height:30px; margin:9px 0; }.providers-grid.compact .provider-meta { min-height:54px; margin-bottom:11px; }.providers-grid.compact .runtime-status { margin-bottom:10px; }
.provider-card { min-width:0; min-height:0; padding:22px; border:1px solid var(--line); background:#fff; cursor:pointer; transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.provider-card:hover, .provider-card:focus-visible { border-color:var(--cyan); outline:none; box-shadow:4px 4px 0 rgba(0,159,198,.17); transform:translateY(-2px); }
.provider-card.active { border-color:var(--ink); box-shadow:4px 4px 0 var(--cyan); }
.provider-card.local { background:linear-gradient(135deg,#fff,#f6fcfd); }
.provider-header { display:flex; align-items:start; justify-content:space-between; gap:12px; }
.provider-title { display:flex; align-items:center; gap:8px; min-width:0; }
.provider-mark { width:9px; height:9px; flex:0 0 9px; border:2px solid var(--cyan); transform:rotate(45deg); }
.provider-mark.local { border-color:#b153bd; }
.provider-title h3 { margin:0; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:16px; }
.mode-badge, .active-label, .status-chip { white-space:nowrap; font:10px "Cascadia Mono",Consolas,monospace; }
.mode-badge { padding:3px 6px; border:1px solid #b153bd; color:#93419c; }
.mode-badge.api { border-color:var(--line); color:var(--muted); }
.active-label { color:var(--muted); }.active-label.on { color:var(--ok); }
.provider-description { min-height:38px; margin:13px 0 12px; color:var(--muted); font-size:12px; line-height:1.55; }
.runtime-status { display:flex; align-items:center; gap:7px; margin-bottom:14px; color:#9a716b; font:11px "Cascadia Mono",Consolas,monospace; }.runtime-status.supported { color:var(--ok); }
.runtime-dot { width:7px; height:7px; border-radius:50%; background:currentColor; }.provider-meta { display:grid; gap:5px; min-height:68px; margin-bottom:16px; padding:11px 12px; border:1px solid var(--line); background:#fbfdfd; }.meta-label { color:var(--muted); font-size:11px; }.provider-meta code, .meta-url { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--ink); font:11px "Cascadia Mono",Consolas,monospace; }.meta-url { color:var(--muted); }.resource-meta strong { font-size:12px; }.provider-actions, .resource-control-actions, .modal-actions { display:flex; flex-wrap:wrap; gap:8px; }.provider-actions .button { flex:1 1 100px; }
.button { min-height:36px; padding:8px 12px; border:1px solid var(--ink); background:#fff; color:var(--ink); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:7px; font:12px inherit; transition:background .18s ease,color .18s ease,border-color .18s ease; }.button:hover:not(:disabled) { border-color:var(--cyan); }.button:disabled { opacity:.45; cursor:not-allowed; }.button-primary { background:var(--ink); color:#fff; }.button-primary:hover:not(:disabled) { background:var(--cyan); border-color:var(--cyan); }.button-secondary { border-color:var(--line); }.button-test { background:var(--cyan-soft); color:#087a9a; border-color:var(--cyan); }.button-active { color:var(--ok); border-color:#9bcfbe; background:#effaf6; }
.button:focus-visible, .tab-button:focus-visible, .refresh-button:focus-visible, .modal-close:focus-visible, input:focus-visible, select:focus-visible, .provider-card:focus-visible { outline:2px solid var(--cyan); outline-offset:2px; }
.loading-state,.error-state,.empty-state { min-height:260px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--muted); }.empty-state { border:1px dashed var(--line); }
.spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
.drawer-overlay { position:fixed; inset:0; z-index:1000; display:flex; justify-content:flex-end; background:rgba(17,28,34,.34); animation:fade-in .16s ease; }.config-drawer { width:min(560px,100%); height:100%; overflow:auto; background:#fff; border-left:1px solid var(--ink); box-shadow:-16px 0 40px rgba(16,40,48,.16); animation:slide-in .2s ease; }.drawer-header { display:flex; justify-content:space-between; gap:20px; padding:28px 30px 22px; border-bottom:1px solid var(--ink); }.drawer-header h3 { margin:0; font-size:22px; letter-spacing:-.03em; }.drawer-header p:last-child { max-width:40ch; margin:9px 0 0; color:var(--muted); font-size:12px; line-height:1.5; }.modal-close { display:grid; place-items:center; width:28px; height:28px; flex:0 0 34px; border:1px solid var(--line); background:#fff; color:var(--ink); cursor:pointer; }.drawer-body { padding:18px 30px 36px; }.drawer-status { display:flex; align-items:center; gap:10px; margin-bottom:20px; color:var(--muted); font:11px "Cascadia Mono",Consolas,monospace; }.status-chip { padding:4px 7px; border:1px solid var(--line); }.status-chip.on { color:var(--ok); border-color:#9bcfbe; background:#effaf6; }
.config-form { padding:0; }.field { display:flex; flex-direction:column; gap:7px; margin-bottom:18px; }.field > span { color:var(--muted); font-size:12px; }.required { color:var(--danger); }.field input[type=text],.field input[type=password],.field select { width:100%; padding:11px 12px; border:1px solid var(--line); background:#fbfcfc; color:var(--ink); font:13px inherit; }.field input:focus,.field select:focus { border-color:var(--cyan); outline:none; }.form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }.checkbox-field { flex-direction:row; align-items:center; gap:9px; padding:14px 0; border-top:1px solid var(--line); }.checkbox-field input { width:16px; height:16px; accent-color:var(--cyan); }.resource-controls { margin:5px 0 22px; padding:13px; border:1px solid var(--line); background:#fbfcfc; }.resource-controls > div:first-child { display:flex; justify-content:space-between; align-items:center; gap:12px; }.resource-control-actions { margin-top:12px; }.config-success,.config-error,.config-message { display:flex; align-items:center; gap:7px; margin:15px 0 0; padding:11px 12px; font-size:12px; }.config-success,.config-message.success { color:var(--ok); background:#effaf6; border:1px solid #b9e5d6; }.config-error,.config-message.error { color:var(--danger); background:#fff5f4; border:1px solid #ecc2bf; }.config-hint { margin:7px 0 18px; color:var(--muted); font-size:11px; line-height:1.5; }
.rvc-workspace-drawer { width:min(680px,100%); }.rvc-workspace-body { background:linear-gradient(180deg,#fff 0%,#f8fcfd 100%); }.rvc-workspace-summary { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:18px; margin-bottom:18px; border:1px solid #b9e5ed; background:#f2fbfd; }.rvc-workspace-summary div { display:flex; flex-direction:column; gap:6px; }.rvc-workspace-summary strong { font-size:17px; }.rvc-component-list { border-top:1px solid var(--line); }.rvc-component-row { display:grid; grid-template-columns:28px 1fr auto; align-items:center; gap:12px; min-height:68px; padding:10px 0; border-bottom:1px solid var(--line); }.rvc-component-icon { display:grid; place-items:center; width:26px; height:26px; border:1px solid var(--line); color:var(--muted); }.rvc-component-copy { display:flex; flex-direction:column; gap:4px; min-width:0; }.rvc-component-copy strong { font-size:13px; }.rvc-component-copy span { color:var(--muted); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.rvc-component-row b { color:var(--muted); font:11px monospace; }.rvc-component-row b.ready { color:var(--ok); }.rvc-install-block { margin-top:22px; padding:16px; border:1px solid var(--line); background:#fff; }
.rvc-install-block > div:first-child { display:flex; flex-direction:column; gap:6px; }.rvc-install-block p { margin:0; color:var(--muted); font-size:12px; line-height:1.5; }.rvc-progress { display:flex!important; flex-direction:row!important; align-items:center; gap:10px; margin-top:16px; font:12px monospace; }.rvc-progress i { display:block; height:6px; flex:1; background:#dff1f4; overflow:hidden; }.rvc-progress em { display:block; height:100%; background:var(--cyan); transition:width .3s ease; }.rvc-install-block .production-actions { margin-top:16px; }.rvc-workspace-note { display:flex; gap:10px; margin-top:18px; padding:12px; border-left:2px solid #b976d9; background:#fbf6fd; color:var(--muted); font-size:11px; line-height:1.55; }.rvc-workspace-note strong { color:#8b4da8; white-space:nowrap; }
@keyframes fade-in { from { opacity:0; } to { opacity:1; } } @keyframes slide-in { from { transform:translateX(24px); } to { transform:translateX(0); } }
@media (max-width:900px) { .production-grid { grid-template-columns:1fr; }.production-facts { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:760px) { .providers-settings { padding:22px 16px 34px; background-size:24px 24px; }.settings-header { align-items:start; margin-bottom:22px; }.provider-tabs { position:sticky; top:0; margin:0 -16px 25px; padding:0 10px; flex-wrap:wrap; }.tab-button { flex:1 1 33%; min-height:46px; padding:0 7px; font-size:11px; }.providers-grid,.providers-grid.compact { grid-template-columns:1fr; }.section-note { display:none; }.drawer-overlay { justify-content:stretch; }.config-drawer { width:100%; border-left:0; }.drawer-header,.drawer-body { padding-left:20px; padding-right:20px; }.form-row { grid-template-columns:1fr; gap:0; } }
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; scroll-behavior:auto!important; } }

.download-center { margin:0 auto 28px; max-width:1180px; }.download-summary { width:100%; display:flex; align-items:center; gap:14px; padding:9px 12px; border:1px solid var(--cyan); background:linear-gradient(100deg,#f0fbfd,#fff 65%); color:var(--ink); text-align:left; cursor:pointer; }.download-summary:hover { box-shadow:0 8px 24px rgba(0,150,190,.10); }.download-summary-icon { display:grid; place-items:center; width:34px; height:34px; color:#0785a3; border:1px solid #8ed8e5; }.download-summary-copy { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1; }.download-summary-copy strong { font-size:13px; }.download-summary-copy span { color:var(--muted); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.download-summary-progress { width:130px; display:flex; align-items:center; gap:8px; font:11px monospace; }.download-summary-progress i,.task-progress { display:block; overflow:hidden; height:5px; flex:1; background:#dff1f4; }.download-summary-progress em,.task-progress i { display:block; height:100%; background:var(--cyan); transition:width .3s ease; }.download-summary-arrow { color:#087a9a; font-size:11px; white-space:nowrap; }.download-drawer { width:min(620px,100%); }.download-list { display:flex; flex-direction:column; gap:12px; }.download-task { padding:15px; border:1px solid var(--line); background:#fbfcfc; }.download-task-head { display:flex; justify-content:space-between; gap:12px; }.download-task-head div { display:flex; flex-direction:column; gap:5px; }.download-task-head span,.download-task-meta { color:var(--muted); font-size:11px; }.download-task-head b { color:#0785a3; font:14px monospace; }.task-progress { margin:12px 0 10px; height:6px; }.download-task-meta { display:flex; flex-wrap:wrap; gap:5px 14px; line-height:1.5; }.task-error { color:var(--danger); flex-basis:100%; }.download-task-actions { display:flex; justify-content:flex-end; margin-top:12px; }.task-ready .download-task-head b { color:var(--ok); }.task-failed { border-color:#ecc2bf; background:#fffafa; }
</style>

<style>
.providers-settings .resource-config-intro { margin: 2px 0 14px; padding: 12px 14px; border: 1px solid var(--line); background: var(--paper); }
.providers-settings .resource-config-intro .config-hint { margin: 5px 0 0; }
.providers-settings .resource-config-readonly { display: grid; gap: 5px; margin: 4px 0 16px; padding: 13px 14px; border: 1px solid var(--line); background: #fbfdfd; }
.providers-settings .resource-config-readonly span { color: var(--muted); font-size: 11px; }
.providers-settings .resource-config-readonly strong { font-size: 13px; font-weight: 650; }
</style>
