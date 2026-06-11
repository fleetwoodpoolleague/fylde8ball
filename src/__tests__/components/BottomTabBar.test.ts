import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import BottomTabBar from '../../components/BottomTabBar.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/tournaments', component: { template: '<div />' } },
    { path: '/tournaments/:slug', component: { template: '<div />' } },
    { path: '/leagues', component: { template: '<div />' } },
    { path: '/about', component: { template: '<div />' } },
  ],
})

async function mountAt(path: string) {
  await router.push(path)
  await router.isReady()
  return mount(BottomTabBar, { global: { plugins: [router] } })
}

describe('BottomTabBar', () => {
  it('renders a primary navigation landmark', async () => {
    const wrapper = await mountAt('/')
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Primary')
  })

  it('renders all four tabs with labels and icons', async () => {
    const wrapper = await mountAt('/')
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(4)
    const hrefs = links.map(l => l.attributes('href'))
    expect(hrefs).toEqual(['/', '/tournaments', '/leagues', '/about'])
    const labels = links.map(l => l.text())
    expect(labels).toEqual(['Home', 'Tournaments', 'Leagues', 'About'])
    for (const link of links) {
      expect(link.find('svg').exists()).toBe(true)
    }
  })

  it('marks the exact-active tab with aria-current="page"', async () => {
    const wrapper = await mountAt('/tournaments')
    const current = wrapper.findAll('a').filter(l => l.attributes('aria-current') === 'page')
    expect(current).toHaveLength(1)
    expect(current[0].attributes('href')).toBe('/tournaments')
  })

  it('highlights the Tournaments tab on a tournament detail page without aria-current', async () => {
    const wrapper = await mountAt('/tournaments/some-comp')
    const tournaments = wrapper.findAll('a').find(l => l.attributes('href') === '/tournaments')!
    expect(tournaments.classes()).toContain('text-accent')
    expect(tournaments.attributes('aria-current')).toBeUndefined()
  })

  it('does not highlight the Home tab on other routes', async () => {
    const wrapper = await mountAt('/about')
    const home = wrapper.findAll('a').find(l => l.attributes('href') === '/')!
    expect(home.classes()).not.toContain('text-accent')
  })
})
