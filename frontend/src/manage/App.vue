<script setup lang="ts">
import { GitBranch, Save, Undo2 } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { synthesizeVoicePreview } from "./api";
import { buildRoleGraph } from "./graph/model";
import { layoutRoleGraph } from "./graph/layout";
import { projectRoleGraph } from "./graph/projection";
import NodeInspector from "./components/NodeInspector.vue";
import RoleGraphCanvas from "./components/RoleGraphCanvas.vue";
import RoleNavigator from "./components/RoleNavigator.vue";
import VersionPanel from "./components/VersionPanel.vue";
import { useRoleWorkbench } from "./state/useRoleWorkbench";

const workbench = useRoleWorkbench();
const layoutEpoch = ref(0);
const uploadCompleteToken = ref(0);
const versionPanelOpen = ref(false);
const busy = computed(() => workbench.isSaving.value || workbench.operationPending.value);
const fullGraph = computed(() => workbench.draft.value ? buildRoleGraph(workbench.draft.value) : { nodes: [], edges: [] });
const graph = computed(() => { layoutEpoch.value; return layoutRoleGraph(projectRoleGraph(fullGraph.value, workbench.selectedNodeId.value)); });
const selectedNode = computed(() => fullGraph.value.nodes.find((node) => node.id === workbench.selectedNodeId.value));
function toggleCapability(id: string) {
  const node = graph.value.nodes.find((item) => item.id === id);
  if (!node?.data.configurable) return;
  if (node.data.kind === "mcp" && node.data.sourceId) {
    workbench.setServer(node.data.sourceId, !node.data.assigned); return;
  }
  workbench.setCapability(id, node.data.assigned ? "deny" : "allow");
}
async function previewVoice() {
  const tts = workbench.draft.value?.persona.profile?.tts as any;
  if (!tts?.voice_asset_id) return;
  try {
    const blob = await synthesizeVoicePreview(tts.voice_asset_id, tts.output_language || "auto");
    const audio = new Audio(URL.createObjectURL(blob));
    const player = (window as any).PL?.audio;
    if (player) await player.play(audio); else await audio.play();
  } catch (reason) { workbench.error.value = reason instanceof Error ? reason.message : String(reason); }
}
function openVoiceStudio() { (document.querySelector('[data-view="voice"]') as HTMLButtonElement | null)?.click(); }
function openRagEval() { window.location.hash = "#knowledge-eval"; }
function toggleVersionPanel() {
  if (!workbench.draft.value || busy.value) return;
  versionPanelOpen.value = !versionPanelOpen.value;
}
function closeVersionPanel() { versionPanelOpen.value = false; }
async function onVersionChanged() { await workbench.refreshIfClean(); }
async function deleteCurrentPersona() {
  const name = workbench.draft.value?.persona.name;
  if (!name || !window.confirm(`永久删除“${name}”及其资料、记忆、向量和对话？此操作无法恢复。`)) return;
  await workbench.removeCurrentPersona();
}
async function deleteKnowledgeDocument(id: string) {
  if (!window.confirm("从角色资料中删除该文件？知识库向量与本地文件将一并移除。")) return;
  await workbench.removeDocument(id);
}
async function handleUpload(files: File[], text: string) { if (await workbench.addDocuments(files, text)) uploadCompleteToken.value += 1; }
function openPreview(title: string, content: string | HTMLElement) {
  const titleNode = document.querySelector("#preview-title");
  const contentNode = document.querySelector("#preview-content");
  if (!titleNode || !contentNode) return;
  titleNode.textContent = title; contentNode.replaceChildren(typeof content === "string" ? document.createTextNode(content) : content);
  document.querySelector("#preview-drawer")?.classList.add("is-open"); document.querySelector("#preview-backdrop")?.classList.add("is-open");
}
function closePreview() { document.querySelector("#preview-drawer")?.classList.remove("is-open"); document.querySelector("#preview-backdrop")?.classList.remove("is-open"); }
function previewDocument(documentItem: Record<string, unknown>) {
  openPreview(String(documentItem.original_filename || documentItem.original_name || "资料预览"), String(documentItem.markdown_preview || documentItem.error_message || "暂无预览内容"));
}
async function previewLocalFile(file: File) {
  if (file.type.startsWith("image/")) {
    const image = document.createElement("img"); const url = URL.createObjectURL(file); image.src = url; image.alt = file.name; image.style.maxWidth = "100%"; image.onload = () => URL.revokeObjectURL(url); openPreview(file.name, image); return;
  }
  const textLike = file.type.startsWith("text/") || /\.(md|txt|json|csv|ya?ml)$/i.test(file.name);
  openPreview(file.name, textLike ? await file.text() : "该文件将在上传转换后提供 Markdown 预览。");
}
function beforeUnload(event: BeforeUnloadEvent) { if (!workbench.isDirty.value) return; event.preventDefault(); event.returnValue = ""; }
function selectRequestedNode(event?: Event) {
  const requested = (event as CustomEvent<{ nodeId?: string }> | undefined)?.detail?.nodeId || sessionStorage.getItem("yumeno.manage.node");
  if (!requested) return;
  sessionStorage.removeItem("yumeno.manage.node");
  workbench.selectNode(requested);
}
async function onManageShow() { await workbench.refreshIfClean(); selectRequestedNode(); }
watch(() => workbench.selectedPersonaId.value, () => { versionPanelOpen.value = false; });
onMounted(async () => { await workbench.initialize(); selectRequestedNode(); window.addEventListener("beforeunload", beforeUnload); document.querySelector("#role-workbench-root")?.addEventListener("yumeno:manage-show", onManageShow); document.addEventListener("yumeno:manage-select-node", selectRequestedNode); document.querySelector("#close-preview")?.addEventListener("click", closePreview); document.querySelector("#preview-backdrop")?.addEventListener("click", closePreview); });
onBeforeUnmount(() => { window.removeEventListener("beforeunload", beforeUnload); document.querySelector("#role-workbench-root")?.removeEventListener("yumeno:manage-show", onManageShow); document.removeEventListener("yumeno:manage-select-node", selectRequestedNode); document.querySelector("#close-preview")?.removeEventListener("click", closePreview); document.querySelector("#preview-backdrop")?.removeEventListener("click", closePreview); });
</script>

