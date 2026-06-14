import type { Tournament } from '../types/tournament'
import { validateTournament } from '../utils/tournament'

const modules = import.meta.glob<{ meta: Tournament['meta']; dates: Tournament['dates'] }>(
  '../data/tournaments/*.json',
  { eager: true }
)

const tournaments = Object.entries(modules).map(([path, data]) => {
  const slug = path.split('/').pop()!.replace('.json', '')
  const t = { ...data, slug } as Tournament
  if (import.meta.env.DEV) validateTournament(t)
  return t
})

const tournamentBySlug = new Map(tournaments.map(t => [t.slug, t]))

export function useTournaments(): Tournament[] {
  return tournaments
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  return tournamentBySlug.get(slug)
}
