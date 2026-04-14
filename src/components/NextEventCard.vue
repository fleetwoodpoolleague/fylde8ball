<script setup lang="ts">
import type { TournamentDate } from '../types/tournament'

defineProps<{
  event: TournamentDate
  tournamentName: string
  venue: string
}>()

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="bg-accent text-white rounded-xl p-6">
    <p class="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">Next Event</p>
    <h2 class="text-xl font-bold mb-1">{{ event.name }}</h2>
    <p class="text-sm opacity-90 mb-3">{{ tournamentName }}</p>
    <p class="text-sm opacity-75">{{ formatDate(event.date) }}</p>
    <p class="text-sm opacity-75">{{ venue }}</p>
  </div>
</template>
