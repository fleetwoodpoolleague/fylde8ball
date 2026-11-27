<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TournamentDate } from '../types/tournament'
import { getNextEvent, isEventPast } from '../utils/tournament'
import EventTimelineItem from './EventTimelineItem.vue'

const props = defineProps<{
  dates: TournamentDate[]
  tournamentCompleted?: boolean
  now?: Date
}>()

const clientNow = ref(new Date())
onMounted(() => {
  clientNow.value = new Date()
})

const clock = computed(() => props.now ?? clientNow.value)
const showPastDates = ref(false)

const nextEvent = computed(() =>
  props.tournamentCompleted ? undefined : getNextEvent(props.dates, clock.value),
)

const firstActiveIndex = computed(() => {
  if (props.tournamentCompleted) return -1
  return props.dates.findIndex(d => !isEventPast(d, clock.value))
})

// Collapse leading completed events on long active series (>2 elapsed dates) so Next is immediately visible
const canCollapsePast = computed(
  () => !props.tournamentCompleted && firstActiveIndex.value > 2,
)

const hiddenPastCount = computed(() =>
  canCollapsePast.value ? firstActiveIndex.value : 0,
)

const visibleDates = computed(() => {
  if (!canCollapsePast.value || showPastDates.value) return props.dates
  return props.dates.slice(firstActiveIndex.value)
})
</script>

<template>
  <section aria-labelledby="schedule-heading">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h2 id="schedule-heading" class="text-xs font-semibold uppercase tracking-wider text-muted">
        Schedule ({{ dates.length }} {{ dates.length === 1 ? 'date' : 'dates' }})
      </h2>
      <button
        v-if="canCollapsePast"
        type="button"
        :aria-expanded="showPastDates"
        class="inline-flex items-center min-h-[44px] -my-2 px-2.5 rounded-lg text-xs font-medium text-accent hover:bg-sunken transition-colors cursor-pointer"
        @click="showPastDates = !showPastDates"
      >
        {{ showPastDates ? `Hide ${hiddenPastCount} completed` : `Show ${hiddenPastCount} completed` }}
      </button>
    </div>
    <div class="relative">
      <!-- Vertical spine line -->
      <div class="absolute left-1.5 top-2 bottom-2 w-px bg-line" aria-hidden="true" />
      <EventTimelineItem
        v-for="(date, index) in visibleDates"
        :key="`${date.date}-${date.name}-${index}`"
        :date="date"
        :is-next="date === nextEvent"
        :is-past="Boolean(tournamentCompleted) || isEventPast(date, clock)"
        :now="clock"
      />
    </div>
  </section>
</template>
