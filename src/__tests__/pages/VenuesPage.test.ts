import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import VenuesPage from '../../pages/VenuesPage.vue'
import VenueDetailPage from '../../pages/VenueDetailPage.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/venues', component: { template: '<div />' } },
    { path: '/venues/:slug', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

describe('VenuesPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14'))
    await router.push('/venues')
    await router.isReady()
  })

  afterEach(() => vi.useRealTimers())

  it('lists all Fylde Coast venues with links to their detail pages', () => {
    const wrapper = mount(VenuesPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Ballers Blackpool')
    expect(wrapper.text()).toContain("Q's Sports Lounge")
    expect(wrapper.text()).toContain('The Cue Lounge')
    expect(wrapper.find('a[href="/venues/ballers-blackpool"]').exists()).toBe(true)
  })
})

describe('VenueDetailPage', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14'))
    await router.push('/venues/ballers-blackpool')
    await router.isReady()
  })

  afterEach(() => vi.useRealTimers())

  it('renders venue contact actions and hosted competitions', () => {
    const wrapper = mount(VenueDetailPage, {
      props: { slug: 'ballers-blackpool' },
      global: { plugins: [router] },
    })
    expect(wrapper.text()).toContain('Ballers Blackpool')
    expect(wrapper.text()).toContain('Blackpool')
    expect(wrapper.find('a[href="tel:01253584711"]').exists()).toBe(true)
    expect(wrapper.find('a[href^="https://www.google.com/maps/search/"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Precision Cue Series')
  })

  it('renders a recoverable not-found card for an unknown venue slug', () => {
    const wrapper = mount(VenueDetailPage, {
      props: { slug: 'does-not-exist' },
      global: { plugins: [router] },
    })
    expect(wrapper.text().toLowerCase()).toContain('venue not found')
    expect(wrapper.find('a[href="/venues"]').exists()).toBe(true)
  })
})
