import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppNav from '../../components/AppNav.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/leagues', component: { template: '<div />' } },
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
})
