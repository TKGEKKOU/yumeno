<script setup lang="ts">
import { BaseEdge } from "@vue-flow/core";
import { computed } from "vue";

const props = defineProps<{ sourceX: number; sourceY: number; targetX: number; targetY: number; selected?: boolean }>();
const path = computed(() => {
  const direction = props.targetX >= props.sourceX ? 1 : -1;
  const span = Math.abs(props.targetX - props.sourceX);
  const shoulder = Math.min(86, span * 0.34);
  const middleX = (props.sourceX + props.targetX) / 2;
  const middleY = (props.sourceY + props.targetY) / 2;
  return `M ${props.sourceX} ${props.sourceY} C ${props.sourceX + direction * shoulder} ${props.sourceY}, ${middleX} ${props.sourceY}, ${middleX} ${middleY} C ${middleX} ${props.targetY}, ${props.targetX - direction * shoulder} ${props.targetY}, ${props.targetX} ${props.targetY}`;
});
</script>

<template><BaseEdge :path="path" :class="{ selected }"/></template>
