// @ts-expect-error - importing a plain .mjs utility module without a .d.ts
import { buildServiceWorkerSource, computeCacheVersionFromEntries, selectPrecacheUrls } from '../../../scripts/generate-sw.mjs'

describe('generate-sw', () => {
  const sampleFiles = [
    '404.html',
    'apple-touch-icon.png',
    'assets/app-abc123.css',
    'assets/app-abc123.js',
    'favicon.svg',
    'fylde8ball.ics',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'ics/series.ics',
    'index.html',
    'manifest.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'sw.js',
    'tournaments/open.html',
  ]

  describe('selectPrecacheUrls', () => {
    it('includes app shell, hashed assets, manifest, and icons', () => {
      const assets = selectPrecacheUrls(sampleFiles)

      expect(assets).toEqual([
        '/',
        '/apple-touch-icon.png',
        '/assets/app-abc123.css',
        '/assets/app-abc123.js',
        '/favicon.svg',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/index.html',
        '/manifest.webmanifest',
      ])
    })

    it('excludes 404, sw.js, sitemap, robots, calendar feeds, and subpage html', () => {
      const assets = selectPrecacheUrls(sampleFiles)

      expect(assets).not.toContain('/404.html')
      expect(assets).not.toContain('/sw.js')
      expect(assets).not.toContain('/sitemap.xml')
      expect(assets).not.toContain('/robots.txt')
      expect(assets).not.toContain('/fylde8ball.ics')
      expect(assets).not.toContain('/ics/series.ics')
      expect(assets).not.toContain('/tournaments/open.html')
    })
  })

  describe('computeCacheVersionFromEntries', () => {
    it('returns a deterministic 12-char hex hash that changes when asset contents change', () => {
      const v1 = computeCacheVersionFromEntries([
        ['/index.html', '<html>v1</html>'],
        ['/assets/app-abc123.js', 'console.log(1)'],
      ])
      const v2 = computeCacheVersionFromEntries([
        ['/assets/app-abc123.js', 'console.log(1)'],
        ['/index.html', '<html>v1</html>'],
      ])
      const v3 = computeCacheVersionFromEntries([
        ['/index.html', '<html>v1</html>'],
        ['/assets/app-abc123.js', 'console.log(2)'],
      ])

      expect(v1).toMatch(/^[0-9a-f]{12}$/)
      expect(v1).toBe(v2)
      expect(v3).not.toBe(v1)
    })
  })

  describe('buildServiceWorkerSource', () => {
    it('embeds cache name, precache list, and lifecycle/fetch handlers', () => {
      const source = buildServiceWorkerSource('fylde8ball-deadbeef1234', [
        '/',
        '/index.html',
        '/assets/app-abc123.js',
      ])

      expect(source).toContain('const CACHE_NAME = "fylde8ball-deadbeef1234"')
      expect(source).toContain('"/assets/app-abc123.js"')
      expect(source).toContain("self.addEventListener('install'")
      expect(source).toContain("self.addEventListener('activate'")
      expect(source).toContain("self.addEventListener('fetch'")
      expect(source).toContain('self.skipWaiting()')
      expect(source).toContain('self.clients.claim()')
    })
  })
})
