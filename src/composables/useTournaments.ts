import type { Tournament } from '../types/tournament'
import { validateTournament } from '../utils/tournament'

export function useTournaments(): Tournament[] {
  const modules = import.meta.glob<{ meta: Tournament['meta']; dates: Tournament['dates'] }>(
    '../data/tournaments/*.json',
    { eager: true }
  )

  return Object.entries(modules).map(([path, data]) => {
    const slug = path.split('/').pop()!.replace('.json', '')
    const t = { ...data, slug } as Tournament
    if (import.meta.env.DEV) validateTournament(t)
    return t
  })
}
