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

  it('renders the site name', async () => {
    await router.isReady()
    const wrapper = mount(AppNav, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Fylde 8 Ball')
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
