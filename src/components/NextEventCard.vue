<script setup lang="ts">
import type { TournamentDate } from '../types/tournament'
import { formatDate, LONG_DATE } from '../utils/format'

defineProps<{
  event: TournamentDate
  tournamentName: string
  venue: string
}>()
</script>

<template>
  <div class="bg-accent text-white rounded-xl p-6">
    <p class="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">Next Event</p>
    <h2 class="text-xl font-bold mb-1">{{ event.name }}</h2>
    <p class="text-sm opacity-90 mb-3">{{ tournamentName }}</p>
    <p class="text-sm opacity-75">{{ formatDate(event.date, LONG_DATE) }}</p>
    <p class="text-sm opacity-75">{{ venue }}</p>
  </div>
</template>
