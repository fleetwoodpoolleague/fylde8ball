<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { getNextEvent, isUpcomingOrInProgress } from '../utils/tournament'
import NextEventCard from '../components/NextEventCard.vue'
import UpcomingEventsList from '../components/UpcomingEventsList.vue'
import EightBallIcon from '../components/EightBallIcon.vue'
import type { Tournament, TournamentDate, UpcomingEventInfo } from '../types/tournament'

const tournaments = useTournaments()
const activeTournaments = tournaments.filter(t => !t.completed)

interface NextEventInfo {
  event: TournamentDate
  tournament: Tournament
}

function findGlobalNextEvent(): NextEventInfo | null {
  const candidates: NextEventInfo[] = []
  for (const tournament of activeTournaments) {
    const next = getNextEvent(tournament.dates)
    if (next) candidates.push({ event: next, tournament })
  }
  if (!candidates.length) return null
  return candidates.sort((a, b) => {
    const aDate = a.event.date === 'TBC' ? 'Z' : a.event.date
    const bDate = b.event.date === 'TBC' ? 'Z' : b.event.date
    return aDate.localeCompare(bDate)
  })[0]
}

const nextEventInfo = findGlobalNextEvent()

function getUpcomingEvents(): UpcomingEventInfo[] {
  const upcoming: UpcomingEventInfo[] = []
  for (const tournament of activeTournaments) {
    for (const date of tournament.dates) {
      if (date.completed) continue
      if (!isUpcomingOrInProgress(date, 3)) continue
      if (
        nextEventInfo &&
        date === nextEventInfo.event
      ) continue
      upcoming.push({
        event: date,
        tournamentName: tournament.meta.name,
        tournamentSlug: tournament.slug,
        logo: tournament.meta.logo,
      })
    }
  }
  return upcoming.sort((a, b) => {
    const aDate = a.event.date === 'TBC' ? 'Z' : a.event.date
    const bDate = b.event.date === 'TBC' ? 'Z' : b.event.date
    return aDate.localeCompare(bDate)
  })
}

const upcomingEvents = getUpcomingEvents()

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
    <p v-else class="text-muted">No upcoming events.</p>
  </div>
</template>
