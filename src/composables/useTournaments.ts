import type { Tournament } from '../types/tournament'

export function useTournaments(): Tournament[] {
  const modules = import.meta.glob('../data/tournaments/*.json', { eager: true }) as Record<
    string,
    { meta: Tournament['meta']; dates: Tournament['dates'] }
  >

  return Object.entries(modules).map(([path, data]) => {
    const slug = path.split('/').pop()!.replace('.json', '')
    return { ...data, slug }
  })
}
