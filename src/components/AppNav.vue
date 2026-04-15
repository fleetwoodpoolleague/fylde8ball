<script setup lang="ts">
import EightBallIcon from './EightBallIcon.vue'
</script>

<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink to="/" class="font-bold text-lg text-gray-900 hover:text-accent" active-class="">
        Fylde <EightBallIcon size="1.1em" /> Ball
      </RouterLink>
      <div class="flex gap-6 text-sm font-medium">
        <RouterLink
          to="/tournaments"
          class="text-gray-600 hover:text-accent"
          active-class="text-accent border-b-2 border-accent"
        >
          Tournaments
        </RouterLink>
        <RouterLink
          to="/leagues"
          class="text-gray-600 hover:text-accent"
          active-class="text-accent border-b-2 border-accent"
        >
          Leagues
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-gray-600 hover:text-accent"
          active-class="text-accent border-b-2 border-accent"
        >
          About
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
