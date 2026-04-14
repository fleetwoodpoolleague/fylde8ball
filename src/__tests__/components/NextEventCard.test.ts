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

  it('renders a details link to the tournament page', () => {
    const link = mountCard().find('a[href="/tournaments/challenger-series"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Details')
  })
})
