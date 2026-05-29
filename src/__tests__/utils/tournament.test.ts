import { vi } from 'vitest'
import { getNextEvent, isWithinMonths, isInProgress, getEffectiveEndDate, isUpcomingOrInProgress } from '../../utils/tournament'
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

describe('isInProgress', () => {
  afterEach(() => vi.useRealTimers())

  it('returns false when no endDate is set', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 3)) // 3 Jun 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', completed: false })).toBe(false)
  })

  it('returns false before the start date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 31)) // 31 May 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe(false)
  })

  it('returns true on the start date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 1)) // 1 Jun 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe(true)
  })

  it('returns true mid-range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 4)) // 4 Jun 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe(true)
  })

  it('returns true on the end date (inclusive)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 8)) // 8 Jun 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe(true)
  })

  it('returns false after the end date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 9)) // 9 Jun 2026
    expect(isInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe(false)
  })
})

describe('getEffectiveEndDate', () => {
  it('returns date.date when no endDate is set', () => {
    expect(getEffectiveEndDate({ name: 'x', date: '2026-06-01', completed: false })).toBe('2026-06-01')
  })

  it('returns date.endDate when set', () => {
    expect(getEffectiveEndDate({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false })).toBe('2026-06-08')
  })

  it('returns "TBC" untouched', () => {
    expect(getEffectiveEndDate({ name: 'x', date: 'TBC', completed: false })).toBe('TBC')
  })
})

describe('isUpcomingOrInProgress', () => {
  it('returns true when start is within the 3-month window', () => {
    const from = new Date('2026-04-14')
    expect(isUpcomingOrInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false }, 3, from)).toBe(true)
  })

  it('returns true when today is mid-range even if start is before today', () => {
    const from = new Date('2026-06-04') // mid-range — start (Jun 1) is in the past, but in-progress
    expect(isUpcomingOrInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false }, 3, from)).toBe(true)
  })

  it('returns false when entirely past (day after end)', () => {
    const from = new Date('2026-06-09')
    expect(isUpcomingOrInProgress({ name: 'x', date: '2026-06-01', endDate: '2026-06-08', completed: false }, 3, from)).toBe(false)
  })

  it('returns false when start is beyond the window (single-day)', () => {
    const from = new Date('2026-04-14')
    expect(isUpcomingOrInProgress({ name: 'x', date: '2026-08-01', completed: false }, 3, from)).toBe(false)
  })
})
