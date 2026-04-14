<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { TournamentDate } from '../types/tournament'
import { formatDate, LONG_DATE } from '../utils/format'

const props = defineProps<{
  event: TournamentDate
  tournamentName: string
  tournamentSlug: string
  venue: string
  logo?: string
}>()

const logoSrc = computed(() =>
  props.logo ? new URL(`../assets/img/${props.logo}`, import.meta.url).href : null
)
</script>

<template>
  <div class="table-frame">
    <!-- Corner pockets -->
    <div class="pocket pocket-tl" aria-hidden="true"></div>
    <div class="pocket pocket-tr" aria-hidden="true"></div>
    <div class="pocket pocket-bl" aria-hidden="true"></div>
    <div class="pocket pocket-br" aria-hidden="true"></div>
    <!-- Middle pockets (top and bottom rails) -->
    <div class="pocket pocket-tm" aria-hidden="true"></div>
    <div class="pocket pocket-bm" aria-hidden="true"></div>
    <!-- Felt surface -->
    <div class="felt text-white p-6">
      <div class="flex justify-between items-start mb-3">
        <p class="text-xs font-semibold uppercase tracking-wider opacity-75">Next Event</p>
        <img v-if="logoSrc" :src="logoSrc" :alt="tournamentName" class="h-10 w-auto object-contain" />
      </div>
      <p class="text-sm opacity-90 mb-1">{{ tournamentName }}</p>
      <h2 class="text-xl font-bold mb-3">{{ event.name }}</h2>
      <p class="text-sm opacity-75">{{ formatDate(event.date, LONG_DATE) }}</p>
      <p class="text-sm opacity-75 mb-3">{{ venue }}</p>
      <div class="flex justify-end">
        <RouterLink
          :to="`/tournaments/${tournamentSlug}`"
          class="text-sm font-semibold opacity-80 hover:opacity-100 underline underline-offset-2"
        >Details &rarr;</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-frame {
  position: relative;
  border-radius: 14px;
  background: linear-gradient(
    105deg,
    #3d1f08 0%,
    #7a3e12 8%,
    #a0541a 15%,
    #c47832 22%,
    #8b4a14 30%,
    #6b3410 38%,
    #a05c20 46%,
    #c47832 53%,
    #8b4a14 60%,
    #6b3410 68%,
    #9e5218 76%,
    #c47832 84%,
    #8b4a14 92%,
    #4a2208 100%
  );
  padding: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.15),
    inset 0 -1px 2px rgba(0, 0, 0, 0.4);
}

.felt {
  background: #1a5c3a;
  border-radius: 4px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.pocket {
  position: absolute;
  background: radial-gradient(circle at 50% 50%, #2a2a2a, #000);
  border-radius: 50%;
  box-shadow:
    inset 0 0 8px #000,
    0 0 4px rgba(0, 0, 0, 0.6);
  z-index: 3;
}

/* Corner pockets — 24×24px */
.pocket-tl { width: 24px; height: 24px; top: -3px; left: -3px; }
.pocket-tr { width: 24px; height: 24px; top: -3px; right: -3px; }
.pocket-bl { width: 24px; height: 24px; bottom: -3px; left: -3px; }
.pocket-br { width: 24px; height: 24px; bottom: -3px; right: -3px; }

/* Middle pockets — 20×20px (slightly smaller, matching real table proportions) */
.pocket-tm { width: 20px; height: 20px; top: -3px; left: 50%; transform: translateX(-50%); }
.pocket-bm { width: 20px; height: 20px; bottom: -3px; left: 50%; transform: translateX(-50%); }
</style>
