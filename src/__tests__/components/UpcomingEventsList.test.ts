import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UpcomingEventsList from '../../components/UpcomingEventsList.vue'
import type { UpcomingEventInfo } from '../../types/tournament'

const events: UpcomingEventInfo[] = [
  {
    event: { name: 'Event 2', date: '2026-05-09', completed: false },
    tournamentName: 'Challenger Series',
    tournamentSlug: 'challenger-series',
    logo: '',
  },
  {
    event: { name: 'Event 2', date: '2026-05-03', completed: false },
    tournamentName: 'International Rules',
    tournamentSlug: 'international-rules',
    logo: '',
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
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

  it("shows 'Today' for an event on today's date", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15)) // 15 Apr 2026
    await router.isReady()
    const todayEvents: UpcomingEventInfo[] = [
      {
        event: { name: 'Finals', date: '2026-04-15', completed: false },
        tournamentName: 'Challenger Series',
        tournamentSlug: 'challenger-series',
        logo: '',
      },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: { events: todayEvents },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).not.toContain('15 Apr 2026')
    vi.useRealTimers()
  })

  it('renders each event as a link to its tournament page', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events },
      global: { plugins: [router] },
    })
    const links = wrapper.findAll('a[href^="/tournaments/"]')
    expect(links.length).toBe(2)
    expect(links[0].attributes('href')).toBe('/tournaments/challenger-series')
    expect(links[1].attributes('href')).toBe('/tournaments/international-rules')
  })

  it('shows formatted range for a range event', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 29)) // 29 May 2026
    await router.isReady()
    const rangeEvents: UpcomingEventInfo[] = [
      {
        event: { name: 'Tournament Week', date: '2026-06-01', endDate: '2026-06-08', completed: false },
        tournamentName: 'Fylde Summer Open',
        tournamentSlug: 'fylde-summer-open-2026',
        logo: '',
      },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: { events: rangeEvents },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('1 Jun 2026')
    expect(wrapper.text()).toContain('8 Jun 2026')
    vi.useRealTimers()
  })

  it("shows 'In progress' for a mid-range event", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 4)) // 4 Jun 2026
    await router.isReady()
    const rangeEvents: UpcomingEventInfo[] = [
      {
        event: { name: 'Tournament Week', date: '2026-06-01', endDate: '2026-06-08', completed: false },
        tournamentName: 'Fylde Summer Open',
        tournamentSlug: 'fylde-summer-open-2026',
        logo: '',
      },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: { events: rangeEvents },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('In progress')
    vi.useRealTimers()
  })
})
