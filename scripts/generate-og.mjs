import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapByChars(text, maxChars, maxLines) {
  const words = String(text).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []

  const lines = []
  let current = words[0]

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`
    if (candidate.length <= maxChars) {
      current = candidate
    } else {
      lines.push(current)
      current = words[i]
      if (lines.length === maxLines - 1) {
        let rest = [current, ...words.slice(i + 1)].join(' ')
        if (rest.length > maxChars) {
          rest = `${rest.slice(0, maxChars - 1).trimEnd()}…`
        }
        lines.push(rest)
        return lines
      }
    }
  }
  if (current.length > maxChars) {
    current = `${current.slice(0, maxChars - 1).trimEnd()}…`
  }
  lines.push(current)
  return lines
}

function formatLongDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt)
}

function formatShortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dt)
}

function formatTime(raw) {
  const clean = String(raw).trim()
  if (/^\d{4}$/.test(clean)) {
    const h = parseInt(clean.slice(0, 2), 10)
    const min = clean.slice(2, 4)
    const period = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    return min === '00' ? `${h12}${period}` : `${h12}:${min}${period}`
  }
  return clean.toLowerCase()
}

export function buildTournamentOgData(slug, tournament, todayIso) {
  const dates = Array.isArray(tournament.dates) ? tournament.dates : []
  const nextEvent = tournament.completed
    ? undefined
    : dates.find((d) => {
        if (d.completed) return false
        const end = d.endDate ?? d.date
        return end === 'TBC' || end >= todayIso
      })

  let eyebrow = 'Tournament'
  let subtitle
  let dateLine

  if (tournament.completed) {
    eyebrow = 'Completed'
  } else if (nextEvent) {
    eyebrow =
      nextEvent.endDate && nextEvent.date <= todayIso && todayIso <= nextEvent.endDate
        ? 'In Progress'
        : 'Next Up'
    subtitle = nextEvent.name
    if (nextEvent.date === 'TBC') {
      dateLine = 'Date TBC — check with organiser'
    } else if (nextEvent.endDate) {
      dateLine = `${formatShortDate(nextEvent.date)} – ${formatLongDate(nextEvent.endDate)}`
    } else {
      const parts = [formatLongDate(nextEvent.date)]
      if (nextEvent.doorsTime) parts.push(`Doors ${formatTime(nextEvent.doorsTime)}`)
      if (nextEvent.time) {
        parts.push(`${nextEvent.doorsTime ? 'Break-off ' : ''}${formatTime(nextEvent.time)}`)
      } else if (!nextEvent.doorsTime) {
        parts.push('Time TBC')
      }
      dateLine = parts.join(' · ')
    }
  }

  const f = tournament.format ?? {}
  const badges = []
  if (f.rules) badges.push(f.rules)
  if (f.entryFee) badges.push(`Entry ${f.entryFee}`)
  if (f.handicap === true) badges.push('Handicapped')
  else if (f.handicap === false) badges.push('Scratch')
  if (f.raceToWin) badges.push(`Race to ${f.raceToWin}`)

  return {
    eyebrow,
    title: tournament.meta.name,
    subtitle,
    dateLine,
    venue: tournament.meta.venue,
    badges,
    logoFile: tournament.meta.logo,
    footerUrl: `fylde8ball.co.uk/tournaments/${slug}`,
  }
}

export function buildOgCardSvg(card) {
  const hasLogo = Boolean(card.logoDataUri)
  const titleMaxChars = hasLogo ? 30 : 36
  const titleLines = wrapByChars(card.title, titleMaxChars, 2)

  const contentX = 124
  const contentRight = 1076
  let cursorY = 162

  const titleSvg = titleLines
    .map((line, idx) => {
      const y = cursorY + idx * 56
      return `<text x="${contentX}" y="${y}" fill="#ffffff" font-family="sans-serif" font-size="46" font-weight="700">${escapeXml(line)}</text>`
    })
    .join('\n    ')
  cursorY += titleLines.length * 56

  let subtitleSvg = ''
  if (card.subtitle) {
    cursorY += 6
    const subLine = wrapByChars(card.subtitle, hasLogo ? 46 : 56, 1)[0]
    subtitleSvg = `<text x="${contentX}" y="${cursorY}" fill="#f0f7f2" font-family="sans-serif" font-size="28" font-weight="600">${escapeXml(subLine)}</text>`
    cursorY += 42
  }

  let dateSvg = ''
  if (card.dateLine) {
    cursorY += 4
    const dLine = wrapByChars(card.dateLine, 62, 1)[0]
    dateSvg = `<text x="${contentX}" y="${cursorY}" fill="#ffffff" font-family="sans-serif" font-size="25" font-weight="600">${escapeXml(dLine)}</text>`
    cursorY += 36
  }

  let venueSvg = ''
  if (card.venue) {
    cursorY += 2
    const vLine = wrapByChars(card.venue, 64, 1)[0]
    venueSvg = `<text x="${contentX}" y="${cursorY}" fill="#cfe8da" font-family="sans-serif" font-size="24" font-weight="500">${escapeXml(vLine)}</text>`
    cursorY += 40
  }

  let badgesSvg = ''
  if (Array.isArray(card.badges) && card.badges.length > 0) {
    cursorY += 6
    let pillX = contentX
    const pillH = 38
    const pillGap = 12
    const parts = []
    for (const badge of card.badges) {
      const estW = Math.round(badge.length * 11.4 + 36)
      if (pillX + estW > contentRight) break
      parts.push(
        `<rect x="${pillX}" y="${cursorY - 22}" width="${estW}" height="${pillH}" rx="19" fill="rgba(0,0,0,0.28)" />`,
      )
      parts.push(
        `<text x="${pillX + estW / 2}" y="${cursorY + 3}" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="600">${escapeXml(badge)}</text>`,
      )
      pillX += estW + pillGap
    }
    badgesSvg = parts.join('\n    ')
  }

  const logoSvg = hasLogo
    ? `
    <rect x="980" y="102" width="96" height="96" rx="14" fill="rgba(255,255,255,0.94)" />
    <image x="990" y="112" width="76" height="76" href="${card.logoDataUri}" preserveAspectRatio="xMidYMid meet" />`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="28%">
      <stop offset="0%" stop-color="#3d1f08"/>
      <stop offset="8%" stop-color="#7a3e12"/>
      <stop offset="15%" stop-color="#a0541a"/>
      <stop offset="22%" stop-color="#c47832"/>
      <stop offset="30%" stop-color="#8b4a14"/>
      <stop offset="38%" stop-color="#6b3410"/>
      <stop offset="46%" stop-color="#a05c20"/>
      <stop offset="53%" stop-color="#c47832"/>
      <stop offset="60%" stop-color="#8b4a14"/>
      <stop offset="68%" stop-color="#6b3410"/>
      <stop offset="76%" stop-color="#9e5218"/>
      <stop offset="84%" stop-color="#c47832"/>
      <stop offset="92%" stop-color="#8b4a14"/>
      <stop offset="100%" stop-color="#4a2208"/>
    </linearGradient>
    <radialGradient id="feltGrad" cx="45%" cy="28%" r="72%">
      <stop offset="0%" stop-color="#227247"/>
      <stop offset="60%" stop-color="#1a5c3a"/>
      <stop offset="100%" stop-color="#124229"/>
    </radialGradient>
    <radialGradient id="pocketGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="ballGrad" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#4a4a4a"/>
      <stop offset="45%" stop-color="#181818"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>

  <!-- Pool-hall charcoal background -->
  <rect width="1200" height="630" fill="#111814"/>

  <!-- Wooden table rail -->
  <rect x="48" y="40" width="1104" height="550" rx="24" fill="url(#woodGrad)"/>

  <!-- Green felt surface -->
  <rect x="72" y="64" width="1056" height="502" rx="10" fill="url(#feltGrad)" stroke="rgba(217,178,95,0.55)" stroke-width="2.5"/>

  <!-- 6 pockets -->
  <circle cx="58" cy="50" r="26" fill="url(#pocketGrad)"/>
  <circle cx="1142" cy="50" r="26" fill="url(#pocketGrad)"/>
  <circle cx="58" cy="580" r="26" fill="url(#pocketGrad)"/>
  <circle cx="1142" cy="580" r="26" fill="url(#pocketGrad)"/>
  <circle cx="600" cy="46" r="22" fill="url(#pocketGrad)"/>
  <circle cx="600" cy="584" r="22" fill="url(#pocketGrad)"/>

  <!-- Content -->
  <text x="${contentX}" y="106" fill="#cfe8da" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="1.8">${escapeXml(card.eyebrow.toUpperCase())}</text>
  ${logoSvg}
  ${titleSvg}
  ${subtitleSvg}
  ${dateSvg}
  ${venueSvg}
  ${badgesSvg}

  <!-- Footer bar -->
  <line x1="${contentX}" y1="494" x2="${contentRight}" y2="494" stroke="rgba(217,178,95,0.35)" stroke-width="1.5"/>
  <circle cx="140" cy="526" r="16" fill="url(#ballGrad)"/>
  <circle cx="140" cy="526.5" r="7" fill="#f5f5f5"/>
  <text x="140" y="530.5" text-anchor="middle" fill="#111111" font-family="Georgia, serif" font-size="11" font-weight="700">8</text>
  <text x="168" y="533" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700">Fylde 8 Ball</text>
  <text x="${contentRight}" y="533" text-anchor="end" fill="#e2c277" font-family="sans-serif" font-size="20" font-weight="600">${escapeXml(card.footerUrl ?? 'fylde8ball.co.uk')}</text>
</svg>`
}

