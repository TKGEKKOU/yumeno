<script setup lang="ts">
import { FolderOpen } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  cancelRerankerInstall,
  getRerankerStatus,
  installReranker,
  openRerankerDirectory,
  removeReranker,
  type RerankerStatus,
} from "./api";

const status = ref<RerankerStatus | null>(null);
const device = ref("auto");
const busy = ref(false);
const error = ref("");
const expanded = ref(false);
let timer: number | undefined;

const stateLabel = computed(() => {
  if (error.value) return "检查失败";
  if (!status.value) return "检查中";
  if (status.value.installing) return "安装中";
  if (status.value.ready) return "已就绪";
  if (status.value.installed) return "已安装，等待加载";
  return "未安装";
});

const statusDetail = computed(() => {
  if (error.value) return error.value;
  if (!status.value) return "正在读取本地模型状态";
  if (status.value.ready) return "本地精排可用；检索候选将经过语义重排序。";
  if (status.value.installed) return "模型文件完整，将在首次检索时加载。";
  return "未安装时系统自动使用 RRF 融合结果，不会阻断知识检索。";
});

const progressDetail = computed(() => {
  if (!status.value?.installing) return "";
  const phase = status.value.phase || "准备资源";
  const detail = status.value.current_file || phase;
  return `${detail} · ${Math.round(status.value.elapsed_seconds || 0)} 秒`;
});

async function refresh() {
  try {
    status.value = await getRerankerStatus();
    device.value = status.value.device || device.value;
    error.value = status.value.error || "";
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "无法读取 Reranker 状态";
  }
}

async function act(callback: () => Promise<RerankerStatus>) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    status.value = await callback();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "操作失败";
  } finally {
    busy.value = false;
  }
}

async function openDirectory() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await openRerankerDirectory();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : "无法打开模型目录";
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  void refresh();
  timer = window.setInterval(() => {
    if (status.value?.installing) void refresh();
  }, 1500);
});
onBeforeUnmount(() => { if (timer) window.clearInterval(timer); });
</script>

<template>
  <details class="panel settings-section" data-collapsible @toggle="expanded = ($event.currentTarget as HTMLDetailsElement).open">
    <summary class="settings-summary">
      <span class="settings-summary-title">
        <strong>Reranker 精排</strong>
        <span class="settings-summary-meta">候选重排序 · 本地模型 · RRF 自动降级</span>
      </span>
      <span class="section-toggle-label">{{ expanded ? '收起' : '展开' }}</span>
    </summary>
    <p class="settings-help">使用本地模型 <code>Qwen3-Reranker-0.6B</code> 对召回候选精排；模型未安装或暂不可用时，系统自动保留 RRF 融合结果。</p>
    <div class="asr-resource-bar">
      <div>
        <strong>{{ stateLabel }}</strong>
        <p class="inline-status" :class="{ 'is-error': Boolean(error) }" role="status" aria-live="polite">{{ statusDetail }}</p>
        <progress v-if="status?.installing" max="100"></progress>
        <p v-if="progressDetail" class="inline-status">{{ progressDetail }}</p>
      </div>
      <div class="asr-actions">
        <button class="button button-secondary" type="button" :disabled="busy" @click="openDirectory"><FolderOpen :size="16"/>打开目录</button>
        <button class="button button-danger" type="button" :disabled="busy || !status?.installed || status?.installing" @click="act(removeReranker)">删除</button>
        <button v-if="status?.installing" class="button button-secondary" type="button" :disabled="busy || status.cancelling" @click="act(cancelRerankerInstall)">取消下载</button>
        <button v-else class="button button-primary" type="button" :disabled="busy || status?.installed" @click="act(() => installReranker(device))">安装</button>
      </div>
    </div>
    <div class="settings-grid one-column reranker-settings-grid">
      <label class="field provider-field">
        <span>运行设备</span>
        <select v-model="device" :disabled="busy || status?.installing || status?.installed">
          <option value="auto">自动（GPU 优先）</option>
          <option value="cuda">仅 GPU</option>
          <option value="cpu">仅 CPU</option>
        </select>
      </label>
    </div>
    <details class="settings-help">
      <summary>参数说明</summary>
      <p>模型固定为 <code>Qwen/Qwen3-Reranker-0.6B</code>，从 ModelScope 下载。设备选择在安装时保存；需要更换设备时，删除后重新安装。</p>
    </details>
  </details>
</template>

<style scoped>
.reranker-settings-grid { margin-top: 18px; }
.asr-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
progress { width: min(360px, 100%); margin-top: 8px; }
</style>
