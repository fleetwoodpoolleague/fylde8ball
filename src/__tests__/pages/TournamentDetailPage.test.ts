import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Tournament } from '../../types/tournament'

const mockTournament: Tournament = {
  slug: 'test-series',
  meta: { name: 'Test Series', venue: 'Test Venue', organiser: 'Test Org', logo: '' },
  dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
}

vi.mock('../../composables/useTournament', () => ({
  useTournament: vi.fn((slug: string) =>
    slug === 'test-series' ? mockTournament : undefined
  ),
}))

import TournamentDetailPage from '../../pages/TournamentDetailPage.vue'

describe('TournamentDetailPage', () => {
  it('renders the tournament name for a known slug', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Series')
  })

  it('renders the venue', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Venue')
  })

  it('renders the organiser', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Org')
  })

  it('shows "not found" for an unknown slug', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'unknown' } })
    expect(wrapper.text().toLowerCase()).toContain('not found')
  })
})
