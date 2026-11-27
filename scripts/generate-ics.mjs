import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fold, esc, toIcsTime, toIcsDate, addFourHours, addOneDay } from './ics-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dataDir = resolve(root, 'src/data/tournaments')
const outFile = resolve(root, 'public/fylde8ball.ics')
const perTournamentDir = resolve(root, 'public/ics')

const LONDON_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/London',
  'X-LIC-LOCATION:Europe/London',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0000',
  'TZOFFSETTO:+0100',
  'TZNAME:BST',
  'DTSTART:19700329T010000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0000',
  'TZNAME:GMT',
  'DTSTART:19701025T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

function wrapCalendar(calName, calDesc, eventLines) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fylde 8 Ball//fylde8ball.co.uk//EN',
    fold(`X-WR-CALNAME:${esc(calName)}`),
    fold(`X-WR-CALDESC:${esc(calDesc)}`),
    'X-WR-TIMEZONE:Europe/London',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...LONDON_VTIMEZONE,
    ...eventLines,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

function buildTournamentEvents(slug, tournament) {
  if (tournament.completed) return { lines: [], count: 0 }
  const { meta, format, dates } = tournament

  const location = [meta.venue, meta.address].filter(Boolean).map(esc).join('\\, ')
  const url = `https://fylde8ball.co.uk/tournaments/${slug}`
  const lines = []
  let eventIndex = 0

  for (const date of dates) {
    if (date.completed) continue
    if (date.date === 'TBC') continue

    const effectiveFormat = { ...format, ...(date.format ?? {}) }
    const formatParts = [
      effectiveFormat?.rules,
      effectiveFormat?.type,
      effectiveFormat?.entryFee ? `Entry ${effectiveFormat.entryFee}` : null,
    ].filter(Boolean)
    const description = formatParts.length
      ? `${formatParts.join(' · ')}\n${url}`
      : url

    const uid = `${date.date}-${slug}-${eventIndex}@fylde8ball.co.uk`
    const summary = `${meta.name} – ${date.name}`

    if (date.endDate) {
      const dtstart = toIcsDate(date.date)
      const dtend = addOneDay(toIcsDate(date.endDate))
      lines.push('BEGIN:VEVENT')
      lines.push(fold(`UID:${uid}`))
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`)
      lines.push(`DTEND;VALUE=DATE:${dtend}`)
      lines.push(fold(`SUMMARY:${esc(summary)}`))
      if (location) lines.push(fold(`LOCATION:${location}`))
      lines.push(fold(`DESCRIPTION:${esc(description)}`))
      lines.push(fold(`URL:${url}`))
      lines.push('END:VEVENT')
      eventIndex++
      continue
    }

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
      lines.push(`DTSTART;TZID=Europe/London:${dtstart}`)
      lines.push(`DTEND;TZID=Europe/London:${dtend}`)
    }
    lines.push(fold(`SUMMARY:${esc(summary)}`))
    if (location) lines.push(fold(`LOCATION:${location}`))
    lines.push(fold(`DESCRIPTION:${esc(description)}`))
    lines.push(fold(`URL:${url}`))
    lines.push('END:VEVENT')

    eventIndex++
  }

  return { lines, count: eventIndex }
}

const files = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()

rmSync(perTournamentDir, { recursive: true, force: true })
mkdirSync(perTournamentDir, { recursive: true })

const allEventLines = []
let totalEvents = 0
let perTournamentCount = 0

for (const file of files) {
  const slug = file.replace('.json', '')
  const tournament = JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'))
  const { lines, count } = buildTournamentEvents(slug, tournament)

  if (count > 0) {
    allEventLines.push(...lines)
    totalEvents += count
    const singleIcs = wrapCalendar(
      tournament.meta.name,
      `${tournament.meta.name} at ${tournament.meta.venue}`,
      lines,
    )
    writeFileSync(resolve(perTournamentDir, `${slug}.ics`), singleIcs, 'utf8')
    perTournamentCount++
  }
}

const output = wrapCalendar('Fylde 8 Ball', 'Pool tournaments on the Fylde Coast', allEventLines)
writeFileSync(outFile, output, 'utf8')

console.log(
  `Generated public/fylde8ball.ics (${totalEvents} events) and ${perTournamentCount} per-tournament calendars in public/ics/`,
)
