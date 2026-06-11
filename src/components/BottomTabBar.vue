<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import HomeIcon from './icons/HomeIcon.vue'
import TrophyIcon from './icons/TrophyIcon.vue'
import LeagueIcon from './icons/LeagueIcon.vue'
import InfoIcon from './icons/InfoIcon.vue'

interface Tab {
  to: string
  label: string
  icon: Component
}

const tabs: Tab[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/tournaments', label: 'Tournaments', icon: TrophyIcon },
  { to: '/leagues', label: 'Leagues', icon: LeagueIcon },
  { to: '/about', label: 'About', icon: InfoIcon },
]

const route = useRoute()

// Path-prefix match so /tournaments/:slug keeps the Tournaments tab lit.
// (RouterLink's isActive only prefix-matches nested routes, and the detail
// page is a sibling route, not a child.) Home matches exactly.
function isTabActive(tab: Tab): boolean {
  if (tab.to === '/') return route.path === '/'
  return route.path === tab.to || route.path.startsWith(`${tab.to}/`)
}
</script>

<template>
  <nav
    aria-label="Primary"
    class="fixed inset-x-0 bottom-0 z-40 md:hidden bg-raised/95 backdrop-blur border-t border-line"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="flex">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        custom
        v-slot="{ href, navigate, isExactActive }"
      >
        <a
          :href="href"
          :aria-current="isExactActive ? 'page' : undefined"
          class="relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[11px] font-medium transition-colors"
          :class="isTabActive(tab) ? 'text-accent' : 'text-muted hover:text-ink'"
          @click="navigate"
        >
          <span
            v-if="isTabActive(tab)"
            class="absolute top-0 inset-x-5 h-0.5 rounded-full bg-brass"
            aria-hidden="true"
          />
          <component :is="tab.icon" size="22" />
          {{ tab.label }}
        </a>
      </RouterLink>
    </div>
  </nav>
</template>
