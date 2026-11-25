<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { getNextEvent, isEventPast, isTournamentActive } from '../utils/tournament'
import { formatDate, formatDateRange, SHORT_DATE, isToday } from '../utils/format'
import CalendarSubscribeMenu from '../components/CalendarSubscribeMenu.vue'
import BallBadge from '../components/BallBadge.vue'
import { ballForSlug } from '../utils/ballColor'
import { logoSrc } from '../utils/assets'
import type { TournamentDate } from '../types/tournament'

const tournaments = useTournaments()

// Resolve each logo asset URL once so filter/clock updates don't redo lookups.
const logoBySlug = new Map(tournaments.map(t => [t.slug, logoSrc(t.meta.logo)]))

const now = ref(new Date())
onMounted(() => {
  now.value = new Date()
})

const selectedVenue = ref<string>('all')
const selectedRules = ref<string>('all')
const showCompleted = ref<boolean>(false)

const venues = computed(() =>
  [...new Set(tournaments.map(t => t.meta.venue))].sort()
)

const rulesOptions = computed(() =>
  [...new Set(tournaments.map(t => t.format?.rules).filter((r): r is string => Boolean(r)))].sort()
)

function formatNextDate(d: TournamentDate | undefined, today: Date): string {
  if (!d) return 'Completed'
  if (d.date === 'TBC') return 'Next: Date TBC'
  if (d.endDate) return `Next: ${formatDateRange(d.date, d.endDate, SHORT_DATE)}`
  return isToday(d.date, today) ? 'Next: Today' : `Next: ${formatDate(d.date, SHORT_DATE)}`
}

const enriched = computed(() =>
  tournaments.map(t => {
    const active = isTournamentActive(t, now.value)
    const next = active ? getNextEvent(t.dates, now.value) : undefined
    const remainingCount = active ? t.dates.filter(d => !isEventPast(d, now.value)).length : 0
    return {
      ...t,
      active,
      nextEvent: next,
      nextDateLabel: formatNextDate(next, now.value),
      sortKey: next ? (next.date === 'TBC' ? '9999-12-31' : next.date) : '9999-99-99',
      remainingCount,
      logoUrl: logoBySlug.get(t.slug) ?? null,
    }
  })
)

const completedTotalCount = computed(() => enriched.value.filter(t => !t.active).length)

const filtered = computed(() =>
  enriched.value.filter(t => {
    if (!showCompleted.value && !t.active) return false
    if (selectedVenue.value !== 'all' && t.meta.venue !== selectedVenue.value) return false
    if (selectedRules.value !== 'all' && t.format?.rules !== selectedRules.value) return false
    return true
  })
)

const activeCards = computed(() =>
  filtered.value.filter(t => t.active).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
)

const completedCards = computed(() =>
  filtered.value.filter(t => !t.active).sort((a, b) => a.meta.name.localeCompare(b.meta.name))
)

function resetFilters() {
  selectedVenue.value = 'all'
  selectedRules.value = 'all'
  showCompleted.value = true
}

