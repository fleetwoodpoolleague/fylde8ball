import { ref, type Ref } from 'vue'

export type Theme = 'light' | 'dark'

/**
 * Keep in sync with the inline anti-FOUC script in index.html, which
 * duplicates the storage key and meta colours by necessity (it must run
 * before any module code).
 */
export const THEME_STORAGE_KEY = 'f8b-theme'
export const THEME_META_COLORS: Record<Theme, string> = {
  light: '#f4f6f2',
  dark: '#111814',
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

// Shared singleton. Initialised from <html data-theme>, which the inline
// script in index.html sets before paint — never from localStorage directly,
// so the composable and the DOM cannot disagree.
const theme: Ref<Theme> = ref('light')

if (!import.meta.env.SSR) {
  const current = document.documentElement.dataset.theme
  if (isTheme(current)) theme.value = current
}

export function useTheme() {
  function setTheme(next: Theme): void {
    theme.value = next
    if (import.meta.env.SSR) return
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // localStorage unavailable (private browsing) — theme still applies for this page
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = THEME_META_COLORS[next]
  }

  function toggle(): void {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggle }
}
