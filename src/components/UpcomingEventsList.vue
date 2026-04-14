<script setup lang="ts">
import type { TournamentDate } from '../types/tournament'

defineProps<{
  events: TournamentDate[]
  tournamentSlug: string
}>()

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Upcoming</h3>
    <div class="divide-y divide-gray-100">
      <div
        v-for="event in events"
        :key="event.date"
        class="py-2 flex justify-between text-sm"
      >
        <span class="text-gray-700">{{ event.name }}</span>
        <span class="text-gray-500">{{ formatDate(event.date) }}</span>
      </div>
    </div>
    <RouterLink
      :to="`/tournaments/${tournamentSlug}`"
      class="mt-4 inline-block text-sm text-accent hover:underline font-medium"
    >
      View all →
    </RouterLink>
  </div>
</template>
