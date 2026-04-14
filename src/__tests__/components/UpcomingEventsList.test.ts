import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UpcomingEventsList from '../../components/UpcomingEventsList.vue'
import type { TournamentDate } from '../../types/tournament'

const events: TournamentDate[] = [
  { name: 'Event 2', date: '2026-05-09', completed: false },
  { name: 'Event 3', date: '2026-06-06', completed: false },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

describe('UpcomingEventsList', () => {
  beforeEach(() => router.push('/'))

  it('renders each event name', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events, tournamentSlug: 'test-series' },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Event 2')
    expect(wrapper.text()).toContain('Event 3')
  })

  it('renders a "View all" link pointing to the tournament', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events, tournamentSlug: 'test-series' },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('View all')
    const link = wrapper.find('a[href*="test-series"]')
    expect(link.exists()).toBe(true)
  })
})
