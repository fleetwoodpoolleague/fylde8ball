import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShareButton from '../../components/ShareButton.vue'

describe('ShareButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    const wrapper = mount(ShareButton, {
      props: { title: 'Test Comp', text: 'At Test Venue', url: 'https://fylde8ball.co.uk/tournaments/test' },
    })
    await wrapper.find('button').trigger('click')

    expect(share).toHaveBeenCalledWith({
      title: 'Test Comp',
      text: 'At Test Venue',
      url: 'https://fylde8ball.co.uk/tournaments/test',
    })
  })

  it('falls back to clipboard copy and shows confirmation when navigator.share is absent', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const wrapper = mount(ShareButton, {
      props: { title: 'Test Comp', url: 'https://fylde8ball.co.uk/tournaments/test' },
    })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(writeText).toHaveBeenCalledWith('https://fylde8ball.co.uk/tournaments/test')
    expect(wrapper.text()).toContain('Link copied!')
  })
})
