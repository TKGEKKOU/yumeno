<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Archive, Check, Clock3, GitBranch, Plus, RefreshCw, RotateCcw, Send, X } from "lucide-vue-next";
import { ApiError, createPersonaVersion, getPersonaVersion, listPersonaVersions, publishPersonaVersion, rollbackPersonaVersion } from "../api";
import type { PersonaVersion, PersonaVersionStatus, PersonaVersionSummary } from "../types";

const props = defineProps<{ personaId: string; personaName?: string; disabled?: boolean }>();
const emit = defineEmits<{ close: []; changed: [version: PersonaVersion] }>();

const versions = ref<PersonaVersionSummary[]>([]);
const selectedId = ref("");
const selectedVersion = ref<PersonaVersion | null>(null);
const loading = ref(false);
const detailLoading = ref(false);
const pendingId = ref("");
const error = ref("");
const createOpen = ref(false);
const label = ref("");
const note = ref("");
let requestSequence = 0;

const busy = computed(() => loading.value || detailLoading.value || Boolean(pendingId.value));
const selectedSummary = computed(() => versions.value.find((item) => item.id === selectedId.value));
const selectedSnapshot = computed(() => selectedVersion.value?.snapshot);
const capabilityCount = computed(() => Object.keys(selectedSnapshot.value?.capability_overrides || {}).length);
const documentCount = computed(() => selectedSnapshot.value?.document_ids?.length || 0);
const serverNames = computed(() => selectedSnapshot.value?.mcp_server_names || []);

function statusLabel(status: PersonaVersionStatus) {
  return ({ draft: "草稿", published: "已发布", superseded: "已替代", archived: "已归档" } as Record<string, string>)[status] || status;
}

