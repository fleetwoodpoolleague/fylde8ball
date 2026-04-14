<script setup lang="ts">
import type { TournamentDate } from '../types/tournament'
import { getNextEvent } from '../utils/tournament'
import EventTimelineItem from './EventTimelineItem.vue'

const props = defineProps<{
  dates: TournamentDate[]
}>()

const nextEvent = getNextEvent(props.dates)
</script>

<template>
  <div class="relative">
    <!-- Vertical spine line -->
    <div class="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200" />
    <EventTimelineItem
      v-for="date in dates"
      :key="date.date"
      :date="date"
      :isNext="date === nextEvent"
    />
  </div>
</template>
