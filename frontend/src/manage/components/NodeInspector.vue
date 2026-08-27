<script setup lang="ts">
import { Check, ExternalLink, Eye, FolderOpen, Play, RefreshCw, RotateCcw, Trash2, Upload } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { plainClone } from "../api";
import type { PersonaSummary, RetrievalConfig, RoleGraphNode, WorkbenchSnapshot } from "../types";

const props = defineProps<{ node?: RoleGraphNode; draft: WorkbenchSnapshot; disabled?: boolean; uploadCompleteToken?: number }>();
const emit = defineEmits<{ profile: [persona: PersonaSummary]; capability: [id: string, mode: "allow" | "deny" | "inherit"]; server: [name: string, allowed: boolean]; upload: [files: File[], text: string]; deleteDocument: [id: string]; retryDocument: [id: string]; deletePersona: []; previewVoice: []; openVoiceStudio: []; openRagEval: []; previewDocument: [document: Record<string, unknown>]; previewLocalFile: [file: File]; refreshLive2d: []; openLive2dDirectory: [] }>();
const selectedFiles = ref<File[]>([]);
const directText = ref("");
const fileInputKey = ref(0);
const kind = computed(() => props.node?.data.kind || "persona");
const capability = computed(() => props.draft.capabilities.packages.find((item) => item.id === props.node?.id));
const server = computed(() => kind.value === "mcp" ? props.draft.grants.servers.find((item) => `mcp:${item.name}` === props.node?.id) : undefined);
const mode = computed(() => { const value = props.node ? props.draft.capabilities.overrides[props.node.id] : undefined; return value === true ? "allow" : value === false ? "deny" : "inherit"; });
const boundLive2dModel = computed(() => String((props.draft.persona.profile?.live2d as any)?.model || ""));
const live2dModels = computed(() => props.draft.resources?.live2dModels || []);
const statusText = computed(() => ({ available: "可用", partial: "部分可用", unassigned: "未分配", blocked: "不可用", pending: "等待中", error: "异常" }[props.node?.data.status || "blocked"]));
function live2dFormat(model: { kind?: string; moc_version?: number | null }) {
  if (model.kind === "cubism2") return "Cubism 2";
  return model.moc_version ? `MOC3 v${model.moc_version}` : "Cubism / MOC3";
}
function patchPersona(name: string, value: unknown) {
  const persona = plainClone(props.draft.persona); const profile = { ...(persona.profile || {}) };
  if (name === "name") persona.name = String(value); else profile[name] = value; persona.profile = profile; emit("profile", persona);
}
function patchTts(name: string, value: unknown) { const persona = plainClone(props.draft.persona); const profile = { ...(persona.profile || {}) }; profile.tts = { ...((profile.tts as object) || {}), [name]: value }; persona.profile = profile; emit("profile", persona); }
function patchLive2d(value: string) { const persona = plainClone(props.draft.persona); const profile = { ...(persona.profile || {}) }; profile.live2d = { ...((profile.live2d as object) || {}), model: value }; persona.profile = profile; emit("profile", persona); }
const retrievalConfig = computed(() => (props.draft.persona.profile?.rag || {}) as RetrievalConfig);
function patchRag(name: keyof RetrievalConfig, value: unknown) {
  const persona = plainClone(props.draft.persona); const profile = { ...(persona.profile || {}) };
  profile.rag = { ...(profile.rag as RetrievalConfig || {}), [name]: value };
  persona.profile = profile; emit("profile", persona);
}
function chooseFiles(event: Event) { selectedFiles.value = Array.from((event.target as HTMLInputElement).files || []); }
function dropFiles(event: DragEvent) { selectedFiles.value = Array.from(event.dataTransfer?.files || []); }
function removeSelectedFile(index: number) { selectedFiles.value = selectedFiles.value.filter((_, itemIndex) => itemIndex !== index); }
function submitDocuments() { if (props.disabled || (!selectedFiles.value.length && !directText.value.trim())) return; emit("upload", selectedFiles.value, directText.value); }
watch(() => props.uploadCompleteToken, () => { selectedFiles.value = []; directText.value = ""; fileInputKey.value += 1; });
</script>

