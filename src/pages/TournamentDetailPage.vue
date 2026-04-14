<script setup lang="ts">
import { useTournament } from '../composables/useTournament'
import EventTimeline from '../components/EventTimeline.vue'

const props = defineProps<{
  slug: string
}>()

const tournament = useTournament(props.slug)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <template v-if="tournament">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ tournament.meta.name }}</h1>
        <p class="text-sm text-gray-500">
          {{ tournament.meta.venue }} · Organised by {{ tournament.meta.organiser }}
        </p>
      </div>
      <EventTimeline :dates="tournament.dates" />
    </template>
    <p v-else class="text-gray-500">Tournament not found.</p>
  </div>
</template>
