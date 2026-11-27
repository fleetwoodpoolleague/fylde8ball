<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CalendarIcon from './icons/CalendarIcon.vue'

const props = withDefaults(
  defineProps<{
    icsPath?: string
    label?: string
    downloadName?: string
    align?: 'left' | 'right'
    scopeHint?: string
  }>(),
  {
    icsPath: '/fylde8ball.ics',
    label: 'Sync all comps',
    downloadName: 'fylde8ball.ics',
    align: 'right',
    scopeHint: 'Auto-updates your phone calendar as dates are announced.',
  },
)

const detailsRef = ref<HTMLDetailsElement | null>(null)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | null = null

const httpsIcsUrl = computed(() => `https://fylde8ball.co.uk${props.icsPath}`)
const webcalUrl = computed(() => `webcal://fylde8ball.co.uk${props.icsPath}`)
const googleUrl = computed(
  () => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl.value)}`,
)

function close() {
  if (detailsRef.value) detailsRef.value.open = false
}

async function copySyncUrl() {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(httpsIcsUrl.value)
      copyState.value = 'copied'
      if (copyTimer) clearTimeout(copyTimer)
      copyTimer = setTimeout(() => {
        copyState.value = 'idle'
        close()
      }, 1800)
      return
    } catch {
      // Fall through to failure feedback below
    }
  }
  copyState.value = 'failed'
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copyState.value = 'idle'
  }, 3000)
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
  if (copyTimer) clearTimeout(copyTimer)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <details ref="detailsRef" class="relative inline-block">
    <summary
      class="list-none inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-semibold text-accent hover:border-accent hover:bg-sunken transition-colors cursor-pointer select-none"
    >
      <CalendarIcon size="1.1em" />
      <span>{{ label }}</span>
    </summary>
    <div
      class="absolute mt-1.5 w-68 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-raised shadow-lg py-2 z-30"
      :class="align === 'left' ? 'left-0' : 'right-0'"
      role="menu"
    >
      <p class="px-3.5 pb-2 mb-1 border-b border-line text-xs text-muted leading-relaxed">
        {{ scopeHint }}
      </p>

      <a
        :href="webcalUrl"
        role="menuitem"
        class="flex flex-col justify-center min-h-[44px] px-3.5 py-1.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        <span class="font-medium">Subscribe (iPhone / Mac / Outlook)</span>
        <span class="text-xs text-muted">One-tap live webcal feed</span>
      </a>

      <a
        :href="googleUrl"
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        class="flex flex-col justify-center min-h-[44px] px-3.5 py-1.5 text-sm text-ink hover:bg-sunken transition-colors"
        @click="close"
      >
        <span class="font-medium">Google Calendar (Desktop web)</span>
        <span class="text-xs text-muted">Opens Google Calendar subscription</span>
      </a>

      <button
        type="button"
        role="menuitem"
        aria-live="polite"
        class="w-full flex flex-col items-start justify-center min-h-[44px] px-3.5 py-1.5 text-left text-sm text-ink hover:bg-sunken transition-colors cursor-pointer"
        @click="copySyncUrl"
      >
        <span class="font-medium" :class="copyState === 'copied' ? 'text-accent' : ''">
          <template v-if="copyState === 'copied'">✓ Sync link copied!</template>
          <template v-else-if="copyState === 'failed'">Copy unavailable — long-press .ics below</template>
          <template v-else>Copy sync link (Android / Other)</template>
        </span>
        <span class="text-xs text-muted">
          <template v-if="copyState === 'copied'">Paste into Google Calendar &rarr; From URL</template>
          <template v-else>Paste into your calendar app URL settings</template>
        </span>
      </button>

      <div class="mt-1 pt-1 border-t border-line">
        <a
          :href="icsPath"
          :download="downloadName"
          role="menuitem"
          class="flex items-center min-h-[44px] px-3.5 text-xs text-muted hover:text-ink hover:bg-sunken transition-colors"
          @click="close"
        >
          Download static .ics snapshot (no auto-sync)
        </a>
      </div>
    </div>
  </details>
</template>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
</style>
