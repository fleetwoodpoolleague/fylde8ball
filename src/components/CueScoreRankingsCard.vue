<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCueScoreRanking } from '../composables/useCueScoreRanking'

const props = defineProps<{
  slug: string
  rankingId: number | null
  fallbackUrl?: string | null
}>()

const { ranking, loading, error, isLive } = useCueScoreRanking(props.slug, props.rankingId)

const searchQuery = ref('')
const expanded = ref(false)
const DEFAULT_LIMIT = 10

const filteredParticipants = computed(() => {
  const list = ranking.value?.participants ?? []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(p => p.name.toLowerCase().includes(q))
})

const visibleParticipants = computed(() => {
  if (searchQuery.value.trim() || expanded.value) {
    return filteredParticipants.value
  }
  return filteredParticipants.value.slice(0, DEFAULT_LIMIT)
})

const hasMore = computed(
  () => !searchQuery.value.trim() && filteredParticipants.value.length > DEFAULT_LIMIT,
)

const externalUrl = computed(() => ranking.value?.url || props.fallbackUrl || null)

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-ball-yellow text-[#111] font-bold'
  if (rank === 2) return 'bg-sunken text-ink font-bold'
  if (rank === 3) return 'bg-ball-orange/20 text-ink font-bold'
  return 'text-muted font-medium'
}
</script>

<template>
  <section
    v-if="rankingId"
    aria-labelledby="rankings-heading"
    class="mb-6 rounded-xl border border-line bg-raised p-4 sm:p-5"
  >
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <h2 id="rankings-heading" class="text-xs font-semibold uppercase tracking-wider text-muted">
          Series Standings
        </h2>
        <span
          v-if="isLive"
          class="inline-flex items-center gap-1 rounded-full bg-chalk-tint px-2 py-0.5 text-[11px] font-medium text-chalk"
        >
          Live
        </span>
      </div>
      <a
        v-if="externalUrl"
        :href="externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center min-h-[44px] -my-2 px-1 text-xs font-medium text-accent hover:underline"
      >
        Full table on CueScore &rarr;
      </a>
    </div>

    <!-- Loading skeleton (only shown when no cached SSG snapshot exists) -->
    <div v-if="loading && !ranking" class="space-y-2 py-2" aria-busy="true">
      <div v-for="n in 5" :key="n" class="h-8 rounded bg-sunken animate-pulse" />
    </div>

    <!-- Graceful fallback if CueScore unreachable and no cached snapshot -->
    <div v-else-if="error && !ranking" class="text-sm text-muted py-2">
      <p>Live standings are temporarily unavailable.</p>
      <a
        v-if="externalUrl"
        :href="externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-2 inline-flex items-center min-h-[44px] text-accent font-medium hover:underline"
      >
        View standings on CueScore &rarr;
      </a>
    </div>

    <!-- Standings table -->
    <template v-else-if="ranking && ranking.participants.length">
      <div v-if="ranking.participants.length > 5" class="relative mb-3">
        <label class="sr-only" for="ranking-player-search">Search players in standings</label>
        <input
          id="ranking-player-search"
          v-model="searchQuery"
          type="search"
          placeholder="Find a player..."
          class="w-full h-11 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted"
        />
      </div>

      <div v-if="visibleParticipants.length" class="overflow-x-auto -mx-2 px-2">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-line text-left text-xs text-muted">
              <th scope="col" class="py-2 pr-2 font-semibold w-12">Pos</th>
              <th scope="col" class="py-2 pr-3 font-semibold">Player</th>
              <th scope="col" class="py-2 px-2 font-semibold text-right w-16">Played</th>
              <th scope="col" class="py-2 pl-2 font-semibold text-right w-16">Pts</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="player in visibleParticipants"
              :key="`${player.participantId}-${player.rank}`"
              class="hover:bg-sunken/60 transition-colors"
            >
              <td class="py-2.5 pr-2">
                <span
                  class="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs"
                  :class="rankBadgeClass(player.rank)"
                >
                  {{ player.rank }}
                </span>
              </td>
              <td class="py-2.5 pr-3 font-medium text-ink">
                <a
                  v-if="player.url"
                  :href="player.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-accent hover:underline"
                >
                  {{ player.name }}
                </a>
                <template v-else>{{ player.name }}</template>
              </td>
              <td class="py-2.5 px-2 text-right text-muted tabular-nums">
                {{ player.tournamentCount }}
              </td>
              <td class="py-2.5 pl-2 text-right font-semibold text-ink tabular-nums">
                {{ player.points }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-4 text-center text-sm text-muted">
        <p class="mb-2">No players matching "{{ searchQuery }}".</p>
        <button
          type="button"
          class="inline-flex items-center min-h-[44px] px-4 rounded-full border border-line text-xs font-semibold text-accent hover:border-accent cursor-pointer"
          @click="searchQuery = ''"
        >
          Clear search
        </button>
      </div>

      <div v-if="hasMore" class="mt-3 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center min-h-[44px] px-4 rounded-full border border-line bg-surface text-xs font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Show top 10' : `Show all ${filteredParticipants.length} players` }}
        </button>
      </div>
    </template>

    <p v-else-if="ranking" class="text-sm text-muted py-1">
      Standings will appear once results are posted on CueScore.
    </p>
  </section>
</template>
