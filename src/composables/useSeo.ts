import { useHead } from '@unhead/vue'

export const BASE_URL = 'https://fylde8ball.co.uk'

export interface SeoOptions {
  title: string
  description: string
  path: string
  image?: string
}

export function useSeo({ title, description, path, image }: SeoOptions) {
  const url = `${BASE_URL}${path}`
  const ogImage = image ?? `${BASE_URL}/og/default.png`
  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: title },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
  })
}