function convertWebpToPngBuffer(filePath) {
  const candidates = [
    ['magick', [filePath, 'png:-']],
    ['convert', [filePath, 'png:-']],
    ['dwebp', [filePath, '-o', '-']],
  ]
  for (const [bin, args] of candidates) {
    try {
      return execFileSync(bin, args, {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    } catch {
      // Try next binary
    }
  }
  return null
}

function loadLogoDataUri(root, logoFile) {
  if (!logoFile) return null
  const full = resolve(root, 'src/assets/img', logoFile)
  if (!existsSync(full)) return null
  const ext = extname(logoFile).toLowerCase()
  if (ext === '.webp') {
    const pngBuf = convertWebpToPngBuffer(full)
    if (!pngBuf) return null
    return `data:image/png;base64,${pngBuf.toString('base64')}`
  }
  const mime =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.svg'
          ? 'image/svg+xml'
          : null
  if (!mime) return null
  const b64 = readFileSync(full).toString('base64')
  return `data:${mime};base64,${b64}`
}

function renderSvgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: true },
  })
  return resvg.render().asPng()
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = resolve(__dirname, '..')
  const outDir = resolve(root, 'public/og')
  mkdirSync(outDir, { recursive: true })

  // Site-wide default OG card
  const defaultSvg = buildOgCardSvg({
    eyebrow: 'Fylde Coast Pool',
    title: 'Fylde 8 Ball',
    subtitle: 'Tournaments, leagues & venues',
    venue: 'Blackpool, Poulton-le-Fylde & the Fylde Coast',
    badges: ['8-Ball Pool', 'Fixtures & Schedules', 'Calendar Feeds'],
    footerUrl: 'fylde8ball.co.uk',
  })
  writeFileSync(resolve(outDir, 'default.png'), renderSvgToPng(defaultSvg))

  const tournamentsDir = resolve(root, 'src/data/tournaments')
  const todayIso = new Date().toISOString().slice(0, 10)
  const files = existsSync(tournamentsDir)
    ? readdirSync(tournamentsDir).filter((f) => f.endsWith('.json')).sort()
    : []

  for (const file of files) {
    const slug = file.replace(/\.json$/, '')
    const tournament = JSON.parse(readFileSync(resolve(tournamentsDir, file), 'utf8'))
    const card = buildTournamentOgData(slug, tournament, todayIso)
    card.logoDataUri = loadLogoDataUri(root, card.logoFile)
    const svg = buildOgCardSvg(card)
    writeFileSync(resolve(outDir, `${slug}.png`), renderSvgToPng(svg))
  }

  console.log(`Generated ${files.length + 1} OG images in public/og/`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
}
