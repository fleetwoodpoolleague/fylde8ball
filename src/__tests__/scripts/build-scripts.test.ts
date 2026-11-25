// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { validateTournamentData } from '../../../scripts/validate-tournaments.mjs'
// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { buildSitemapXml } from '../../../scripts/generate-sitemap.mjs'
// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { parseCueScoreId, extractRankingIdFromUrl, normalizeRankingPayload, summarizeVenuePayload } from '../../../scripts/fetch-cuescore.mjs'

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

describe('fetch-cuescore helpers', () => {
  it('parses valid numeric IDs and returns null for null/empty/invalid placeholders', () => {
    expect(parseCueScoreId(85297054)).toBe(85297054)
    expect(parseCueScoreId('80566852')).toBe(80566852)
    expect(parseCueScoreId(null)).toBeNull()
    expect(parseCueScoreId('')).toBeNull()
    expect(parseCueScoreId('   ')).toBeNull()
    expect(parseCueScoreId(undefined)).toBeNull()
    expect(parseCueScoreId('abc')).toBeNull()
  })

  it('extracts ranking IDs from CueScore ranking URLs', () => {
    expect(
      extractRankingIdFromUrl('https://cuescore.com/ranking/Ballers+Series/75307840'),
    ).toBe(75307840)
    expect(extractRankingIdFromUrl('')).toBeNull()
    expect(extractRankingIdFromUrl('https://example.com')).toBeNull()
  })

  it('normalizes ranking payloads and returns null on API error payloads', () => {
    expect(normalizeRankingPayload({ error: 'Not found' })).toBeNull()
    const normalized = normalizeRankingPayload(
      {
        rankingId: 85297054,
        name: 'Contenders 2',
        url: '//cuescore.com/ranking/Test/85297054',
        participants: [
          { rank: 1, name: 'Player A', participantId: 11, url: 'https://cuescore.com/player/A/11', points: 240, tournamentCount: 3 },
        ],
        tournaments: [],
      },
      '2026-11-25T10:00:00Z',
    )
    expect(normalized?.url).toBe('https://cuescore.com/ranking/Test/85297054')
    expect(normalized?.participants).toHaveLength(1)
  })

  it('summarizes venue tables by shared spec', () => {
    const venue = summarizeVenuePayload(
      {
        venueId: 58691482,
        name: 'Ballers Blackpool',
        url: 'https://cuescore.com/venue/Ballers/58691482',
        tables: [
          { manufacturer: 'Supreme', model: 'Winner', size: 7, cloth: 'Hainsworth Match Silver', branch: 'English pool' },
          { manufacturer: 'Supreme', model: 'Winner', size: 7, cloth: 'Hainsworth Match Silver', branch: 'English pool' },
          { manufacturer: 'Supreme', model: 'Winner', size: 7, cloth: '', branch: 'American pool' },
        ],
      },
      '2026-11-25T10:00:00Z',
    )
    expect(venue?.totalTables).toBe(3)
    expect(venue?.tableGroups).toHaveLength(2)
    expect(venue?.tableGroups[0].count).toBe(2)
  })
})
