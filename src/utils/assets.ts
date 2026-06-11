/**
 * Resolve a tournament logo filename (from `meta.logo`) to a bundled asset
 * URL. The static `../assets/img/` prefix is required — Vite globs assets at
 * build time based on it, so don't refactor it into a variable.
 */
export function logoSrc(logo: string | undefined): string | null {
  return logo ? new URL(`../assets/img/${logo}`, import.meta.url).href : null
}
