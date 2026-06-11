import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppNav from '../../components/AppNav.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/leagues', component: { template: '<div />' } },
    { path: '/about', component: { template: '<div />' } },
  ],
})

describe('AppNav', () => {
  beforeEach(() => router.push('/'))

  it('renders the site name with an 8-ball icon', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    const link = wrapper.find('a[href="/"]')
    expect(link.text()).toContain('Fylde')
    expect(link.text()).toContain('Ball')
    expect(link.find('svg').exists()).toBe(true)
  })

  it('has a link to /tournaments', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    const links = wrapper.findAll('a')
    expect(links.some(l => l.attributes('href') === '/tournaments')).toBe(true)
  })

  it('has a link to /leagues', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    const links = wrapper.findAll('a')
    expect(links.some(l => l.attributes('href') === '/leagues')).toBe(true)
  })

  it('has a link to /about', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    const links = wrapper.findAll('a')
    expect(links.some(l => l.attributes('href') === '/about')).toBe(true)
  })

  it('marks the active link with aria-current="page"', async () => {
    await router.push('/tournaments')
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    const active = wrapper.findAll('a').filter(l => l.attributes('aria-current') === 'page')
    expect(active).toHaveLength(1)
    expect(active[0].attributes('href')).toBe('/tournaments')
  })

  it('includes the theme toggle', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    expect(wrapper.find('button[aria-label="Toggle colour theme"]').exists()).toBe(true)
  })
})
