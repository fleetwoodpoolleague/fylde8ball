// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { fold, esc, toIcsTime, toIcsDate, addFourHours } from '../../../scripts/ics-utils.mjs'

describe('fold', () => {
  it('returns a short line unchanged', () => {
    expect(fold('SUMMARY:short')).toBe('SUMMARY:short')
  })

  it('returns a line of exactly 75 octets unchanged', () => {
    const line = 'A'.repeat(75)
    expect(fold(line)).toBe(line)
  })

  it('folds a line longer than 75 octets with CRLF + space', () => {
    const line = 'A'.repeat(150)
    const folded = fold(line)
    expect(folded).toContain('\r\n ')
    const parts = folded.split('\r\n ')
    expect(parts[0]).toHaveLength(75)
    // Continuation lines cap at 74 octets so the leading space keeps each
    // physical line within the 75-octet RFC 5545 limit.
    expect(parts[1]).toHaveLength(74)
    expect(parts.join('')).toBe(line)
  })

  it('handles multi-byte UTF-8 without splitting characters improperly', () => {
    // "£" is 2 bytes in UTF-8; ensure length math is byte-based, not char-based
    const line = '£'.repeat(80)
    const folded = fold(line)
    expect(folded).toContain('\r\n ')
  })
})

describe('esc', () => {
  it('returns empty string for falsy input', () => {
    expect(esc('')).toBe('')
    expect(esc(undefined)).toBe('')
    expect(esc(null)).toBe('')
  })

  it('escapes commas', () => {
    expect(esc('a,b')).toBe('a\\,b')
  })

  it('escapes semicolons', () => {
    expect(esc('a;b')).toBe('a\\;b')
  })

  it('escapes newlines as literal \\n', () => {
    expect(esc('a\nb')).toBe('a\\nb')
  })

  it('escapes backslashes first so later escapes are not double-escaped', () => {
    expect(esc('a\\b')).toBe('a\\\\b')
    // A comma after a backslash should produce \\\\\\,  (backslash + comma each escaped once)
    expect(esc('\\,')).toBe('\\\\\\,')
  })
})

describe('toIcsTime', () => {
  it('appends "00" seconds to a 4-digit military time', () => {
    expect(toIcsTime('1030')).toBe('103000')
    expect(toIcsTime('2000')).toBe('200000')
    expect(toIcsTime('0000')).toBe('000000')
  })

  it('returns null for non-military formats', () => {
    expect(toIcsTime('8pm')).toBeNull()
    expect(toIcsTime('')).toBeNull()
    expect(toIcsTime('100')).toBeNull()
  })
})

describe('toIcsDate', () => {
  it('strips hyphens from an ISO date', () => {
    expect(toIcsDate('2026-05-09')).toBe('20260509')
  })
})

describe('addFourHours', () => {
  it('adds 4 hours to an evening start time', () => {
    expect(addFourHours('20260509T190000')).toBe('20260509T230000')
  })

  it('zero-pads single-digit results (no wrap)', () => {
    expect(addFourHours('20260509T040000')).toBe('20260509T080000')
  })

  it('preserves minutes and seconds', () => {
    expect(addFourHours('20260509T193045')).toBe('20260509T233045')
  })
})
