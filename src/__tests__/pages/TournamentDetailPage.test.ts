import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Tournament } from '../../types/tournament'

const mockTournament: Tournament = {
  slug: 'test-series',
  meta: { name: 'Test Series', venue: 'Test Venue', organiser: 'Test Org', logo: 'qs_logo.webp' },
  dates: [{ name: 'Event 1', date: '2026-04-18', completed: false }],
}

const mockTournamentNoLogo: Tournament = {
  slug: 'no-logo-series',
  meta: { name: 'No Logo Series', venue: 'Test Venue', organiser: 'Test Org', logo: '' },
  dates: [],
}

const mockFull: Tournament = {
  slug: 'full-series',
  completed: false,
  meta: {
    name: 'Full Series',
    venue: 'The Venue',
    organiser: 'The Org',
    logo: '',
    address: '123 Main St, Town, FY1 1AA',
    contact: { phone: '01234 567890', whatsapp: '07700 900000', email: 'info@test.com' },
    urls: { venue: 'https://https://venue.com', organiser: '', scoreboard: 'https://scores.com' },
    socials: { facebook: 'https://facebook.com/test', twitter: '', instagram: '' },
  },
  format: {
    rules: 'Blackball',
    type: 'Double Elimination',
    raceToWin: 3,
    entryFee: '£15',
    handicap: null,
    maxPlayers: 24,
  },
  dates: [],
}

const mockHandicapped: Tournament = {
  slug: 'handicap-series',
  completed: false,
  meta: { name: 'Handicap Series', venue: 'Venue', organiser: 'Org', logo: '' },
  format: { rules: 'Blackball', handicap: true },
  dates: [],
}

const mockCompleted: Tournament = {
  slug: 'completed-series',
  completed: true,
  meta: { name: 'Completed Series', venue: 'Venue', organiser: 'Org', logo: '' },
  dates: [{ name: 'Event 1', date: '2026-09-01', completed: false }],
}

vi.mock('../../composables/useTournament', () => ({
  useTournament: vi.fn((slug: string) => {
    if (slug === 'test-series') return mockTournament
    if (slug === 'no-logo-series') return mockTournamentNoLogo
    if (slug === 'full-series') return mockFull
    if (slug === 'handicap-series') return mockHandicapped
    if (slug === 'completed-series') return mockCompleted
    return undefined
  }),
}))

import TournamentDetailPage from '../../pages/TournamentDetailPage.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

const mountDetail = (slug: string) =>
  mount(TournamentDetailPage, { props: { slug }, global: { plugins: [router] } })