useSeo({
  title: 'Tournaments | Fylde 8 Ball',
  description: 'Browse all 8-ball pool tournaments on the Fylde Coast — Challenger Pool Series, Precision Cue Series, Ballers Blackpool events and more.',
  path: '/tournaments',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Pool Tournaments on the Fylde Coast',
        itemListElement: tournaments.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.meta.name,
          url: `${BASE_URL}/tournaments/${t.slug}`,
        })),
      }),
    },
  ],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <h1 class="font-display text-2xl md:text-3xl text-ink">Tournaments</h1>
      <CalendarSubscribeMenu />
    </div>

    <!-- Filter bar -->
    <div class="flex flex-wrap items-center gap-2 mb-6" role="region" aria-label="Filter tournaments">
      <label class="sr-only" for="filter-venue">Filter by venue</label>
      <div class="relative inline-flex items-center">
        <select
          id="filter-venue"
          v-model="selectedVenue"
          class="appearance-none h-11 rounded-lg border border-line bg-raised pl-3 pr-9 text-sm text-ink cursor-pointer"
        >
          <option value="all">All venues</option>
          <option v-for="venue in venues" :key="venue" :value="venue">{{ venue }}</option>
        </select>
        <svg
          class="pointer-events-none absolute right-2.5 h-4 w-4 text-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <label class="sr-only" for="filter-rules">Filter by rules</label>
      <div class="relative inline-flex items-center">
        <select
          id="filter-rules"
          v-model="selectedRules"
          class="appearance-none h-11 rounded-lg border border-line bg-raised pl-3 pr-9 text-sm text-ink cursor-pointer"
        >
          <option value="all">All rules</option>
          <option v-for="rule in rulesOptions" :key="rule" :value="rule">{{ rule }}</option>
        </select>
        <svg
          class="pointer-events-none absolute right-2.5 h-4 w-4 text-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <label
        v-if="completedTotalCount > 0"
        class="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg border border-line bg-raised text-sm text-ink cursor-pointer select-none"
      >
        <input v-model="showCompleted" type="checkbox" class="h-4 w-4 accent-[var(--accent)]" />
        Show completed ({{ completedTotalCount }})
      </label>

      <RouterLink
        to="/venues"
        class="inline-flex items-center min-h-[44px] px-2 text-sm font-medium text-accent hover:underline ml-auto"
      >
        Venues directory →
      </RouterLink>
    </div>

    <!-- Active tournaments -->
    <section v-if="activeCards.length" aria-labelledby="active-heading" class="mb-8">
      <h2 id="active-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Upcoming &amp; Active ({{ activeCards.length }})
      </h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="tournament in activeCards"
          :key="tournament.slug"
          :to="`/tournaments/${tournament.slug}`"
          class="relative flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-raised p-4 pl-5 shadow-sm transition hover:shadow-md motion-safe:hover:-translate-y-0.5"
        >
          <span
            class="absolute inset-y-0 left-0 w-1.5"
            :style="{ background: ballForSlug(tournament.slug).color }"
            aria-hidden="true"
          />
          <img
            v-if="tournament.logoUrl"
            :src="tournament.logoUrl"
            alt=""
            class="h-10 w-10 object-contain shrink-0 rounded bg-white/90 p-0.5"
            loading="lazy"
            decoding="async"
            width="40"
            height="40"
          />
          <BallBadge v-else :slug="tournament.slug" numbered size="2.5rem" />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-ink leading-snug">{{ tournament.meta.name }}</p>
            <p class="text-sm text-muted truncate">{{ tournament.meta.venue }}</p>
            <p class="mt-1.5 text-xs font-medium text-accent">{{ tournament.nextDateLabel }}</p>
            <div class="mt-2 flex flex-wrap gap-1.5 text-xs text-muted">
              <span v-if="tournament.format?.rules" class="rounded bg-sunken px-2 py-0.5">
                {{ tournament.format.rules }}
              </span>
              <span v-if="tournament.format?.entryFee" class="rounded bg-sunken px-2 py-0.5 font-medium text-ink">
                Entry {{ tournament.format.entryFee }}
              </span>
              <span class="rounded bg-sunken px-2 py-0.5">
                {{ tournament.remainingCount }} {{ tournament.remainingCount === 1 ? 'event' : 'events' }} left
              </span>
            </div>
          </div>
          <span class="text-accent text-sm shrink-0 self-center" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <!-- Completed tournaments -->
    <section v-if="completedCards.length" aria-labelledby="completed-heading">
      <h2 id="completed-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Completed ({{ completedCards.length }})
      </h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="tournament in completedCards"
          :key="tournament.slug"
          :to="`/tournaments/${tournament.slug}`"
          class="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-raised/70 p-4 pl-5 opacity-80 transition hover:opacity-100"
        >
          <span class="absolute inset-y-0 left-0 w-1.5 bg-line" aria-hidden="true" />
          <img
            v-if="tournament.logoUrl"
            :src="tournament.logoUrl"
            alt=""
            class="h-10 w-10 object-contain shrink-0 grayscale rounded bg-white/90 p-0.5"
            loading="lazy"
            decoding="async"
            width="40"
            height="40"
          />
          <BallBadge v-else :slug="tournament.slug" numbered size="2.5rem" />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-ink leading-snug">{{ tournament.meta.name }}</p>
            <p class="text-sm text-muted truncate">{{ tournament.meta.venue }}</p>
          </div>
          <span class="shrink-0 rounded-full bg-sunken px-2.5 py-0.5 text-xs font-medium text-muted">
            Finished
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- Empty filter state -->
    <div
      v-if="!activeCards.length && !completedCards.length"
      class="rounded-xl border border-line bg-raised p-8 text-center"
    >
      <p class="font-semibold text-ink mb-1">No matching tournaments</p>
      <p class="text-sm text-muted mb-4">Try clearing your filters or including completed competitions.</p>
      <button
        type="button"
        class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition cursor-pointer"
        @click="resetFilters"
      >
        Reset filters
      </button>
    </div>
  </div>
</template>
