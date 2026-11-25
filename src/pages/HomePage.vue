<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { getNextEvent, isUpcomingOrInProgress } from '../utils/tournament'
import NextEventCard from '../components/NextEventCard.vue'
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

interface NextEventInfo {
  event: TournamentDate
  tournament: Tournament
}

const nextEventInfo = computed<NextEventInfo | null>(() => {
  const candidates: NextEventInfo[] = []
  for (const tournament of activeTournaments) {
    const next = getNextEvent(tournament.dates, now.value)
    if (next) candidates.push({ event: next, tournament })
  }
  if (!candidates.length) return null
  return candidates.sort((a, b) => {
    const aDate = a.event.date === 'TBC' ? 'Z' : a.event.date
    const bDate = b.event.date === 'TBC' ? 'Z' : b.event.date
    return aDate.localeCompare(bDate)
  })[0]
})

const upcomingEvents = computed<UpcomingEventInfo[]>(() => {
  const upcoming: UpcomingEventInfo[] = []
  for (const tournament of activeTournaments) {
    for (const date of tournament.dates) {
      if (date.completed) continue
      if (!isUpcomingOrInProgress(date, 3, now.value)) continue
      if (nextEventInfo.value && date === nextEventInfo.value.event) continue
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
    <div class="mb-8 motion-safe:animate-rise">
      <h1 class="font-display text-3xl md:text-4xl text-ink mb-1">Fylde <EightBallIcon size="1em" /> Ball</h1>
      <p class="text-muted">Pool events and fixtures for the Fylde coast</p>
    </div>

    <template v-if="nextEventInfo">
      <NextEventCard
        class="mb-6 motion-safe:animate-rise"
        style="animation-delay: 120ms"
        :event="nextEventInfo.event"
        :tournament-name="nextEventInfo.tournament.meta.name"
        :tournament-slug="nextEventInfo.tournament.slug"
        :venue="nextEventInfo.tournament.meta.venue"
        :logo="nextEventInfo.tournament.meta.logo"
      />
      <UpcomingEventsList
        v-if="upcomingEvents.length"
        :events="upcomingEvents"
        class="motion-safe:animate-rise"
        style="animation-delay: 240ms"
      />
    </template>
    <div
      v-else
      class="rounded-xl border border-line bg-raised p-8 text-center motion-safe:animate-rise"
    >
      <h2 class="font-display text-xl text-ink mb-2">No upcoming events scheduled</h2>
      <p class="text-sm text-muted mb-5">
        Check back soon, or browse past competitions and sync the calendar for new dates.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          to="/tournaments"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
        >
          Browse tournaments
        </RouterLink>
        <CalendarSubscribeMenu />
      </div>
    </div>
  </div>
</template>
