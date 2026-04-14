<script setup lang="ts">
import { useTournaments } from '../composables/useTournaments'

const tournaments = useTournaments()

function logoSrc(logo: string): string | null {
  return logo ? new URL(`../assets/img/${logo}`, import.meta.url).href : null
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Tournaments</h1>
    <div class="divide-y divide-gray-100">
      <RouterLink
        v-for="tournament in tournaments"
        :key="tournament.slug"
        :to="`/tournaments/${tournament.slug}`"
        class="flex justify-between items-center py-4 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="logoSrc(tournament.meta.logo)"
            :src="logoSrc(tournament.meta.logo)!"
            :alt="tournament.meta.name"
            class="h-10 w-10 object-contain shrink-0"
          />
          <div>
            <p class="font-semibold text-gray-900">{{ tournament.meta.name }}</p>
            <p class="text-sm text-gray-500">{{ tournament.meta.venue }}</p>
          </div>
        </div>
        <div class="text-right ml-4">
          <p class="text-sm text-gray-500">
            {{ tournament.dates.length }}
            {{ tournament.dates.length === 1 ? 'event' : 'events' }}
          </p>
          <span class="text-accent text-sm">→</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