<template>
  <aside class="node-inspector" :class="{ 'is-disabled': disabled }" :aria-busy="disabled">
    <header><div><strong>{{ node?.data.label || '角色配置' }}</strong><small>{{ node?.data.summary }}</small></div><span v-if="node" :class="`inspect-status status-${node.data.status}`">{{ statusText }}</span></header>
    <div v-if="kind === 'profile'" class="inspect-fields">
      <label><span>角色名称</span><input :value="draft.persona.name" @input="patchPersona('name', ($event.target as HTMLInputElement).value)"></label>
      <label><span>角色人设</span><textarea rows="7" :value="String(draft.persona.profile?.description || '')" @input="patchPersona('description', ($event.target as HTMLTextAreaElement).value)"></textarea></label>
      <label><span>回复语言</span><select :value="String(draft.persona.profile?.reply_language || '')" @change="patchPersona('reply_language', ($event.target as HTMLSelectElement).value)"><option value="">跟随对话</option><option value="zh">中文</option><option value="ja">日语</option><option value="en">英语</option></select></label>
      <fieldset class="inspect-fieldset"><legend>知识检索</legend>
        <label><span>检索预设</span><select :value="String(retrievalConfig.profile || 'deep')" @change="patchRag('profile', ($event.target as HTMLSelectElement).value)"><option value="precise">精准检索</option><option value="deep">深度检索</option><option value="custom">自定义</option></select></label>
        <template v-if="retrievalConfig.profile === 'custom'">
          <label><span>初始召回 K</span><input type="number" min="1" max="100" :value="retrievalConfig.retrieval_k || 20" @change="patchRag('retrieval_k', Number(($event.target as HTMLInputElement).value))"></label>
          <label><span>重排保留 K</span><input type="number" min="1" max="100" :value="retrievalConfig.rerank_k || 8" @change="patchRag('rerank_k', Number(($event.target as HTMLInputElement).value))"></label>
          <label><span>最终上下文 K</span><input type="number" min="1" max="30" :value="retrievalConfig.final_context_k || 8" @change="patchRag('final_context_k', Number(($event.target as HTMLInputElement).value))"></label>
          <label><span>证据 Token 预算</span><input type="number" min="256" max="20000" step="256" :value="retrievalConfig.evidence_token_budget || 4500" @change="patchRag('evidence_token_budget', Number(($event.target as HTMLInputElement).value))"></label>
          <label class="inline-check"><input type="checkbox" :checked="retrievalConfig.allow_neighbors !== false" @change="patchRag('allow_neighbors', ($event.target as HTMLInputElement).checked)"><span>允许补充相邻片段</span></label>
        </template>
        <small>查询时直接使用这里保存的参数，不额外调用模型判断检索模式。</small>
      </fieldset>
      <button type="button" class="inspect-danger" @click="emit('deletePersona')"><Trash2 :size="15"/>删除当前角色</button>
    </div>
    <div v-else-if="kind === 'rag'" class="inspect-stack rag-inspector">
      <p>{{ draft.documents.length }} 份资料已关联到角色知识空间。</p>
      <label class="document-picker" @dragover.prevent @drop.prevent="dropFiles"><Upload :size="15"/><span>{{ selectedFiles.length ? `已选择 ${selectedFiles.length} 个文件` : '选择或拖入资料文件' }}</span><input :key="fileInputKey" type="file" multiple :disabled="disabled" @change="chooseFiles"></label>
      <ul v-if="selectedFiles.length" class="pending-files"><li v-for="(file, index) in selectedFiles" :key="`${file.name}-${file.size}-${index}`"><span>{{ file.name }}</span><span><button type="button" title="上传前预览" @click="emit('previewLocalFile', file)"><Eye :size="14"/></button><button type="button" title="移除" @click="removeSelectedFile(index)"><Trash2 :size="14"/></button></span></li></ul>
      <label><span>补充文本</span><textarea v-model="directText" rows="3" placeholder="直接写入角色知识库"></textarea></label>
      <button type="button" class="inspect-action" :disabled="disabled || (!selectedFiles.length && !directText.trim())" @click="submitDocuments"><Upload :size="15"/>{{ disabled ? '处理中' : '写入知识库' }}</button>
      <ul class="document-items"><li v-for="doc in draft.documents" :key="String(doc.id)"><div><b>{{ doc.original_filename || doc.original_name || doc.id }}</b><span>{{ doc.status }}</span></div><span class="document-actions"><button type="button" title="预览 Markdown" @click="emit('previewDocument', doc)"><Eye :size="14"/></button><button v-if="doc.status === 'index_failed'" type="button" title="重新索引" @click="emit('retryDocument', String(doc.id))"><RotateCcw :size="14"/></button><button type="button" title="删除资料" @click="emit('deleteDocument', String(doc.id))"><Trash2 :size="14"/></button></span></li></ul>
      <button type="button" class="inspect-action" @click="emit('openRagEval')"><ExternalLink :size="15"/>前往 RAG 评测</button>
    </div>
    <div v-else-if="kind === 'memory'" class="inspect-stack"><p>会话记忆按对话窗口隔离，长期记忆与角色绑定。</p><small>清理操作继续在对应对话或接入窗口执行，避免误清其他会话。</small></div>
    <div v-else-if="kind === 'extensions'" class="inspect-stack"><p>当前角色可配置 {{ draft.capabilities.packages.length }} 项扩展能力。</p><small>选择画布中的 Skill 或 Tool 查看依赖并设置角色策略；依赖只在选中时展开。</small></div>
    <div v-else-if="kind === 'voice'" class="inspect-fields">
      <label class="inline-check"><input type="checkbox" :checked="Boolean((draft.persona.profile?.tts as any)?.enabled)" @change="patchTts('enabled', ($event.target as HTMLInputElement).checked)"><span>生成语音</span></label>
      <label class="inline-check"><input type="checkbox" :checked="Boolean((draft.persona.profile?.tts as any)?.auto_play)" @change="patchTts('auto_play', ($event.target as HTMLInputElement).checked)"><span>自动播放</span></label>
      <label><span>角色音色</span><select :value="String((draft.persona.profile?.tts as any)?.voice_asset_id || '')" @change="patchTts('voice_asset_id', ($event.target as HTMLSelectElement).value)"><option value="">不绑定音色</option><option v-for="asset in draft.resources?.voiceAssets" :key="asset.id" :value="asset.id">{{ asset.name }}</option></select></label>
      <label><span>输出语言</span><select :value="String((draft.persona.profile?.tts as any)?.output_language || 'auto')" @change="patchTts('output_language', ($event.target as HTMLSelectElement).value)"><option value="auto">自动</option><option value="zh">中文</option><option value="ja">日语</option><option value="en">英语</option></select></label>
      <div class="inspect-button-row"><button type="button" class="inspect-action" :disabled="!(draft.persona.profile?.tts as any)?.voice_asset_id" @click="emit('previewVoice')"><Play :size="15"/>试听</button><button type="button" class="inspect-action" @click="emit('openVoiceStudio')"><ExternalLink :size="15"/>声音工坊</button></div>
    </div>
    <div v-else-if="kind === 'live2d'" class="live2d-model-library">
      <section class="live2d-binding-summary">
        <span>当前角色绑定</span>
        <strong>{{ boundLive2dModel || '未绑定模型' }}</strong>
        <button v-if="boundLive2dModel" type="button" :disabled="disabled" @click="patchLive2d('')">解除绑定</button>
      </section>
      <div class="live2d-library-actions">
        <button type="button" :disabled="disabled" title="重新扫描模型" @click="emit('refreshLive2d')"><RefreshCw :size="15"/>刷新</button>
        <button type="button" :disabled="disabled" title="打开 Live2D 模型文件夹" @click="emit('openLive2dDirectory')"><FolderOpen :size="15"/>打开文件夹</button>
      </div>
      <div class="live2d-model-heading"><strong>已安装模型</strong><span>{{ live2dModels.length }} 个</span></div>
      <ul v-if="live2dModels.length" class="live2d-model-items">
        <li v-for="model in live2dModels" :key="model.id" :class="{ bound: boundLive2dModel === model.id, incompatible: model.compatible === false }">
          <div class="live2d-model-copy">
            <strong>{{ model.name }}</strong>
            <span>{{ live2dFormat(model) }}</span>
          </div>
          <div class="live2d-model-state">
            <span :class="model.compatible === false ? 'is-error' : 'is-compatible'">{{ model.compatible === false ? '不兼容' : '兼容' }}</span>
            <button v-if="boundLive2dModel === model.id" type="button" disabled class="is-bound"><Check :size="14"/>已绑定</button>
            <button v-else type="button" :disabled="disabled || model.compatible === false" :title="model.compatible === false ? '当前 Live2D 运行时不支持此 MOC3 版本' : `绑定 ${model.name}`" @click="patchLive2d(model.id)">绑定</button>
          </div>
        </li>
      </ul>
      <div v-else class="live2d-model-empty"><strong>尚未发现模型</strong><p>将模型文件夹放入 data/live2d 后刷新。</p></div>
      <p class="live2d-save-hint">绑定修改会随页面顶部“保存配置”一起生效。</p>
    </div>
    <div v-else-if="kind === 'skill' || kind === 'tool'" class="inspect-fields">
      <label v-if="capability"><span>角色策略</span><select :value="mode" @change="emit('capability', node!.id, ($event.target as HTMLSelectElement).value as any)"><option value="inherit">继承默认</option><option value="allow">允许</option><option value="deny">禁用</option></select></label>
      <p v-else>此 Tool 由上级能力包管理，不单独保存开关。</p>
      <div v-if="capability" class="dependency-list"><b>依赖</b><p v-for="item in capability.dependencies" :key="item.id || item.name"><span>{{ item.name }}</span><em>{{ item.server || item.source }}</em></p></div>
    </div>
    <div v-else-if="kind === 'mcp' && server" class="inspect-fields"><label class="inline-check"><input type="checkbox" :checked="server.authorized" :disabled="server.global" @change="emit('server', server.name, ($event.target as HTMLInputElement).checked)"><span>{{ server.global ? '全局授权' : '允许当前角色使用' }}</span></label><p>{{ server.description || 'MCP 服务' }}</p><small>连接状态：{{ server.status?.status || 'unknown' }}</small></div>
  </aside>
</template>
