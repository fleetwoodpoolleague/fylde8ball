import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dataDir = resolve(root, 'src/data/tournaments')
const outFile = resolve(root, 'public/fylde8ball.ics')

// RFC 5545 §3.1: fold lines longer than 75 octets
function fold(line) {
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

function esc(str) {
  if (!str) return ''
  return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

// "1030" → "103000", "2000" → "200000"
function toIcsTime(raw) {
  if (/^\d{4}$/.test(raw)) return raw + '00'
  return null
}

// "2026-05-09" → "20260509"
function toIcsDate(iso) {
  return iso.replace(/-/g, '')
}

// Add 4 hours to a YYYYMMDDTHHMMSS string (floating)
function addFourHours(dtstart) {
  const [datePart, timePart] = dtstart.split('T')
  const h = parseInt(timePart.slice(0, 2), 10)
  const m = timePart.slice(2, 4)
  const s = timePart.slice(4, 6)
  const newH = String(h + 4).padStart(2, '0')
  return `${datePart}T${newH}${m}${s}`
}

const lines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Fylde 8 Ball//fylde8ball.co.uk//EN',
  'X-WR-CALNAME:Fylde 8 Ball',
  'X-WR-CALDESC:Pool tournaments on the Fylde Coast',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
]

const files = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()

for (const file of files) {
  const slug = file.replace('.json', '')
  const tournament = JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'))
  const { meta, format, dates } = tournament

  const location = [meta.venue, meta.address].filter(Boolean).map(esc).join('\\, ')

  const url = `https://fylde8ball.co.uk/tournaments/${slug}`
  const formatParts = [
    format?.rules,
    format?.type,
    format?.entryFee ? `Entry ${format.entryFee}` : null,
  ].filter(Boolean)
  const description = formatParts.length
    ? `${formatParts.join(' · ')}\n${url}`
    : url

  let eventIndex = 0
  for (const date of dates) {
    if (date.completed) continue
    if (date.date === 'TBC') continue

    const uid = `${date.date}-${slug}-${eventIndex}@fylde8ball.co.uk`
    const summary = `${meta.name} – ${date.name}`

    let dtstart, dtend, allDay = false
    const icsTime = date.time ? toIcsTime(date.time) : null
    if (icsTime) {
      dtstart = `${toIcsDate(date.date)}T${icsTime}`
      dtend = addFourHours(dtstart)
    } else {
      allDay = true
      dtstart = toIcsDate(date.date)
    }

    lines.push('BEGIN:VEVENT')
    lines.push(fold(`UID:${uid}`))
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`)
    } else {
      lines.push(`DTSTART:${dtstart}`)
      lines.push(`DTEND:${dtend}`)
    }
    lines.push(fold(`SUMMARY:${esc(summary)}`))
    if (location) lines.push(fold(`LOCATION:${location}`))
    lines.push(fold(`DESCRIPTION:${esc(description)}`))
    lines.push(fold(`URL:${url}`))
    lines.push('END:VEVENT')

    eventIndex++
  }
}

lines.push('END:VCALENDAR')

const output = lines.join('\r\n') + '\r\n'
writeFileSync(outFile, output, 'utf8')

const eventCount = lines.filter(l => l === 'BEGIN:VEVENT').length
console.log(`Generated public/fylde8ball.ics — ${eventCount} events from ${files.length} tournaments`)
