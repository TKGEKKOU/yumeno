<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { Check, RefreshCw, X } from "lucide-vue-next";
import { errorMessage } from "../shared/api";
import {
  approveEvalCandidate,
  listEvalCandidates,
  rejectEvalCandidate,
  syncEvalCandidates,
  type EvalCandidate,
  type EvalDifficulty,
} from "./dataset";

type Draft = { expectedAnswer: string; documentIds: string; tags: string; difficulty: EvalDifficulty; note: string };
const props = defineProps<{ spaceId?: string }>();
const emit = defineEmits<{ accepted: [] }>();
const candidates = ref<EvalCandidate[]>([]);
const pendingTotal = ref(0);
const loading = ref(false);
const syncing = ref(false);
const busyId = ref("");
const error = ref("");
const drafts = reactive<Record<string, Draft>>({});
const hasSpace = computed(() => Boolean(props.spaceId));

function draftFor(candidate: EvalCandidate): Draft {
  return drafts[candidate.id] || (drafts[candidate.id] = {
    expectedAnswer: candidate.suggested_answer || "",
    documentIds: (candidate.relevant_document_ids || []).join("\n"),
    tags: (candidate.tags || []).join(", "),
    difficulty: "medium",
    note: "",
  });
}
function sourceLabel(candidate: EvalCandidate) { return candidate.source === "feedback" ? "用户反馈" : "质量信号"; }
function loadCandidates() {
  if (!props.spaceId) { candidates.value = []; pendingTotal.value = 0; return Promise.resolve(); }
  loading.value = true; error.value = "";
  return listEvalCandidates(props.spaceId).then((payload) => {
    candidates.value = payload.items || [];
    pendingTotal.value = payload.pending_total || candidates.value.length;
    for (const candidate of candidates.value) draftFor(candidate);
  }).catch((reason) => { error.value = errorMessage(reason); }).finally(() => { loading.value = false; });
}
async function syncCandidates() {
  if (!props.spaceId) return;
  syncing.value = true; error.value = "";
  try {
    const payload = await syncEvalCandidates(props.spaceId);
    candidates.value = payload.items || [];
    pendingTotal.value = candidates.value.length;
    for (const candidate of candidates.value) draftFor(candidate);
  } catch (reason) { error.value = errorMessage(reason); } finally { syncing.value = false; }
}
async function approve(candidate: EvalCandidate) {
  if (!props.spaceId) return;
  busyId.value = candidate.id; error.value = "";
  try {
    await approveEvalCandidate(props.spaceId, candidate.id, draftFor(candidate));
    candidates.value = candidates.value.filter((item) => item.id !== candidate.id);
    pendingTotal.value = Math.max(0, pendingTotal.value - 1);
    emit("accepted");
  } catch (reason) { error.value = errorMessage(reason); } finally { busyId.value = ""; }
}
async function reject(candidate: EvalCandidate) {
  if (!props.spaceId) return;
  busyId.value = candidate.id; error.value = "";
  try {
    await rejectEvalCandidate(props.spaceId, candidate.id, drafts[candidate.id].note);
    candidates.value = candidates.value.filter((item) => item.id !== candidate.id);
    pendingTotal.value = Math.max(0, pendingTotal.value - 1);
  } catch (reason) { error.value = errorMessage(reason); } finally { busyId.value = ""; }
}
watch(() => props.spaceId, loadCandidates, { immediate: true });
</script>

<template>
  <section class="eval-candidates">
    <header class="eval-candidates-heading">
      <div><span class="yv-kicker">Quality loop</span><h2>失败样本 <small v-if="hasSpace">{{ pendingTotal }} 条待确认</small></h2><p>把真实问答里的问题沉淀为人工题，确认后才会进入正式评测。</p></div>
      <button class="yv-button" type="button" :disabled="!hasSpace || syncing" @click="syncCandidates"><RefreshCw :size="14" :class="{ 'is-spinning': syncing }" />{{ syncing ? "扫描中" : "扫描新样本" }}</button>
    </header>
    <p v-if="error" class="eval-candidates-error">{{ error }}</p>
    <div v-if="!hasSpace" class="eval-candidates-empty">先选择一个角色。</div>
    <div v-else-if="loading && !candidates.length" class="eval-candidates-empty">读取待确认样本…</div>
    <div v-else-if="!candidates.length" class="eval-candidates-empty">暂无待确认样本。点击“扫描新样本”读取低置信度、未接地或负反馈查询。</div>
    <div v-else class="eval-candidates-list">
      <article v-for="candidate in candidates" :key="candidate.id" class="eval-candidate-row">
        <div class="eval-candidate-head"><div><span class="eval-candidate-source">{{ sourceLabel(candidate) }}</span><small>查询 {{ candidate.source_query_id.slice(0, 8) }}</small></div><div class="eval-candidate-signals"><span v-for="signal in candidate.signals" :key="signal.code">{{ signal.label }}</span></div></div>
        <strong class="eval-candidate-question">{{ candidate.question }}</strong>
        <div class="eval-candidate-meta"><span>置信度 {{ candidate.confidence.toFixed(2) }}</span><span>{{ candidate.grounded ? "已接地" : "未接地" }}</span><span>{{ candidate.useful ? "已解决" : "未解决" }}</span></div>
        <div class="eval-candidate-editor">
          <label class="yv-field"><span>标准答案 <em>建议答案可直接修改</em></span><textarea v-model="drafts[candidate.id].expectedAnswer" rows="3" /></label>
          <div class="eval-candidate-fields"><label class="yv-field"><span>关联资料 ID</span><input v-model="drafts[candidate.id].documentIds" placeholder="每行一个 DocumentJob ID" /></label><label class="yv-field"><span>标签</span><input v-model="drafts[candidate.id].tags" placeholder="例如：反馈回流, 边界问题" /></label><label class="yv-field"><span>难度</span><select v-model="drafts[candidate.id].difficulty"><option value="easy">简单</option><option value="medium">中等</option><option value="hard">困难</option></select></label></div>
          <label class="yv-field"><span>复核备注</span><input v-model="drafts[candidate.id].note" placeholder="可选：记录为什么收录或忽略" /></label>
        </div>
        <div class="eval-candidate-actions"><button class="yv-button primary" type="button" :disabled="busyId === candidate.id" @click="approve(candidate)"><Check :size="14" />收录为人工题</button><button class="yv-button" type="button" :disabled="busyId === candidate.id" @click="reject(candidate)"><X :size="14" />忽略</button></div>
      </article>
    </div>
  </section>
</template>


