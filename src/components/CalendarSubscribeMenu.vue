<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CalendarIcon from './icons/CalendarIcon.vue'

const props = withDefaults(
  defineProps<{
    icsPath?: string
    label?: string
    downloadName?: string
    align?: 'left' | 'right'
  }>(),
  {
    icsPath: '/fylde8ball.ics',
    label: 'Add to calendar',
    downloadName: 'fylde8ball.ics',
    align: 'right',
  },
)

const detailsRef = ref<HTMLDetailsElement | null>(null)

const webcalUrl = computed(() => `webcal://fylde8ball.co.uk${props.icsPath}`)
const googleUrl = computed(
  () => `https://calendar.google.com/calendar/r?cid=${webcalUrl.value}`,
)

function close() {
  if (detailsRef.value) detailsRef.value.open = false
}

function onDocumentClick(event: MouseEvent) {
  if (!detailsRef.value?.open) return
  if (!detailsRef.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
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
  <details ref="detailsRef" class="relative inline-block">
    <summary
      class="list-none inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-accent hover:bg-sunken transition-colors cursor-pointer select-none"
    >
      <CalendarIcon size="1.1em" />
      <span>{{ label }}</span>
    </summary>
    <div
      class="absolute mt-1.5 w-56 rounded-xl border border-line bg-raised shadow-lg py-1.5 z-30"
      :class="align === 'left' ? 'left-0' : 'right-0'"
      role="menu"
    >
      <a
        :href="webcalUrl"
        role="menuitem"
        class="flex items-center min-h-[44px] px-3.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        Apple / Outlook Calendar
      </a>
      <a
        :href="googleUrl"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        class="flex items-center min-h-[44px] px-3.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        Google Calendar
      </a>
      <a
        :href="icsPath"
        :download="downloadName"
        role="menuitem"
        class="flex items-center min-h-[44px] px-3.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        Download .ics file
      </a>
    </div>
  </details>
</template>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
</style>
