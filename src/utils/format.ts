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
