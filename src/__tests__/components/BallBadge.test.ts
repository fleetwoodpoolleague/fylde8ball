import { mount } from '@vue/test-utils'
import BallBadge from '../../components/BallBadge.vue'
import { ballForSlug } from '../../utils/ballColor'

describe('BallBadge', () => {
  it('is hidden from assistive tech (decorative)', () => {
    const wrapper = mount(BallBadge, { props: { slug: 'bapto' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('derives its colour from the slug', () => {
    const wrapper = mount(BallBadge, { props: { slug: 'bapto' } })
    expect(wrapper.attributes('style')).toContain(ballForSlug('bapto').color)
  })

  it('prefers an explicit color prop over the slug', () => {
    const wrapper = mount(BallBadge, { props: { slug: 'bapto', color: 'var(--accent)' } })
    expect(wrapper.attributes('style')).toContain('var(--accent)')
  })

  it('shows the ball number when numbered', () => {
    const wrapper = mount(BallBadge, { props: { slug: 'bapto', numbered: true } })
    const expected = ballForSlug('bapto').number
    expect(wrapper.find('.ball-number').text()).toBe(String(expected))
  })

  it('hides the number by default', () => {
    const wrapper = mount(BallBadge, { props: { slug: 'bapto' } })
    expect(wrapper.find('.ball-number').exists()).toBe(false)
  })

  it('applies the requested size', () => {
    const wrapper = mount(BallBadge, { props: { color: 'red', size: '12px' } })
    expect(wrapper.attributes('style')).toContain('width: 12px')
    expect(wrapper.attributes('style')).toContain('height: 12px')
  })
})
