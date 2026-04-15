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

  it('shows the time when date.time is present', () => {
    const timedDate: TournamentDate = { ...date, time: '1900' }
    const wrapper = mount(EventTimelineItem, { props: { date: timedDate, isNext: false } })
    expect(wrapper.text()).toContain('· 1900')
  })

  it('does not show a time separator when date.time is absent', () => {
    const wrapper = mount(EventTimelineItem, { props: { date, isNext: false } })
    expect(wrapper.text()).not.toContain('·')
  })

  it('normalises 8pm to 2000 in the timeline', () => {
    const timedDate: TournamentDate = { ...date, time: '8pm' }
    const wrapper = mount(EventTimelineItem, { props: { date: timedDate, isNext: false } })
    expect(wrapper.text()).toContain('· 2000')
    expect(wrapper.text()).not.toContain('8pm')
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