describe('TournamentDetailPage', () => {
  beforeEach(async () => {
    await router.push('/tournaments/test-series')
    await router.isReady()
  })

  it('renders a back breadcrumb link to /tournaments', () => {
    const wrapper = mountDetail('test-series')
    const back = wrapper.find('nav[aria-label="Breadcrumb"] a[href="/tournaments"]')
    expect(back.exists()).toBe(true)
    expect(back.text()).toContain('All tournaments')
  })

  it('renders the tournament name for a known slug', () => {
    const wrapper = mountDetail('test-series')
    expect(wrapper.text()).toContain('Test Series')
  })

  it('renders the venue', () => {
    const wrapper = mountDetail('test-series')
    expect(wrapper.text()).toContain('Test Venue')
  })

  it('renders the organiser', () => {
    const wrapper = mountDetail('test-series')
    expect(wrapper.text()).toContain('Test Org')
  })

  it('shows a recoverable "not found" state for an unknown slug', () => {
    const wrapper = mountDetail('unknown')
    expect(wrapper.text().toLowerCase()).toContain('not found')
    expect(wrapper.find('a[href="/tournaments"]').exists()).toBe(true)
  })

  it('renders the logo when the tournament has one', () => {
    const wrapper = mountDetail('test-series')
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test Series')
  })

  it('renders no logo when the tournament has none', () => {
    const wrapper = mountDetail('no-logo-series')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  describe('completed badge', () => {
    it('shows "Completed" and suppresses Next badge when tournament.completed is true', () => {
      const wrapper = mountDetail('completed-series')
      expect(wrapper.text()).toContain('Completed')
      expect(wrapper.text()).not.toContain('Next')
    })

    it('does not show "Completed" for a normal tournament', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.text()).not.toContain('Completed')
    })
  })

  describe('address and directions', () => {
    it('shows the address linked to Google Maps when meta.address is set', () => {
      const wrapper = mountDetail('full-series')
      expect(wrapper.text()).toContain('123 Main St, Town, FY1 1AA')
      expect(wrapper.find('a[href^="https://www.google.com/maps/search/"]').exists()).toBe(true)
    })

    it('does not show an address when meta.address is absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.text()).not.toContain('Main St')
    })
  })

  describe('venue and organiser links', () => {
    it('sanitizes duplicated protocol and shows a website link when meta.urls.venue is set', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="https://venue.com"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('venue.com')
      expect(link.text()).not.toContain('https://')
    })

    it('keeps venue website hidden when meta.urls.venue is absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.find('a[href*="venue.com"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('Test Venue')
    })

    it('keeps organiser as plain text when meta.urls.organiser is empty', () => {
      const wrapper = mountDetail('full-series')
      const links = wrapper.findAll('a')
      expect(links.some(l => l.text() === 'The Org')).toBe(false)
      expect(wrapper.text()).toContain('The Org')
    })
  })

  describe('contact details', () => {
    it('shows phone number as a tel: link', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="tel:01234567890"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('01234 567890')
    })

    it('shows WhatsApp as a clickable wa.me link', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="https://wa.me/447700900000"]')
      expect(link.exists()).toBe(true)
    })

    it('shows email as a mailto: link', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="mailto:info@test.com"]')
      expect(link.exists()).toBe(true)
    })

    it('does not show contact links when meta.contact is absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false)
      expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
    })
  })

  describe('scoreboard link', () => {
    it('shows a scoreboard link when meta.urls.scoreboard is set', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="https://scores.com"]')
      expect(link.exists()).toBe(true)
      expect(link.text().toLowerCase()).toContain('scoreboard')
    })

    it('does not show a scoreboard link when absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.text().toLowerCase()).not.toContain('scoreboard')
    })
  })

  describe('social icons', () => {
    it('renders a Facebook link when meta.socials.facebook is set', () => {
      const wrapper = mountDetail('full-series')
      const link = wrapper.find('a[href="https://facebook.com/test"]')
      expect(link.exists()).toBe(true)
    })

    it('does not render social links for empty social values', () => {
      const wrapper = mountDetail('full-series')
      const links = wrapper.findAll('a')
      expect(links.some(l => l.attributes('href') === '')).toBe(false)
    })

    it('does not render any social links when meta.socials is absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.find('a[href*="facebook"]').exists()).toBe(false)
    })
  })

  describe('format section', () => {
    it('shows format fields when tournament.format is present', () => {
      const wrapper = mountDetail('full-series')
      expect(wrapper.text()).toContain('Blackball')
      expect(wrapper.text()).toContain('Double Elimination')
      expect(wrapper.text()).toContain('3 frames')
      expect(wrapper.text()).toContain('£15')
      expect(wrapper.text()).toContain('24')
    })

    it('formats boolean handicap as readable text rather than raw "true"', () => {
      const wrapper = mountDetail('handicap-series')
      expect(wrapper.text()).toContain('Yes (handicapped)')
      expect(wrapper.text()).not.toContain('true')
    })

    it('does not show null format fields', () => {
      const wrapper = mountDetail('full-series')
      expect(wrapper.text().toLowerCase()).not.toContain('handicap')
    })

    it('does not show the format section when tournament.format is absent', () => {
      const wrapper = mountDetail('test-series')
      expect(wrapper.text()).not.toContain('Blackball')
      expect(wrapper.text().toLowerCase()).not.toContain('rules')
    })
  })
})
