<script setup lang="ts">
import type { UpcomingEventInfo } from '../types/tournament'
import { formatDate, SHORT_DATE, isToday } from '../utils/format'
import CalendarIcon from './icons/CalendarIcon.vue'

defineProps<{
  events: UpcomingEventInfo[]
}>()

function logoSrc(logo: string): string {
  return new URL(`../assets/img/${logo}`, import.meta.url).href
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500">Upcoming</h3>
      <a
        href="https://calendar.google.com/calendar/r?cid=webcal://fylde8ball.co.uk/fylde8ball.ics"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 text-xs text-accent hover:underline"
      >
        <CalendarIcon size="1em" />
        Subscribe
      </a>
    </div>
    <div class="divide-y divide-gray-100">
      <RouterLink
        v-for="item in events"
        :key="`${item.tournamentSlug}-${item.event.date}`"
        :to="`/tournaments/${item.tournamentSlug}`"
        class="py-2 flex justify-between items-center text-sm -mx-2 px-2 rounded hover:bg-gray-50 transition-colors"
      >
        <span class="flex items-center gap-2 text-gray-700">
          <img v-if="item.logo" :src="logoSrc(item.logo)" :alt="item.tournamentName" class="h-6 w-auto object-contain" />
          {{ item.tournamentName }} — {{ item.event.name }}
        </span>
        <span :class="isToday(item.event.date) ? 'text-accent font-medium shrink-0 ml-4' : 'text-gray-500 shrink-0 ml-4'">
          {{ isToday(item.event.date) ? 'Today' : formatDate(item.event.date, SHORT_DATE) }}
        </span>
      </RouterLink>
    </div>
    <RouterLink
      to="/tournaments"
      class="mt-4 inline-block text-sm text-accent hover:underline font-medium"
    >
      View all →
    </RouterLink>
  </div>
</template>
