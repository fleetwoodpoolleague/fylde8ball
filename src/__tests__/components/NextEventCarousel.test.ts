import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NextEventCarousel, { type NextEventSlide } from '../../components/NextEventCarousel.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
  ],
})

const slideA: NextEventSlide = {
  event: { name: 'Event 5', date: '2026-11-28', time: '1300', completed: false },
  tournamentName: 'Precision Cue Series: Contenders Season 2',
  tournamentSlug: 'precision-contenders-2',
  venue: 'Ballers Blackpool',
  format: { rules: 'Blackball', entryFee: '£25' },
}

const slideB: NextEventSlide = {
  event: { name: 'Event 5', date: '2026-11-28', completed: false },
  tournamentName: 'Premier Pool Series 2026/27',
  tournamentSlug: 'premier-pool-series',
  venue: "Q's Sports Lounge",
  format: { rules: 'Blackball', entryFee: '£25' },
}

describe('NextEventCarousel', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    await router.push('/')
    await router.isReady()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a standalone NextEventCard without carousel chrome when given 1 item', () => {
    const wrapper = mount(NextEventCarousel, {
      props: { items: [slideA] },
      global: { plugins: [router] },
    })
    expect(wrapper.find('[aria-roledescription="carousel"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Precision Cue Series: Contenders Season 2')
  })

  it('cycles automatically between same-day competitions using the configured intervalMs', async () => {
    const wrapper = mount(NextEventCarousel, {
      props: { items: [slideA, slideB], intervalMs: 5000 },
      global: { plugins: [router] },
    })

    expect(wrapper.find('[aria-roledescription="carousel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('2 comps on the next matchday')
    expect(wrapper.text()).toContain('(1/2)')

    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('(2/2)')

    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('(1/2)')
  })

  it('defaults to a 9000ms auto-advance delay', async () => {
    const wrapper = mount(NextEventCarousel, {
      props: { items: [slideA, slideB] },
      global: { plugins: [router] },
    })

    vi.advanceTimersByTime(8900)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('(1/2)')

    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('(2/2)')
  })

  it('pauses auto-rotation on hover and switches via matchday pills or arrow keys', async () => {
    const wrapper = mount(NextEventCarousel, {
      props: { items: [slideA, slideB], intervalMs: 3000 },
      global: { plugins: [router] },
    })

    const region = wrapper.find('[aria-roledescription="carousel"]')
    await region.trigger('mouseenter')
    vi.advanceTimersByTime(9000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('(1/2)')

    const pills = wrapper.findAll('[aria-label="Choose matchday competition"] button')
    expect(pills).toHaveLength(2)
    await pills[1].trigger('click')
    expect(wrapper.text()).toContain('(2/2)')

    await region.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.text()).toContain('(1/2)')
  })
})
