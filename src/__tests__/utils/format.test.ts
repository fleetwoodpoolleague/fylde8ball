import { vi } from 'vitest'
import { formatDate, SHORT_DATE, LONG_DATE, isToday } from '../../utils/format'

describe('formatDate', () => {
  it('formats a date in short format', () => {
    expect(formatDate('2026-04-18', SHORT_DATE)).toBe('18 Apr 2026')
  })

  it('formats a date in long format containing the year', () => {
    const result = formatDate('2026-04-18', LONG_DATE)
    expect(result).toContain('2026')
    expect(result).toContain('April')
    expect(result).toContain('18')
  })

  it('parses as local date (no timezone offset for midnight UTC)', () => {
    // If parsed as UTC, dates near midnight could shift to the previous day
    // in negative-offset timezones. Local parsing must be used.
    const result = formatDate('2026-01-01', SHORT_DATE)
    expect(result).toContain('1 Jan 2026')
  })
})

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15)) // 15 Apr 2026
  })
  afterEach(() => vi.useRealTimers())

  it("returns true for today's ISO date", () => {
    expect(isToday('2026-04-15')).toBe(true)
  })

  it('returns false for a different date', () => {
    expect(isToday('2026-04-16')).toBe(false)
  })

  it('returns false for a non-date string', () => {
    expect(isToday('TBC')).toBe(false)
  })
})
