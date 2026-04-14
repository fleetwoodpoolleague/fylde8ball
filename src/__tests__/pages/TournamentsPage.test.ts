import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Tournament } from '../../types/tournament'

vi.mock('../../composables/useTournaments', () => ({
  useTournaments: vi.fn(),
}))

import { useTournaments } from '../../composables/useTournaments'
import TournamentsPage from '../../pages/TournamentsPage.vue'

const mockTournaments: Tournament[] = [
  {
    slug: 'challenger-series',
    meta: { name: 'Challenger Series', venue: "Q's Sports Lounge", organiser: "Q's Sports Lounge", logo: 'qs_logo.jpg' },
    dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
  },
  {
    slug: 'no-logo-series',
    meta: { name: 'No Logo Series', venue: 'Somewhere', organiser: 'Someone', logo: '' },
    dates: [{ name: 'Event 1', date: '2026-05-01', completed: false }],
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

describe('TournamentsPage', () => {
  beforeEach(async () => {
    vi.mocked(useTournaments).mockReturnValue(mockTournaments)
    await router.push('/tournaments')
  })

  it('renders the tournament name', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Challenger Series')
  })

  it('renders the venue', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain("Q's Sports Lounge")
  })

  it('renders the event count', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('1 event')
  })

  it('renders a logo image when the tournament has one', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    const imgs = wrapper.findAll('img')
    expect(imgs.length).toBe(1)
    expect(imgs[0].attributes('alt')).toBe('Challenger Series')
  })
})
