// RFC 5545 §3.1: fold lines longer than 75 octets. Subsequent lines are
// prefixed with CRLF + a single space and are capped at 74 octets so that the
// leading space stays within the 75-octet limit.
export function fold(line) {
  if (Buffer.byteLength(line, 'utf8') <= 75) return line
  const chunks = []
  let first = true
  let chunk = ''
  let chunkBytes = 0

  for (const char of line) {
    const limit = first ? 75 : 74
    const charBytes = Buffer.byteLength(char, 'utf8')
    if (chunkBytes + charBytes > limit) {
      chunks.push(chunk)
      chunk = ''
      chunkBytes = 0
      first = false
    }
    chunk += char
    chunkBytes += charBytes
  }
  if (chunk) chunks.push(chunk)
  return chunks.join('\r\n ')
}

export function esc(str) {
  if (!str) return ''
  return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

// "1030" → "103000", "2000" → "200000", "8pm" → "200000", "8:30pm" → "203000"
export function toIcsTime(raw) {
  if (typeof raw !== 'string') return null
  const clean = raw.trim()
  if (!clean) return null

  let hours
  let minutes

  if (/^\d{4}$/.test(clean)) {
    hours = parseInt(clean.slice(0, 2), 10)
    minutes = parseInt(clean.slice(2, 4), 10)
  } else {
    const match = clean.match(/^(1[0-2]|[1-9])(?::(\d{2}))?\s*(am|pm)$/i)
    if (!match) return null
    hours = parseInt(match[1], 10)
    minutes = match[2] ? parseInt(match[2], 10) : 0
    const period = match[3].toLowerCase()
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
  }

  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`
}

// "2026-05-09" → "20260509"
export function toIcsDate(iso) {
  return iso.replace(/-/g, '')
}

// Add 4 hours to a YYYYMMDDTHHMMSS string, rolling cleanly across midnight/month/year boundaries.
export function addFourHours(dtstart) {
  const [datePart, timePart] = dtstart.split('T')
  const y = +datePart.slice(0, 4)
  const mo = +datePart.slice(4, 6)
  const d = +datePart.slice(6, 8)
  const h = +timePart.slice(0, 2)
  const mi = +timePart.slice(2, 4)
  const s = +timePart.slice(4, 6)
  const end = new Date(Date.UTC(y, mo - 1, d, h + 4, mi, s))
  return (
    `${end.getUTCFullYear()}` +
    `${String(end.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(end.getUTCDate()).padStart(2, '0')}T` +
    `${String(end.getUTCHours()).padStart(2, '0')}` +
    `${String(end.getUTCMinutes()).padStart(2, '0')}` +
    `${String(end.getUTCSeconds()).padStart(2, '0')}`
  )
}

// Add one calendar day to a YYYYMMDD string. Uses UTC arithmetic to avoid DST drift.
export function addOneDay(yyyymmdd) {
  const y = +yyyymmdd.slice(0, 4)
  const m = +yyyymmdd.slice(4, 6)
  const d = +yyyymmdd.slice(6, 8)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, '0')}${String(next.getUTCDate()).padStart(2, '0')}`
}
