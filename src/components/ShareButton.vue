<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { renderShareCardBlob, type ShareCardData } from '../utils/shareCard'

const props = defineProps<{
  title: string
  text?: string
  url: string
  card?: ShareCardData
  cardFilename?: string
}>()

const status = ref<'idle' | 'sharing' | 'copied' | 'failed'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    status.value = 'idle'
  }, 2500)
}

async function tryBuildCardFile(): Promise<File | null> {
  if (!props.card || typeof File === 'undefined') return null
  try {
    const blob = await renderShareCardBlob(props.card)
    if (!blob) return null
    const filename = props.cardFilename ?? 'fylde8ball-share.png'
    return new File([blob], filename, { type: 'image/png' })
  } catch {
    return null
  }
}

async function handleShare() {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    status.value = 'sharing'
    try {
      const file = await tryBuildCardFile()
      const canShareFiles =
        file !== null &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })

      if (canShareFiles && file) {
        const caption = [props.text ?? props.title, props.url].filter(Boolean).join('\n')
        await navigator.share({
          files: [file],
          title: props.title,
          text: caption,
        })
        status.value = 'idle'
        return
      }

      await navigator.share({
        title: props.title,
        text: props.text,
        url: props.url,
      })
      status.value = 'idle'
      return
    } catch (err) {
      status.value = 'idle'
      // User dismissed share sheet — do not fall back to clipboard toast
      if (err instanceof DOMException && err.name === 'AbortError') return
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(props.url)
      status.value = 'copied'
      scheduleReset()
      return
    } catch {
      // Fall through to error feedback
    }
  }

  status.value = 'failed'
  scheduleReset()
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <button
    type="button"
    :disabled="status === 'sharing'"
    class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition cursor-pointer disabled:opacity-60"
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
    <span>
      <template v-if="status === 'sharing'">Preparing…</template>
      <template v-else-if="status === 'copied'">Link copied!</template>
      <template v-else-if="status === 'failed'">Copy failed</template>
      <template v-else>Share</template>
    </span>
  </button>
</template>
