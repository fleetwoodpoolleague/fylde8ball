import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const BASE_URL = 'https://fylde8ball.co.uk'

export function buildSitemapXml(entries) {
  const blocks = entries.map(({ path, changefreq, priority }) => [
    '  <url>',
    `    <loc>${BASE_URL}${path}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n'))

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    blocks.join('\n\n'),
    '',
    '</urlset>',
    '',
  ].join('\n')
}

function listSlugs(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
    .sort()
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const root = resolve(__dirname, '..')
  const tournamentSlugs = listSlugs(resolve(root, 'src/data/tournaments'))
  const venueSlugs = listSlugs(resolve(root, 'src/data/venues'))

  const entries = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/tournaments', changefreq: 'weekly', priority: '0.9' },
    ...tournamentSlugs.map(slug => ({
      path: `/tournaments/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...(venueSlugs.length
      ? [
          { path: '/venues', changefreq: 'monthly', priority: '0.8' },
          ...venueSlugs.map(slug => ({
            path: `/venues/${slug}`,
            changefreq: 'weekly',
            priority: '0.7',
          })),
        ]
      : []),
    { path: '/leagues', changefreq: 'monthly', priority: '0.5' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
  ]

  const xml = buildSitemapXml(entries)
  writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8')
  console.log(`Generated public/sitemap.xml — ${entries.length} URLs`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
}
