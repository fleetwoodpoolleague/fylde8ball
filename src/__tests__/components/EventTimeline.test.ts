import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EventTimeline from '../../components/EventTimeline.vue'
import EventTimelineItem from '../../components/EventTimelineItem.vue'
import type { TournamentDate } from '../../types/tournament'

const dates: TournamentDate[] = [
  { name: 'Event 1', date: '2026-04-18', completed: true },
  { name: 'Event 2', date: '2026-05-09', completed: false },
  { name: 'Event 3', date: '2026-06-06', completed: false },
]

describe('EventTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an item for every date with a Schedule heading', () => {
    const wrapper = mount(EventTimeline, { props: { dates } })
    expect(wrapper.text()).toContain('Schedule (3 dates)')
    const items = wrapper.findAllComponents(EventTimelineItem)
    expect(items).toHaveLength(3)
  })

  it('marks the first incomplete upcoming event as next', () => {
    const wrapper = mount(EventTimeline, { props: { dates } })
    const items = wrapper.findAllComponents(EventTimelineItem)
    const nextItems = items.filter(i => i.props('isNext') === true)
    expect(nextItems).toHaveLength(1)
    expect(nextItems[0].props('date').name).toBe('Event 2')
  })

  it('skips elapsed dates when choosing the next event', () => {
    vi.setSystemTime(new Date('2026-05-20'))
    const wrapper = mount(EventTimeline, { props: { dates } })
    const items = wrapper.findAllComponents(EventTimelineItem)
    const nextItems = items.filter(i => i.props('isNext') === true)
    expect(nextItems).toHaveLength(1)
    expect(nextItems[0].props('date').name).toBe('Event 3')
    expect(items[1].props('isPast')).toBe(true)
  })

  it('marks no item as next when tournamentCompleted is true', () => {
    const wrapper = mount(EventTimeline, { props: { dates, tournamentCompleted: true } })
    const items = wrapper.findAllComponents(EventTimelineItem)
    expect(items.every(i => i.props('isNext') === false)).toBe(true)
    expect(items.every(i => i.props('isPast') === true)).toBe(true)
  })

  it('marks no item as next when all are completed', () => {
    const allDone = dates.map(d => ({ ...d, completed: true }))
    const wrapper = mount(EventTimeline, { props: { dates: allDone } })
    const items = wrapper.findAllComponents(EventTimelineItem)
    expect(items.every(i => i.props('isNext') === false)).toBe(true)
  })

  it('renders all event names', () => {
    const wrapper = mount(EventTimeline, { props: { dates } })
    expect(wrapper.text()).toContain('Event 1')
    expect(wrapper.text()).toContain('Event 2')
    expect(wrapper.text()).toContain('Event 3')
  })
})
