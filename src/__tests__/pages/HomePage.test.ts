import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Tournament } from '../../types/tournament'

vi.mock('../../composables/useTournaments', () => ({
  useTournaments: vi.fn(),
}))

import { useTournaments } from '../../composables/useTournaments'
import HomePage from '../../pages/HomePage.vue'

const mockTournamentA: Tournament = {
  slug: 'challenger-series',
  meta: { name: 'Challenger Series', venue: "Q's Sports Lounge", organiser: "Q's Sports Lounge", logo: '' },
  dates: [
    { name: 'Event 1', date: '2026-04-18', completed: false },
    { name: 'Event 2', date: '2026-05-09', completed: false },
    { name: 'Event 3', date: '2026-06-06', completed: false },
  ],
}

const mockTournamentB: Tournament = {
  slug: 'international-rules',
  meta: { name: 'International Rules', venue: 'The Venue', organiser: 'The Organiser', logo: '' },
  dates: [
    { name: 'Round 1', date: '2026-05-03', completed: false },
    { name: 'Round 2', date: '2026-06-07', completed: false },
  ],
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

describe('HomePage', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14'))
    vi.mocked(useTournaments).mockReturnValue([mockTournamentA])
    await router.push('/')
    await router.isReady()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the next event name', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Event 1')
  })

  it('renders the tournament venue in the hero card', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain("Q's Sports Lounge")
  })

  it('renders upcoming events after the next event', () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Event 2')
  })

  it('shows a fallback when there are no incomplete events', () => {
    vi.mocked(useTournaments).mockReturnValue([])
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text().toLowerCase()).toContain('no upcoming')
  })

  it('excludes upcoming events more than 3 months away', () => {
    vi.mocked(useTournaments).mockReturnValue([
      {
        slug: 'test-series',
        meta: { name: 'Test Series', venue: 'Venue', organiser: 'Org', logo: '' },
        dates: [
          { name: 'Near Event', date: '2026-05-01', completed: false },
          { name: 'Far Event', date: '2026-09-01', completed: false },
        ],
      },
    ])
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Near Event')
    expect(wrapper.text()).not.toContain('Far Event')
  })

  describe('with multiple tournaments', () => {
    beforeEach(() => {
      vi.mocked(useTournaments).mockReturnValue([mockTournamentA, mockTournamentB])
    })

    it('shows upcoming events from all tournaments in the list', () => {
      const wrapper = mount(HomePage, { global: { plugins: [router] } })
      // Event 1 from Challenger Series is "next", so upcoming should include both tournaments' remaining events
      expect(wrapper.text()).toContain('International Rules')
      expect(wrapper.text()).toContain('Challenger Series')
    })

    it('shows upcoming events sorted by date across tournaments', () => {
      const wrapper = mount(HomePage, { global: { plugins: [router] } })
      const text = wrapper.text()
      // International Rules Round 1 (May 3) should appear before Challenger Series Event 2 (May 9)
      const roundOnePos = text.indexOf('Round 1')
      const event2Pos = text.indexOf('Event 2')
      expect(roundOnePos).toBeLessThan(event2Pos)
    })

    it('prepends tournament name to each event in the upcoming list', () => {
      const wrapper = mount(HomePage, { global: { plugins: [router] } })
      expect(wrapper.text()).toContain('International Rules — Round 1')
      expect(wrapper.text()).toContain('Challenger Series — Event 2')
    })

    it('picks the earliest event across tournaments as the next event', () => {
      // mockTournamentA Event 1 is 2026-04-18, mockTournamentB Round 1 is 2026-05-03
      // so next event should be Challenger Series Event 1
      const wrapper = mount(HomePage, { global: { plugins: [router] } })
      expect(wrapper.text()).toContain('Event 1')
      expect(wrapper.text()).toContain('Challenger Series')
    })
  })
})
