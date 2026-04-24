// RFC 5545 §3.1: fold lines longer than 75 octets. Subsequent lines are
// prefixed with CRLF + a single space and are capped at 74 octets so that the
// leading space stays within the 75-octet limit.
export function fold(line) {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const chunks = []
  let offset = 0
  let first = true
  while (offset < bytes.length) {
    const limit = first ? 75 : 74
    chunks.push(bytes.slice(offset, offset + limit).toString('utf8'))
    offset += limit
    first = false
  }
  return chunks.join('\r\n ')
}

export function esc(str) {
  if (!str) return ''
  return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

// "1030" → "103000", "2000" → "200000"
export function toIcsTime(raw) {
  if (/^\d{4}$/.test(raw)) return raw + '00'
  return null
}

// "2026-05-09" → "20260509"
export function toIcsDate(iso) {
  return iso.replace(/-/g, '')
}

// Add 4 hours to a YYYYMMDDTHHMMSS string (floating).
export function addFourHours(dtstart) {
  const [datePart, timePart] = dtstart.split('T')
  const h = parseInt(timePart.slice(0, 2), 10)
  const m = timePart.slice(2, 4)
  const s = timePart.slice(4, 6)
  const newH = String(h + 4).padStart(2, '0')
  return `${datePart}T${newH}${m}${s}`
}
