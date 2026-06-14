import type { Tournament, TournamentDate } from '../types/tournament'

export function getNextEvent(dates: TournamentDate[]): TournamentDate | undefined {
  return dates.find(d => !d.completed)
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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

export function getEffectiveEndDate(date: TournamentDate): string {
  return date.endDate ?? date.date
}

export function isUpcomingOrInProgress(date: TournamentDate, months: number, from: Date = new Date()): boolean {
  const end = getEffectiveEndDate(date)
  const fromStr = toLocalDateString(from)
  // Exclude events entirely in the past (isWithinMonths has no lower bound).
  if (end !== 'TBC' && end < fromStr) return false
  return isWithinMonths(date.date, months, from)
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
}
