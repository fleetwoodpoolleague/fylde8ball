<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useSeo, BASE_URL } from '../composables/useSeo'

useSeo({
  title: 'About | Fylde 8 Ball',
  description: 'Fylde 8 Ball is the home of pool on the Fylde Coast, covering tournaments, leagues, and local competition across Blackpool and Poulton-le-Fylde.',
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
        description: 'Home of pool on the Fylde Coast, covering tournaments, leagues, and local competition across Blackpool and Poulton-le-Fylde.',
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
    <h1 class="text-2xl font-bold text-gray-900 mb-4">About</h1>
    <div class="prose prose-gray text-gray-700 space-y-4">
      <p>
        Fylde 8 Ball is the home of pool in the Fylde Coast area, covering tournaments, leagues,
        and local competition across the region.
      </p>
      <p>
        This site provides up-to-date information on upcoming events, results, and league standings
        so players and spectators can keep track of everything happening in the local pool scene.
      </p>
      <h2 class="text-lg font-semibold text-gray-900 mt-6 mb-2">Contact</h2>
      <p>
        For enquiries about tournaments or leagues, please get in touch with the organiser directly
        via the contact details provided at each event.
      </p>
    </div>
  </div>
</template>
