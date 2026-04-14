import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Tournament } from '../../types/tournament'

const mockTournament: Tournament = {
  slug: 'test-series',
  meta: { name: 'Test Series', venue: 'Test Venue', organiser: 'Test Org', logo: 'qs_logo.jpg' },
  dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
}

const mockTournamentNoLogo: Tournament = {
  slug: 'no-logo-series',
  meta: { name: 'No Logo Series', venue: 'Test Venue', organiser: 'Test Org', logo: '' },
  dates: [],
}

vi.mock('../../composables/useTournament', () => ({
  useTournament: vi.fn((slug: string) => {
    if (slug === 'test-series') return mockTournament
    if (slug === 'no-logo-series') return mockTournamentNoLogo
    return undefined
  }),
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

  it('renders the logo when the tournament has one', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test Series')
  })

  it('renders no logo when the tournament has none', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'no-logo-series' } })
    expect(wrapper.find('img').exists()).toBe(false)
  })
})
