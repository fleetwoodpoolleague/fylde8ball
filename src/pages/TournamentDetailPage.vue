<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useTournament } from '../composables/useTournament'
import { useSeo, BASE_URL } from '../composables/useSeo'
import EventTimeline from '../components/EventTimeline.vue'
import FacebookIcon from '../components/icons/FacebookIcon.vue'
import TwitterIcon from '../components/icons/TwitterIcon.vue'
import InstagramIcon from '../components/icons/InstagramIcon.vue'
import GlobeIcon from '../components/icons/GlobeIcon.vue'
import PhoneIcon from '../components/icons/PhoneIcon.vue'
import MailIcon from '../components/icons/MailIcon.vue'

const props = defineProps<{
  slug: string
}>()

const tournament = useTournament(props.slug)

function logoSrc(logo: string): string | null {
  return logo ? new URL(`../assets/img/${logo}`, import.meta.url).href : null
}

function hasValue(v: unknown): boolean {
  return v !== null && v !== undefined && v !== ''
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function toIsoTime(raw: string): string {
  if (/^\d{4}$/.test(raw)) return `T${raw.slice(0, 2)}:${raw.slice(2, 4)}:00`
  return ''
}

const metaTitle = tournament
  ? `${tournament.meta.name} | Fylde 8 Ball`
  : 'Fylde 8 Ball'

const metaDesc = (() => {
  if (!tournament) return 'Pool tournament on the Fylde Coast.'
  const { meta, format } = tournament
  const city = meta.address?.split(',').find(p => p.trim().match(/^[A-Za-z]/))?.trim() ?? meta.venue
  const parts = [`${meta.name} at ${meta.venue}, ${city}`]
  if (format?.type) parts.push(format.type)
  if (format?.rules) parts.push(`${format.rules} rules`)
  if (format?.entryFee) parts.push(`entry ${format.entryFee}`)
  return parts.join(' · ') + '.'
})()

useSeo({ title: metaTitle, description: metaDesc, path: `/tournaments/${props.slug}` })

if (tournament) {
  const { meta, format, dates } = tournament
  const canonicalUrl = `${BASE_URL}/tournaments/${props.slug}`

  const venueAddress = {
    '@type': 'PostalAddress',
    streetAddress: meta.address ?? meta.venue,
    addressLocality: 'Fylde Coast',
    addressRegion: 'Lancashire',
    addressCountry: 'GB',
  }

  const location = {
    '@type': 'SportsActivityLocation',
    name: meta.venue,
    address: venueAddress,
    ...(meta.contact?.phone ? { telephone: meta.contact.phone } : {}),
  }

  const upcomingDates = dates.filter(d => !d.completed && d.date !== 'TBC')

  const sportsEvents = upcomingDates.map(d => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${meta.name} – ${d.name}`,
    startDate: `${d.date}${d.time ? toIsoTime(d.time) : ''}`,
    location,
    organizer: { '@type': 'Organization', name: meta.organiser },
    sport: 'Pool',
    ...(format?.entryFee
      ? {
          offers: {
            '@type': 'Offer',
            price: format.entryFee.replace(/[^0-9.]/g, ''),
            priceCurrency: 'GBP',
          },
        }
      : {}),
  }))

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: meta.venue,
    address: venueAddress,
    ...(meta.contact?.phone ? { telephone: meta.contact.phone } : {}),
    ...(meta.contact?.email ? { email: meta.contact.email } : {}),
    ...(meta.urls?.venue ? { url: meta.urls.venue } : {}),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Tournaments', item: `${BASE_URL}/tournaments` },
      { '@type': 'ListItem', position: 3, name: meta.name, item: canonicalUrl },
    ],
  }

  useHead({
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumb) },
      { type: 'application/ld+json', innerHTML: JSON.stringify(localBusiness) },
      ...sportsEvents.map(e => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(e),
      })),
    ],
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <template v-if="tournament">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ tournament.meta.name }}</h1>
            <span
              v-if="tournament.completed"
              class="inline-block text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-2"
            >Completed</span>
          </div>
          <img
            v-if="logoSrc(tournament.meta.logo)"
            :src="logoSrc(tournament.meta.logo)!"
            :alt="tournament.meta.name"
            class="h-12 w-12 object-contain shrink-0 ml-4"
          />
        </div>

        <!-- Venue / organiser -->
        <p class="text-sm text-gray-500">
          {{ tournament.meta.venue }}
          · Organised by
          <a
            v-if="hasValue(tournament.meta.urls?.organiser)"
            :href="tournament.meta.urls!.organiser"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-accent underline"
          >{{ tournament.meta.organiser }}</a>
          <template v-else>{{ tournament.meta.organiser }}</template>
        </p>

        <!-- Address -->
        <p v-if="hasValue(tournament.meta.address)" class="text-sm text-gray-500 mt-1">
          {{ tournament.meta.address }}
        </p>

        <!-- Contact details -->
        <div v-if="tournament.meta.contact" class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
          <a
            v-if="hasValue(tournament.meta.contact.phone)"
            :href="telHref(tournament.meta.contact.phone!)"
            class="flex items-center gap-1 hover:text-accent"
          ><PhoneIcon size="0.9em" />{{ tournament.meta.contact.phone }}</a>
          <span v-if="hasValue(tournament.meta.contact.whatsapp)">WhatsApp: {{ tournament.meta.contact.whatsapp }}</span>
          <a
            v-if="hasValue(tournament.meta.contact.email)"
            :href="`mailto:${tournament.meta.contact.email}`"
            class="flex items-center gap-1 hover:text-accent"
          ><MailIcon size="0.9em" />{{ tournament.meta.contact.email }}</a>
        </div>

        <!-- Social icons + venue/scoreboard links -->
        <div class="flex items-center gap-3 mt-2">
          <a
            v-if="hasValue(tournament.meta.urls?.venue)"
            :href="tournament.meta.urls!.venue"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-sm text-accent hover:underline"
          ><GlobeIcon size="0.9em" />{{ displayUrl(tournament.meta.urls!.venue!) }}</a>
          <template v-if="tournament.meta.socials">
            <a
              v-if="hasValue(tournament.meta.socials.facebook)"
              :href="tournament.meta.socials.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-accent"
              aria-label="Facebook"
            >
              <FacebookIcon size="1.25rem" />
            </a>
            <a
              v-if="hasValue(tournament.meta.socials.twitter)"
              :href="tournament.meta.socials.twitter"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-accent"
              aria-label="X (Twitter)"
            >
              <TwitterIcon size="1.25rem" />
            </a>
            <a
              v-if="hasValue(tournament.meta.socials.instagram)"
              :href="tournament.meta.socials.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-accent"
              aria-label="Instagram"
            >
              <InstagramIcon size="1.25rem" />
            </a>
          </template>
          <a
            v-if="hasValue(tournament.meta.urls?.scoreboard)"
            :href="tournament.meta.urls!.scoreboard"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-accent hover:underline"
          >Scoreboard &rarr;</a>
        </div>
      </div>

      <!-- Format section -->
      <div v-if="tournament.format" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Competition Format</h2>
        <dl class="space-y-1 text-sm">
          <div v-if="hasValue(tournament.format.rules)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Rules</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.rules }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.type)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Type</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.type }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.raceToWin)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Race to</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.raceToWin }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.entryFee)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Entry fee</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.entryFee }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.handicap)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Handicap</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.handicap }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.maxPlayers)" class="flex gap-2">
            <dt class="text-gray-500 w-24 shrink-0">Max players</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.maxPlayers }}</dd>
          </div>
        </dl>
      </div>

      <EventTimeline :dates="tournament.dates" />
    </template>
    <p v-else class="text-gray-500">Tournament not found.</p>
  </div>
</template>
