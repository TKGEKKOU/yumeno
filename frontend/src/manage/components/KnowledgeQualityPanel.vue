<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RefreshCw } from "lucide-vue-next";
import { getKnowledgeSpaceReport, listKnowledgeSpaceEvaluations } from "../api";
import {
  evaluationStatusLabel,
  formatQualityPercent,
  qualityReportStatus,
  summarizeKnowledgeDocuments,
} from "../knowledge-quality";
import type { KnowledgeEvaluationSummary, KnowledgeSpaceReport } from "../types";

const props = defineProps<{
  personaId: string;
  knowledgeSpaceId?: string;
  documents: Array<Record<string, unknown>>;
  disabled?: boolean;
}>();

const report = ref<KnowledgeSpaceReport | null>(null);
const evaluations = ref<KnowledgeEvaluationSummary[]>([]);
const loading = ref(false);
const error = ref("");
let requestSequence = 0;

const documentSummary = computed(() => summarizeKnowledgeDocuments(props.documents));
const reportDocumentSummary = computed(() => {
  if (!report.value) return documentSummary.value;
  const total = Number(report.value.total_documents);
  const indexed = Number(report.value.indexed_count ?? report.value.indexed_documents);
  const processing = Number(report.value.in_progress_count ?? report.value.processing_documents);
  const failed = Number(report.value.failed_count ?? report.value.failed_documents);
  if (![total, indexed, processing, failed].every(Number.isFinite)) return documentSummary.value;
  return { total, indexed, processing, failed, attention: processing + failed };
});
const latestEvaluation = computed(() => evaluations.value[0] || null);
const reportState = computed(() => qualityReportStatus(report.value));
const chunkCount = computed(() => {
  const value = report.value?.chunk_count ?? report.value?.chunks ?? report.value?.total_chunks;
  return Number.isFinite(Number(value)) ? Number(value) : null;
});
const acceptedRate = computed(() => latestEvaluation.value?.metrics?.accepted_rate ?? latestEvaluation.value?.accepted_rate);
const reportVersion = computed(() => {
  const versions = report.value?.index_version_counts;
  if (!versions) return "";
  const [version] = Object.keys(versions);
  return version ? `索引 ${version}` : "";
});

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

async function refresh() {
  const sequence = ++requestSequence;
  if (!props.knowledgeSpaceId) {
    report.value = null;
    evaluations.value = [];
    error.value = "";
    return;
  }
  loading.value = true;
  error.value = "";
  const [reportResult, evaluationResult] = await Promise.allSettled([
    getKnowledgeSpaceReport(props.knowledgeSpaceId),
    listKnowledgeSpaceEvaluations(props.personaId),
  ]);
  if (sequence !== requestSequence) return;
  if (reportResult.status === "fulfilled") report.value = reportResult.value;
  if (evaluationResult.status === "fulfilled") evaluations.value = evaluationResult.value;
  const failed = [reportResult, evaluationResult].find((result) => result.status === "rejected");
  if (failed?.status === "rejected") error.value = failed.reason instanceof Error ? failed.reason.message : String(failed.reason);
  loading.value = false;
}

watch(() => [props.personaId, props.knowledgeSpaceId], refresh);
onMounted(refresh);
</script>

<template>
  <section class="knowledge-quality" aria-label="知识质量">
    <header class="knowledge-quality-heading">
      <div>
        <span>知识质量</span>
        <strong>处理与评测</strong>
      </div>
      <button type="button" class="knowledge-quality-refresh" :disabled="loading || disabled || !knowledgeSpaceId" title="刷新知识质量" @click="refresh">
        <RefreshCw :size="13" :class="{ 'is-spinning': loading }" />
        <span>{{ loading ? "读取中" : "刷新" }}</span>
      </button>
    </header>

    <div class="knowledge-quality-stats" aria-label="资料处理概览">
      <div><strong>{{ reportDocumentSummary.total }}</strong><span>资料</span></div>
      <div><strong>{{ reportDocumentSummary.indexed }}</strong><span>已索引</span></div>
      <div :class="{ 'has-attention': reportDocumentSummary.attention > 0 }"><strong>{{ reportDocumentSummary.attention }}</strong><span>需处理</span></div>
    </div>

    <div class="knowledge-quality-report">
      <div class="knowledge-quality-subheading"><span>处理报告</span><b :class="{ 'is-attention': reportDocumentSummary.attention > 0 }">{{ reportState }}</b></div>
      <p v-if="report?.summary" class="knowledge-quality-summary">{{ report.summary }}</p>
      <p v-if="chunkCount !== null || reportVersion" class="knowledge-quality-meta"><span v-if="chunkCount !== null">{{ chunkCount }} 个片段</span><span v-if="chunkCount !== null && reportVersion"> · </span><span v-if="reportVersion">{{ reportVersion }}</span><span v-if="report?.latest_updated_at || report?.updated_at"> · {{ formatDate(report.latest_updated_at || report.updated_at) }} 更新</span></p>
      <p v-else-if="!report" class="knowledge-quality-empty">暂无处理报告，当前先显示资料状态。</p>
    </div>

    <div class="knowledge-quality-evaluation">
      <div class="knowledge-quality-subheading"><span>最近评测</span><b v-if="latestEvaluation">{{ evaluationStatusLabel(latestEvaluation.status) }}</b></div>
      <template v-if="latestEvaluation">
        <p v-if="latestEvaluation.summary" class="knowledge-quality-summary">{{ latestEvaluation.summary }}</p>
        <div class="knowledge-quality-eval-facts">
          <span v-if="acceptedRate !== undefined && acceptedRate !== null">通过率 <strong>{{ formatQualityPercent(acceptedRate) }}</strong></span>
          <span v-if="latestEvaluation.created_at">{{ formatDate(latestEvaluation.created_at) }}</span>
        </div>
      </template>
      <p v-else class="knowledge-quality-empty">暂无已保存评测，可从下方进入完整 RAG 评测。</p>
    </div>

    <p v-if="error" class="knowledge-quality-error">读取质量数据失败：{{ error }}</p>
  </section>
</template>

