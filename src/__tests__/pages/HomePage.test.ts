import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Tournament } from '../../types/tournament'

vi.mock('../../composables/useTournaments', () => ({
  useTournaments: vi.fn(),
}))

import { useTournaments } from '../../composables/useTournaments'
import HomePage from '../../pages/HomePage.vue'

const mockTournament: Tournament = {
  slug: 'challenger-series',
  meta: { name: 'Challenger Series', venue: "Q's Sports Lounge", organiser: "Q's Sports Lounge", logo: '' },
  dates: [
    { name: 'Event 1', date: '2026-04-18', completed: false },
    { name: 'Event 2', date: '2026-05-09', completed: false },
    { name: 'Event 3', date: '2026-06-06', completed: false },
  ],
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

describe('HomePage', () => {
  beforeEach(async () => {
    vi.mocked(useTournaments).mockReturnValue([mockTournament])
    await router.push('/')
    await router.isReady()
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
})
