<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useTournament } from '../composables/useTournament'
import { findVenueByName } from '../composables/useVenues'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { resolveCueScoreRankingId } from '../utils/cuescore'
import { logoSrc } from '../utils/assets'
import EventTimeline from '../components/EventTimeline.vue'
import CueScoreRankingsCard from '../components/CueScoreRankingsCard.vue'
import CalendarSubscribeMenu from '../components/CalendarSubscribeMenu.vue'
import ShareButton from '../components/ShareButton.vue'
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

const now = ref(new Date())
onMounted(() => {
  now.value = new Date()
})

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

function formatLocalAddress(address: string): string {
  return address.replace(/,\s*United Kingdom,?/i, ',').replace(/,\s*,/g, ',').trim()
}

function formatHandicap(val: unknown): string {
  if (val === true) return 'Yes (handicapped)'
  if (val === false) return 'No (scratch)'
  return String(val)
}

function toIsoTime(raw: string): string {
  const clean = raw.trim()
  if (/^\d{4}$/.test(clean)) return `T${clean.slice(0, 2)}:${clean.slice(2, 4)}:00`
  const match = clean.match(/^(1[0-2]|[1-9])(?::(\d{2}))?\s*(am|pm)$/i)
  if (!match) return ''
  let hours = parseInt(match[1], 10)
  const minutes = match[2] ? parseInt(match[2], 10) : 0
  const period = match[3].toLowerCase()
  if (period === 'pm' && hours !== 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return ''
  return `T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
}

const venueUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.venue))
const organiserUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.organiser))
const scoreboardUrl = computed(() => sanitizeUrl(tournament?.meta.urls?.scoreboard))
const cuescoreRankingId = computed(() => resolveCueScoreRankingId(tournament?.meta))
const matchedVenue = computed(() => findVenueByName(tournament?.meta.venue))
const shareUrl = computed(() => `${BASE_URL}/tournaments/${props.slug}`)

const hasEntryActions = computed(() =>
  Boolean(
    tournament &&
    (hasValue(tournament.meta.contact?.whatsapp) ||
      hasValue(tournament.meta.socials?.facebook) ||
      hasValue(tournament.meta.contact?.phone) ||
      hasValue(tournament.meta.contact?.email)),
  ),
)

const hasCalendarEvents = computed(() =>
  Boolean(
    tournament &&
    !tournament.completed &&
    tournament.dates.some(d => !d.completed && d.date !== 'TBC'),
  ),
)

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

        <!-- Venue / organiser with 44px-safe touch spacing -->
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted mt-1">
          <RouterLink
            v-if="matchedVenue"
            :to="`/venues/${matchedVenue.slug}`"
            class="inline-flex items-center min-h-[44px] -my-2 px-1 font-medium text-ink underline underline-offset-2 hover:text-accent"
          >{{ tournament.meta.venue }}</RouterLink>
          <span v-else class="font-medium text-ink">{{ tournament.meta.venue }}</span>
          <span aria-hidden="true">·</span>
          <span>
            Organised by
            <a
              v-if="organiserUrl"
              :href="organiserUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center min-h-[44px] -my-2 px-1 text-ink underline underline-offset-2 hover:text-accent"
            >{{ tournament.meta.organiser }}</a>
            <template v-else>{{ tournament.meta.organiser }}</template>
          </span>
        </div>

        <!-- Local address -->
        <p v-if="hasValue(tournament.meta.address)" class="text-sm text-muted mt-1">
          {{ formatLocalAddress(tournament.meta.address!) }}
        </p>

        <!-- Band 1: Primary Entry Conversion Card -->
        <div
          v-if="!tournament.completed && (hasEntryActions || hasValue(tournament.format?.entryMethod))"
          class="mt-5 rounded-xl border border-line bg-raised p-4 shadow-xs"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted">
              How to Enter
            </h2>
            <div class="flex items-center gap-2 text-xs">
              <span v-if="hasValue(tournament.format?.entryFee)" class="font-semibold text-ink">
                Entry {{ tournament.format!.entryFee }}
              </span>
              <span v-if="hasValue(tournament.format?.maxPlayers)" class="text-muted">
                <template v-if="hasValue(tournament.format?.entryFee)">· </template>Max {{ tournament.format!.maxPlayers }} players
              </span>
            </div>
          </div>

          <div v-if="hasEntryActions" class="flex flex-wrap items-center gap-2">
            <a
              v-if="hasValue(tournament.meta.contact?.whatsapp)"
              :href="whatsappHref(tournament.meta.contact!.whatsapp!)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-accent text-accent-ink text-sm font-semibold hover:brightness-110 transition"
            >
              Message on WhatsApp
            </a>

            <a
              v-if="hasValue(tournament.meta.socials?.facebook)"
              :href="tournament.meta.socials!.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg text-sm font-semibold transition"
              :class="
                hasValue(tournament.meta.contact?.whatsapp)
                  ? 'border border-line bg-surface text-ink hover:border-accent hover:text-accent'
                  : 'bg-accent text-accent-ink hover:brightness-110'
              "
            >
              <FacebookIcon size="1.15rem" />
              Message on Facebook
            </a>

            <a
              v-if="hasValue(tournament.meta.contact?.phone)"
              :href="telHref(tournament.meta.contact!.phone!)"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-surface text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              <PhoneIcon size="1em" />
              Call {{ tournament.meta.contact!.phone }}
            </a>

            <a
              v-if="hasValue(tournament.meta.contact?.email)"
              :href="`mailto:${tournament.meta.contact!.email}`"
              class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-surface text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
            >
              <MailIcon size="1em" />
              Email organiser
            </a>
          </div>

          <p class="mt-2.5 text-xs text-muted">
            {{ tournament.format?.entryMethod || 'Contact the organiser directly to check spaces and get your name down.' }}
          </p>
        </div>

        <!-- Band 2: Calendar Sync, Scoreboard & Venue Utilities -->
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <CalendarSubscribeMenu
            v-if="hasCalendarEvents"
            :ics-path="`/ics/${tournament.slug}.ics`"
            :download-name="`${tournament.slug}.ics`"
            label="Sync series dates"
            scope-hint="Subscribes only to upcoming dates in this series."
            align="left"
          />
          <span
            v-else-if="!tournament.completed && tournament.dates.length"
            class="inline-flex items-center min-h-[44px] px-3.5 rounded-lg border border-dashed border-line text-xs text-muted"
          >
            Dates TBC — calendar sync unavailable
          </span>

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
            :href="mapsHref(tournament.meta.venue, tournament.meta.address)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            Directions ↗
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

          <!-- Keep Facebook accessible on completed tournaments where the entry card is hidden -->
          <a
            v-if="tournament.completed && hasValue(tournament.meta.socials?.facebook)"
            :href="tournament.meta.socials!.facebook"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            <FacebookIcon size="1.15rem" />
            Facebook
          </a>

          <ShareButton
            :title="tournament.meta.name"
            :text="`${tournament.meta.name} at ${tournament.meta.venue}`"
            :url="shareUrl"
          />

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
          <div v-if="hasValue(tournament.format.prizeFund)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Prize fund</dt>
            <dd class="text-ink font-medium">{{ tournament.format.prizeFund }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.tableType)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Tables</dt>
            <dd class="text-ink font-medium">{{ tournament.format.tableType }}</dd>
          </div>
          <div v-if="hasValue(tournament.format.entryMethod)" class="flex gap-2">
            <dt class="text-muted w-24 shrink-0">Entry</dt>
            <dd class="text-ink font-medium">{{ tournament.format.entryMethod }}</dd>
          </div>
        </dl>
      </section>

      <CueScoreRankingsCard
        v-if="cuescoreRankingId"
        :slug="tournament.slug"
        :ranking-id="cuescoreRankingId"
        :fallback-url="scoreboardUrl"
      />

      <EventTimeline
        :dates="tournament.dates"
        :tournament-completed="tournament.completed"
        :now="now"
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
