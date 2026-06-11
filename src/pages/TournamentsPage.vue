<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import CalendarIcon from '../components/icons/CalendarIcon.vue'
import BallBadge from '../components/BallBadge.vue'
import { ballForSlug } from '../utils/ballColor'
import { logoSrc } from '../utils/assets'

const tournaments = useTournaments()

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
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl md:text-3xl text-ink">Tournaments</h1>
      <a
        href="https://calendar.google.com/calendar/r?cid=webcal://fylde8ball.co.uk/fylde8ball.ics"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <CalendarIcon size="1.1em" />
        Subscribe
      </a>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="tournament in tournaments"
        :key="tournament.slug"
        :to="`/tournaments/${tournament.slug}`"
        class="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-raised p-4 pl-5 shadow-sm transition hover:shadow-md motion-safe:hover:-translate-y-0.5"
      >
        <span
          class="absolute inset-y-0 left-0 w-1.5"
          :style="{ background: ballForSlug(tournament.slug).color }"
          aria-hidden="true"
        />
        <img
          v-if="logoSrc(tournament.meta.logo)"
          :src="logoSrc(tournament.meta.logo)!"
          :alt="tournament.meta.name"
          class="h-10 w-10 object-contain shrink-0"
          loading="lazy"
          decoding="async"
          width="40"
          height="40"
        />
        <BallBadge v-else :slug="tournament.slug" numbered size="2.5rem" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-ink">{{ tournament.meta.name }}</p>
          <p class="text-sm text-muted">{{ tournament.meta.venue }}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-sm text-muted">
            {{ tournament.dates.length }}
            {{ tournament.dates.length === 1 ? 'event' : 'events' }}
          </p>
          <span class="text-accent text-sm">→</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
