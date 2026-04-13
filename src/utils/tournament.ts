import type { TournamentDate } from '../types/tournament'

export function getNextEvent(dates: TournamentDate[]): TournamentDate | undefined {
  return dates.find(d => !d.completed)
}
