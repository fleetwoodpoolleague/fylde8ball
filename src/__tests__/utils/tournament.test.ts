import { getNextEvent, isWithinMonths } from '../../utils/tournament'
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

  it('returns an incomplete event that appears before completed ones', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: false },
      { name: 'Event 2', date: '2026-05-09', completed: true },
    ]
    expect(getNextEvent(dates)).toEqual({
      name: 'Event 1',
      date: '2026-04-18',
      completed: false,
    })
  })
})

describe('isWithinMonths', () => {
  const from = new Date('2026-04-14')

  it('returns true for a date within the window', () => {
    expect(isWithinMonths('2026-07-13', 3, from)).toBe(true)
  })

  it('returns true for a date exactly on the cutoff day', () => {
    expect(isWithinMonths('2026-07-14', 3, from)).toBe(true)
  })

  it('returns false for a date one day past the cutoff', () => {
    expect(isWithinMonths('2026-07-15', 3, from)).toBe(false)
  })

  it('returns false for TBC dates', () => {
    expect(isWithinMonths('TBC', 3, from)).toBe(false)
  })

  it('returns true for a date today', () => {
    expect(isWithinMonths('2026-04-14', 3, from)).toBe(true)
  })
})
