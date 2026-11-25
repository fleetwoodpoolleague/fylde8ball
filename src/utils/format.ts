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

export function isToday(iso: string, today: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [year, month, day] = iso.split('-').map(Number)
  return year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()
}

/**
 * Format a time string into human-readable UK 12-hour format (e.g. "7:00 pm", "10:30 am").
 * Accepts 4-digit military ("1900", "1030") or 12h ("8pm", "8PM", "8:30pm").
 * Returns the input unchanged if the format is not recognised.
 */
export function formatTime(raw: string): string {
  const clean = raw.trim()
  let hours: number
  let minutes: number

  if (/^\d{4}$/.test(clean)) {
    hours = parseInt(clean.slice(0, 2), 10)
    minutes = parseInt(clean.slice(2, 4), 10)
  } else {
    const match = clean.match(/^(1[0-2]|[1-9])(?::(\d{2}))?\s*(am|pm)$/i)
    if (!match) return raw
    hours = parseInt(match[1], 10)
    minutes = match[2] ? parseInt(match[2], 10) : 0
    const period = match[3].toLowerCase()
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
  }

  if (hours > 23 || minutes > 59) return raw
  const suffix = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/**
 * Format an inclusive date range for display.
 * If either date is not ISO 8601 format, returns the start value unchanged.
 * Otherwise, returns both dates formatted and separated by " - ".
 */
export function formatDateRange(startIso: string, endIso: string, options: Intl.DateTimeFormatOptions): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso) || !/^\d{4}-\d{2}-\d{2}$/.test(endIso)) return startIso
  return `${formatDate(startIso, options)} - ${formatDate(endIso, options)}`
}
