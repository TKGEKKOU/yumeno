<script setup lang="ts">
import { Bot, Brain, Database, Layers3, Mic2, Plug, Puzzle, UserRound, Wrench, ScanFace } from "lucide-vue-next";
import { Handle, Position } from "@vue-flow/core";
import type { RoleGraphNodeData } from "../types";

const props = defineProps<{ data: RoleGraphNodeData; selected?: boolean }>();
const emit = defineEmits<{ toggle: [] }>();
const icons = { persona: Bot, profile: UserRound, memory: Brain, rag: Database, voice: Mic2, live2d: ScanFace, extensions: Layers3, skill: Puzzle, tool: Wrench, mcp: Plug };
const canToggle = Boolean(props.data.configurable) && props.data.level > 0;
</script>

<template>
  <article class="graph-node" :class="[`kind-${data.kind}`, `status-${data.status}`, { selected }]">
    <Handle id="left-target" type="target" :position="Position.Left" class="graph-handle"/>
    <Handle id="left-source" type="source" :position="Position.Left" class="graph-handle"/>
    <Handle id="right-target" type="target" :position="Position.Right" class="graph-handle"/>
    <Handle id="right-source" type="source" :position="Position.Right" class="graph-handle"/>
    <div class="graph-node-head"><component :is="icons[data.kind]" :size="16"/><b>{{ data.label }}</b><span v-if="data.kind === 'skill' || data.kind === 'tool'" class="level-tag">L{{ data.level }}</span></div>
    <p>{{ data.summary }}</p>
    <footer><span>{{ data.status === 'available' ? '可用' : data.status === 'unassigned' ? '未分配' : data.status === 'partial' ? '部分可用' : '不可用' }}</span>
      <button v-if="canToggle" type="button" class="graph-switch" :class="{ on: data.assigned }" :aria-pressed="Boolean(data.assigned)" :aria-label="`${data.label}能力开关`" @click.stop="emit('toggle')"><i></i></button>
    </footer>
  </article>
</template>
