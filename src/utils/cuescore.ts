import type { TournamentMeta } from '../types/tournament'
import type { Venue } from '../types/venue'
import type {
  CueScoreRankingSnapshot,
  CueScoreTableGroup,
  CueScoreVenueSnapshot,
} from '../types/cuescore'

export function parseCueScoreId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed)
      return Number.isSafeInteger(n) && n > 0 ? n : null
    }
  }
  return null
}

export function extractRankingIdFromUrl(url?: string | null): number | null {
  if (!url) return null
  const match = url.trim().match(/cuescore\.com\/ranking\/[^/]+\/(\d+)/i)
  return match ? parseCueScoreId(match[1]) : null
}

export function resolveCueScoreRankingId(meta?: TournamentMeta | null): number | null {
  if (!meta) return null
  return parseCueScoreId(meta.cuescoreRankingId) ?? extractRankingIdFromUrl(meta.urls?.scoreboard)
}

export function resolveCueScoreVenueId(venue?: Venue | null): number | null {
  if (!venue) return null
  return parseCueScoreId(venue.cuescoreVenueId)
}

function normalizeUrl(url: unknown): string {
  if (typeof url !== 'string' || !url.trim()) return ''
  const trimmed = url.trim()
  return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
}

export function normalizeRankingPayload(
  raw: unknown,
  fetchedAt: string = new Date().toISOString(),
): CueScoreRankingSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.error || !obj.rankingId) return null

  const rawParticipants = Array.isArray(obj.participants) ? obj.participants : []
  const rawTournaments = Array.isArray(obj.tournaments) ? obj.tournaments : []

  return {
    rankingId: Number(obj.rankingId),
    name: String(obj.name ?? ''),
    url: normalizeUrl(obj.url),
    ...(obj.season ? { season: Number(obj.season) } : {}),
    fetchedAt,
    participants: rawParticipants.map((p: Record<string, unknown>) => ({
      rank: Number(p.rank ?? 0),
      name: String(p.name ?? ''),
      participantId: Number(p.participantId ?? 0),
      url: normalizeUrl(p.url),
      points: Number(p.points ?? 0),
      tournamentCount: Number(p.tournamentCount ?? 0),
    })),
    tournaments: rawTournaments.map((t: Record<string, unknown>) => ({
      id: Number(t.id ?? 0),
      name: String(t.name ?? ''),
      url: normalizeUrl(t.url),
      starttime: String(t.starttime ?? ''),
      ...(t.stoptime ? { stoptime: String(t.stoptime) } : {}),
      status: String(t.status ?? ''),
    })),
  }
}

export function summarizeVenuePayload(
  raw: unknown,
  fetchedAt: string = new Date().toISOString(),
): CueScoreVenueSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.error || !obj.venueId) return null

  const tables = Array.isArray(obj.tables) ? obj.tables : []
  const groupMap = new Map<string, CueScoreTableGroup>()

  for (const item of tables) {
    const t = (item ?? {}) as Record<string, unknown>
    const manufacturer = String(t.manufacturer ?? '').trim()
    const model = String(t.model ?? '').trim()
    const size = typeof t.size === 'number' && t.size > 0 ? t.size : null
    const cloth = String(t.cloth ?? '').trim()
    const branch = String(t.branch ?? '').trim()
    const key = `${branch}|${size ?? ''}|${manufacturer}|${model}|${cloth}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.count += 1
    } else {
      groupMap.set(key, { count: 1, manufacturer, model, size, cloth, branch })
    }
  }

  return {
    venueId: Number(obj.venueId),
    name: String(obj.name ?? ''),
    url: normalizeUrl(obj.url),
    fetchedAt,
    totalTables: tables.length,
    tableGroups: [...groupMap.values()].sort((a, b) => b.count - a.count),
  }
}
