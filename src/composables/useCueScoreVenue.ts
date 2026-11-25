import { onMounted, ref } from 'vue'
import type { CueScoreVenueSnapshot } from '../types/cuescore'
import { summarizeVenuePayload } from '../utils/cuescore'

const snapshotModules = import.meta.glob<CueScoreVenueSnapshot>(
  '../data/cuescore/venues/*.json',
  { eager: true, import: 'default' },
)

const snapshotsBySlug = new Map<string, CueScoreVenueSnapshot>(
  Object.entries(snapshotModules).map(([path, data]) => [
    path.split('/').pop()!.replace(/\.json$/, ''),
    data,
  ]),
)

export function getCachedCueScoreVenue(slug: string): CueScoreVenueSnapshot | null {
  return snapshotsBySlug.get(slug) ?? null
}

export function useCueScoreVenue(slug: string, venueId: number | null) {
  const initial = venueId ? getCachedCueScoreVenue(slug) : null
  const venueInfo = ref<CueScoreVenueSnapshot | null>(initial)
  const loading = ref(Boolean(venueId && !initial))

  onMounted(async () => {
    if (!venueId || import.meta.env.SSR || typeof fetch !== 'function') return

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const res = await fetch(`https://api.cuescore.com/venue/?id=${venueId}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const normalized = summarizeVenuePayload(raw)
      if (normalized) venueInfo.value = normalized
    } catch {
      // Fall back quietly to build-time cached snapshot
    } finally {
      clearTimeout(timer)
      loading.value = false
    }
  })

  return { venueInfo, loading }
}
