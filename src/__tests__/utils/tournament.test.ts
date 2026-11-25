import { vi } from 'vitest'
import {
  getNextEvent,
  isEventPast,
  isTournamentActive,
  isWithinMonths,
  isWithinDays,
  isWeekendEvent,
  isInProgress,
  getEffectiveEndDate,
  isUpcomingOrInProgress,
} from '../../utils/tournament'
import type { Tournament, TournamentDate } from '../../types/tournament'

describe('isEventPast', () => {
  const today = new Date('2026-05-01')

  it('returns true when completed is true even if date is in the future', () => {
    expect(isEventPast({ name: 'E1', date: '2026-06-01', completed: true }, today)).toBe(true)
  })

  it('returns true when date is before today even if completed is false', () => {
    expect(isEventPast({ name: 'E1', date: '2026-04-18', completed: false }, today)).toBe(true)
  })

  it('returns false on the event day itself', () => {
    expect(isEventPast({ name: 'E1', date: '2026-05-01', completed: false }, today)).toBe(false)
  })

  it('returns false when mid-range of a multi-day event', () => {
    expect(isEventPast({ name: 'E1', date: '2026-04-29', endDate: '2026-05-02', completed: false }, today)).toBe(false)
  })

  it('returns false for TBC dates that are not completed', () => {
    expect(isEventPast({ name: 'Final', date: 'TBC', completed: false }, today)).toBe(false)
  })
})

describe('getNextEvent', () => {
  const today = new Date('2026-04-14')

  it('returns the first incomplete future event', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: true },
      { name: 'Event 2', date: '2026-05-09', completed: false },
      { name: 'Event 3', date: '2026-06-06', completed: false },
    ]
    expect(getNextEvent(dates, today)).toEqual({
      name: 'Event 2',
      date: '2026-05-09',
      completed: false,
    })
  })

  it('skips past dates even when completed flag was not updated', () => {
    const dates: TournamentDate[] = [
      { name: 'Stale Event', date: '2026-04-01', completed: false },
      { name: 'Upcoming Event', date: '2026-05-09', completed: false },
    ]
    expect(getNextEvent(dates, today)).toEqual({
      name: 'Upcoming Event',
      date: '2026-05-09',
      completed: false,
    })
  })

  it('returns undefined when all events are completed or elapsed', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: true },
      { name: 'Past', date: '2026-03-01', completed: false },
    ]
    expect(getNextEvent(dates, today)).toBeUndefined()
  })

  it('returns the first event when none are completed and all are upcoming', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: false },
      { name: 'Event 2', date: '2026-05-09', completed: false },
    ]
    expect(getNextEvent(dates, today)).toEqual({
      name: 'Event 1',
      date: '2026-04-18',
      completed: false,
    })
  })

  it('returns undefined for an empty array', () => {
    expect(getNextEvent([], today)).toBeUndefined()
  })

  it('returns an incomplete future event that appears before completed ones', () => {
    const dates: TournamentDate[] = [
      { name: 'Event 1', date: '2026-04-18', completed: false },
      { name: 'Event 2', date: '2026-05-09', completed: true },
    ]
    expect(getNextEvent(dates, today)).toEqual({
      name: 'Event 1',
      date: '2026-04-18',
      completed: false,
    })
  })
})

describe('isTournamentActive', () => {
  const today = new Date('2026-05-01')
  const base: Tournament = {
    slug: 't',
    meta: { name: 'T', venue: 'V', organiser: 'O', logo: '' },
    dates: [{ name: 'E1', date: '2026-06-01', completed: false }],
  }

  it('returns true when not completed and has upcoming dates', () => {
    expect(isTournamentActive(base, today)).toBe(true)
  })

  it('returns false when tournament.completed is true', () => {
    expect(isTournamentActive({ ...base, completed: true }, today)).toBe(false)
  })

  it('returns false when all dates are in the past', () => {
    expect(
      isTournamentActive({ ...base, dates: [{ name: 'E1', date: '2026-04-01', completed: false }] }, today),
    ).toBe(false)
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

  it('uses the local cutoff date instead of UTC when checking the window', () => {
    const bstFrom = new Date(2026, 5, 14, 0, 30) // 14 Jun 2026 00:30 local time
    expect(isWithinMonths('2026-09-14', 3, bstFrom)).toBe(true)
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

describe('isWithinDays', () => {
  const from = new Date('2026-05-01')

  it('returns true for events within N days', () => {
    expect(isWithinDays({ name: 'x', date: '2026-05-07', completed: false }, 7, from)).toBe(true)
  })

  it('returns false for events beyond N days', () => {
    expect(isWithinDays({ name: 'x', date: '2026-05-10', completed: false }, 7, from)).toBe(false)
  })

  it('returns true for in-progress multi-day events', () => {
    expect(isWithinDays({ name: 'x', date: '2026-04-29', endDate: '2026-05-03', completed: false }, 7, from)).toBe(true)
  })
})

describe('isWeekendEvent', () => {
  it('returns true for Saturday and Sunday events', () => {
    expect(isWeekendEvent({ name: 'Sat', date: '2026-05-02', completed: false })).toBe(true)
    expect(isWeekendEvent({ name: 'Sun', date: '2026-05-03', completed: false })).toBe(true)
  })

  it('returns false for weekday-only events', () => {
    expect(isWeekendEvent({ name: 'Wed', date: '2026-05-06', completed: false })).toBe(false)
  })

  it('returns true for multi-day ranges that span a weekend', () => {
    expect(isWeekendEvent({ name: 'Fest', date: '2026-05-01', endDate: '2026-05-04', completed: false })).toBe(true)
  })
})
