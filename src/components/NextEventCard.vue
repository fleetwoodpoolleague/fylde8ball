<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { TournamentDate, TournamentFormat } from '../types/tournament'
import { formatDate, formatDateRange, LONG_DATE, isToday, formatTime } from '../utils/format'
import { isInProgress } from '../utils/tournament'
import { logoSrc as resolveLogo } from '../utils/assets'

const props = withDefaults(
  defineProps<{
    event: TournamentDate
    tournamentName: string
    tournamentSlug: string
    venue: string
    logo?: string
    format?: TournamentFormat
    now?: Date
    inactive?: boolean
  }>(),
  {
    inactive: false,
  },
)

const clock = computed(() => props.now ?? new Date())
const logoSrc = computed(() => resolveLogo(props.logo))

const dateLabel = computed(() => {
  if (props.event.date === 'TBC') return 'Date TBC — check with organiser'
  if (isInProgress(props.event, clock.value)) return 'In progress'
  if (props.event.endDate) return formatDateRange(props.event.date, props.event.endDate, LONG_DATE)
  return isToday(props.event.date, clock.value) ? 'Today' : formatDate(props.event.date, LONG_DATE)
})

const quickBadges = computed(() => {
  const f = props.format
  if (!f) return []
  const pills: string[] = []
  if (f.rules) pills.push(f.rules)
  if (f.entryFee) pills.push(`Entry ${f.entryFee}`)
  if (f.handicap === true) pills.push('Handicapped')
  else if (f.handicap === false) pills.push('Scratch')
  if (f.raceToWin) pills.push(`Race to ${f.raceToWin}`)
  return pills
})
</script>

<template>
  <article class="table-frame h-full flex flex-col">
    <!-- Corner pockets -->
    <div class="pocket pocket-tl" aria-hidden="true"></div>
    <div class="pocket pocket-tr" aria-hidden="true"></div>
    <div class="pocket pocket-bl" aria-hidden="true"></div>
    <div class="pocket pocket-br" aria-hidden="true"></div>
    <!-- Middle pockets (top and bottom rails) -->
    <div class="pocket pocket-tm" aria-hidden="true"></div>
    <div class="pocket pocket-bm" aria-hidden="true"></div>
    <!-- Felt surface -->
    <div class="felt texture-felt text-felt-ink p-5 sm:p-6 flex-1 flex flex-col">
      <div class="flex justify-between items-start gap-3 mb-2.5">
        <p class="text-xs font-semibold uppercase tracking-wider text-felt-ink-muted">Next Up</p>
        <img
          v-if="logoSrc"
          :src="logoSrc"
          :alt="tournamentName"
          class="h-10 w-auto object-contain rounded bg-white/90 p-1"
        />
      </div>
      <h2 class="text-xl font-bold leading-snug mb-1">{{ tournamentName }}</h2>
      <p class="text-sm font-medium mb-2.5">{{ event.name }}</p>
      <p class="text-sm text-felt-ink-muted">
        <span class="font-semibold text-felt-ink">{{ dateLabel }}</span><template v-if="!event.endDate && event.date !== 'TBC'"><template v-if="event.doorsTime"> · Doors {{ formatTime(event.doorsTime) }}</template><template v-if="event.time"> · {{ event.doorsTime ? 'Break-off ' : '' }}{{ formatTime(event.time) }}</template><template v-else-if="!event.doorsTime"> · Time TBC</template></template>
      </p>
      <p class="text-sm text-felt-ink-muted mb-3">{{ venue }}</p>

      <div v-if="quickBadges.length" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="pill in quickBadges"
          :key="pill"
          class="rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-medium text-felt-ink"
        >
          {{ pill }}
        </span>
      </div>

      <div class="mt-auto pt-1 flex justify-end">
        <RouterLink
          :to="`/tournaments/${tournamentSlug}`"
          :tabindex="inactive ? -1 : undefined"
          class="inline-flex items-center min-h-[44px] rounded-full bg-chalk text-chalk-ink px-5 py-2 text-sm font-semibold transition hover:brightness-110 motion-safe:hover:-translate-y-0.5"
        >Entry &amp; schedule &rarr;</RouterLink>
      </div>
    </div>
  </article>
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

/* Deeper, less saturated wood under dark pool-hall lighting */
[data-theme='dark'] .table-frame {
  background: linear-gradient(
    105deg,
    #1f1004 0%,
    #4a2509 8%,
    #613311 15%,
    #7a4a1e 22%,
    #542d0c 30%,
    #401f09 38%,
    #613813 46%,
    #7a4a1e 53%,
    #542d0c 60%,
    #401f09 68%,
    #5f320e 76%,
    #7a4a1e 84%,
    #542d0c 92%,
    #2a1404 100%
  );
}

.felt {
  background: var(--felt);
  border-radius: 4px;
  box-shadow:
    inset 0 0 0 1.5px rgba(217, 178, 95, 0.5),
    inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.pocket {
  position: absolute;
  background: radial-gradient(circle at 50% 50%, #2a2a2a, #000);
  border-radius: 50%;
  box-shadow:
    inset 0 0 8px #000,
    0 0 4px rgba(0, 0, 0, 0.6);
  z-index: 3;
  pointer-events: none;
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
