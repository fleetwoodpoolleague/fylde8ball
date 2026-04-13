import type { Tournament } from '../types/tournament'
import { useTournaments } from './useTournaments'

export function useTournament(slug: string): Tournament | undefined {
  return useTournaments().find(t => t.slug === slug)
}
