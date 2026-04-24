import { vi } from 'vitest'

const useHead = vi.fn()
vi.mock('@unhead/vue', () => ({
  useHead: (...args: unknown[]) => useHead(...args),
}))

import { useSeo, BASE_URL } from '../../composables/useSeo'

function findMeta(args: { meta?: Array<Record<string, string>> }, key: string, value: string) {
  return args.meta?.find(m => m[key] === value)
}

describe('useSeo', () => {
  beforeEach(() => useHead.mockClear())

  it('passes the title through to useHead', () => {
    useSeo({ title: 'Home | Fylde 8 Ball', description: 'desc', path: '/' })
    expect(useHead.mock.calls[0][0].title).toBe('Home | Fylde 8 Ball')
  })

  it('builds canonical URL by appending path to BASE_URL', () => {
    useSeo({ title: 't', description: 'd', path: '/about' })
    const [{ link }] = useHead.mock.calls[0]
    expect(link).toContainEqual({ rel: 'canonical', href: `${BASE_URL}/about` })
  })

  it('sets og:url to the same canonical URL', () => {
    useSeo({ title: 't', description: 'd', path: '/tournaments' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'property', 'og:url')).toEqual({
      property: 'og:url',
      content: `${BASE_URL}/tournaments`,
    })
  })

  it('sets description for both name=description and og:description', () => {
    useSeo({ title: 't', description: 'Local pool tournaments.', path: '/' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'name', 'description')?.content).toBe('Local pool tournaments.')
    expect(findMeta(head, 'property', 'og:description')?.content).toBe('Local pool tournaments.')
  })

  it('defaults og:image to /favicon.svg when no image is provided', () => {
    useSeo({ title: 't', description: 'd', path: '/' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'property', 'og:image')?.content).toBe(`${BASE_URL}/favicon.svg`)
  })

  it('uses the provided image when one is passed', () => {
    useSeo({ title: 't', description: 'd', path: '/', image: 'https://example.com/card.png' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'property', 'og:image')?.content).toBe('https://example.com/card.png')
  })

  it('populates Twitter card meta tags', () => {
    useSeo({ title: 'Home', description: 'desc', path: '/' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'name', 'twitter:card')?.content).toBe('summary')
    expect(findMeta(head, 'name', 'twitter:title')?.content).toBe('Home')
    expect(findMeta(head, 'name', 'twitter:description')?.content).toBe('desc')
  })

  it('marks og:type as website', () => {
    useSeo({ title: 't', description: 'd', path: '/' })
    const [head] = useHead.mock.calls[0]
    expect(findMeta(head, 'property', 'og:type')?.content).toBe('website')
  })
})
