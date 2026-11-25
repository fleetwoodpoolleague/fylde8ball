<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CalendarIcon from './icons/CalendarIcon.vue'

const detailsRef = ref<HTMLDetailsElement | null>(null)

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
      class="list-none inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-line bg-raised text-sm font-medium text-accent hover:bg-sunken transition-colors cursor-pointer select-none"
    >
      <CalendarIcon size="1.1em" />
      <span>Add to calendar</span>
    </summary>
    <div
      class="absolute right-0 mt-1.5 w-56 rounded-xl border border-line bg-raised shadow-lg py-1.5 z-30"
      role="menu"
    >
      <a
        href="webcal://fylde8ball.co.uk/fylde8ball.ics"
        role="menuitem"
        class="flex items-center min-h-[44px] px-3.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        Apple / Outlook Calendar
      </a>
      <a
        href="https://calendar.google.com/calendar/r?cid=webcal://fylde8ball.co.uk/fylde8ball.ics"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        class="flex items-center min-h-[44px] px-3.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        Google Calendar
      </a>
      <a
        href="/fylde8ball.ics"
        download="fylde8ball.ics"
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
