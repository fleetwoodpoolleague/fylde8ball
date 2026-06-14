import type { Tournament } from '../types/tournament'
import { getTournamentBySlug } from './useTournaments'

export function useTournament(slug: string): Tournament | undefined {
  return getTournamentBySlug(slug)
}
