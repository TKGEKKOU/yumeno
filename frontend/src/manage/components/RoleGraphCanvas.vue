<script setup lang="ts">
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-vue-next";
import { nextTick, ref, watch } from "vue";
import GraphNodeCard from "./GraphNodeCard.vue";
import BraceEdge from "./BraceEdge.vue";
import type { RoleGraph, RoleGraphNode } from "../types";

const props = defineProps<{ graph: RoleGraph; selectedNodeId: string }>();
const emit = defineEmits<{ select: [id: string]; toggle: [id: string]; reset: [] }>();
const nodes = ref<any[]>([]); const edges = ref<any[]>([]);
const { fitView, zoomIn, zoomOut } = useVueFlow({ id: "role-architecture" });
const flowReady = ref(false);

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function descendants(startId: string): Set<string> {
  const branch = new Set<string>([startId]);
  const pending = [startId];
  while (pending.length) {
    const source = pending.shift()!;
    for (const edge of edges.value) {
      if (edge.source !== source || branch.has(edge.target)) continue;
      branch.add(edge.target); pending.push(edge.target);
    }
  }
  return branch;
}

function owningPackage(selectedId: string): string | undefined {
  let current = selectedId;
  const visited = new Set<string>();
  while (!visited.has(current)) {
    visited.add(current);
    const parent = edges.value.find((edge) => edge.target === current)?.source;
    if (!parent) return undefined;
    if (parent === "module:extensions") return current;
    current = parent;
  }
  return undefined;
}

async function fitNodeIds(ids: string[], options: { minZoom: number; maxZoom: number; padding: number; duration?: number }) {
  if (!flowReady.value || !ids.length) return;
  await nextTick(); await nextPaint();
  await fitView({ nodes: ids, ...options });
}

function focusCore(duration = 220) {
  const core = nodes.value.filter((item) => item.data.kind === "persona" || ["profile", "memory", "rag", "voice", "live2d", "extensions"].includes(item.data.kind));
  return fitNodeIds(core.map((item) => item.id), { padding: 0.18, minZoom: 0.68, maxZoom: 1.08, duration });
}

function focusSelection(duration = 220) {
  if (props.selectedNodeId === "module:extensions") {
    const overview = nodes.value.filter((item) => item.id === "module:extensions" || ["skill", "tool"].includes(item.data.kind));
    return fitNodeIds(overview.map((item) => item.id), { padding: 0.16, minZoom: 0.38, maxZoom: 0.86, duration });
  }
  const owner = owningPackage(props.selectedNodeId);
  if (owner) {
    const branch = descendants(owner);
    branch.add("module:extensions");
    return fitNodeIds([...branch], { padding: 0.24, minZoom: 0.58, maxZoom: 1, duration });
  }
  return focusCore(duration);
}
watch(() => props.graph, async (graph) => {
  nodes.value = graph.nodes.map((item) => ({ ...item, selected: item.id === props.selectedNodeId }));
  edges.value = graph.edges.map((edge) => ({ ...edge, type: "brace", animated: false }));
  await nextTick(); await focusSelection();
}, { immediate: true, deep: true });
watch(() => props.selectedNodeId, (id) => nodes.value = nodes.value.map((item) => ({ ...item, selected: item.id === id })));
function nodeClick(event: any) { emit("select", event.node.id); }
async function reset() { emit("reset"); await nextTick(); focusCore(); }
async function onInit() { flowReady.value = true; await focusSelection(0); }
</script>

<template>
  <section class="graph-stage" aria-label="角色能力架构画布">
    <div class="graph-tools" aria-label="画布工具">
      <button type="button" title="放大" @click="() => zoomIn()"><Plus :size="16"/></button>
      <button type="button" title="缩小" @click="() => zoomOut()"><Minus :size="16"/></button>
      <button type="button" title="适应视图" @click="fitView({ padding: .15, duration: 220 })"><Maximize2 :size="16"/></button>
      <button type="button" title="恢复自动布局" @click="reset"><RotateCcw :size="16"/></button>
    </div>
    <VueFlow id="role-architecture" v-model:nodes="nodes" v-model:edges="edges" :min-zoom=".32" :max-zoom="1.8" :fit-view-on-init="false" @init="onInit" @node-click="nodeClick">
      <template #node-persona="slotProps"><GraphNodeCard v-bind="slotProps"/></template>
      <template #node-module="slotProps"><GraphNodeCard v-bind="slotProps"/></template>
      <template #node-capability="slotProps"><GraphNodeCard v-bind="slotProps" @toggle="emit('toggle', slotProps.id)"/></template>
      <template #edge-brace="slotProps"><BraceEdge v-bind="slotProps"/></template>
    </VueFlow>
  </section>
</template>
