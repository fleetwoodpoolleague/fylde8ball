import type { Tournament } from '../types/tournament'

export function useTournaments(): Tournament[] {
  const modules = import.meta.glob<{ meta: Tournament['meta']; dates: Tournament['dates'] }>(
    '../data/tournaments/*.json',
    { eager: true }
  )

  return Object.entries(modules).map(([path, data]) => {
    const slug = path.split('/').pop()!.replace('.json', '')
    return { ...data, slug }
  })
}
