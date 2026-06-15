/**
 * Resolve a tournament logo filename (from `meta.logo`) to a bundled asset
 * URL.
 *
 * Uses `import.meta.glob` with `query: '?url'` rather than
 * `new URL(..., import.meta.url)`: the latter is only rewritten to a hashed
 * asset URL by Vite when the path is a *static* string literal. With a runtime
 * filename it falls through to a plain runtime `new URL`, which during
 * vite-ssg prerendering resolves against a `file:///.../.vite-ssg-temp/...`
 * path and bakes that absolute filesystem URL into the HTML (browsers then
 * refuse to load it from an https page). The glob below is resolved at build
 * time for every file in `../assets/img/`, so lookups return correct web URLs
 * in all build modes.
 *
 * The static `../assets/img/` prefix is required — Vite globs assets at build
 * time based on it, so don't refactor it into a variable.
 */
const logoUrls = import.meta.glob('../assets/img/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export function logoSrc(logo: string | undefined): string | null {
  if (!logo) return null
  return logoUrls[`../assets/img/${logo}`] ?? null
}
