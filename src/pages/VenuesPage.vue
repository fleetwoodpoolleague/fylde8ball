<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useVenues } from '../composables/useVenues'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { isTournamentActive } from '../utils/tournament'
import { logoSrc } from '../utils/assets'
import BallBadge from '../components/BallBadge.vue'
import { ballForSlug } from '../utils/ballColor'

const venues = useVenues()
const tournaments = useTournaments()

const now = ref(new Date())
onMounted(() => {
  now.value = new Date()
})

const venueCards = computed(() =>
  venues.map(venue => {
    const hosted = tournaments.filter(
      t => t.meta.venue.trim().toLowerCase() === venue.name.trim().toLowerCase(),
    )
    const activeCount = hosted.filter(t => isTournamentActive(t, now.value)).length
    return {
      ...venue,
      logoUrl: logoSrc(venue.logo),
      totalCount: hosted.length,
      activeCount,
    }
  }),
)

useSeo({
  title: 'Venues | Fylde 8 Ball',
  description: 'Pool clubs and tournament venues across Blackpool, Poulton-le-Fylde, and the Fylde Coast.',
  path: '/venues',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Pool Venues on the Fylde Coast',
        itemListElement: venues.map((v, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: v.name,
          url: `${BASE_URL}/venues/${v.slug}`,
        })),
      }),
    },
  ],
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="font-display text-2xl md:text-3xl text-ink mb-1">Venues</h1>
      <p class="text-sm text-muted">Pool clubs and tournament venues across the Fylde Coast and nearby.</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="venue in venueCards"
        :key="venue.slug"
        :to="`/venues/${venue.slug}`"
        class="relative flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-raised p-4 pl-5 shadow-sm transition hover:shadow-md motion-safe:hover:-translate-y-0.5"
      >
        <span
          class="absolute inset-y-0 left-0 w-1.5"
          :style="{ background: ballForSlug(venue.slug).color }"
          aria-hidden="true"
        />
        <img
          v-if="venue.logoUrl"
          :src="venue.logoUrl"
          alt=""
          class="h-10 w-10 object-contain shrink-0 rounded bg-white/90 p-0.5"
          loading="lazy"
          decoding="async"
          width="40"
          height="40"
        />
        <BallBadge v-else :slug="venue.slug" numbered size="2.5rem" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-ink leading-snug">{{ venue.name }}</p>
          <p class="text-sm text-muted">{{ venue.town }}</p>
          <div class="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span
              v-if="venue.activeCount > 0"
              class="rounded bg-chalk-tint text-chalk px-2 py-0.5 font-medium"
            >
              {{ venue.activeCount }} active
            </span>
            <span class="rounded bg-sunken text-muted px-2 py-0.5">
              {{ venue.totalCount }} {{ venue.totalCount === 1 ? 'competition' : 'competitions' }}
            </span>
          </div>
        </div>
        <span class="text-accent text-sm shrink-0 self-center" aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </div>
</template>
