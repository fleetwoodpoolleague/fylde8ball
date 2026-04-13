import { getNextEvent } from '../../utils/tournament'
import type { TournamentDate } from '../../types/tournament'

describe('getNextEvent', () => {
  it('returns the first incomplete event', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: true },
      { name: 'Event 2', date: '2026-05-09', completed: false },
      { name: 'Event 3', date: '2026-06-06', completed: false },
    ]
    expect(getNextEvent(dates)).toEqual({
      name: 'Event 2',
      date: '2026-05-09',
      completed: false,
    })
  })

  it('returns undefined when all events are completed', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: true },
    ]
    expect(getNextEvent(dates)).toBeUndefined()
  })

  it('returns the first event when none are completed', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: false },
      { name: 'Event 2', date: '2026-05-09', completed: false },
    ]
    expect(getNextEvent(dates)).toEqual({
      name: 'Event 1',
      date: '2026-04-18',
      completed: false,
    })
  })

  it('returns undefined for an empty array', () => {
    expect(getNextEvent([])).toBeUndefined()
  })
})
