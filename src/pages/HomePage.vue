<script setup lang="ts">
import { useTournaments } from '../composables/useTournaments'
import { getNextEvent, isWithinMonths } from '../utils/tournament'
import NextEventCard from '../components/NextEventCard.vue'
import UpcomingEventsList from '../components/UpcomingEventsList.vue'
import EightBallIcon from '../components/EightBallIcon.vue'
import type { Tournament, TournamentDate, UpcomingEventInfo } from '../types/tournament'

const tournaments = useTournaments()

interface NextEventInfo {
  event: TournamentDate
  tournament: Tournament
}

function findGlobalNextEvent(): NextEventInfo | null {
  const candidates: NextEventInfo[] = []
  for (const tournament of tournaments) {
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
  for (const tournament of tournaments) {
    for (const date of tournament.dates) {
      if (date.completed) continue
      if (!isWithinMonths(date.date, 3)) continue
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
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Fylde <EightBallIcon size="1.2em" /> Ball</h1>
      <p class="text-gray-500">Pool fixtures for the Fylde area</p>
    </div>

    <template v-if="nextEventInfo">
      <NextEventCard
        class="mb-6"
        :event="nextEventInfo.event"
        :tournament-name="nextEventInfo.tournament.meta.name"
        :tournament-slug="nextEventInfo.tournament.slug"
        :venue="nextEventInfo.tournament.meta.venue"
        :logo="nextEventInfo.tournament.meta.logo"
      />
      <UpcomingEventsList
        v-if="upcomingEvents.length"
        :events="upcomingEvents"
      />
    </template>
    <p v-else class="text-gray-500">No upcoming events.</p>
  </div>
</template>
