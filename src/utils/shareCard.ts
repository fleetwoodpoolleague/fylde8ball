import type { Tournament, TournamentFormat } from '../types/tournament'
import { formatDate, formatDateRange, formatTime, isToday, LONG_DATE } from './format'
import { getNextEvent, isInProgress } from './tournament'
import { logoSrc } from './assets'

export interface ShareCardData {
  eyebrow: string
  title: string
  subtitle?: string
  dateLine?: string
  venue?: string
  badges?: string[]
  logoUrl?: string | null
  footerUrl?: string
}

export function buildQuickBadges(format?: TournamentFormat): string[] {
  if (!format) return []
  const pills: string[] = []
  if (format.rules) pills.push(format.rules)
  if (format.entryFee) pills.push(`Entry ${format.entryFee}`)
  if (format.handicap === true) pills.push('Handicapped')
  else if (format.handicap === false) pills.push('Scratch')
  if (format.raceToWin) pills.push(`Race to ${format.raceToWin}`)
  return pills
}

export function buildTournamentShareCardData(
  tournament: Tournament,
  now: Date = new Date(),
): ShareCardData {
  const nextEvent = tournament.completed ? undefined : getNextEvent(tournament.dates, now)

  let eyebrow = 'Tournament'
  let subtitle: string | undefined
  let dateLine: string | undefined

  if (tournament.completed) {
    eyebrow = 'Completed'
  } else if (nextEvent) {
    eyebrow = isInProgress(nextEvent, now) ? 'In Progress' : 'Next Up'
    subtitle = nextEvent.name

    if (nextEvent.date === 'TBC') {
      dateLine = 'Date TBC — check with organiser'
    } else if (nextEvent.endDate) {
      dateLine = formatDateRange(nextEvent.date, nextEvent.endDate, LONG_DATE)
    } else {
      const dayPart = isToday(nextEvent.date, now)
        ? 'Today'
        : formatDate(nextEvent.date, LONG_DATE)
      const parts = [dayPart]
      if (nextEvent.doorsTime) parts.push(`Doors ${formatTime(nextEvent.doorsTime)}`)
      if (nextEvent.time) {
        parts.push(`${nextEvent.doorsTime ? 'Break-off ' : ''}${formatTime(nextEvent.time)}`)
      } else if (!nextEvent.doorsTime) {
        parts.push('Time TBC')
      }
      dateLine = parts.join(' · ')
    }
  }

  return {
    eyebrow,
    title: tournament.meta.name,
    subtitle,
    dateLine,
    venue: tournament.meta.venue,
    badges: buildQuickBadges(tournament.format),
    logoUrl: logoSrc(tournament.meta.logo),
    footerUrl: `fylde8ball.co.uk/tournaments/${tournament.slug}`,
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/)
  if (!words.length) return []

  const lines: string[] = []
  let current = words[0]

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = words[i]
      if (lines.length === maxLines - 1) {
        // Pack remaining words onto the last line with ellipsis if needed
        let rest = [current, ...words.slice(i + 1)].join(' ')
        while (rest.length > 1 && ctx.measureText(`${rest}…`).width > maxWidth) {
          rest = rest.slice(0, -1).trimEnd()
        }
        if (ctx.measureText(rest).width > maxWidth) {
          rest = `${rest}…`
        } else if (i + 1 < words.length && rest !== [current, ...words.slice(i + 1)].join(' ')) {
          rest = `${rest}…`
        }
        lines.push(rest)
        return lines
      }
    }
  }
  lines.push(current)
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawPocket(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
  ctx.shadowBlur = 10
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r)
  grad.addColorStop(0, '#2a2a2a')
  grad.addColorStop(1, '#000000')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawEightBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  const ballGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r)
  ballGrad.addColorStop(0, '#4a4a4a')
  ballGrad.addColorStop(0.45, '#181818')
  ballGrad.addColorStop(1, '#050505')
  ctx.fillStyle = ballGrad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f5f5f5'
  ctx.beginPath()
  ctx.arc(cx, cy + r * 0.03, r * 0.42, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#111111'
  ctx.font = `700 ${Math.round(r * 0.56)}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('8', cx, cy + r * 0.06)
  ctx.restore()
}

export async function renderShareCardBlob(data: ShareCardData): Promise<Blob | null> {
  if (typeof document === 'undefined') return null

  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const sans = '"Barlow", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

  // Background — dark pool-hall charcoal
  ctx.fillStyle = '#111814'
  ctx.fillRect(0, 0, W, H)

  // Table outer frame (wooden rail)
  const padX = 48
  const padY = 40
  const tableW = W - padX * 2
  const tableH = H - padY * 2

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 32
  ctx.shadowOffsetY = 12
  const woodGrad = ctx.createLinearGradient(padX, padY, padX + tableW, padY + tableH * 0.3)
  woodGrad.addColorStop(0.0, '#3d1f08')
  woodGrad.addColorStop(0.08, '#7a3e12')
  woodGrad.addColorStop(0.15, '#a0541a')
  woodGrad.addColorStop(0.22, '#c47832')
  woodGrad.addColorStop(0.3, '#8b4a14')
  woodGrad.addColorStop(0.38, '#6b3410')
  woodGrad.addColorStop(0.46, '#a05c20')
  woodGrad.addColorStop(0.53, '#c47832')
  woodGrad.addColorStop(0.6, '#8b4a14')
  woodGrad.addColorStop(0.68, '#6b3410')
  woodGrad.addColorStop(0.76, '#9e5218')
  woodGrad.addColorStop(0.84, '#c47832')
  woodGrad.addColorStop(0.92, '#8b4a14')
  woodGrad.addColorStop(1.0, '#4a2208')
  ctx.fillStyle = woodGrad
  drawRoundedRect(ctx, padX, padY, tableW, tableH, 24)
  ctx.fill()
  ctx.restore()

  // Felt playing surface
  const rail = 24
  const feltX = padX + rail
  const feltY = padY + rail
  const feltW = tableW - rail * 2
  const feltH = tableH - rail * 2

  const feltGrad = ctx.createRadialGradient(
    feltX + feltW * 0.45,
    feltY + feltH * 0.25,
    40,
    feltX + feltW * 0.5,
    feltY + feltH * 0.5,
    feltW * 0.72,
  )
  feltGrad.addColorStop(0, '#227247')
  feltGrad.addColorStop(0.6, '#1a5c3a')
  feltGrad.addColorStop(1, '#124229')
  ctx.fillStyle = feltGrad
  drawRoundedRect(ctx, feltX, feltY, feltW, feltH, 10)
  ctx.fill()

  // Brass cushion trim
  ctx.strokeStyle = 'rgba(217, 178, 95, 0.55)'
  ctx.lineWidth = 2.5
  drawRoundedRect(ctx, feltX + 1.5, feltY + 1.5, feltW - 3, feltH - 3, 9)
  ctx.stroke()

  // 6 pockets (4 corners + 2 middle rails)
  drawPocket(ctx, padX + 10, padY + 10, 26)
  drawPocket(ctx, padX + tableW - 10, padY + 10, 26)
  drawPocket(ctx, padX + 10, padY + tableH - 10, 26)
  drawPocket(ctx, padX + tableW - 10, padY + tableH - 10, 26)
  drawPocket(ctx, W / 2, padY + 6, 22)
  drawPocket(ctx, W / 2, padY + tableH - 6, 22)

  // Inner content bounds
  const contentX = feltX + 52
  const contentY = feltY + 46
  const contentRight = feltX + feltW - 52

  // Optional logo badge on top-right
  const logoImg = data.logoUrl ? await loadImage(data.logoUrl) : null
  const logoBoxSize = 96
  if (logoImg) {
    const lx = contentRight - logoBoxSize
    const ly = contentY - 6
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
    drawRoundedRect(ctx, lx, ly, logoBoxSize, logoBoxSize, 14)
    ctx.fill()
    const pad = 10
    const scale = Math.min(
      (logoBoxSize - pad * 2) / logoImg.width,
      (logoBoxSize - pad * 2) / logoImg.height,
    )
    const dw = logoImg.width * scale
    const dh = logoImg.height * scale
    ctx.drawImage(logoImg, lx + (logoBoxSize - dw) / 2, ly + (logoBoxSize - dh) / 2, dw, dh)
  }

  const textMaxW = logoImg ? contentRight - contentX - logoBoxSize - 28 : contentRight - contentX

  // Eyebrow
  ctx.fillStyle = '#cfe8da'
  ctx.font = `600 20px ${sans}`
  ctx.textBaseline = 'top'
  ctx.fillText(data.eyebrow.toUpperCase(), contentX, contentY)

  // Title
  let cursorY = contentY + 38
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 46px ${sans}`
  const titleLines = wrapText(ctx, data.title, textMaxW, 2)
  for (const line of titleLines) {
    ctx.fillText(line, contentX, cursorY)
    cursorY += 56
  }

  // Subtitle (next event name)
  if (data.subtitle) {
    cursorY += 4
    ctx.fillStyle = '#f0f7f2'
    ctx.font = `600 28px ${sans}`
    const subLines = wrapText(ctx, data.subtitle, textMaxW, 1)
    ctx.fillText(subLines[0], contentX, cursorY)
    cursorY += 40
  }

  // Date & time line
  if (data.dateLine) {
    cursorY += 6
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 25px ${sans}`
    const dateLines = wrapText(ctx, data.dateLine, contentRight - contentX, 1)
    ctx.fillText(dateLines[0], contentX, cursorY)
    cursorY += 36
  }

  // Venue
  if (data.venue) {
    cursorY += 2
    ctx.fillStyle = '#cfe8da'
    ctx.font = `500 24px ${sans}`
    const venueLines = wrapText(ctx, data.venue, contentRight - contentX, 1)
    ctx.fillText(venueLines[0], contentX, cursorY)
    cursorY += 42
  }

  // Format badges
  if (data.badges && data.badges.length > 0) {
    cursorY += 8
    ctx.font = `600 20px ${sans}`
    let pillX = contentX
    const pillH = 38
    const pillPadX = 18
    const pillGap = 12
    for (const badge of data.badges) {
      const tw = ctx.measureText(badge).width
      const pw = tw + pillPadX * 2
      if (pillX + pw > contentRight) break
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      drawRoundedRect(ctx, pillX, cursorY, pw, pillH, pillH / 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'middle'
      ctx.fillText(badge, pillX + pillPadX, cursorY + pillH / 2 + 1)
      pillX += pw + pillGap
    }
  }

  // Footer divider + branding + link
  const footerY = feltY + feltH - 54
  ctx.strokeStyle = 'rgba(217, 178, 95, 0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(contentX, footerY - 18)
  ctx.lineTo(contentRight, footerY - 18)
  ctx.stroke()

  drawEightBall(ctx, contentX + 16, footerY + 12, 16)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 22px ${sans}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText('Fylde 8 Ball', contentX + 44, footerY + 13)

  if (data.footerUrl) {
    ctx.fillStyle = '#e2c277'
    ctx.font = `600 20px ${sans}`
    ctx.textAlign = 'right'
    ctx.fillText(data.footerUrl, contentRight, footerY + 13)
    ctx.textAlign = 'left'
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}