function statusClass(status: PersonaVersionStatus) {
  return `is-${status}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError && reason.status === 404) return "版本接口尚未启用，请先启用角色版本 API。";
  return reason instanceof Error ? reason.message : String(reason);
}

async function loadVersions() {
  const sequence = ++requestSequence;
  versions.value = [];
  selectedId.value = "";
  selectedVersion.value = null;
  error.value = "";
  if (!props.personaId) return;
  loading.value = true;
  try {
    const result = await listPersonaVersions(props.personaId);
    if (sequence !== requestSequence) return;
    versions.value = result;
    if (result.length) await selectVersion(result[0].id, sequence);
  } catch (reason) {
    if (sequence === requestSequence) error.value = errorMessage(reason);
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

async function selectVersion(id: string, sequence = requestSequence) {
  selectedId.value = id;
  selectedVersion.value = null;
  error.value = "";
  detailLoading.value = true;
  try {
    const result = await getPersonaVersion(props.personaId, id);
    if (sequence === requestSequence) selectedVersion.value = result;
  } catch (reason) {
    if (sequence === requestSequence) error.value = errorMessage(reason);
  } finally {
    if (sequence === requestSequence) detailLoading.value = false;
  }
}

function openCreate() {
  if (props.disabled || busy.value) return;
  createOpen.value = true;
  label.value = `版本 ${Math.max(versions.value[0]?.version_number || 0, 0) + 1}`;
  note.value = "";
}

function closeCreate() {
  if (pendingId.value) return;
  createOpen.value = false;
}

async function createVersion() {
  if (props.disabled || busy.value) return;
  pendingId.value = "create";
  error.value = "";
  try {
    const created = await createPersonaVersion(props.personaId, { label: label.value, note: note.value });
    createOpen.value = false;
    versions.value = [created, ...versions.value.filter((item) => item.id !== created.id)];
    selectedId.value = created.id;
    selectedVersion.value = created;
    emit("changed", created);
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    pendingId.value = "";
  }
}

function replaceSummary(version: PersonaVersion) {
  versions.value = versions.value.map((item) => item.id === version.id ? version : item);
  selectedId.value = version.id;
  selectedVersion.value = version;
}

async function activateVersion(action: "publish" | "rollback") {
  const id = selectedId.value;
  if (!id || props.disabled || busy.value) return;
  if (action === "rollback" && !window.confirm("确定回滚到这个角色版本？当前未保存的运行配置不会自动保留。")) return;
  pendingId.value = id;
  error.value = "";
  try {
    const updated = action === "publish"
      ? await publishPersonaVersion(props.personaId, id)
      : await rollbackPersonaVersion(props.personaId, id);
    replaceSummary(updated);
    emit("changed", updated);
    await loadVersions();
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    pendingId.value = "";
  }
}

watch(() => props.personaId, () => { void loadVersions(); }, { immediate: true });
</script>

<template>
  <div class="version-panel-layer">
    <button type="button" class="version-panel-backdrop" aria-label="关闭版本面板" @click="emit('close')"></button>
    <section class="version-panel" role="dialog" aria-modal="true" aria-labelledby="version-panel-title">
      <header class="version-panel-header">
        <div>
          <span class="version-panel-kicker"><GitBranch :size="13"/>运行版本</span>
          <h2 id="version-panel-title">{{ personaName || '当前角色' }}</h2>
          <p>保存和切换角色的运行配置</p>
        </div>
        <button type="button" class="icon-button" aria-label="关闭版本面板" @click="emit('close')"><X :size="17"/></button>
      </header>

      <p v-if="error" class="version-message is-error">{{ error }}</p>
      <div class="version-panel-toolbar">
        <span>{{ versions.length ? `${versions.length} 个版本` : '版本历史' }}</span>
        <div>
          <button type="button" class="text-button" :disabled="busy" @click="loadVersions"><RefreshCw :size="14"/>刷新</button>
          <button type="button" class="text-button is-primary" :disabled="disabled || busy" @click="openCreate"><Plus :size="14"/>创建</button>
        </div>
      </div>

      <form v-if="createOpen" class="version-create-form" @submit.prevent="createVersion">
        <label><span>版本名称</span><input v-model="label" maxlength="255" placeholder="例如：稳定版"/></label>
        <label><span>备注</span><textarea v-model="note" rows="2" maxlength="5000" placeholder="记录这次配置的变化"></textarea></label>
        <p v-if="disabled" class="version-form-hint">请先保存顶部的角色配置，再创建版本。</p>
        <div class="version-form-actions"><button type="button" class="text-button" :disabled="Boolean(pendingId)" @click="closeCreate">取消</button><button type="submit" class="text-button is-primary" :disabled="disabled || busy">{{ pendingId === 'create' ? '创建中…' : '保存版本' }}</button></div>
      </form>

      <div v-if="loading" class="version-empty">正在读取版本历史…</div>
      <div v-else-if="!versions.length && !error" class="version-empty"><Archive :size="22"/><strong>还没有保存的运行版本</strong><span>创建版本会记录当前已保存的角色配置。</span></div>
      <div v-else-if="versions.length" class="version-body">
        <div class="version-list" role="listbox" aria-label="角色版本历史">
          <button v-for="item in versions" :key="item.id" type="button" class="version-item" :class="{ selected: item.id === selectedId }" :aria-selected="item.id === selectedId" role="option" :disabled="busy" @click="selectVersion(item.id)">
            <span class="version-number">v{{ item.version_number }}</span>
            <span class="version-item-copy"><strong>{{ item.label || `版本 ${item.version_number}` }}</strong><small>{{ formatDate(item.created_at) }}</small></span>
            <span class="version-status" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
          </button>
        </div>

        <div class="version-detail">
          <div class="version-detail-heading"><div><span>当前选择</span><strong>{{ selectedSummary?.label || `版本 ${selectedSummary?.version_number || ''}` }}</strong></div><span class="version-status" :class="statusClass(selectedSummary?.status || 'draft')">{{ statusLabel(selectedSummary?.status || 'draft') }}</span></div>
          <p v-if="selectedSummary?.note" class="version-note">{{ selectedSummary.note }}</p>
          <div v-if="detailLoading" class="version-detail-loading">正在读取快照…</div>
          <dl v-else-if="selectedSnapshot" class="version-facts">
            <div><dt>角色名称</dt><dd>{{ selectedSnapshot.name }}</dd></div>
            <div><dt>知识库</dt><dd>{{ selectedSnapshot.knowledge_space_id || '未绑定' }}</dd></div>
            <div><dt>资料</dt><dd>{{ documentCount }} 份资料</dd></div>
            <div><dt>能力策略</dt><dd>{{ capabilityCount }} 项能力</dd></div>
            <div><dt>MCP 授权</dt><dd>{{ serverNames.length ? serverNames.join('、') : '无' }}</dd></div>
          </dl>
          <p v-else class="version-detail-loading">暂无快照详情</p>
          <div class="version-action-row">
            <button v-if="selectedSummary?.status === 'draft'" type="button" class="version-action is-primary" :disabled="disabled || busy" @click="activateVersion('publish')"><Send :size="14"/>发布版本</button>
            <button v-else-if="selectedSummary && selectedSummary.status !== 'published'" type="button" class="version-action" :disabled="disabled || busy" @click="activateVersion('rollback')"><RotateCcw :size="14"/>回滚到此版本</button>
            <span v-else class="version-current"><Check :size="14"/>这是当前发布版本</span>
          </div>
          <p v-if="selectedSummary?.published_at" class="version-published"><Clock3 :size="13"/>发布于 {{ formatDate(selectedSummary.published_at) }}</p>
        </div>
      </div>
      <p v-if="!error && disabled && versions.length" class="version-panel-footnote">顶部存在未保存修改时，版本操作会暂时停用。</p>
    </section>
  </div>
</template>

<style scoped>
.version-panel-layer {
  position: absolute;
  z-index: 30;
  inset: 0;
  pointer-events: none;
}
.version-panel-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: rgba(24, 23, 26, .08);
  cursor: default;
  pointer-events: auto;
}
.version-panel {
  position: absolute;
  top: 78px;
  right: clamp(16px, 4vw, 64px);
  width: min(420px, calc(100% - 32px));
  max-height: calc(100% - 94px);
  border: 1px solid #cfd4d8;
  background: #fff;
  color: #18171a;
  box-shadow: 0 20px 54px rgba(24, 23, 26, .18);
  overflow: auto;
  pointer-events: auto;
}
.version-panel::before {
  display: block;
  height: 2px;
  background: linear-gradient(90deg, #00afec, #8d6be8 58%, #ee8cae);
  content: "";
}
.version-panel-header {
  min-height: 92px;
  padding: 18px 20px 16px;
  border-bottom: 1px solid #e2e4e6;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.version-panel-kicker {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #007da8;
  font-size: 10px;
  letter-spacing: .08em;
}
.version-panel h2 { margin: 8px 0 0; font-size: 19px; }
.version-panel-header p { margin: 5px 0 0; color: #6f6f6f; font-size: 11px; }
.icon-button { width: 30px; height: 30px; border: 1px solid #d1d1d1; display: grid; place-items: center; background: transparent; color: inherit; cursor: pointer; }
.icon-button:hover { border-color: #18171a; }
.version-message { margin: 0; padding: 10px 20px; border-bottom: 1px solid #e1aaa6; background: #fff0ef; color: #9d211b; font-size: 11px; line-height: 1.5; }
.version-panel-toolbar { min-height: 48px; padding: 0 20px; border-bottom: 1px solid #e2e4e6; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #6f6f6f; font-size: 10px; }
.version-panel-toolbar > div, .version-form-actions { display: flex; align-items: center; gap: 6px; }
.text-button, .version-action { min-height: 30px; padding: 0 9px; border: 1px solid #d1d1d1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; background: transparent; color: #18171a; font: inherit; cursor: pointer; }
.text-button:hover:not(:disabled), .version-action:hover:not(:disabled) { border-color: #18171a; background: #f5f5f5; }
.text-button.is-primary, .version-action.is-primary { border-color: #18171a; background: #18171a; color: #fff; }
.text-button:disabled, .version-action:disabled, .icon-button:disabled { opacity: .42; cursor: not-allowed; }
.version-create-form { padding: 16px 20px; border-bottom: 1px solid #e2e4e6; display: grid; gap: 11px; background: #fafcfd; }
.version-create-form label { display: grid; gap: 6px; }
.version-create-form label > span { color: #6f6f6f; font-size: 10px; }
.version-create-form input, .version-create-form textarea { box-sizing: border-box; width: 100%; padding: 8px 9px; border: 1px solid #d1d1d1; border-radius: 0; background: #fff; color: inherit; font: 12px inherit; outline: none; }
.version-create-form input:focus, .version-create-form textarea:focus { border-color: #00afec; }
.version-create-form textarea { resize: vertical; }
.version-form-hint, .version-panel-footnote { margin: 0; color: #8a5a08; font-size: 10px; line-height: 1.5; }
.version-form-actions { justify-content: flex-end; }
.version-body { padding: 14px 20px 20px; }
.version-list { display: grid; gap: 6px; }
.version-item { width: 100%; min-height: 55px; padding: 8px 9px; border: 1px solid transparent; display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 8px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.version-item:hover:not(:disabled) { border-color: #d1d1d1; background: #fafafa; }
.version-item.selected { border-color: #00afec; background: #f1fbfe; }
.version-item:disabled { cursor: wait; }
.version-number { color: #007da8; font: 12px Consolas, monospace; }
.version-item-copy { min-width: 0; display: grid; gap: 4px; }
.version-item-copy strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.version-item-copy small { color: #6f6f6f; font-size: 10px; }
.version-status { flex: none; padding: 3px 5px; border: 1px solid currentColor; font-size: 9px; white-space: nowrap; }
.version-status.is-draft { color: #8a5a08; }
.version-status.is-published { color: #28705a; }
.version-status.is-superseded, .version-status.is-archived { color: #6f6f6f; }
.version-detail { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e4e6; }
.version-detail-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.version-detail-heading > div { min-width: 0; display: grid; gap: 5px; }
.version-detail-heading span:first-child { color: #6f6f6f; font-size: 10px; }
.version-detail-heading strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.version-note { margin: 11px 0 0; padding: 8px 10px; background: #f5f5f5; color: #555; font-size: 10px; line-height: 1.5; white-space: pre-wrap; }
.version-facts { margin: 14px 0 0; display: grid; gap: 0; }
.version-facts div { min-width: 0; padding: 8px 0; border-bottom: 1px solid #ececec; display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 10px; font-size: 10px; }
.version-facts dt { color: #6f6f6f; }
.version-facts dd { margin: 0; overflow-wrap: anywhere; text-align: right; }
.version-detail-loading, .version-empty { color: #6f6f6f; font-size: 11px; line-height: 1.5; }
.version-empty { min-height: 170px; padding: 20px; display: grid; place-content: center; justify-items: center; gap: 8px; text-align: center; }
.version-empty strong { color: #18171a; font-size: 12px; }
.version-empty span { max-width: 240px; font-size: 10px; }
.version-action-row { margin-top: 16px; }
.version-action { width: 100%; min-height: 36px; }
.version-current { display: inline-flex; align-items: center; gap: 5px; color: #28705a; font-size: 10px; }
.version-published { margin: 10px 0 0; display: flex; align-items: center; gap: 5px; color: #6f6f6f; font-size: 10px; }
.version-panel-footnote { padding: 0 20px 16px; }
@media (max-width: 820px) { .version-panel { top: 70px; right: 12px; max-height: calc(100% - 82px); } }
@media (prefers-reduced-motion: reduce) { .version-panel, .version-item, .text-button, .version-action { transition: none; } }
</style>
