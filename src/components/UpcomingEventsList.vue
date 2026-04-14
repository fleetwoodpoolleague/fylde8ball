<script setup lang="ts">
import type { UpcomingEventInfo } from '../types/tournament'
import { formatDate, SHORT_DATE } from '../utils/format'

defineProps<{
  events: UpcomingEventInfo[]
}>()
</script>

<template>
  <div>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Upcoming</h3>
    <div class="divide-y divide-gray-100">
      <div
        v-for="item in events"
        :key="`${item.tournamentSlug}-${item.event.date}`"
        class="py-2 flex justify-between text-sm"
      >
        <span class="text-gray-700">{{ item.tournamentName }} — {{ item.event.name }}</span>
        <span class="text-gray-500">{{ formatDate(item.event.date, SHORT_DATE) }}</span>
      </div>
    </div>
    <RouterLink
      to="/tournaments"
      class="mt-4 inline-block text-sm text-accent hover:underline font-medium"
    >
      View all →
    </RouterLink>
  </div>
</template>
