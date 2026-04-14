import type { TournamentDate } from '../types/tournament'

export function getNextEvent(dates: TournamentDate[]): TournamentDate | undefined {
  return dates.find(d => !d.completed)
}

export function isWithinMonths(dateStr: string, months: number, from: Date = new Date()): boolean {
  if (dateStr === 'TBC') return false
  const cutoff = new Date(from)
  cutoff.setMonth(cutoff.getMonth() + months)
  return dateStr <= cutoff.toISOString().slice(0, 10)
}
