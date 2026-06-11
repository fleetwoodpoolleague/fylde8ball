import { mount } from '@vue/test-utils'
import ThemeToggle from '../../components/ThemeToggle.vue'
import { useTheme } from '../../composables/useTheme'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useTheme().setTheme('light')
  })

  it('renders a button with an accessible label', () => {
    const wrapper = mount(ThemeToggle)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBe('Toggle colour theme')
  })

  it('renders both icons so SSG markup is theme-independent', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('.icon-sun').exists()).toBe(true)
    expect(wrapper.find('.icon-moon').exists()).toBe(true)
  })

  it('toggles the document theme on click', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.find('button').trigger('click')
    expect(document.documentElement.dataset.theme).toBe('dark')
    await wrapper.find('button').trigger('click')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
