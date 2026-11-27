import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NextEventCard from '../../components/NextEventCard.vue'
import type { TournamentDate } from '../../types/tournament'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: {} }, { path: '/tournaments/:slug', component: {} }],
})

const event: TournamentDate = { name: 'Event 1', date: '2026-04-18', completed: false }

const defaultProps = {
  event,
  tournamentName: 'Challenger Series',
  tournamentSlug: 'challenger-series',
  venue: "Q's Sports Lounge",
}

const mountCard = () => mount(NextEventCard, { props: defaultProps, global: { plugins: [router] } })

describe('NextEventCard', () => {
  beforeEach(() => router.push('/'))

  it('renders the event name', () => {
    expect(mountCard().text()).toContain('Event 1')
  })

  it('renders the tournament name', () => {
    expect(mountCard().text()).toContain('Challenger Series')
  })

  it('renders the venue', () => {
    expect(mountCard().text()).toContain("Q's Sports Lounge")
  })

  it('renders a formatted date containing the year', () => {
    expect(mountCard().text()).toContain('2026')
  })

  it('renders 6 pool table pockets', () => {
    expect(mountCard().findAll('.pocket')).toHaveLength(6)
  })

  it("shows 'Today' when the event date is today", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 18)) // 18 Apr 2026 — matches mock event date
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Today')
    vi.useRealTimers()
  })

  it('shows the formatted time when event.time is present', () => {
    const timedEvent: TournamentDate = { ...event, time: '1900' }
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, event: timedEvent },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('7:00 pm')
  })

  it('shows Time TBC when event.time is absent on a single-day dated event', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).not.toContain('7:00 pm')
    expect(wrapper.text()).toContain('Time TBC')
  })

  it('normalises 8pm to 8:00 pm in the display', () => {
    const timedEvent: TournamentDate = { ...event, time: '8pm' }
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, event: timedEvent },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('8:00 pm')
    expect(wrapper.text()).not.toContain('2000')
  })

  it('renders a details link to the tournament page and eligibility pills when format is given', () => {
    const wrapper = mount(NextEventCard, {
      props: {
        ...defaultProps,
        format: { rules: 'Blackball', entryFee: '£25', handicap: true },
      },
      global: { plugins: [router] },
    })
    const link = wrapper.find('a[href="/tournaments/challenger-series"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Entry & schedule')
    expect(wrapper.text()).toContain('Blackball')
    expect(wrapper.text()).toContain('Entry £25')
    expect(wrapper.text()).toContain('Handicapped')
  })

  it('shows a helpful message for TBC dates', () => {
    const tbcEvent: TournamentDate = { ...event, date: 'TBC' }
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, event: tbcEvent },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Date TBC')
  })

  it('does not render a logo image when logo prop is omitted', () => {
    expect(mountCard().find('img').exists()).toBe(false)
  })

  it('renders a logo image when logo prop is provided', () => {
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, logo: 'qs_logo.webp' },
      global: { plugins: [router] },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Challenger Series')
  })

  describe('range events', () => {
    const rangeEvent: TournamentDate = {
      name: 'Tournament Week',
      date: '2026-06-01',
      endDate: '2026-06-08',
      completed: false,
    }

    afterEach(() => vi.useRealTimers())

    it('shows the formatted range when event has not yet started', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 4, 29)) // 29 May 2026
      const wrapper = mount(NextEventCard, {
        props: { ...defaultProps, event: rangeEvent },
        global: { plugins: [router] },
      })
      expect(wrapper.text()).toContain('1 June 2026')
      expect(wrapper.text()).toContain('8 June 2026')
    })

    it('shows "In progress" when today is mid-range', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 5, 4)) // 4 Jun 2026
      const wrapper = mount(NextEventCard, {
        props: { ...defaultProps, event: rangeEvent },
        global: { plugins: [router] },
      })
      expect(wrapper.text()).toContain('In progress')
    })

    it('does not show a time row when endDate is set', () => {
      const rangeWithTime: TournamentDate = { ...rangeEvent, time: '1900' }
      const wrapper = mount(NextEventCard, {
        props: { ...defaultProps, event: rangeWithTime },
        global: { plugins: [router] },
      })
      expect(wrapper.text()).not.toContain('1900')
    })
  })
})
