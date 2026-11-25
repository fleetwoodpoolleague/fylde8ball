<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  title: string
  text?: string
  url: string
}>()

const status = ref<'idle' | 'copied'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | null = null

async function handleShare() {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: props.title,
        text: props.text,
        url: props.url,
      })
      return
    } catch (err) {
      // User dismissed share sheet — do not fall back to clipboard toast
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(props.url)
      status.value = 'copied'
      if (resetTimer) clearTimeout(resetTimer)
      resetTimer = setTimeout(() => {
        status.value = 'idle'
      }, 2500)
    } catch {
      // Clipboard unavailable
    }
  }
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition cursor-pointer"
    aria-live="polite"
    @click="handleShare"
  >
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
    <span>{{ status === 'copied' ? 'Link copied!' : 'Share' }}</span>
  </button>
</template>
