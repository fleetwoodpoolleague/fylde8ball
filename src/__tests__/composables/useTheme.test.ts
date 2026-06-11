import { useTheme, THEME_STORAGE_KEY, THEME_META_COLORS } from '../../composables/useTheme'

function getMeta(): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  return meta
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    getMeta()
    const { setTheme } = useTheme()
    setTheme('light')
  })

  it('setTheme applies the theme to <html data-theme>', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('setTheme persists the choice to localStorage', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('setTheme updates the theme-color meta tag', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    expect(getMeta().content).toBe(THEME_META_COLORS.dark)
    setTheme('light')
    expect(getMeta().content).toBe(THEME_META_COLORS.light)
  })

  it('toggle flips between light and dark', () => {
    const { theme, toggle } = useTheme()
    expect(theme.value).toBe('light')
    toggle()
    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    toggle()
    expect(theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('shares state between callers (singleton)', () => {
    const a = useTheme()
    const b = useTheme()
    a.setTheme('dark')
    expect(b.theme.value).toBe('dark')
  })
})
