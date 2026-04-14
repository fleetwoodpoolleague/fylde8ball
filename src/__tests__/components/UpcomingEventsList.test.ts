import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UpcomingEventsList from '../../components/UpcomingEventsList.vue'
import type { UpcomingEventInfo } from '../../types/tournament'

const events: UpcomingEventInfo[] = [
  {
    event: { name: 'Event 2', date: '2026-05-09', completed: false },
    tournamentName: 'Challenger Series',
    tournamentSlug: 'challenger-series',
  },
  {
    event: { name: 'Event 2', date: '2026-05-03', completed: false },
    tournamentName: 'International Rules',
    tournamentSlug: 'international-rules',
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
  ],
})

describe('UpcomingEventsList', () => {
  beforeEach(() => router.push('/'))

  it('renders each event name with its tournament name prepended', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Challenger Series — Event 2')
    expect(wrapper.text()).toContain('International Rules — Event 2')
  })

  it('renders a "View all" link pointing to the tournaments page', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('View all')
    const link = wrapper.find('a[href="/tournaments"]')
    expect(link.exists()).toBe(true)
  })
})