<template>
  <div class="role-workbench" :class="{ 'is-busy': busy }">
    <header class="workbench-toolbar">
      <div class="toolbar-identity">
        <RoleNavigator :personas="workbench.personas.value" :selected-id="workbench.selectedPersonaId.value" :disabled="busy" @select="workbench.selectPersona"/>
        <p>角色运行架构与能力配置</p>
      </div>
      <div class="toolbar-actions"><span v-if="workbench.isDirty.value" class="dirty-state">存在未保存修改</span><button type="button" :class="{ active: versionPanelOpen }" :disabled="!workbench.draft.value || busy" @click="toggleVersionPanel"><GitBranch :size="16"/>运行版本</button><button type="button" :disabled="!workbench.isDirty.value || workbench.isSaving.value || workbench.operationPending.value" @click="workbench.discard"><Undo2 :size="16"/>撤销</button><button type="button" class="primary" :disabled="!workbench.isDirty.value || workbench.isSaving.value || workbench.operationPending.value" @click="workbench.save"><Save :size="16"/>{{ workbench.isSaving.value ? '保存中' : '保存配置' }}</button></div>
    </header>
    <p v-if="workbench.error.value" class="workbench-message error">{{ workbench.error.value }}</p><p v-else-if="workbench.message.value" class="workbench-message">{{ workbench.message.value }}</p>
    <div class="workbench-content">
      <main class="workbench-canvas-region">
        <div v-if="workbench.loading.value" class="workbench-loading">正在读取角色架构...</div>
        <div v-else-if="!workbench.personas.value.length" class="workbench-empty"><strong>还没有角色</strong><p>先在“创建角色”页面建立角色。</p></div>
        <RoleGraphCanvas v-else :graph="graph" :selected-node-id="workbench.selectedNodeId.value" @select="workbench.selectNode" @toggle="toggleCapability" @reset="layoutEpoch++"/>
      </main>
      <NodeInspector v-if="workbench.draft.value" :node="selectedNode" :draft="workbench.draft.value" :disabled="busy" :upload-complete-token="uploadCompleteToken" @profile="workbench.updateProfile" @capability="workbench.setCapability" @server="workbench.setServer" @upload="handleUpload" @delete-document="deleteKnowledgeDocument" @retry-document="workbench.reindexDocument" @delete-persona="deleteCurrentPersona" @preview-voice="previewVoice" @open-voice-studio="openVoiceStudio" @open-rag-eval="openRagEval" @preview-document="previewDocument" @preview-local-file="previewLocalFile" @refresh-live2d="workbench.refreshLive2dResources" @open-live2d-directory="workbench.openLive2dDirectory"/>
    </div>
    <VersionPanel v-if="versionPanelOpen && workbench.draft.value" :persona-id="workbench.draft.value.persona.id" :persona-name="workbench.draft.value.persona.name" :disabled="busy || workbench.isDirty.value" @close="closeVersionPanel" @changed="onVersionChanged"/>
  </div>
</template>
