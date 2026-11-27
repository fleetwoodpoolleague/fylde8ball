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

  it('renders a "Browse all tournaments" link pointing to the tournaments page', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Browse all tournaments')
    const link = wrapper.find('a[href="/tournaments"]')
    expect(link.exists()).toBe(true)
  })

  it('shows venue and formatted time when provided', async () => {
    await router.isReady()
    const detailedEvents: UpcomingEventInfo[] = [
      {
        event: { name: 'Event 2', date: '2026-05-09', time: '1030', completed: false },
        tournamentName: 'Challenger Series',
        tournamentSlug: 'challenger-series',
        venue: "Q's Sports Lounge",
        logo: '',
      },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: { events: detailedEvents },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain("Q's Sports Lounge")
    expect(wrapper.text()).toContain('10:30 am')
  })

  it('offers cross-platform calendar subscription options including Android sync link copy', async () => {
    await router.isReady()
    const wrapper = mount(UpcomingEventsList, {
      props: { events },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Sync all comps')
    expect(wrapper.find('a[href="webcal://fylde8ball.co.uk/fylde8ball.ics"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/fylde8ball.ics"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Copy sync link (Android / Other)')
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

  it('groups events under month headers and filters by quick time pills', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 1)) // Fri 1 May 2026
    await router.isReady()
    const multiMonthEvents: UpcomingEventInfo[] = [
      {
        event: { name: 'Weekend Comp', date: '2026-05-02', completed: false }, // Sat (this week + weekend)
        tournamentName: 'Series A',
        tournamentSlug: 'series-a',
        logo: '',
      },
      {
        event: { name: 'Midweek Comp', date: '2026-06-03', completed: false }, // Wed (next month, weekday)
        tournamentName: 'Series B',
        tournamentSlug: 'series-b',
        logo: '',
      },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: { events: multiMonthEvents },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('May 2026')
    expect(wrapper.text()).toContain('June 2026')

    const weekBtn = wrapper.findAll('button').find(b => b.text() === 'This week')!
    await weekBtn.trigger('click')
    expect(wrapper.text()).toContain('Weekend Comp')
    expect(wrapper.text()).not.toContain('Midweek Comp')

    const weekendsBtn = wrapper.findAll('button').find(b => b.text() === 'Weekends')!
    await weekendsBtn.trigger('click')
    expect(wrapper.text()).toContain('Weekend Comp')
    expect(wrapper.text()).not.toContain('Midweek Comp')

    vi.useRealTimers()
  })

  it('hides heroEvents in default All view but keeps them in This week filter to prevent false empty states', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 1)) // Fri 1 May 2026
    await router.isReady()
    const heroDate = { name: 'Hero Saturday Comp', date: '2026-05-02', completed: false }
    const laterDate = { name: 'June Comp', date: '2026-06-10', completed: false }
    const listEvents: UpcomingEventInfo[] = [
      { event: heroDate, tournamentName: 'Series A', tournamentSlug: 'series-a', logo: '' },
      { event: laterDate, tournamentName: 'Series B', tournamentSlug: 'series-b', logo: '' },
    ]
    const wrapper = mount(UpcomingEventsList, {
      props: {
        events: listEvents,
        heroEvents: new Set([heroDate]),
        now: new Date(2026, 4, 1),
      },
      global: { plugins: [router] },
    })

    // Default All view omits heroDate so it is not duplicated directly below the hero card
    expect(wrapper.text()).not.toContain('Hero Saturday Comp')
    expect(wrapper.text()).toContain('June Comp')

    // Filtering to "This week" includes heroDate instead of showing a misleading empty message
    const weekBtn = wrapper.findAll('button').find(b => b.text() === 'This week')!
    await weekBtn.trigger('click')
    expect(wrapper.text()).toContain('Hero Saturday Comp')

    vi.useRealTimers()
  })
})
