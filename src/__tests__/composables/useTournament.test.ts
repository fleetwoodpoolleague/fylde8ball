import { vi } from 'vitest'
import type { Tournament } from '../../types/tournament'

const mockTournament: Tournament = {
  slug: 'test-series',
  meta: { name: 'Test Series', venue: 'Test Venue', organiser: 'Test Org', logo: '' },
  dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
}

vi.mock('../../composables/useTournaments', () => ({
  useTournaments: () => [mockTournament],
}))

import { useTournament } from '../../composables/useTournament'

describe('useTournament', () => {
  it('returns the matching tournament', () => {
    expect(useTournament('test-series')).toEqual(mockTournament)
  })

  it('returns undefined for an unknown slug', () => {
    expect(useTournament('no-such-tournament')).toBeUndefined()
  })
})
