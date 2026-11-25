<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useTournament } from '../composables/useTournament'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { logoSrc } from '../utils/assets'
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
const logoUrl = computed(() => logoSrc(tournament?.meta.logo))

function hasValue(v: unknown): boolean {
  return v !== null && v !== undefined && v !== ''
}

function sanitizeUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null
  return url.trim().replace(/^(https?:\/\/)+/i, 'https://')
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '').replace(/^0/, '44')
  return `https://wa.me/${digits}`
}

function mapsHref(venue: string, address?: string | null): string {
  const query = [venue, address].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function formatHandicap(val: unknown): string {
  if (val === true) return 'Yes (handicapped)'
  if (val === false) return 'No (scratch)'
  return String(val)
}

function toIsoTime(raw: string): string {
  if (/^\d{4}$/.test(raw)) return `T${raw.slice(0, 2)}:${raw.slice(2, 4)}:00`
  return ''
}

const venueUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.venue))
const organiserUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.organiser))
const scoreboardUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.scoreboard))

const metaTitle = tournament
  ? `${tournament.meta.name} | Fylde 8 Ball`
  : 'Tournament not found | Fylde 8 Ball'

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

  const upcomingDates = tournament.completed
    ? []
    : dates.filter(d => !d.completed && d.date !== 'TBC')

  const sportsEvents = upcomingDates.map(d => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${meta.name} – ${d.name}`,
    startDate: `${d.date}${d.endDate ? '' : (d.time ? toIsoTime(d.time) : '')}`,
    ...(d.endDate ? { endDate: d.endDate } : {}),
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

  const cleanVenueUrl = sanitizeUrl(meta.urls?.venue)
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: meta.venue,
    address: venueAddress,
    ...(meta.contact?.phone ? { telephone: meta.contact.phone } : {}),
    ...(meta.contact?.email ? { email: meta.contact.email } : {}),
    ...(cleanVenueUrl ? { url: cleanVenueUrl } : {}),
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
  <div class="max-w-3xl mx-auto px-4 py-6 md:py-8">
    <!-- Visible back navigation -->
    <nav aria-label="Breadcrumb" class="mb-4">
      <RouterLink
        to="/tournaments"
        class="inline-flex items-center gap-1 min-h-[44px] -ml-2 px-2 rounded-lg text-sm font-medium text-muted hover:text-accent transition-colors"
      >
        <span aria-hidden="true">←</span> All tournaments
      </RouterLink>
    </nav>

    <template v-if="tournament">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex justify-between items-start gap-4">
          <div>
            <h1 class="font-display text-2xl md:text-3xl text-ink mb-1">
              {{ tournament.meta.name }}
            </h1>
            <span
              v-if="tournament.completed"
              class="inline-block text-xs font-semibold bg-sunken text-muted px-2.5 py-0.5 rounded-full mb-2"
            >
              Completed
            </span>
          </div>
          <img
            v-if="logoUrl"
            :src="logoUrl"
            :alt="tournament.meta.name"
            class="h-12 w-12 md:h-16 md:w-16 object-contain shrink-0 rounded-lg bg-white/90 p-1"
            decoding="async"
            width="64"
            height="64"
          />
        </div>

        <!-- Venue / organiser -->
        <p class="text-sm text-muted">
          {{ tournament.meta.venue }}
          · Organised by
          <a
            v-if="organiserUrl"
            :href="organiserUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ink underline hover:text-accent"
          >{{ tournament.meta.organiser }}</a>
          <template v-else>{{ tournament.meta.organiser }}</template>
        </p>

        <!-- Clickable address -> Google Maps -->
        <p v-if="hasValue(tournament.meta.address)" class="text-sm text-muted mt-1">
          <a
            :href="mapsHref(tournament.meta.venue, tournament.meta.address)"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-accent underline underline-offset-2"
          >
            {{ tournament.meta.address }}
          </a>
        </p>

        <!-- Entry & Venue Action Bar -->
        <div class="mt-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Entry &amp; Venue Info
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <a
              v-if="hasValue(tournament.meta.contact?.phone)"
              :href="telHref(tournament.meta.contact!.phone!)"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg bg-accent text-accent-ink text-sm font-semibold hover:brightness-110 transition"
            >
              <PhoneIcon size="1em" />
              {{ tournament.meta.contact!.phone }}
            </a>

            <a
              v-if="hasValue(tournament.meta.socials?.facebook)"
              :href="tournament.meta.socials!.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              <FacebookIcon size="1.15rem" />
              Facebook
            </a>

            <a
              v-if="hasValue(tournament.meta.contact?.whatsapp)"
              :href="whatsappHref(tournament.meta.contact!.whatsapp!)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              WhatsApp: {{ tournament.meta.contact!.whatsapp }}
            </a>

            <a
              :href="mapsHref(tournament.meta.venue, tournament.meta.address)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              Directions
            </a>

            <a
              v-if="venueUrl"
              :href="venueUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              <GlobeIcon size="1em" />
              {{ displayUrl(venueUrl) }}
            </a>

            <a
              v-if="hasValue(tournament.meta.contact?.email)"
              :href="`mailto:${tournament.meta.contact!.email}`"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              <MailIcon size="1em" />
              Email
            </a>

            <a
              v-if="scoreboardUrl"
              :href="scoreboardUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg bg-chalk-tint text-chalk text-sm font-semibold hover:brightness-95 transition"
            >
              Live scoreboard &rarr;
            </a>

            <a
              v-if="hasValue(tournament.meta.socials?.twitter)"
              :href="tournament.meta.socials!.twitter"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-muted hover:text-accent transition"
              aria-label="X (Twitter)"
            >
              <TwitterIcon size="1.25rem" />
            </a>

            <a
              v-if="hasValue(tournament.meta.socials?.instagram)"
              :href="tournament.meta.socials!.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-muted hover:text-accent transition"
              aria-label="Instagram"
            >
              <InstagramIcon size="1.25rem" />
            </a>
          </div>
          <p class="mt-2 text-xs text-muted">
            Contact the organiser directly to check availability and enter.
          </p>
        </div>
      </div>

      <!-- Format section -->
      <section
        v-if="tournament.format"
        aria-labelledby="format-heading"
        class="mb-6 p-4 bg-sunken texture-felt rounded-xl border border-line"
      >
        <h2 id="format-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Competition Format
        </h2>
        <dl class="space-y-1.5 text-sm sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1.5">
          <div v-if="hasValue(tournament.format.rules)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Rules</dt>
            <dd class="text-ink font-medium">{{ tournament.format.rules }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.type)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Format</dt>
            <dd class="text-ink font-medium">{{ tournament.format.type }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.raceToWin)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Race to</dt>
            <dd class="text-ink font-medium">{{ tournament.format.raceToWin }} frames</dd>
          </div>
          <div v-if="hasValue(tournament.format.entryFee)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Entry fee</dt>
            <dd class="text-ink font-medium">{{ tournament.format.entryFee }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.handicap)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Handicap</dt>
            <dd class="text-ink font-medium">{{ formatHandicap(tournament.format.handicap) }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.maxPlayers)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Max players</dt>
            <dd class="text-ink font-medium">{{ tournament.format.maxPlayers }}</dd>
          </div>
        </dl>
      </section>

      <EventTimeline
        :dates="tournament.dates"
        :tournament-completed="tournament.completed"
      />
    </template>

    <!-- Recoverable 404 state -->
    <div v-else class="rounded-xl border border-line bg-raised p-8 text-center">
      <h1 class="font-display text-2xl text-ink mb-2">Tournament not found</h1>
      <p class="text-sm text-muted mb-5">
        This competition may have been moved or removed.
      </p>
      <RouterLink
        to="/tournaments"
        class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
      >
        Browse all tournaments
      </RouterLink>
    </div>
  </div>
</template>
