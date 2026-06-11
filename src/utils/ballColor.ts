/**
 * Deterministic mapping from a tournament slug to one of the seven solid
 * pool-ball colours (balls 1–7), so each tournament keeps a stable accent
 * across the site. Colour values live in main.css as --color-ball-* tokens.
 */
export interface BallStyle {
  /** Solid ball number, 1–7 */
  number: number
  /** CSS colour value (a var() reference to the ball token) */
  color: string
}

export const SOLID_BALLS: readonly BallStyle[] = [
  { number: 1, color: 'var(--color-ball-yellow)' },
  { number: 2, color: 'var(--color-ball-blue)' },
  { number: 3, color: 'var(--color-ball-red)' },
  { number: 4, color: 'var(--color-ball-purple)' },
  { number: 5, color: 'var(--color-ball-orange)' },
  { number: 6, color: 'var(--color-ball-green)' },
  { number: 7, color: 'var(--color-ball-maroon)' },
]

export function ballForSlug(slug: string): BallStyle {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0
  }
  return SOLID_BALLS[Math.abs(hash) % SOLID_BALLS.length]
}
