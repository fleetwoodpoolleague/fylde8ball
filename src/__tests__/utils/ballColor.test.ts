import { ballForSlug, SOLID_BALLS } from '../../utils/ballColor'

describe('ballForSlug', () => {
  it('is deterministic for a given slug', () => {
    expect(ballForSlug('challenger-pool-series-2026-27')).toEqual(
      ballForSlug('challenger-pool-series-2026-27'),
    )
  })

  it('always returns one of the seven solid balls', () => {
    const slugs = ['a', 'bapto', 'golden-8-ball', 'premier-pool-series-2026-27', '', 'x'.repeat(100)]
    for (const slug of slugs) {
      expect(SOLID_BALLS).toContainEqual(ballForSlug(slug))
    }
  })

  it('pairs each ball number with its traditional colour', () => {
    expect(SOLID_BALLS).toHaveLength(7)
    expect(SOLID_BALLS[0]).toEqual({ number: 1, color: 'var(--color-ball-yellow)' })
    expect(SOLID_BALLS[6]).toEqual({ number: 7, color: 'var(--color-ball-maroon)' })
    const numbers = SOLID_BALLS.map(b => b.number)
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('spreads different slugs across colours', () => {
    const colors = new Set(
      ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'].map(
        s => ballForSlug(s).color,
      ),
    )
    expect(colors.size).toBeGreaterThan(1)
  })
})
