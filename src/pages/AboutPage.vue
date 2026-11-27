<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useSeo, BASE_URL } from '../composables/useSeo'

useSeo({
  title: 'About | Fylde 8 Ball',
  description: 'Fylde 8 Ball brings together upcoming 8-ball pool tournaments, entry details, and venue information across Blackpool and Poulton-le-Fylde.',
  path: '/about',
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
        description: 'Home of pool on the Fylde Coast, covering tournaments and local competition across Blackpool and Poulton-le-Fylde.',
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
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="font-display text-2xl md:text-3xl text-ink mb-4">About</h1>
    <div class="text-ink space-y-4">
      <p>
        Fylde 8 Ball is the home of pool on the Fylde Coast, bringing together upcoming 8-ball
        tournaments, entry details, and venue information across Blackpool, Poulton-le-Fylde, and
        the surrounding area.
      </p>
      <p>
        Whether you're looking for a weekend knockout or a season-long Blackball series, you can
        browse upcoming dates or sync the full calendar straight to your phone.
      </p>
      <h2 class="text-lg font-semibold text-ink mt-6 mb-2">Contact &amp; Entry</h2>
      <p>
        For entries or enquiries about a specific competition, please get in touch with the
        organiser directly using the phone, Facebook, or website details listed on each event page.
      </p>
      <div class="pt-2 flex flex-wrap items-center gap-3">
        <RouterLink
          to="/tournaments"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
        >
          Browse tournaments &rarr;
        </RouterLink>
        <RouterLink
          to="/leagues"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full border border-line bg-raised px-5 text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
        >
          Local leagues (coming soon)
        </RouterLink>
      </div>
    </div>
  </div>
</template>
