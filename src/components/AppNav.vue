<script setup lang="ts">
import { useRoute } from 'vue-router'
import EightBallIcon from './EightBallIcon.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()

const links = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/leagues', label: 'Leagues' },
  { to: '/about', label: 'About' },
]

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav aria-label="Main" class="bg-raised border-b border-line">
    <div class="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
      <RouterLink
        to="/"
        class="inline-flex items-center min-h-[44px] font-display text-lg text-ink hover:text-accent transition-colors"
        active-class=""
      >
        Fylde&nbsp;<EightBallIcon size="1.1em" />&nbsp;Ball
      </RouterLink>
      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-6 text-sm font-medium">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :aria-current="route.path === link.to ? 'page' : undefined"
            class="py-2 transition-colors"
            :class="isActive(link.to) ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-accent'"
          >
            {{ link.label }}
          </RouterLink>
        </div>
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>
