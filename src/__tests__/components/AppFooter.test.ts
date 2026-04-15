import { mount } from '@vue/test-utils'
import AppFooter from '../../components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders the copyright year and site name', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).toContain('Fylde')
  })

  it('renders the logo/name disclaimer', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Tournament logos and names are property of their respective companies and/or organisations')
  })
})
