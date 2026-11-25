<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentDate } from '../types/tournament'
import { formatDate, formatDateRange, SHORT_DATE, isToday, formatTime } from '../utils/format'
import { isInProgress } from '../utils/tournament'
import BallBadge from './BallBadge.vue'

const props = defineProps<{
  date: TournamentDate
  isNext: boolean
  isPast?: boolean
}>()

const elapsed = computed(() => Boolean(props.isPast || props.date.completed))

const dotColor = computed(() => {
  if (props.isNext) return 'var(--accent)'
  return elapsed.value ? 'var(--line)' : 'var(--ink-muted)'
})

const dateLabel = computed(() => {
  if (isInProgress(props.date)) return 'In progress'
  if (props.date.endDate) return formatDateRange(props.date.date, props.date.endDate, SHORT_DATE)
  return isToday(props.date.date) ? 'Today' : formatDate(props.date.date, SHORT_DATE)
})

const timeSummary = computed(() => {
  if (props.date.endDate) return ''
  const parts: string[] = []
  if (props.date.doorsTime) parts.push(`Doors ${formatTime(props.date.doorsTime)}`)
  if (props.date.time) {
    parts.push(
      props.date.doorsTime
        ? `Break-off ${formatTime(props.date.time)}`
        : formatTime(props.date.time),
    )
  }
  return parts.join(' · ')
})

const statusMeta = computed(() => {
  if (elapsed.value || !props.date.entryStatus) return null
  const map: Record<NonNullable<TournamentDate['entryStatus']>, { label: string; cls: string }> = {
    open: { label: 'Entries open', cls: 'bg-chalk-tint text-chalk' },
    'walk-in': { label: 'Walk-in', cls: 'bg-sunken text-ink' },
    waitlist: { label: 'Waitlist', cls: 'bg-sunken text-muted' },
    full: { label: 'Full', cls: 'bg-sunken text-muted' },
  }
  return map[props.date.entryStatus]
})

const overrideBadges = computed(() => {
  const f = props.date.format
  if (!f) return []
  const items: string[] = []
  if (f.rules) items.push(f.rules)
  if (f.type) items.push(f.type)
  if (f.raceToWin) items.push(`Race to ${f.raceToWin}`)
  if (f.entryFee) items.push(`Entry ${f.entryFee}`)
  if (f.prizeFund) items.push(f.prizeFund)
  return items
})
</script>

<template>
  <div class="relative pl-6 pb-6 last:pb-0">
    <!-- Spine dot: a mini pool ball -->
    <BallBadge :color="dotColor" size="12px" class="absolute left-0 top-1" />
    <!-- Row: stacks on narrow mobile so multi-day date ranges never crush titles -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
      <span
        class="text-sm"
        :class="
          isNext
            ? 'text-accent font-semibold'
            : elapsed
            ? 'text-muted font-medium line-through'
            : 'text-ink font-medium'
        "
      >
        {{ date.name }}
        <span
          v-if="isNext"
          class="ml-2 text-xs bg-chalk-tint text-chalk px-2 py-0.5 rounded-full font-medium"
        >
          Next
        </span>
        <span
          v-if="statusMeta"
          class="ml-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
          :class="statusMeta.cls"
        >
          {{ statusMeta.label }}
        </span>
      </span>
      <span class="text-sm text-muted shrink-0">
        {{ dateLabel }}<template v-if="timeSummary"> · {{ timeSummary }}</template>
      </span>
    </div>
    <div v-if="overrideBadges.length" class="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted">
      <span
        v-for="badge in overrideBadges"
        :key="badge"
        class="rounded bg-sunken px-2 py-0.5"
      >
        {{ badge }}
      </span>
    </div>
  </div>
</template>
