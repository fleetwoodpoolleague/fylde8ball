<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentDate } from '../types/tournament'
import { getNextEvent, isEventPast } from '../utils/tournament'
import EventTimelineItem from './EventTimelineItem.vue'

const props = defineProps<{
  dates: TournamentDate[]
  tournamentCompleted?: boolean
}>()

const nextEvent = computed(() =>
  props.tournamentCompleted ? undefined : getNextEvent(props.dates)
)
</script>

<template>
  <section aria-labelledby="schedule-heading">
    <h2 id="schedule-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
      Schedule ({{ dates.length }} {{ dates.length === 1 ? 'date' : 'dates' }})
    </h2>
    <div class="relative">
      <!-- Vertical spine line -->
      <div class="absolute left-1.5 top-2 bottom-2 w-px bg-line" aria-hidden="true" />
      <EventTimelineItem
        v-for="(date, index) in dates"
        :key="`${date.date}-${date.name}-${index}`"
        :date="date"
        :is-next="date === nextEvent"
        :is-past="Boolean(tournamentCompleted) || isEventPast(date)"
      />
    </div>
  </section>
</template>
