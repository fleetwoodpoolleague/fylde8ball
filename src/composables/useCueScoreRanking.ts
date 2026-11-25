import { onMounted, ref } from 'vue'
import type { CueScoreRankingSnapshot } from '../types/cuescore'
import { normalizeRankingPayload } from '../utils/cuescore'

const snapshotModules = import.meta.glob<CueScoreRankingSnapshot>(
  '../data/cuescore/rankings/*.json',
  { eager: true, import: 'default' },
)

const snapshotsBySlug = new Map<string, CueScoreRankingSnapshot>(
  Object.entries(snapshotModules).map(([path, data]) => [
    path.split('/').pop()!.replace(/\.json$/, ''),
    data,
  ]),
)

export function getCachedCueScoreRanking(slug: string): CueScoreRankingSnapshot | null {
  return snapshotsBySlug.get(slug) ?? null
}

export function useCueScoreRanking(slug: string, rankingId: number | null) {
  const initial = rankingId ? getCachedCueScoreRanking(slug) : null
  const ranking = ref<CueScoreRankingSnapshot | null>(initial)
  const loading = ref(Boolean(rankingId && !initial))
  const error = ref(false)
  const isLive = ref(false)

  onMounted(async () => {
    if (!rankingId || import.meta.env.SSR || typeof fetch !== 'function') return

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const res = await fetch(`https://api.cuescore.com/ranking/?id=${rankingId}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const normalized = normalizeRankingPayload(raw)
      if (normalized) {
        ranking.value = normalized
        isLive.value = true
        error.value = false
      }
    } catch {
      // Keep build-time snapshot when offline or CueScore is unreachable
      if (!ranking.value) error.value = true
    } finally {
      clearTimeout(timer)
      loading.value = false
    }
  })

  return { ranking, loading, error, isLive }
}
