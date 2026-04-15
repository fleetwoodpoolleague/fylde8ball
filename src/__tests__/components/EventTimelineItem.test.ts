import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EventTimelineItem from '../../components/EventTimelineItem.vue'
import type { TournamentDate } from '../../types/tournament'

const date: TournamentDate = { name: 'Event 1', date: '2026-04-18', completed: false }

describe('EventTimelineItem', () => {
  it('renders the event name', () => {
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: false } })
    expect(wrapper.text()).toContain('Event 1')
  })

  it('renders the formatted date', () => {
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: false } })
    expect(wrapper.text()).toContain('18 Apr 2026')
  })

  it('shows "Next" badge when isNext is true', () => {
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: true } })
    expect(wrapper.text()).toContain('Next')
  })

  it('does not show "Next" badge when isNext is false', () => {
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: false } })
    expect(wrapper.text()).not.toContain('Next')
  })

  it('applies line-through style to completed events', () => {
    const completedDate: TournamentDate = { ...date, completed: true }
    const wrapper = mount(EventTimelineItem, { props: { date: completedDate, isNext: false } })
    expect(wrapper.html()).toContain('line-through')
  })

  it("shows 'Today' when the event date is today", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 18)) // 18 Apr 2026 — matches mock event date
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: false } })
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).not.toContain('18 Apr 2026')
    vi.useRealTimers()
  })
})
