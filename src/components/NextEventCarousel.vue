<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TournamentDate, TournamentFormat } from '../types/tournament'
import NextEventCard from './NextEventCard.vue'

export interface NextEventSlide {
  event: TournamentDate
  tournamentName: string
  tournamentSlug: string
  venue: string
  logo?: string
  format?: TournamentFormat
}

const props = withDefaults(
  defineProps<{
    items: NextEventSlide[]
    /** Auto-cycle delay in milliseconds when 2+ competitions share the next matchday. Set <= 0 to disable. */
    intervalMs?: number
    now?: Date
  }>(),
  {
    intervalMs: 9000,
  },
)

const activeIndex = ref(0)
const hovered = ref(false)
const focusedWithin = ref(false)
const prefersReducedMotion = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let mediaQuery: MediaQueryList | null = null
let touchStartX: number | null = null
let touchStartY: number | null = null

const isMulti = computed(() => props.items.length > 1)

const shouldAutoPlay = computed(
  () =>
    isMulti.value &&
    props.intervalMs > 0 &&
    !hovered.value &&
    !focusedWithin.value &&
    !prefersReducedMotion.value,
)

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  if (!shouldAutoPlay.value) return
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % props.items.length
  }, props.intervalMs)
}

function goTo(index: number) {
  if (!props.items.length) return
  const count = props.items.length
  activeIndex.value = ((index % count) + count) % count
  startTimer()
}

function next() {
  goTo(activeIndex.value + 1)
}

function prev() {
  goTo(activeIndex.value - 1)
}

function onKeydown(event: KeyboardEvent) {
  if (!isMulti.value) return
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  }
}

function onTouchStart(event: TouchEvent) {
  if (!isMulti.value || event.touches.length !== 1) return
  touchStartX = event.touches[0].clientX
  touchStartY = event.touches[0].clientY
}

function onTouchEnd(event: TouchEvent) {
  if (!isMulti.value || touchStartX === null || touchStartY === null) return
  const touch = event.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  touchStartX = null
  touchStartY = null
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) next()
    else prev()
  }
}

function onMotionChange(e: MediaQueryListEvent) {
  prefersReducedMotion.value = e.matches
}

watch(
  () => props.items.length,
  len => {
    if (activeIndex.value >= len) activeIndex.value = 0
    startTimer()
  },
)

watch([shouldAutoPlay, () => props.intervalMs], () => {
  startTimer()
})

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener?.('change', onMotionChange)
  }
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  mediaQuery?.removeEventListener?.('change', onMotionChange)
})
</script>

<template>
  <NextEventCard
    v-if="items.length === 1"
    v-bind="items[0]"
    :now="now"
  />

  <section
    v-else-if="items.length > 1"
    role="region"
    aria-roledescription="carousel"
    :aria-label="`${items.length} competitions on the next matchday`"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focusedWithin = true"
    @focusout="focusedWithin = false"
    @keydown="onKeydown"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Matchday clash header -->
    <p class="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
      {{ items.length }} comps on the next matchday
      <span class="text-muted font-medium ml-1">({{ activeIndex + 1 }}/{{ items.length }})</span>
    </p>

    <!-- Padding buffer keeps 3D table corner pockets (-3px) and shadow unclipped -->
    <div class="overflow-hidden p-1.5 -m-1.5">
      <div
        class="flex items-stretch transition-transform duration-500 ease-out motion-reduce:transition-none"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <div
          v-for="(item, idx) in items"
          :key="`${item.tournamentSlug}-${item.event.date}-${idx}`"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${idx + 1} of ${items.length}: ${item.tournamentName}`"
          :aria-hidden="idx !== activeIndex ? 'true' : undefined"
          class="w-full shrink-0 px-1"
        >
          <NextEventCard
            v-bind="item"
            :now="now"
            :inactive="idx !== activeIndex"
          />
        </div>
      </div>
    </div>

    <!-- Named matchday switcher pills so players see all clashing comps immediately -->
    <div
      class="mt-3 flex flex-wrap gap-1.5"
      role="group"
      aria-label="Choose matchday competition"
    >
      <button
        v-for="(item, idx) in items"
        :key="`tab-${item.tournamentSlug}-${idx}`"
        type="button"
        :aria-pressed="idx === activeIndex"
        class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full border text-xs font-medium transition-colors cursor-pointer max-w-full"
        :class="
          idx === activeIndex
            ? 'bg-accent text-accent-ink border-accent font-semibold'
            : 'bg-raised text-muted border-line hover:text-ink hover:border-muted'
        "
        @click="goTo(idx)"
      >
        <span class="truncate">{{ item.tournamentName }}</span>
        <span class="text-[11px] opacity-80 shrink-0">· {{ item.venue }}</span>
      </button>
    </div>
  </section>
</template>
