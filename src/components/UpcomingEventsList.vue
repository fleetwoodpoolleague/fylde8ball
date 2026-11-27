<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TournamentDate, UpcomingEventInfo } from '../types/tournament'
import { formatDate, formatDateRange, formatTime, SHORT_DATE, isToday } from '../utils/format'
import { isInProgress, isWeekendEvent, isWithinDays } from '../utils/tournament'
import CalendarSubscribeMenu from './CalendarSubscribeMenu.vue'
import { logoSrc } from '../utils/assets'

const props = defineProps<{
  events: UpcomingEventInfo[]
  heroEvents?: Set<TournamentDate>
  now?: Date
}>()

const clock = computed(() => props.now ?? new Date())

type TimeFilter = 'all' | 'week' | 'month' | 'weekends'

const activeFilter = ref<TimeFilter>('all')

const filterOptions: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'weekends', label: 'Weekends' },
]

const MONTH_HEADER: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
}

function monthKey(event: TournamentDate): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return 'TBC'
  return event.date.slice(0, 7)
}

function monthLabel(event: TournamentDate): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return 'Date TBC'
  return formatDate(event.date, MONTH_HEADER)
}

const defaultListEvents = computed(() =>
  props.heroEvents
    ? props.events.filter(i => !props.heroEvents!.has(i.event))
    : props.events,
)

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return defaultListEvents.value
  if (activeFilter.value === 'week') return props.events.filter(i => isWithinDays(i.event, 7, clock.value))
  if (activeFilter.value === 'month') return props.events.filter(i => isWithinDays(i.event, 30, clock.value))
  return props.events.filter(i => isWeekendEvent(i.event))
})

const groupedEvents = computed(() => {
  const groups: { key: string; label: string; items: UpcomingEventInfo[] }[] = []
  const byKey = new Map<string, { key: string; label: string; items: UpcomingEventInfo[] }>()
  for (const item of filteredEvents.value) {
    const key = monthKey(item.event)
    let group = byKey.get(key)
    if (!group) {
      group = { key, label: monthLabel(item.event), items: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
})

function eventDateLabel(event: TournamentDate): string {
  if (isInProgress(event, clock.value)) return 'In progress'
  if (event.endDate) return formatDateRange(event.date, event.endDate, SHORT_DATE)
  return isToday(event.date, clock.value) ? 'Today' : formatDate(event.date, SHORT_DATE)
}
</script>

<template>
  <section aria-labelledby="upcoming-heading">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h2 id="upcoming-heading" class="text-xs font-semibold uppercase tracking-wider text-muted">
        Coming up (next 3 months)
      </h2>
      <CalendarSubscribeMenu label="Sync all comps" />
    </div>

    <!-- Quick time filter pills -->
    <div
      v-if="defaultListEvents.length > 1 || (heroEvents && props.events.length > 1)"
      class="flex flex-wrap gap-1.5 mb-4"
      role="group"
      aria-label="Filter upcoming events"
    >
      <button
        v-for="opt in filterOptions"
        :key="opt.id"
        type="button"
        :aria-pressed="activeFilter === opt.id"
        class="inline-flex items-center min-h-[44px] px-3.5 rounded-full text-xs font-medium border transition-colors cursor-pointer"
        :class="
          activeFilter === opt.id
            ? 'bg-accent text-accent-ink border-accent'
            : 'bg-raised text-muted border-line hover:text-ink hover:border-muted'
        "
        @click="activeFilter = opt.id"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="groupedEvents.length" class="space-y-5">
      <div v-for="group in groupedEvents" :key="group.key">
        <h3 class="text-xs font-semibold text-muted mb-1">{{ group.label }}</h3>
        <div class="divide-y divide-line">
          <RouterLink
            v-for="(item, index) in group.items"
            :key="`${item.tournamentSlug}-${item.event.date}-${item.event.name}-${index}`"
            :to="`/tournaments/${item.tournamentSlug}`"
            class="py-3 min-h-[48px] flex justify-between items-center gap-3 text-sm -mx-2 px-2 rounded-lg hover:bg-sunken transition-colors"
          >
            <span class="flex items-center gap-2.5 min-w-0 text-ink">
              <img
                v-if="item.logo && logoSrc(item.logo)"
                :src="logoSrc(item.logo)!"
                alt=""
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
              :class="(isInProgress(item.event, clock) || isToday(item.event.date, clock)) ? 'text-accent font-semibold shrink-0' : 'text-muted shrink-0'"
            >
              {{ eventDateLabel(item.event) }}
            </span>
          </RouterLink>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-xl border border-line bg-raised p-5 text-center"
    >
      <p class="text-sm text-muted mb-3">No comps scheduled for this window.</p>
      <button
        type="button"
        class="inline-flex items-center justify-center min-h-[44px] rounded-full border border-line bg-surface px-4 text-xs font-semibold text-accent hover:border-accent transition cursor-pointer"
        @click="activeFilter = 'all'"
      >
        View all upcoming dates
      </button>
    </div>

    <RouterLink
      to="/tournaments"
      class="mt-4 inline-flex items-center min-h-[44px] py-2 text-sm text-accent hover:underline font-medium"
    >
      Browse all tournaments →
    </RouterLink>
  </section>
</template>
