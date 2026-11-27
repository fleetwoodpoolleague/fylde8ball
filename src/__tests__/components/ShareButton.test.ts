import { vi } from 'vitest'
import { mount } from '@vue/test-utils'

const renderShareCardBlob = vi.fn()
vi.mock('../../utils/shareCard', () => ({
  renderShareCardBlob: (...args: unknown[]) => renderShareCardBlob(...args),
}))

import ShareButton from '../../components/ShareButton.vue'

describe('ShareButton', () => {
  beforeEach(() => {
    renderShareCardBlob.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls navigator.share with link payload when no card is provided', async () => {
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

  it('shares the generated pool-table PNG card and link when file sharing is supported', async () => {
    const blob = new Blob(['png-bytes'], { type: 'image/png' })
    renderShareCardBlob.mockResolvedValue(blob)
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })

    const card = {
      eyebrow: 'Next Up',
      title: 'Premier Pool Series',
      venue: 'Ballers Blackpool',
      footerUrl: 'fylde8ball.co.uk/tournaments/premier',
    }
    const wrapper = mount(ShareButton, {
      props: {
        title: 'Premier Pool Series',
        text: 'Premier Pool Series at Ballers Blackpool',
        url: 'https://fylde8ball.co.uk/tournaments/premier',
        card,
        cardFilename: 'premier.png',
      },
    })
    await wrapper.find('button').trigger('click')
    await vi.waitFor(() => expect(share).toHaveBeenCalled())

    const payload = share.mock.calls[0][0]
    expect(payload.files).toHaveLength(1)
    expect(payload.files[0].name).toBe('premier.png')
    expect(payload.files[0].type).toBe('image/png')
    expect(payload.title).toBe('Premier Pool Series')
    expect(payload.text).toContain('https://fylde8ball.co.uk/tournaments/premier')
  })

  it('falls back to link-only navigator.share when file sharing is not supported', async () => {
    renderShareCardBlob.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(false)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })

    const wrapper = mount(ShareButton, {
      props: {
        title: 'Test Comp',
        text: 'At Test Venue',
        url: 'https://fylde8ball.co.uk/tournaments/test',
        card: { eyebrow: 'Next Up', title: 'Test Comp' },
      },
    })
    await wrapper.find('button').trigger('click')
    await vi.waitFor(() => expect(share).toHaveBeenCalled())

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
