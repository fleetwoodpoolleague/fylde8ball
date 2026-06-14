/**
 * Resolve a tournament logo filename (from `meta.logo`) to a bundled asset
 * URL. The static `../assets/img/` prefix is required — Vite globs assets at
 * build time based on it, so don't refactor it into a variable.
 */
const logoCache = new Map<string, string>()

export function logoSrc(logo: string | undefined): string | null {
  if (!logo) return null
  const cached = logoCache.get(logo)
  if (cached) return cached
  const href = new URL(`../assets/img/${logo}`, import.meta.url).href
  logoCache.set(logo, href)
  return href
}
