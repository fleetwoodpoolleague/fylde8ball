import { vi } from 'vitest'
import { mount } from '@vue/test-utils'

async function mountWithBuildTime(value: string | undefined) {
  vi.resetModules()
  if (value === undefined) {
    vi.stubEnv('VITE_BUILD_TIME', '')
  } else {
    vi.stubEnv('VITE_BUILD_TIME', value)
  }
  const { default: AppFooter } = await import('../../components/AppFooter.vue')
  return mount(AppFooter)
}

describe('AppFooter', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('renders the copyright year and site name', async () => {
    const wrapper = await mountWithBuildTime('2026-04-20T12:00:00Z')
    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).toContain('Fylde')
  })

  it('renders the logo/name disclaimer', async () => {
    const wrapper = await mountWithBuildTime('2026-04-20T12:00:00Z')
    expect(wrapper.text()).toContain('Tournament logos and names are property of their respective companies and/or organisations')
  })

  it('shows "Development build" when VITE_BUILD_TIME is unset', async () => {
    const wrapper = await mountWithBuildTime(undefined)
    expect(wrapper.text()).toContain('Development build')
  })

  it('shows "Development build" when VITE_BUILD_TIME is not a valid date', async () => {
    const wrapper = await mountWithBuildTime('not-a-date')
    expect(wrapper.text()).toContain('Development build')
  })

  it('formats a valid VITE_BUILD_TIME as a human-readable date', async () => {
    const wrapper = await mountWithBuildTime('2026-04-20T12:00:00Z')
    // Format is en-GB: "20 Apr 2026" plus time — exact time depends on local TZ,
    // so only assert the stable date portion.
    expect(wrapper.text()).toContain('20 Apr 2026')
    expect(wrapper.text()).not.toContain('Development build')
  })
})
