<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentDate } from '../types/tournament'
import { formatDate, formatDateRange, SHORT_DATE, isToday, formatTime } from '../utils/format'
import { isInProgress } from '../utils/tournament'
import BallBadge from './BallBadge.vue'

const props = defineProps<{
  date: TournamentDate
  isNext: boolean
}>()

const dotColor = computed(() => {
  if (props.isNext) return 'var(--accent)'
  return props.date.completed ? 'var(--line)' : 'var(--ink-muted)'
})

const dateLabel = computed(() => {
  if (isInProgress(props.date)) return 'In progress'
  if (props.date.endDate) return formatDateRange(props.date.date, props.date.endDate, SHORT_DATE)
  return isToday(props.date.date) ? 'Today' : formatDate(props.date.date, SHORT_DATE)
})
</script>

<template>
  <div class="relative pl-6 pb-6 last:pb-0">
    <!-- Spine dot: a mini pool ball -->
    <BallBadge :color="dotColor" size="12px" class="absolute left-0 top-1" />
    <!-- Row -->
    <div class="flex justify-between items-baseline gap-4">
      <span
        class="text-sm"
        :class="
          isNext
            ? 'text-accent font-semibold'
            : date.completed
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
      </span>
      <span class="text-sm text-muted shrink-0">
        {{ dateLabel }}<template v-if="date.time && !date.endDate"> · {{ formatTime(date.time) }}</template>
      </span>
    </div>
  </div>
</template>
