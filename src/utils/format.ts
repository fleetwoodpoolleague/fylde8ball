/**
 * Format an ISO 8601 date string (e.g. "2026-04-18") for display.
 * Parses as a local date to avoid timezone issues.
 */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions
): string {
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
