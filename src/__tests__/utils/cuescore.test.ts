import {
  parseCueScoreId,
  extractRankingIdFromUrl,
  resolveCueScoreRankingId,
  resolveCueScoreVenueId,
  normalizeRankingPayload,
  summarizeVenuePayload,
} from '../../utils/cuescore'
import type { TournamentMeta } from '../../types/tournament'
import type { Venue } from '../../types/venue'

describe('cuescore utils', () => {
  it('handles null, empty string, undefined, and invalid IDs gracefully', () => {
    expect(parseCueScoreId(null)).toBeNull()
    expect(parseCueScoreId('')).toBeNull()
    expect(parseCueScoreId('   ')).toBeNull()
    expect(parseCueScoreId(undefined)).toBeNull()
    expect(parseCueScoreId(0)).toBeNull()
    expect(parseCueScoreId(-5)).toBeNull()
    expect(parseCueScoreId('not-a-number')).toBeNull()
  })

  it('parses valid numeric and string CueScore IDs', () => {
    expect(parseCueScoreId(85297054)).toBe(85297054)
    expect(parseCueScoreId('80566852')).toBe(80566852)
  })

  it('resolves ranking ID from meta.cuescoreRankingId or falls back to scoreboard URL', () => {
    const withExplicit: TournamentMeta = {
      name: 'T',
      venue: 'V',
      organiser: 'O',
      logo: '',
      cuescoreRankingId: 85297054,
    }
    expect(resolveCueScoreRankingId(withExplicit)).toBe(85297054)

    const withUrlOnly: TournamentMeta = {
      name: 'T',
      venue: 'V',
      organiser: 'O',
      logo: '',
      cuescoreRankingId: null,
      urls: { scoreboard: 'https://cuescore.com/ranking/Test/75307840' },
    }
    expect(resolveCueScoreRankingId(withUrlOnly)).toBe(75307840)

    const withEmpty: TournamentMeta = {
      name: 'T',
      venue: 'V',
      organiser: 'O',
      logo: '',
      cuescoreRankingId: '',
      urls: { scoreboard: '' },
    }
    expect(resolveCueScoreRankingId(withEmpty)).toBeNull()
  })

  it('resolves venue ID gracefully when null or empty', () => {
    const venueWithId: Venue = { slug: 'b', name: 'Ballers', town: 'Blackpool', cuescoreVenueId: 58691482 }
    const venueNull: Venue = { slug: 'n', name: 'Norbreck', town: 'Blackpool', cuescoreVenueId: null }
    expect(resolveCueScoreVenueId(venueWithId)).toBe(58691482)
    expect(resolveCueScoreVenueId(venueNull)).toBeNull()
  })

  it('extracts ranking ID from CueScore URLs', () => {
    expect(extractRankingIdFromUrl('https://cuescore.com/ranking/Series/80566852')).toBe(80566852)
    expect(extractRankingIdFromUrl('https://other.com/ranking/123')).toBeNull()
  })

  it('normalizes ranking and venue payloads and rejects error responses', () => {
    expect(normalizeRankingPayload({ error: 'Not found' })).toBeNull()
    expect(summarizeVenuePayload({ error: 'Not found' })).toBeNull()
  })
})
