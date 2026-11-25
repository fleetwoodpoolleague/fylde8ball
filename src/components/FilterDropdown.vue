<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface FilterOption {
  value: string
  label: string
}

const props = defineProps<{
  id: string
  label: string
  modelValue: string
  options: FilterOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(
  () => props.options.find(o => o.value === props.modelValue)?.label ?? props.options[0]?.label ?? '',
)

const isFiltered = computed(() => props.modelValue !== 'all')

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <button
      :id="id"
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="`${label}: ${selectedLabel}`"
      class="inline-flex items-center justify-between gap-2 min-h-[44px] rounded-lg border bg-raised px-3 text-sm transition-colors cursor-pointer"
      :class="
        isFiltered
          ? 'border-accent text-accent font-medium'
          : 'border-line text-ink hover:border-muted'
      "
      @click="open = !open"
    >
      <span class="truncate max-w-[180px]">{{ selectedLabel }}</span>
      <svg
        class="h-4 w-4 shrink-0 text-muted transition-transform"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <ul
      v-if="open"
      role="listbox"
      :aria-label="label"
      class="absolute left-0 mt-1.5 min-w-52 max-w-xs rounded-xl border border-line bg-raised shadow-lg py-1.5 z-30"
    >
      <li v-for="option in options" :key="option.value" role="presentation">
        <button
          type="button"
          role="option"
          :aria-selected="modelValue === option.value"
          class="w-full flex items-center justify-between gap-2 min-h-[44px] px-3.5 text-left text-sm transition-colors cursor-pointer"
          :class="
            modelValue === option.value
              ? 'text-accent font-semibold bg-sunken/60'
              : 'text-ink hover:bg-sunken'
          "
          @click="select(option.value)"
        >
          <span>{{ option.label }}</span>
          <span v-if="modelValue === option.value" aria-hidden="true">✓</span>
        </button>
      </li>
    </ul>
  </div>
</template>
