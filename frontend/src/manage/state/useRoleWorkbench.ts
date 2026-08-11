import { computed, ref } from "vue";

import { deleteDocument, deletePersona, listLive2dModels, listPersonaDocuments, listPersonas, loadRoleWorkbench, openLive2dModelDirectory, plainClone, retryDocument, saveCapabilities, saveGrants, savePersona, uploadDocuments } from "../api";
import type { PersonaSummary, WorkbenchSnapshot } from "../types";
import { applyCapabilityPolicy } from "./capabilityPolicy";
import { saveDomains, type SaveDomain } from "./saveCoordinator";
import { reconcileAfterSave } from "./reconcile";

export function useRoleWorkbench() {
  const personas = ref<PersonaSummary[]>([]);
  const selectedPersonaId = ref("");
  const snapshot = ref<WorkbenchSnapshot | null>(null);
  const draft = ref<WorkbenchSnapshot | null>(null);
  const selectedNodeId = ref("");
  const dirtyDomains = ref(new Set<SaveDomain>());
  const loading = ref(false);
  const isSaving = ref(false);
  const operationPending = ref(false);
  const error = ref("");
  const message = ref("");
  const isDirty = computed(() => dirtyDomains.value.size > 0);

  async function initialize() {
    if (loading.value) return;
    loading.value = true; error.value = "";
    try {
      personas.value = await listPersonas();
      const preferred = selectedPersonaId.value || sessionStorage.getItem("yumeno.manage.persona");
      const initial = personas.value.find((item) => item.id === preferred) || personas.value[0];
      if (initial) await selectPersona(initial.id, true);
    } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { loading.value = false; }
  }

  async function refreshIfClean() {
    if (isDirty.value || loading.value || isSaving.value || operationPending.value) return;
    await initialize();
  }

  async function selectPersona(personaId: string, force = false) {
    if (!force && (isSaving.value || operationPending.value)) { message.value = "当前操作完成后才能切换角色"; return; }
    if (!force && isDirty.value && !window.confirm("当前角色有未保存修改，放弃后切换角色？")) return;
    const persona = personas.value.find((item) => item.id === personaId);
    if (!persona) return;
    loading.value = true; error.value = ""; message.value = "";
    try {
      const loaded = await loadRoleWorkbench(persona);
      snapshot.value = loaded;
      draft.value = plainClone(loaded);
      selectedPersonaId.value = personaId;
      selectedNodeId.value = `persona:${personaId}`;
      dirtyDomains.value = new Set();
      sessionStorage.setItem("yumeno.manage.persona", personaId);
    } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { loading.value = false; }
  }

  function selectNode(nodeId: string) { selectedNodeId.value = nodeId; }
  function updateProfile(profile: PersonaSummary) {
    if (!draft.value) return;
    draft.value.persona = plainClone(profile);
    dirtyDomains.value = new Set(dirtyDomains.value).add("profile");
  }
  function setCapability(packageId: string, mode: "allow" | "deny" | "inherit") {
    if (!draft.value) return;
    draft.value = applyCapabilityPolicy(draft.value, packageId, mode);
    const next = new Set(dirtyDomains.value); next.add("capabilities"); next.add("grants"); dirtyDomains.value = next;
  }
  function setServer(name: string, allowed: boolean) {
    if (!draft.value) return;
    const server = draft.value.grants.servers.find((item) => item.name === name);
    if (server && !server.global) server.authorized = allowed;
    dirtyDomains.value = new Set(dirtyDomains.value).add("grants");
  }
  function discard() {
    if (!snapshot.value) return;
    draft.value = plainClone(snapshot.value); dirtyDomains.value = new Set(); message.value = "已撤销本轮修改";
  }
  async function refreshDocuments() {
    if (!draft.value || !snapshot.value) return;
    const documents = await listPersonaDocuments(draft.value.persona.id);
    draft.value.documents = documents; snapshot.value.documents = plainClone(documents);
  }
  async function refreshLive2dResources() {
    if (!draft.value || !snapshot.value || operationPending.value) return;
    operationPending.value = true; error.value = ""; message.value = "正在扫描 Live2D 模型...";
    try {
      const models = await listLive2dModels();
      draft.value.resources = { ...(draft.value.resources || { voiceAssets: [], live2dModels: [] }), live2dModels: models };
      snapshot.value.resources = { ...(snapshot.value.resources || { voiceAssets: [], live2dModels: [] }), live2dModels: plainClone(models) };
      message.value = `已发现 ${models.length} 个 Live2D 模型`;
    } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { operationPending.value = false; }
  }
  async function openLive2dDirectory() {
    if (operationPending.value) return;
    operationPending.value = true; error.value = "";
    try { await openLive2dModelDirectory(); message.value = "已打开 Live2D 模型文件夹"; }
    catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { operationPending.value = false; }
  }
  function pollDocuments(personaId: string, attempts = 10) {
    if (attempts <= 0) return;
    window.setTimeout(async () => {
      if (draft.value?.persona.id !== personaId) return;
      try {
        await refreshDocuments();
        const busy = draft.value.documents.some((item) => ["converting", "preview_ready", "indexing"].includes(String(item.status)));
        if (busy) pollDocuments(personaId, attempts - 1);
      } catch { /* 下一次进入管理页时会重新读取状态。 */ }
    }, 1400);
  }
  async function addDocuments(files: File[], directText: string): Promise<boolean> {
    if (!draft.value || (!files.length && !directText.trim()) || operationPending.value) return false;
    operationPending.value = true; error.value = ""; message.value = "正在写入角色知识库...";
    try { const personaId = draft.value.persona.id; await uploadDocuments(draft.value.persona, files, directText); await refreshDocuments(); pollDocuments(personaId); message.value = "资料已提交，正在建立索引"; return true; }
    catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); return false; }
    finally { operationPending.value = false; }
  }
  async function removeDocument(documentId: string) {
    operationPending.value = true; error.value = "";
    try { await deleteDocument(documentId); await refreshDocuments(); message.value = "资料已删除"; }
    catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { operationPending.value = false; }
  }
  async function reindexDocument(documentId: string) {
    operationPending.value = true; error.value = "";
    try { const personaId = draft.value?.persona.id || ""; await retryDocument(documentId); await refreshDocuments(); if (personaId) pollDocuments(personaId); message.value = "已重新提交索引"; }
    catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { operationPending.value = false; }
  }
  async function removeCurrentPersona() {
    if (!draft.value) return;
    operationPending.value = true; error.value = "";
    try {
      const removedId = draft.value.persona.id;
      await deletePersona(removedId);
      personas.value = (await listPersonas()).filter((item) => item.id !== removedId);
      snapshot.value = null; draft.value = null; selectedPersonaId.value = ""; dirtyDomains.value = new Set();
      if (personas.value[0]) await selectPersona(personas.value[0].id, true);
      message.value = "角色已删除";
    } catch (reason) { error.value = reason instanceof Error ? reason.message : String(reason); }
    finally { operationPending.value = false; }
  }
  async function save() {
    if (!draft.value || !isDirty.value) return;
    isSaving.value = true; error.value = ""; message.value = "";
    const current = plainClone(draft.value);
    const operations: Partial<Record<SaveDomain, () => Promise<void>>> = {};
    if (dirtyDomains.value.has("profile")) operations.profile = () => savePersona(current.persona);
    if (dirtyDomains.value.has("capabilities")) operations.capabilities = () => saveCapabilities(current.persona.id, current.capabilities.overrides);
    if (dirtyDomains.value.has("grants")) operations.grants = () => saveGrants(current.persona.id, current.grants.servers);
    const result = await saveDomains(operations);
    const remaining = new Set(result.failedDomains.map((item) => item.domain)); dirtyDomains.value = remaining;
    if (result.savedDomains.length) {
      try {
        personas.value = await listPersonas();
        const latestPersona = personas.value.find((item) => item.id === current.persona.id) || current.persona;
        const fresh = await loadRoleWorkbench(latestPersona);
        snapshot.value = fresh; draft.value = reconcileAfterSave(fresh, current, remaining);
      } catch (reason) {
        const fallback = plainClone(snapshot.value || current);
        if (result.savedDomains.includes("profile")) fallback.persona = plainClone(current.persona);
        if (result.savedDomains.includes("capabilities")) fallback.capabilities.overrides = plainClone(current.capabilities.overrides);
        if (result.savedDomains.includes("grants")) fallback.grants.servers = plainClone(current.grants.servers);
        snapshot.value = fallback; draft.value = current;
        error.value = `配置已保存，但刷新失败：${reason instanceof Error ? reason.message : String(reason)}`;
      }
    }
    if (result.ok) message.value = "角色配置已保存";
    else error.value = result.failedDomains.map((item) => `${item.domain}: ${item.message}`).join("；");
    isSaving.value = false;
  }
  return { personas, selectedPersonaId, snapshot, draft, selectedNodeId, dirtyDomains, loading, isSaving, operationPending, error, message, isDirty, initialize, refreshIfClean, selectPersona, selectNode, updateProfile, setCapability, setServer, discard, save, addDocuments, removeDocument, reindexDocument, refreshLive2dResources, openLive2dDirectory, removeCurrentPersona };
}
