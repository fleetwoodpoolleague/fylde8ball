import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

// Tournament slugs are the JSON basenames — same convention the app uses at
// runtime (import.meta.glob in useTournaments), so every tournament gets a
// static page without manual registration.
const tournamentSlugs = readdirSync(
  fileURLToPath(new URL('./src/data/tournaments', import.meta.url)),
)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace(/\.json$/, ''))

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions: {
    includedRoutes(paths) {
      return paths.flatMap(path =>
        path === '/tournaments/:slug'
          ? tournamentSlugs.map(s => `/tournaments/${s}`)
          : [path],
      )
    },
  } satisfies Partial<ViteSSGOptions>,
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
