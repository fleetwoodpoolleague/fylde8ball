import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

function jsonSlugs(relativeDir: string): string[] {
  const dir = fileURLToPath(new URL(relativeDir, import.meta.url))
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
}

const tournamentSlugs = jsonSlugs('./src/data/tournaments')
const venueSlugs = jsonSlugs('./src/data/venues')

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions: {
    includedRoutes(paths) {
      return paths.flatMap(path => {
        if (path === '/tournaments/:slug') {
          return tournamentSlugs.map(s => `/tournaments/${s}`)
        }
        if (path === '/venues/:slug') {
          return venueSlugs.map(s => `/venues/${s}`)
        }
        if (path.includes(':pathMatch')) {
          return ['/404']
        }
        return [path]
      })
    },
  } satisfies Partial<ViteSSGOptions>,
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
