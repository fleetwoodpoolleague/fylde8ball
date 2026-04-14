import { mount } from '@vue/test-utils'
import NextEventCard from '../../components/NextEventCard.vue'
import type { TournamentDate } from '../../types/tournament'

const event: TournamentDate = { name: 'Event 1', date: '2026-04-18', completed: false }

const defaultProps = {
  event,
  tournamentName: 'Challenger Series',
  venue: "Q's Sports Lounge",
}

describe('NextEventCard', () => {
  it('renders the event name', () => {
    const wrapper = mount(NextEventCard, { props: defaultProps })
    expect(wrapper.text()).toContain('Event 1')
  })

  it('renders the tournament name', () => {
    const wrapper = mount(NextEventCard, { props: defaultProps })
    expect(wrapper.text()).toContain('Challenger Series')
  })

  it('renders the venue', () => {
    const wrapper = mount(NextEventCard, { props: defaultProps })
    expect(wrapper.text()).toContain("Q's Sports Lounge")
  })

  it('renders a formatted date containing the year', () => {
    const wrapper = mount(NextEventCard, { props: defaultProps })
    expect(wrapper.text()).toContain('2026')
  })

  it('renders 6 pool table pockets', () => {
    const wrapper = mount(NextEventCard, { props: defaultProps })
    expect(wrapper.findAll('.pocket')).toHaveLength(6)
  })
})
