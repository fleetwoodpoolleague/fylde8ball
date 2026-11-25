<script setup lang="ts">
import type { TournamentDate, UpcomingEventInfo } from '../types/tournament'
import { formatDate, formatDateRange, formatTime, SHORT_DATE, isToday } from '../utils/format'
import { isInProgress } from '../utils/tournament'
import CalendarSubscribeMenu from './CalendarSubscribeMenu.vue'
import { logoSrc } from '../utils/assets'

defineProps<{
  events: UpcomingEventInfo[]
}>()

function eventDateLabel(event: TournamentDate): string {
  if (isInProgress(event)) return 'In progress'
  if (event.endDate) return formatDateRange(event.date, event.endDate, SHORT_DATE)
  return isToday(event.date) ? 'Today' : formatDate(event.date, SHORT_DATE)
}
</script>

<template>
  <section aria-labelledby="upcoming-heading">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h2 id="upcoming-heading" class="text-xs font-semibold uppercase tracking-wider text-muted">
        Coming up (next 3 months)
      </h2>
      <CalendarSubscribeMenu />
    </div>
    <div class="divide-y divide-line">
      <RouterLink
        v-for="(item, index) in events"
        :key="`${item.tournamentSlug}-${item.event.date}-${item.event.name}-${index}`"
        :to="`/tournaments/${item.tournamentSlug}`"
        class="py-3 min-h-[48px] flex justify-between items-center gap-3 text-sm -mx-2 px-2 rounded-lg hover:bg-sunken transition-colors"
      >
        <span class="flex items-center gap-2.5 min-w-0 text-ink">
          <img
            v-if="item.logo && logoSrc(item.logo)"
            :src="logoSrc(item.logo)!"
            :alt="''"
            class="h-7 w-7 object-contain shrink-0 rounded bg-white/90 p-0.5"
            loading="lazy"
            decoding="async"
            width="28"
            height="28"
          />
          <span class="min-w-0">
            <span class="block font-medium text-ink leading-snug">
              {{ item.tournamentName }} — {{ item.event.name }}
            </span>
            <span
              v-if="item.venue || (item.event.time && !item.event.endDate)"
              class="block text-xs text-muted mt-0.5"
            >
              <template v-if="item.venue">{{ item.venue }}</template>
              <template v-if="item.venue && item.event.time && !item.event.endDate"> · </template>
              <template v-if="item.event.time && !item.event.endDate">{{ formatTime(item.event.time) }}</template>
            </span>
          </span>
        </span>
        <span
          :class="(isInProgress(item.event) || isToday(item.event.date)) ? 'text-accent font-semibold shrink-0' : 'text-muted shrink-0'"
        >
          {{ eventDateLabel(item.event) }}
        </span>
      </RouterLink>
    </div>
    <RouterLink
      to="/tournaments"
      class="mt-3 inline-flex items-center min-h-[44px] py-2 text-sm text-accent hover:underline font-medium"
    >
      Browse all tournaments →
    </RouterLink>
  </section>
</template>
