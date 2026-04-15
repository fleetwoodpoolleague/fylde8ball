import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Tournament } from '../../types/tournament'

const mockTournament: Tournament = {
  slug: 'test-series',
  meta: { name: 'Test Series', venue: 'Test Venue', organiser: 'Test Org', logo: 'qs_logo.jpg' },
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
    urls: { venue: 'https://venue.com', organiser: '', scoreboard: 'https://scores.com' },
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

const mockCompleted: Tournament = {
  slug: 'completed-series',
  completed: true,
  meta: { name: 'Completed Series', venue: 'Venue', organiser: 'Org', logo: '' },
  dates: [],
}

vi.mock('../../composables/useTournament', () => ({
  useTournament: vi.fn((slug: string) => {
    if (slug === 'test-series') return mockTournament
    if (slug === 'no-logo-series') return mockTournamentNoLogo
    if (slug === 'full-series') return mockFull
    if (slug === 'completed-series') return mockCompleted
    return undefined
  }),
}))

import TournamentDetailPage from '../../pages/TournamentDetailPage.vue'

describe('TournamentDetailPage', () => {
  it('renders the tournament name for a known slug', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Series')
  })

  it('renders the venue', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Venue')
  })

  it('renders the organiser', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    expect(wrapper.text()).toContain('Test Org')
  })

  it('shows "not found" for an unknown slug', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'unknown' } })
    expect(wrapper.text().toLowerCase()).toContain('not found')
  })

  it('renders the logo when the tournament has one', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test Series')
  })

  it('renders no logo when the tournament has none', () => {
    const wrapper = mount(TournamentDetailPage, { props: { slug: 'no-logo-series' } })
    expect(wrapper.find('img').exists()).toBe(false)
  })

  describe('completed badge', () => {
    it('shows "Completed" when tournament.completed is true', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'completed-series' } })
      expect(wrapper.text()).toContain('Completed')
    })

    it('does not show "Completed" for a normal tournament', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.text()).not.toContain('Completed')
    })
  })

  describe('address', () => {
    it('shows the address when meta.address is set', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      expect(wrapper.text()).toContain('123 Main St, Town, FY1 1AA')
    })

    it('does not show an address when meta.address is absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.text()).not.toContain('Main St')
    })
  })

  describe('venue and organiser links', () => {
    it('makes the venue a link when meta.urls.venue is set', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const link = wrapper.find('a[href="https://venue.com"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('The Venue')
    })

    it('keeps venue as plain text when meta.urls.venue is absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.find('a[href*="venue"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('Test Venue')
    })

    it('keeps organiser as plain text when meta.urls.organiser is empty', () => {
      // mockFull has urls.organiser === '' so organiser should not be a link
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const links = wrapper.findAll('a')
      expect(links.some(l => l.text() === 'The Org')).toBe(false)
      expect(wrapper.text()).toContain('The Org')
    })
  })

  describe('contact details', () => {
    it('shows phone number as a tel: link', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const link = wrapper.find('a[href="tel:01234567890"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('01234 567890')
    })

    it('shows email as a mailto: link', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const link = wrapper.find('a[href="mailto:info@test.com"]')
      expect(link.exists()).toBe(true)
    })

    it('does not show contact when meta.contact is absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false)
      expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
    })
  })

  describe('scoreboard link', () => {
    it('shows a scoreboard link when meta.urls.scoreboard is set', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const link = wrapper.find('a[href="https://scores.com"]')
      expect(link.exists()).toBe(true)
      expect(link.text().toLowerCase()).toContain('scoreboard')
    })

    it('does not show a scoreboard link when absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.text().toLowerCase()).not.toContain('scoreboard')
    })
  })

  describe('social icons', () => {
    it('renders a Facebook link when meta.socials.facebook is set', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const link = wrapper.find('a[href="https://facebook.com/test"]')
      expect(link.exists()).toBe(true)
    })

    it('does not render social links for empty social values', () => {
      // mockFull has twitter: '' and instagram: '' — neither should produce an <a> with href ''
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      const links = wrapper.findAll('a')
      expect(links.some(l => l.attributes('href') === '')).toBe(false)
    })

    it('does not render any social links when meta.socials is absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.find('a[href*="facebook"]').exists()).toBe(false)
    })
  })

  describe('format section', () => {
    it('shows format fields when tournament.format is present', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      expect(wrapper.text()).toContain('Blackball')
      expect(wrapper.text()).toContain('Double Elimination')
      expect(wrapper.text()).toContain('£15')
      expect(wrapper.text()).toContain('24')
    })

    it('does not show null format fields', () => {
      // mockFull has handicap: null — should not appear
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'full-series' } })
      expect(wrapper.text().toLowerCase()).not.toContain('handicap')
    })

    it('does not show the format section when tournament.format is absent', () => {
      const wrapper = mount(TournamentDetailPage, { props: { slug: 'test-series' } })
      expect(wrapper.text()).not.toContain('Blackball')
      expect(wrapper.text().toLowerCase()).not.toContain('rules')
    })
  })
})
