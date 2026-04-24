import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fold, esc, toIcsTime, toIcsDate, addFourHours } from './ics-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dataDir = resolve(root, 'src/data/tournaments')
const outFile = resolve(root, 'public/fylde8ball.ics')

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
