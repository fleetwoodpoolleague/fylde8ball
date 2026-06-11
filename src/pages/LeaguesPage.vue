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
    <h1 class="text-2xl font-bold text-ink mb-2">Leagues</h1>
    <p class="text-muted">League fixtures coming soon.</p>
  </div>
</template>
