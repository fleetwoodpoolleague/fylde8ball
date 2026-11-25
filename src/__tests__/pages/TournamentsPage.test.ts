import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Tournament } from '../../types/tournament'

vi.mock('../../composables/useTournaments', () => ({
  useTournaments: vi.fn(),
}))

vi.mock('../../utils/assets', () => ({
  logoSrc: vi.fn((logo: string | undefined) => logo ? `/assets/${logo}` : null),
}))

import { useTournaments } from '../../composables/useTournaments'
import { logoSrc } from '../../utils/assets'
import TournamentsPage from '../../pages/TournamentsPage.vue'

const mockTournaments: Tournament[] = [
  {
    slug: 'challenger-series',
    meta: { name: 'Challenger Series', venue: "Q's Sports Lounge", organiser: "Q's Sports Lounge", logo: 'qs_logo.webp' },
    format: { rules: 'Blackball', entryFee: '£25' },
    dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
  },
  {
    slug: 'no-logo-series',
    meta: { name: 'No Logo Series', venue: 'Ballers Blackpool', organiser: 'Someone', logo: '' },
    format: { rules: 'International Rules', entryFee: '£20' },
    dates: [{ name: 'Event 1', date: '2026-05-01', completed: false }],
  },
  {
    slug: 'past-series',
    completed: true,
    meta: { name: 'Past Series', venue: 'Ballers Blackpool', organiser: 'Someone', logo: '' },
    format: { rules: 'Blackball', entryFee: '£15' },
    dates: [{ name: 'Final', date: '2026-02-01', completed: true }],
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
    { path: '/venues', component: { template: '<div />' } },
  ],
})

describe('TournamentsPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14'))
    vi.mocked(useTournaments).mockReturnValue(mockTournaments)
    vi.mocked(logoSrc).mockClear()
    await router.push('/tournaments')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders active tournament names, venues, rules, entry fee, and remaining count', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Challenger Series')
    expect(wrapper.text()).toContain("Q's Sports Lounge")
    expect(wrapper.text()).toContain('Blackball')
    expect(wrapper.text()).toContain('Entry £25')
    expect(wrapper.text()).toContain('1 event left')
    expect(wrapper.text()).toContain('Next: 18 Apr 2026')
  })

  it('hides completed tournaments by default and reveals them when toggled', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    expect(wrapper.text()).not.toContain('Past Series')

    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.text()).toContain('Past Series')
    expect(wrapper.text()).toContain('Finished')
  })

  it('filters by venue and rules', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })

    await wrapper.find('#filter-venue').setValue("Q's Sports Lounge")
    expect(wrapper.text()).toContain('Challenger Series')
    expect(wrapper.text()).not.toContain('No Logo Series')

    await wrapper.find('#filter-rules').setValue('International Rules')
    expect(wrapper.text()).toContain('No matching tournaments')

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Challenger Series')
    expect(wrapper.text()).toContain('No Logo Series')
    expect(wrapper.text()).toContain('Past Series')
  })

  it('renders a decorative logo image when the tournament has one', async () => {
    await router.isReady()
    const wrapper = mount(TournamentsPage, { global: { plugins: [router] } })
    const imgs = wrapper.findAll('img')
    expect(imgs.length).toBe(1)
    expect(imgs[0].attributes('alt')).toBe('')
  })

  it('resolves each tournament logo at most once while rendering cards', async () => {
    await router.isReady()
    mount(TournamentsPage, { global: { plugins: [router] } })
    expect(logoSrc).toHaveBeenCalledTimes(mockTournaments.length)
  })
})
