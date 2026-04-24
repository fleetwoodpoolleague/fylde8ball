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

  it('shows the time when event.time is present', () => {
    const timedEvent: TournamentDate = { ...event, time: '1900' }
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, event: timedEvent },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('1900')
  })

  it('does not show a time when event.time is absent', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).not.toContain('1900')
  })

  it('normalises 8pm to 2000 in the display', () => {
    const timedEvent: TournamentDate = { ...event, time: '8pm' }
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, event: timedEvent },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('2000')
    expect(wrapper.text()).not.toContain('8pm')
  })

  it('renders a details link to the tournament page', () => {
    const link = mountCard().find('a[href="/tournaments/challenger-series"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Details')
  })

  it('does not render a logo image when logo prop is omitted', () => {
    expect(mountCard().find('img').exists()).toBe(false)
  })

  it('renders a logo image when logo prop is provided', () => {
    const wrapper = mount(NextEventCard, {
      props: { ...defaultProps, logo: 'qs_logo.jpg' },
      global: { plugins: [router] },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Challenger Series')
  })
})
