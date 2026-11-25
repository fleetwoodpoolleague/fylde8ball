import { vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CueScoreRankingsCard from '../../components/CueScoreRankingsCard.vue'

describe('CueScoreRankingsCard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when rankingId is null', () => {
    const wrapper = mount(CueScoreRankingsCard, {
      props: { slug: 'some-comp', rankingId: null },
    })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders cached standings immediately, supports player search, and expands beyond top 10', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

    const wrapper = mount(CueScoreRankingsCard, {
      props: {
        slug: 'precision-cue-series-contenders-season-2-2026-27',
        rankingId: 85297054,
      },
    })

    expect(wrapper.text()).toContain('Series Standings')
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.text()).toContain('Show all')

    // Expand to full table
    const expandBtn = wrapper.findAll('button').find(b => b.text().startsWith('Show all'))!
    await expandBtn.trigger('click')
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(10)

    // Filter by search input
    const firstPlayer = wrapper.find('tbody tr td:nth-child(2)').text()
    await wrapper.find('#ranking-player-search').setValue(firstPlayer)
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThanOrEqual(1)
    expect(wrapper.text()).toContain(firstPlayer)

    // Empty search feedback
    await wrapper.find('#ranking-player-search').setValue('zzzz-no-such-player')
    expect(wrapper.text()).toContain('No players matching')
  })

  it('updates with live data when CueScore fetch succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        rankingId: 99999999,
        name: 'Live Test Ranking',
        url: 'https://cuescore.com/ranking/Live/99999999',
        participants: [
          { rank: 1, name: 'Live Leader', participantId: 1, url: 'https://cuescore.com/player/Live/1', points: 500, tournamentCount: 4 },
        ],
        tournaments: [],
      }),
    } as Response)

    const wrapper = mount(CueScoreRankingsCard, {
      props: { slug: 'uncached-series', rankingId: 99999999 },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Live Leader')
    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('Live')
  })

  it('shows graceful fallback link when uncached and CueScore fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'))

    const wrapper = mount(CueScoreRankingsCard, {
      props: {
        slug: 'uncached-series',
        rankingId: 99999999,
        fallbackUrl: 'https://cuescore.com/ranking/Test/99999999',
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('temporarily unavailable')
    expect(wrapper.find('a[href="https://cuescore.com/ranking/Test/99999999"]').exists()).toBe(true)
  })
})
