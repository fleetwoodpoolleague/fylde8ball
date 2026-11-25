import type { Tournament, TournamentDate } from '../types/tournament'

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getEffectiveEndDate(date: TournamentDate): string {
  return date.endDate ?? date.date
}

export function isEventPast(date: TournamentDate, today: Date = new Date()): boolean {
  if (date.completed) return true
  const end = getEffectiveEndDate(date)
  if (end === 'TBC') return false
  return end < toLocalDateString(today)
}

export function getNextEvent(
  dates: TournamentDate[],
  today: Date = new Date(),
): TournamentDate | undefined {
  return dates.find(d => !isEventPast(d, today))
}

export function isTournamentActive(
  tournament: Tournament,
  today: Date = new Date(),
): boolean {
  if (tournament.completed) return false
  return Boolean(getNextEvent(tournament.dates, today))
}

export function isWithinMonths(dateStr: string, months: number, from: Date = new Date()): boolean {
  if (dateStr === 'TBC') return false
  const cutoff = new Date(from)
  cutoff.setMonth(cutoff.getMonth() + months)
  return dateStr <= toLocalDateString(cutoff)
}

export function isInProgress(date: TournamentDate, today: Date = new Date()): boolean {
  if (!date.endDate) return false
  const todayStr = toLocalDateString(today)
  return date.date <= todayStr && todayStr <= date.endDate
}

export function isUpcomingOrInProgress(date: TournamentDate, months: number, from: Date = new Date()): boolean {
  const end = getEffectiveEndDate(date)
  const fromStr = toLocalDateString(from)
  // Exclude events entirely in the past (isWithinMonths has no lower bound).
  if (end !== 'TBC' && end < fromStr) return false
  return isWithinMonths(date.date, months, from)
}

export function isWithinDays(date: TournamentDate, days: number, from: Date = new Date()): boolean {
  if (date.date === 'TBC') return false
  if (isInProgress(date, from)) return true
  const fromStr = toLocalDateString(from)
  const cutoff = new Date(from)
  cutoff.setDate(cutoff.getDate() + days)
  const cutoffStr = toLocalDateString(cutoff)
  return date.date >= fromStr && date.date <= cutoffStr
}

export function isWeekendEvent(date: TournamentDate): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.date)) return false
  const [sy, sm, sd] = date.date.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  if (!date.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(date.endDate)) {
    const day = start.getDay()
    return day === 0 || day === 6
  }
  const [ey, em, ed] = date.endDate.split('-').map(Number)
  const end = new Date(ey, em - 1, ed)
  const cursor = new Date(start)
  while (cursor <= end) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) return true
    cursor.setDate(cursor.getDate() + 1)
  }
  return false
}

export function validateTournament(t: Tournament): void {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/
  for (const d of t.dates) {
    if (d.endDate !== undefined) {
      if (!isoRegex.test(d.endDate)) {
        console.error(`[${t.slug}] endDate "${d.endDate}" is not a valid ISO date (YYYY-MM-DD)`)
      }
      if (!isoRegex.test(d.date)) {
        console.error(`[${t.slug}] date "${d.date}" must be ISO when endDate is set`)
      }
      if (isoRegex.test(d.date) && isoRegex.test(d.endDate) && d.endDate <= d.date) {
        console.error(`[${t.slug}] endDate "${d.endDate}" must be strictly after date "${d.date}"`)
      }
      if (d.time !== undefined) {
        console.warn(`[${t.slug}] time "${d.time}" is set alongside endDate and will be ignored`)
      }
    }
  }

  const urls = t.meta.urls
  if (urls) {
    for (const [key, val] of Object.entries(urls)) {
      if (val && /^https?:\/\/https?:\/\//i.test(val)) {
        console.error(`[${t.slug}] urls.${key} "${val}" has a duplicated protocol`)
      }
    }
  }
}
