import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DUP_PROTO_RE = /^https?:\/\/https?:\/\//i

function isValidHttpUrl(value) {
  if (DUP_PROTO_RE.test(value)) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateTournamentData(slug, data, existingLogos = null) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return [`[${slug}] root JSON must be an object`]
  }

  const { meta, dates } = data
  if (!meta || typeof meta !== 'object') {
    errors.push(`[${slug}] missing meta object`)
  } else {
    for (const field of ['name', 'venue', 'organiser']) {
      if (typeof meta[field] !== 'string' || !meta[field].trim()) {
        errors.push(`[${slug}] meta.${field} must be a non-empty string`)
      }
    }

    if (meta.logo && existingLogos && !existingLogos.has(meta.logo)) {
      errors.push(`[${slug}] meta.logo "${meta.logo}" not found in src/assets/img/`)
    }

    if (
      meta.cuescoreRankingId !== undefined &&
      meta.cuescoreRankingId !== null &&
      meta.cuescoreRankingId !== ''
    ) {
      const validNum =
        (typeof meta.cuescoreRankingId === 'number' &&
          Number.isInteger(meta.cuescoreRankingId) &&
          meta.cuescoreRankingId > 0) ||
        (typeof meta.cuescoreRankingId === 'string' && /^\d+$/.test(meta.cuescoreRankingId.trim()))
      if (!validNum) {
        errors.push(`[${slug}] meta.cuescoreRankingId "${meta.cuescoreRankingId}" must be a positive integer or null`)
      }
    }

    for (const group of ['urls', 'socials']) {
      const obj = meta[group]
      if (!obj || typeof obj !== 'object') continue
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === '') continue
        if (typeof value !== 'string' || !isValidHttpUrl(value.trim())) {
          errors.push(`[${slug}] meta.${group}.${key} "${value}" is not a valid http(s) URL`)
        }
      }
    }
  }

  if (!Array.isArray(dates)) {
    errors.push(`[${slug}] dates must be an array`)
  } else {
    dates.forEach((d, idx) => {
      if (!d || typeof d !== 'object') {
        errors.push(`[${slug}] dates[${idx}] must be an object`)
        return
      }
      if (typeof d.name !== 'string' || !d.name.trim()) {
        errors.push(`[${slug}] dates[${idx}].name must be a non-empty string`)
      }
      if (d.date !== 'TBC' && !ISO_DATE_RE.test(String(d.date))) {
        errors.push(`[${slug}] dates[${idx}].date "${d.date}" must be YYYY-MM-DD or "TBC"`)
      }
      if (d.endDate !== undefined && d.endDate !== null) {
        if (!ISO_DATE_RE.test(String(d.endDate))) {
          errors.push(`[${slug}] dates[${idx}].endDate "${d.endDate}" must be YYYY-MM-DD`)
        } else if (!ISO_DATE_RE.test(String(d.date))) {
          errors.push(`[${slug}] dates[${idx}].date must be YYYY-MM-DD when endDate is set`)
        } else if (d.endDate <= d.date) {
          errors.push(`[${slug}] dates[${idx}].endDate "${d.endDate}" must be after date "${d.date}"`)
        }
      }
      if (typeof d.completed !== 'boolean') {
        errors.push(`[${slug}] dates[${idx}].completed must be a boolean`)
      }
      if (
        d.entryStatus !== undefined &&
        d.entryStatus !== null &&
        !['open', 'walk-in', 'full', 'waitlist'].includes(d.entryStatus)
      ) {
        errors.push(`[${slug}] dates[${idx}].entryStatus "${d.entryStatus}" is invalid`)
      }
    })
  }

  return errors
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = resolve(__dirname, '..')
  const dataDir = resolve(root, 'src/data/tournaments')
  const imgDir = resolve(root, 'src/assets/img')

  const existingLogos = new Set(readdirSync(imgDir))
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()
  const allErrors = []

  for (const file of files) {
    const slug = file.replace(/\.json$/, '')
    let parsed
    try {
      parsed = JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'))
    } catch (err) {
      allErrors.push(`[${slug}] invalid JSON: ${err.message}`)
      continue
    }
    allErrors.push(...validateTournamentData(slug, parsed, existingLogos))
  }

  if (allErrors.length) {
    console.error(`Tournament validation failed with ${allErrors.length} error(s):`)
    for (const err of allErrors) console.error(`  - ${err}`)
    process.exit(1)
  }

  console.log(`Validated ${files.length} tournament JSON files — 0 errors`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
}
