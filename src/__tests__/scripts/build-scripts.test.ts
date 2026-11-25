// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { validateTournamentData } from '../../../scripts/validate-tournaments.mjs'
// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { buildSitemapXml } from '../../../scripts/generate-sitemap.mjs'

describe('validateTournamentData', () => {
  const validTournament = {
    completed: false,
    meta: {
      name: 'Test Comp',
      venue: 'Test Venue',
      organiser: 'Test Org',
      logo: 'qs_logo.webp',
      urls: { venue: 'https://example.com', organiser: '', scoreboard: null },
      socials: { facebook: 'https://facebook.com/test' },
    },
    dates: [
      { name: 'Event 1', date: '2026-05-01', completed: false },
      { name: 'Weekend', date: '2026-06-01', endDate: '2026-06-03', completed: false },
      { name: 'Final', date: 'TBC', completed: false },
    ],
  }

  it('returns no errors for a valid tournament', () => {
    const errors = validateTournamentData('test', validTournament, new Set(['qs_logo.webp']))
    expect(errors).toEqual([])
  })

  it('flags duplicated protocols like https://https://', () => {
    const bad = {
      ...validTournament,
      meta: { ...validTournament.meta, urls: { venue: 'https://https://example.com' } },
    }
    const errors = validateTournamentData('test', bad, new Set(['qs_logo.webp']))
    expect(errors.some((e: string) => e.includes('meta.urls.venue'))).toBe(true)
  })

  it('flags missing logo files', () => {
    const errors = validateTournamentData('test', validTournament, new Set(['other.webp']))
    expect(errors.some((e: string) => e.includes('meta.logo'))).toBe(true)
  })

  it('flags invalid dates and endDate <= date', () => {
    const bad = {
      ...validTournament,
      dates: [
        { name: 'Bad Date', date: '01/05/2026', completed: false },
        { name: 'Bad Range', date: '2026-06-05', endDate: '2026-06-05', completed: false },
      ],
    }
    const errors = validateTournamentData('test', bad, new Set(['qs_logo.webp']))
    expect(errors).toHaveLength(2)
  })
})

describe('buildSitemapXml', () => {
  it('generates valid XML entries with canonical fylde8ball URLs', () => {
    const xml = buildSitemapXml([
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/tournaments/qs-one-offs', changefreq: 'weekly', priority: '0.8' },
    ])
    expect(xml).toContain('<loc>https://fylde8ball.co.uk/</loc>')
    expect(xml).toContain('<loc>https://fylde8ball.co.uk/tournaments/qs-one-offs</loc>')
  })
})
