import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const FETCH_TIMEOUT_MS = 8000

export function parseCueScoreId(value) {
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

export function extractRankingIdFromUrl(url) {
  if (typeof url !== 'string') return null
  const match = url.trim().match(/cuescore\.com\/ranking\/[^/]+\/(\d+)/i)
  return match ? parseCueScoreId(match[1]) : null
}

export function normalizeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return trimmed
}

export function normalizeRankingPayload(raw, fetchedAt = new Date().toISOString()) {
  if (!raw || typeof raw !== 'object' || raw.error || !raw.rankingId) return null
  return {
    rankingId: Number(raw.rankingId),
    name: String(raw.name ?? ''),
    url: normalizeUrl(raw.url),
    ...(raw.season ? { season: Number(raw.season) } : {}),
    fetchedAt,
    participants: Array.isArray(raw.participants)
      ? raw.participants.map(p => ({
          rank: Number(p.rank ?? 0),
          name: String(p.name ?? ''),
          participantId: Number(p.participantId ?? 0),
          url: normalizeUrl(p.url),
          points: Number(p.points ?? 0),
          tournamentCount: Number(p.tournamentCount ?? 0),
        }))
      : [],
    tournaments: Array.isArray(raw.tournaments)
      ? raw.tournaments.map(t => ({
          id: Number(t.id ?? 0),
          name: String(t.name ?? ''),
          url: normalizeUrl(t.url),
          starttime: String(t.starttime ?? ''),
          ...(t.stoptime ? { stoptime: String(t.stoptime) } : {}),
          status: String(t.status ?? ''),
        }))
      : [],
  }
}

export function summarizeVenuePayload(raw, fetchedAt = new Date().toISOString()) {
  if (!raw || typeof raw !== 'object' || raw.error || !raw.venueId) return null
  const tables = Array.isArray(raw.tables) ? raw.tables : []
  const groupMap = new Map()

  for (const t of tables) {
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

  const tableGroups = [...groupMap.values()].sort((a, b) => b.count - a.count)

  return {
    venueId: Number(raw.venueId),
    name: String(raw.name ?? ''),
    url: normalizeUrl(raw.url),
    fetchedAt,
    totalTables: tables.length,
    tableGroups,
  }
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = resolve(__dirname, '..')
  const tournamentsDir = resolve(root, 'src/data/tournaments')
  const venuesDir = resolve(root, 'src/data/venues')
  const rankingsOutDir = resolve(root, 'src/data/cuescore/rankings')
  const venuesOutDir = resolve(root, 'src/data/cuescore/venues')

  mkdirSync(rankingsOutDir, { recursive: true })
  mkdirSync(venuesOutDir, { recursive: true })

  let rankingsFetched = 0
  let rankingsSkipped = 0

  if (existsSync(tournamentsDir)) {
    const files = readdirSync(tournamentsDir).filter(f => f.endsWith('.json')).sort()
    for (const file of files) {
      const slug = file.replace(/\.json$/, '')
      const data = JSON.parse(readFileSync(resolve(tournamentsDir, file), 'utf8'))
      const rankingId =
        parseCueScoreId(data?.meta?.cuescoreRankingId) ??
        extractRankingIdFromUrl(data?.meta?.urls?.scoreboard)

      if (!rankingId) continue

      const outPath = resolve(rankingsOutDir, `${slug}.json`)
      try {
        const raw = await fetchJson(`https://api.cuescore.com/ranking/?id=${rankingId}`)
        const normalized = normalizeRankingPayload(raw)
        if (!normalized) {
          console.warn(`[cuescore] ranking ${rankingId} (${slug}) returned empty/error payload — keeping existing cache`)
          rankingsSkipped++
          continue
        }
        writeFileSync(outPath, JSON.stringify(normalized, null, 2) + '\n', 'utf8')
        rankingsFetched++
      } catch (err) {
        console.warn(`[cuescore] could not fetch ranking ${rankingId} (${slug}): ${err.message} — keeping existing cache`)
        rankingsSkipped++
      }
    }
  }

  let venuesFetched = 0
  let venuesSkipped = 0

  if (existsSync(venuesDir)) {
    const files = readdirSync(venuesDir).filter(f => f.endsWith('.json')).sort()
    for (const file of files) {
      const slug = file.replace(/\.json$/, '')
      const data = JSON.parse(readFileSync(resolve(venuesDir, file), 'utf8'))
      const venueId = parseCueScoreId(data?.cuescoreVenueId)
      if (!venueId) continue

      const outPath = resolve(venuesOutDir, `${slug}.json`)
      try {
        const raw = await fetchJson(`https://api.cuescore.com/venue/?id=${venueId}`)
        const normalized = summarizeVenuePayload(raw)
        if (!normalized) {
          console.warn(`[cuescore] venue ${venueId} (${slug}) returned empty/error payload — keeping existing cache`)
          venuesSkipped++
          continue
        }
        writeFileSync(outPath, JSON.stringify(normalized, null, 2) + '\n', 'utf8')
        venuesFetched++
      } catch (err) {
        console.warn(`[cuescore] could not fetch venue ${venueId} (${slug}): ${err.message} — keeping existing cache`)
        venuesSkipped++
      }
    }
  }

  console.log(
    `CueScore sync: ${rankingsFetched} rankings fetched (${rankingsSkipped} skipped), ${venuesFetched} venues fetched (${venuesSkipped} skipped)`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
}
