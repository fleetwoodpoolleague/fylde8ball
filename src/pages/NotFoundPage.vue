<script setup lang="ts">
import { useSeo } from '../composables/useSeo'

useSeo({
  title: 'Page not found | Fylde 8 Ball',
  description: 'The page you were looking for could not be found on Fylde 8 Ball.',
  path: '/404',
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="rounded-xl border border-line bg-raised p-8 text-center">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">404</p>
      <h1 class="font-display text-2xl md:text-3xl text-ink mb-2">Page not found</h1>
      <p class="text-sm text-muted mb-6">
        That link doesn't lead anywhere — check the address or head back to upcoming pool events.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          to="/"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
        >
          Go to homepage
        </RouterLink>
        <RouterLink
          to="/tournaments"
          class="inline-flex items-center justify-center min-h-[44px] rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:border-accent hover:text-accent transition"
        >
          Browse tournaments
        </RouterLink>
      </div>
    </div>
  </div>
</template>
