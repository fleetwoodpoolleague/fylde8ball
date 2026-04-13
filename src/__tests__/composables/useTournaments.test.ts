import { useTournaments } from '../../composables/useTournaments'

describe('useTournaments', () => {
  it('returns an array', () => {
    const result = useTournaments()
    expect(Array.isArray(result)).toBe(true)
  })

  it('includes the Challenger Pool Series', () => {
    const result = useTournaments()
    const challenger = result.find(t => t.slug === 'challenger-pool-series-2026-27')
    expect(challenger).toBeDefined()
    expect(challenger?.meta.name).toBe('Challenger Pool Series 2026/27')
  })

  it('has 10 dates for the Challenger Pool Series', () => {
    const result = useTournaments()
    const challenger = result.find(t => t.slug === 'challenger-pool-series-2026-27')
    expect(challenger?.dates).toHaveLength(10)
  })

  it('derives slug from filename (lowercase letters, numbers, hyphens only)', () => {
    const result = useTournaments()
    for (const t of result) {
      expect(t.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('each tournament has a meta.name string', () => {
    const result = useTournaments()
    for (const t of result) {
      expect(typeof t.meta.name).toBe('string')
      expect(t.meta.name.length).toBeGreaterThan(0)
    }
  })
})
