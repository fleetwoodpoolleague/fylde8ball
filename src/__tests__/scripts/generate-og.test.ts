// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { buildOgCardSvg, buildTournamentOgData } from '../../../scripts/generate-og.mjs'

describe('generate-og', () => {
  const sampleTournament = {
    completed: false,
    meta: {
      name: 'Premier Pool Series 2026/27',
      venue: 'Ballers Blackpool',
      organiser: 'Ballers',
      logo: 'ballers_logo.webp',
    },
    format: {
      rules: 'International Rules',
      entryFee: '£25',
      handicap: false,
      raceToWin: 7,
    },
    dates: [
      { name: 'Event 1', date: '2026-09-01', time: '1900', completed: true },
      { name: 'Event 2', date: '2026-12-12', doorsTime: '1830', time: '1900', completed: false },
    ],
  }

  it('builds tournament OG data from the next upcoming event', () => {
    const data = buildTournamentOgData('premier-pool-series-2026-27', sampleTournament, '2026-11-27')
    expect(data.eyebrow).toBe('Next Up')
    expect(data.title).toBe('Premier Pool Series 2026/27')
    expect(data.subtitle).toBe('Event 2')
    expect(data.dateLine).toContain('12 Dec 2026')
    expect(data.dateLine).toContain('Doors 6:30pm')
    expect(data.dateLine).toContain('Break-off 7pm')
    expect(data.venue).toBe('Ballers Blackpool')
    expect(data.badges).toEqual(['International Rules', 'Entry £25', 'Scratch', 'Race to 7'])
    expect(data.footerUrl).toBe('fylde8ball.co.uk/tournaments/premier-pool-series-2026-27')
  })

  it('renders a 1200x630 pool-table SVG with escaped XML text', () => {
    const svg = buildOgCardSvg({
      eyebrow: 'Next Up',
      title: "KC's & Friends Open",
      subtitle: 'Event 1',
      dateLine: 'Sat 12 Dec 2026 · 7pm',
      venue: "KC's Pool & Sports Club",
      badges: ['EPA Rules', 'Entry £10'],
      footerUrl: 'fylde8ball.co.uk/tournaments/kcs-open',
    })

    expect(svg).toContain('width="1200" height="630"')
    expect(svg).toContain('KC&apos;s &amp; Friends Open')
    expect(svg).toContain('fylde8ball.co.uk/tournaments/kcs-open')
    expect(svg).toContain('url(#woodGrad)')
    expect(svg).toContain('url(#feltGrad)')
  })
})
