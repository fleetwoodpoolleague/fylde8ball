<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentDate } from '../types/tournament'
import { formatDate, LONG_DATE } from '../utils/format'

const props = defineProps<{
  event: TournamentDate
  tournamentName: string
  venue: string
  logo?: string
}>()

const logoSrc = computed(() =>
  props.logo ? new URL(`../assets/img/${props.logo}`, import.meta.url).href : null
)
</script>

<template>
  <div class="bg-accent text-white rounded-xl p-6">
    <div class="flex justify-between items-start mb-3">
      <p class="text-xs font-semibold uppercase tracking-wider opacity-75">Next Event</p>
      <img v-if="logoSrc" :src="logoSrc" :alt="tournamentName" class="h-10 w-auto object-contain" />
    </div>
    <h2 class="text-xl font-bold mb-1">{{ event.name }}</h2>
    <p class="text-sm opacity-90 mb-3">{{ tournamentName }}</p>
    <p class="text-sm opacity-75">{{ formatDate(event.date, LONG_DATE) }}</p>
    <p class="text-sm opacity-75">{{ venue }}</p>
  </div>
</template>
