/**
 * Format an ISO 8601 date string (e.g. "2026-04-18") for display.
 * Parses as a local date to avoid timezone issues.
 * Returns non-date values (e.g. "TBC") as-is.
 */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', options)
}

export const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

export const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

export function isToday(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [year, month, day] = iso.split('-').map(Number)
  const today = new Date()
  return year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()
}

/**
 * Normalise a time string to 4-digit military format (HHMM).
 * Accepts "1900" (already normalised) or "8pm"/"8PM" style.
 * Returns the input unchanged if the format is not recognised.
 */
export function formatTime(raw: string): string {
  if (/^\d{4}$/.test(raw)) return raw

  const match = raw.match(/^(1[0-2]|[1-9])(am|pm)$/i)
  if (match) {
    let hour = parseInt(match[1], 10)
    const period = match[2].toLowerCase()
    if (period === 'pm' && hour !== 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}00`
  }

  return raw
}
