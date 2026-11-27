<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { getNextEvent, isUpcomingOrInProgress } from '../utils/tournament'
import NextEventCarousel, { type NextEventSlide } from '../components/NextEventCarousel.vue'
import UpcomingEventsList from '../components/UpcomingEventsList.vue'
import CalendarSubscribeMenu from '../components/CalendarSubscribeMenu.vue'
import EightBallIcon from '../components/EightBallIcon.vue'
import type { Tournament, TournamentDate, UpcomingEventInfo } from '../types/tournament'

const tournaments = useTournaments()
const activeTournaments = tournaments.filter(t => !t.completed)

// Reactive clock refreshed on client mount so static SSG pages stay accurate on later days.
const now = ref(new Date())
onMounted(() => {
  now.value = new Date()
})

interface NextEventCandidate {
  event: TournamentDate
  tournament: Tournament
}

const nextEventSlides = computed<NextEventSlide[]>(() => {
  const candidates: NextEventCandidate[] = []
  for (const tournament of activeTournaments) {
    const next = getNextEvent(tournament.dates, now.value)
    if (next) candidates.push({ event: next, tournament })
  }
  if (!candidates.length) return []

  candidates.sort((a, b) => {
    const aDate = a.event.date === 'TBC' ? 'Z' : a.event.date
    const bDate = b.event.date === 'TBC' ? 'Z' : b.event.date
    return aDate.localeCompare(bDate)
  })

  const earliestDate = candidates[0].event.date
  const winners =
    earliestDate === 'TBC'
      ? [candidates[0]]
      : candidates.filter(c => c.event.date === earliestDate)

  return winners.map(({ event, tournament }) => ({
    event,
    tournamentName: tournament.meta.name,
    tournamentSlug: tournament.slug,
    venue: tournament.meta.venue,
    logo: tournament.meta.logo,
    format: { ...tournament.format, ...(event.format ?? {}) },
  }))
})

const heroEventSet = computed(() => new Set(nextEventSlides.value.map(s => s.event)))

const allUpcomingEvents = computed<UpcomingEventInfo[]>(() => {
  const upcoming: UpcomingEventInfo[] = []
  for (const tournament of activeTournaments) {
    for (const date of tournament.dates) {
      if (date.completed) continue
      if (!isUpcomingOrInProgress(date, 3, now.value)) continue
      upcoming.push({
        event: date,
        tournamentName: tournament.meta.name,
        tournamentSlug: tournament.slug,
        venue: tournament.meta.venue,
        logo: tournament.meta.logo,
      })
    }
  }
  return upcoming.sort((a, b) => {
    const aDate = a.event.date === 'TBC' ? 'Z' : a.event.date
    const bDate = b.event.date === 'TBC' ? 'Z' : b.event.date
    return aDate.localeCompare(bDate)
  })
})

const hasRemainingUpcoming = computed(() =>
  allUpcomingEvents.value.some(item => !heroEventSet.value.has(item.event)),
)

useSeo({
  title: 'Fylde 8 Ball | Pool Events on the Fylde Coast',
  description: 'Home of pool on the Fylde Coast. Upcoming 8-ball tournaments and fixtures at venues across Blackpool and Poulton-le-Fylde.',
  path: '/',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: 'Fylde 8 Ball',
        url: BASE_URL,
        sport: 'Pool',
        description: 'Home of pool on the Fylde Coast, covering tournaments, leagues, and local competition.',
        areaServed: {
          '@type': 'Place',
          name: 'Fylde Coast, Lancashire, England',
        },
      }),
    },
  ],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 md:py-12">
    <div class="flex flex-wrap items-end justify-between gap-3 mb-8 motion-safe:animate-rise">
      <div>
        <h1 class="font-display text-3xl md:text-4xl text-ink mb-1">Fylde <EightBallIcon size="1em" /> Ball</h1>
        <p class="text-muted">Pool comps and fixtures across the Fylde Coast</p>
      </div>
      <CalendarSubscribeMenu v-if="nextEventSlides.length && !hasRemainingUpcoming" label="Sync all comps" />
    </div>

    <template v-if="nextEventSlides.length">
      <NextEventCarousel
        class="mb-6 motion-safe:animate-rise"
        style="animation-delay: 120ms"
        :items="nextEventSlides"
        :now="now"
      />
      <UpcomingEventsList
        v-if="hasRemainingUpcoming"
        :events="allUpcomingEvents"
        :hero-events="heroEventSet"
        :now="now"
        class="motion-safe:animate-rise"
        style="animation-delay: 240ms"
      />
    </template>
    <div
      v-else
      class="rounded-xl border border-line bg-raised p-8 text-center motion-safe:animate-rise"
    >
      <h2 class="font-display text-xl text-ink mb-2">No upcoming comps scheduled</h2>
      <p class="text-sm text-muted mb-5">
        Sync the Fylde calendar so new tournament dates appear on your phone automatically, or browse past series.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          to="/tournaments"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
        >
          Browse tournaments
        </RouterLink>
        <CalendarSubscribeMenu label="Sync all comps" />
      </div>
    </div>
  </div>
</template>
