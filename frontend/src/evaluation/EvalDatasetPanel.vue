<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Check, Edit3, Plus, RefreshCw, Trash2, X } from "lucide-vue-next";
import { errorMessage } from "../shared/api";
import {
  createEvalCase,
  deleteEvalCase,
  listEvalCases,
  splitListInput,
  type EvalCase,
  type EvalCaseForm,
  type EvalDifficulty,
  updateEvalCase,
} from "./dataset";

const props = defineProps<{ spaceId?: string }>();
const cases = ref<EvalCase[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const editorOpen = ref(false);
const editingId = ref<string | null>(null);
const draft = ref<EvalCaseForm>(emptyForm());
let requestSequence = 0;

const enabledCount = computed(() => cases.value.filter((item) => item.enabled !== false).length);
const editing = computed(() => Boolean(editingId.value));

function emptyForm(): EvalCaseForm {
  return { question: "", expectedAnswer: "", documentIds: "", tags: "", difficulty: "medium", enabled: true };
}
function formFromCase(item: EvalCase): EvalCaseForm {
  return {
    question: item.question || "",
    expectedAnswer: item.expected_answer || "",
    documentIds: (item.relevant_document_ids || []).join("\n"),
    tags: (item.tags || []).join(", "),
    difficulty: item.difficulty || "medium",
    enabled: item.enabled !== false,
  };
}
function difficultyLabel(value?: EvalDifficulty) {
  return ({ easy: "简单", medium: "中等", hard: "困难" }[value || "medium"] || "中等");
}
function openCreate() {
  editingId.value = null;
  draft.value = emptyForm();
  editorOpen.value = true;
  error.value = "";
}
function openEdit(item: EvalCase) {
  editingId.value = item.id;
  draft.value = formFromCase(item);
  editorOpen.value = true;
  error.value = "";
}
function closeEditor() {
  if (saving.value) return;
  editorOpen.value = false;
  editingId.value = null;
}
async function refresh() {
  const sequence = ++requestSequence;
  if (!props.spaceId) {
    cases.value = [];
    editorOpen.value = false;
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const response = await listEvalCases(props.spaceId);
    if (sequence === requestSequence) cases.value = response.items || [];
  } catch (reason) {
    if (sequence === requestSequence) error.value = errorMessage(reason);
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}
async function save() {
  if (!props.spaceId || !draft.value.question.trim()) {
    error.value = "请填写问题";
    return;
  }
  saving.value = true;
  error.value = "";
  try {
    const item = editingId.value
      ? await updateEvalCase(props.spaceId, editingId.value, draft.value)
      : await createEvalCase(props.spaceId, draft.value);
    if (editingId.value) {
      cases.value = cases.value.map((current) => current.id === item.id ? item : current);
    } else {
      cases.value = [...cases.value, item];
    }
    closeEditor();
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    saving.value = false;
  }
}
async function remove(item: EvalCase) {
  if (!props.spaceId || !window.confirm(`删除这条评测题？\n\n${item.question}`)) return;
  saving.value = true;
  error.value = "";
  try {
    await deleteEvalCase(props.spaceId, item.id);
    cases.value = cases.value.filter((current) => current.id !== item.id);
    if (editingId.value === item.id) closeEditor();
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    saving.value = false;
  }
}
watch(() => props.spaceId, refresh);
onMounted(refresh);
</script>

<template>
  <section class="eval-dataset" aria-label="人工评测题集">
    <header class="eval-dataset-heading">
      <div>
        <span class="yv-kicker">Regression set</span>
        <h2>人工题集 <small v-if="cases.length">{{ enabledCount }}/{{ cases.length }} 启用</small></h2>
        <p>把真实问题留成可重复的回归样本。</p>
      </div>
      <div class="eval-dataset-actions">
        <button class="yv-button" type="button" :disabled="loading || saving || !spaceId" title="刷新题集" @click="refresh"><RefreshCw :size="14" :class="{ 'is-spinning': loading }" />刷新</button>
        <button class="yv-button primary" type="button" :disabled="saving || !spaceId" @click="openCreate"><Plus :size="14" />新增题目</button>
      </div>
    </header>

    <p v-if="error" class="eval-dataset-error">{{ error }}</p>
    <div v-if="editorOpen" class="eval-dataset-editor">
      <div class="eval-dataset-editor-head"><strong>{{ editing ? "编辑题目" : "新增题目" }}</strong><button class="icon-button" type="button" title="关闭" :disabled="saving" @click="closeEditor"><X :size="15" /></button></div>
      <label class="yv-field"><span>问题</span><textarea name="question" v-model="draft.question" rows="2" maxlength="4000" placeholder="例如：YUMENO 如何选择知识检索路径？"></textarea></label>
      <label class="yv-field"><span>预期答案 <em>可选</em></span><textarea name="expected_answer" v-model="draft.expectedAnswer" rows="3" maxlength="8000" placeholder="用于人工复核与后续答案对比"></textarea></label>
      <div class="eval-dataset-form-grid">
        <label class="yv-field"><span>相关资料 ID <em>每行一个，也可用逗号分隔</em></span><textarea v-model="draft.documentIds" rows="2" placeholder="上传资料列表中的 ID"></textarea></label>
        <label class="yv-field"><span>标签 <em>用逗号分隔</em></span><input v-model="draft.tags" placeholder="角色, RAG, 回归" /></label>
        <label class="yv-field"><span>难度</span><select v-model="draft.difficulty"><option value="easy">简单</option><option value="medium">中等</option><option value="hard">困难</option></select></label>
        <label class="eval-dataset-check"><input v-model="draft.enabled" type="checkbox" /><span>加入后续评测</span></label>
      </div>
      <div class="eval-dataset-editor-actions"><button class="yv-button" type="button" :disabled="saving" @click="closeEditor">取消</button><button class="yv-button primary" type="button" :disabled="saving || !draft.question.trim()" @click="save"><Check :size="14" />{{ saving ? "保存中" : "保存题目" }}</button></div>
    </div>

    <div v-if="loading && !cases.length" class="eval-dataset-empty">读取题集…</div>
    <div v-else-if="!cases.length && !spaceId" class="eval-dataset-empty">先选择一个角色</div>
    <div v-else-if="!cases.length" class="eval-dataset-empty">还没有人工题目，先保存一条真实问题。</div>
    <div v-else class="eval-dataset-list">
      <article v-for="item in cases" :key="item.id" class="eval-dataset-row" :class="{ 'is-disabled': item.enabled === false }">
        <div class="eval-dataset-row-main"><strong>{{ item.question }}</strong><p v-if="item.expected_answer">{{ item.expected_answer }}</p><div class="eval-dataset-meta"><span>{{ difficultyLabel(item.difficulty) }}</span><span v-if="item.relevant_document_ids?.length">{{ item.relevant_document_ids.length }} 份资料</span><span v-for="tag in item.tags || []" :key="tag" class="eval-dataset-tag">{{ tag }}</span><span v-if="item.enabled === false">已停用</span></div></div>
        <div class="eval-dataset-row-actions"><button class="icon-button" type="button" title="编辑" :disabled="saving" @click="openEdit(item)"><Edit3 :size="15" /></button><button class="icon-button danger" type="button" title="删除" :disabled="saving" @click="remove(item)"><Trash2 :size="15" /></button></div>
      </article>
    </div>
  </section>
</template>


