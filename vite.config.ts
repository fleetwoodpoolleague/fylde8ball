import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import type { ViteSSGOptions } from 'vite-ssg'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  ssgOptions: {
    includedRoutes(paths) {
      const slugs = [
        '8-ball-pool-spring-series-2026',
        'ballers-blackpool-top-cat-2026',
        'ballers-misc-comps-2026',
        'challenger-pool-series-2026-27',
        'international-rules-pool-series-2026',
        'precision-cue-series-contenders-2026',
        'precision-cue-series-masters-2026',
      ]
      return paths.flatMap(path =>
        path === '/tournaments/:slug'
          ? slugs.map(s => `/tournaments/${s}`)
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
