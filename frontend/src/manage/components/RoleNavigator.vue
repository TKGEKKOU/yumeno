<script setup lang="ts">
import { ChevronDown, Search, UserRound } from "lucide-vue-next";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PersonaSummary } from "../types";

const props = defineProps<{ personas: PersonaSummary[]; selectedId: string; disabled?: boolean }>();
const emit = defineEmits<{ select: [id: string] }>();
const root = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const open = ref(false);
const query = ref("");
const visible = computed(() => props.personas.filter((item) => item.name.toLowerCase().includes(query.value.trim().toLowerCase())));
const selected = computed(() => props.personas.find((item) => item.id === props.selectedId));

async function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) await nextTick(() => searchInput.value?.focus());
}
function selectPersona(id: string) {
  emit("select", id);
  open.value = false;
  query.value = "";
}
function closeOnOutside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}
function closeOnEscape(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
watch(() => props.disabled, (disabled) => { if (disabled) open.value = false; });
onMounted(() => { document.addEventListener("pointerdown", closeOnOutside); document.addEventListener("keydown", closeOnEscape); });
onBeforeUnmount(() => { document.removeEventListener("pointerdown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); });
</script>

<template>
  <div ref="root" class="role-picker">
    <button type="button" class="role-picker-trigger" :disabled="disabled || !personas.length" aria-haspopup="listbox" :aria-expanded="open" aria-controls="manage-role-menu" @click="toggle">
      <UserRound :size="17"/>
      <strong>{{ selected?.name || '角色管理' }}</strong>
      <ChevronDown :size="15"/>
    </button>
    <div v-if="open" id="manage-role-menu" class="role-picker-menu">
      <label class="role-search"><Search :size="15"/><input ref="searchInput" v-model="query" placeholder="查找角色" aria-label="查找角色"></label>
      <div class="role-list" role="listbox" aria-label="选择角色">
        <button v-for="persona in visible" :key="persona.id" type="button" role="option" :aria-selected="persona.id === selectedId" :disabled="disabled" :class="{ active: persona.id === selectedId }" @click="selectPersona(persona.id)">
          <UserRound :size="17"/><span><b>{{ persona.name }}</b><small>{{ persona.profile?.description || '尚未填写人设' }}</small></span>
        </button>
        <p v-if="!visible.length" class="role-empty">没有匹配的角色</p>
      </div>
    </div>
  </div>
</template>
