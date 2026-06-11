<script setup lang="ts">
import { useSeo } from '../composables/useSeo'

useSeo({
  title: 'Leagues | Fylde 8 Ball',
  description: 'Fylde Coast pool league fixtures coming soon. Stay tuned for league tables, standings, and results from local 8-ball leagues.',
  path: '/leagues',
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="font-display text-2xl md:text-3xl text-ink mb-2">Leagues</h1>
    <div class="mt-10 flex flex-col items-center text-center motion-safe:animate-rise">
      <!-- Racked triangle of balls -->
      <svg width="140" height="126" viewBox="0 0 200 180" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="ball-sheen" cx="0.32" cy="0.26" r="0.9">
            <stop offset="0" stop-color="#fff" stop-opacity="0.75" />
            <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g>
          <circle cx="100" cy="28" r="19" fill="var(--color-ball-yellow)" />
          <circle cx="78" cy="66" r="19" fill="var(--color-ball-blue)" />
          <circle cx="122" cy="66" r="19" fill="var(--color-ball-red)" />
          <circle cx="56" cy="104" r="19" fill="var(--color-ball-purple)" />
          <circle cx="100" cy="104" r="19" fill="var(--color-ball-black)" />
          <circle cx="144" cy="104" r="19" fill="var(--color-ball-orange)" />
          <circle cx="34" cy="142" r="19" fill="var(--color-ball-green)" />
          <circle cx="78" cy="142" r="19" fill="var(--color-ball-maroon)" />
          <circle cx="122" cy="142" r="19" fill="var(--color-ball-yellow)" />
          <circle cx="166" cy="142" r="19" fill="var(--color-ball-blue)" />
          <circle cx="100" cy="28" r="19" fill="url(#ball-sheen)" />
          <circle cx="78" cy="66" r="19" fill="url(#ball-sheen)" />
          <circle cx="122" cy="66" r="19" fill="url(#ball-sheen)" />
          <circle cx="56" cy="104" r="19" fill="url(#ball-sheen)" />
          <circle cx="100" cy="104" r="19" fill="url(#ball-sheen)" />
          <circle cx="144" cy="104" r="19" fill="url(#ball-sheen)" />
          <circle cx="34" cy="142" r="19" fill="url(#ball-sheen)" />
          <circle cx="78" cy="142" r="19" fill="url(#ball-sheen)" />
          <circle cx="122" cy="142" r="19" fill="url(#ball-sheen)" />
          <circle cx="166" cy="142" r="19" fill="url(#ball-sheen)" />
        </g>
      </svg>
      <p class="text-ink font-semibold mt-6">League fixtures are racking up.</p>
      <p class="text-muted mt-1 text-sm">Tables, standings and results from local leagues are coming soon.</p>
    </div>
  </div>
</template>
