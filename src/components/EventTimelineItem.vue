<script setup lang="ts">
import type { TournamentDate } from '../types/tournament'
import { formatDate, SHORT_DATE, isToday } from '../utils/format'

const props = defineProps<{
  date: TournamentDate
  isNext: boolean
}>()
</script>

<template>
  <div class="relative pl-6 pb-6 last:pb-0">
    <!-- Spine dot -->
    <div
      class="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white ring-2"
      :class="
        isNext
          ? 'bg-accent ring-accent'
          : date.completed
          ? 'bg-gray-200 ring-gray-200'
          : 'bg-gray-300 ring-gray-300'
      "
    />
    <!-- Row -->
    <div class="flex justify-between items-baseline gap-4">
      <span
        class="text-sm"
        :class="
          isNext
            ? 'text-accent font-semibold'
            : date.completed
            ? 'text-gray-400 font-medium line-through'
            : 'text-gray-700 font-medium'
        "
      >
        {{ date.name }}
        <span
          v-if="isNext"
          class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium"
        >
          Next
        </span>
      </span>
      <span class="text-sm text-gray-500 shrink-0">{{ isToday(date.date) ? 'Today' : formatDate(date.date, SHORT_DATE) }}</span>
    </div>
  </div>
</template>
