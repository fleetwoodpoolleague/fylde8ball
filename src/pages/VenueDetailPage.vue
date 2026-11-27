<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { getVenueBySlug } from '../composables/useVenues'
import { useCueScoreVenue } from '../composables/useCueScoreVenue'
import { useTournaments } from '../composables/useTournaments'
import { useSeo, BASE_URL } from '../composables/useSeo'
import { resolveCueScoreVenueId } from '../utils/cuescore'
import { getNextEvent, isTournamentActive } from '../utils/tournament'
import { formatDate, formatDateRange, SHORT_DATE, isToday } from '../utils/format'
import { logoSrc } from '../utils/assets'
import BallBadge from '../components/BallBadge.vue'
import { ballForSlug } from '../utils/ballColor'
import PhoneIcon from '../components/icons/PhoneIcon.vue'
import MailIcon from '../components/icons/MailIcon.vue'
import GlobeIcon from '../components/icons/GlobeIcon.vue'
import FacebookIcon from '../components/icons/FacebookIcon.vue'
import type { TournamentDate } from '../types/tournament'

const props = defineProps<{
  slug: string
}>()

const venue = getVenueBySlug(props.slug)
const tournaments = useTournaments()
const { venueInfo: cuescoreVenue } = useCueScoreVenue(props.slug, resolveCueScoreVenueId(venue))

const now = ref(new Date())
onMounted(() => {
  now.value = new Date()
})

const logoUrl = computed(() => logoSrc(venue?.logo))

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}

function mapsHref(name: string, address?: string | null): string {
  const query = [name, address].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function formatNextDate(d: TournamentDate | undefined, today: Date): string {
  if (!d) return 'Completed'
  if (d.date === 'TBC') return 'Next: Date TBC'
  if (d.endDate) return `Next: ${formatDateRange(d.date, d.endDate, SHORT_DATE)}`
  return isToday(d.date, today) ? 'Next: Today' : `Next: ${formatDate(d.date, SHORT_DATE)}`
}

const hostedTournaments = computed(() => {
  if (!venue) return []
  return tournaments
    .filter(t => t.meta.venue.trim().toLowerCase() === venue.name.trim().toLowerCase())
    .map(t => {
      const active = isTournamentActive(t, now.value)
      const next = active ? getNextEvent(t.dates, now.value) : undefined
      return {
        ...t,
        active,
        nextDateLabel: formatNextDate(next, now.value),
        sortKey: next ? (next.date === 'TBC' ? '9999-12-31' : next.date) : '9999-99-99',
      }
    })
})

const activeTournaments = computed(() =>
  hostedTournaments.value.filter(t => t.active).sort((a, b) => a.sortKey.localeCompare(b.sortKey)),
)

const completedTournaments = computed(() =>
  hostedTournaments.value.filter(t => !t.active).sort((a, b) => a.meta.name.localeCompare(b.meta.name)),
)

useSeo({
  title: venue ? `${venue.name} | Venues | Fylde 8 Ball` : 'Venue not found | Fylde 8 Ball',
  description: venue
    ? `Pool tournaments and venue info for ${venue.name} in ${venue.town}.`
    : 'Pool venue on the Fylde Coast.',
  path: `/venues/${props.slug}`,
})

if (venue) {
  const canonicalUrl = `${BASE_URL}/venues/${venue.slug}`
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Venues', item: `${BASE_URL}/venues` },
            { '@type': 'ListItem', position: 3, name: venue.name, item: canonicalUrl },
          ],
        }),
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportsActivityLocation',
          name: venue.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: venue.address ?? venue.name,
            addressLocality: venue.town,
            addressRegion: 'Lancashire',
            addressCountry: 'GB',
          },
          ...(venue.contact?.phone ? { telephone: venue.contact.phone } : {}),
          ...(venue.contact?.email ? { email: venue.contact.email } : {}),
          ...(venue.website ? { url: venue.website } : {}),
        }),
      },
    ],
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-6 md:py-8">
    <nav aria-label="Breadcrumb" class="mb-4">
      <RouterLink
        to="/venues"
        class="inline-flex items-center gap-1 min-h-[44px] -ml-2 px-2 rounded-lg text-sm font-medium text-muted hover:text-accent transition-colors"
      >
        <span aria-hidden="true">←</span> All venues
      </RouterLink>
    </nav>

    <template v-if="venue">
      <div class="mb-8">
        <div class="flex justify-between items-start gap-4">
          <div>
            <h1 class="font-display text-2xl md:text-3xl text-ink mb-1">{{ venue.name }}</h1>
            <p class="text-sm text-muted">{{ venue.town }}</p>
          </div>
          <img
            v-if="logoUrl"
            :src="logoUrl"
            :alt="venue.name"
            class="h-12 w-12 md:h-16 md:w-16 object-contain shrink-0 rounded-lg bg-white/90 p-1"
            decoding="async"
            width="64"
            height="64"
          />
          <BallBadge v-else :slug="venue.slug" numbered size="3rem" />
        </div>

        <p v-if="venue.address" class="text-sm text-muted mt-2">
          {{ venue.address.replace(/,\s*United Kingdom,?/i, ',').trim() }}
        </p>

        <div class="flex flex-wrap gap-2 mt-4">
          <a
            v-if="venue.contact?.phone"
            :href="telHref(venue.contact.phone)"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg bg-accent text-accent-ink text-sm font-semibold hover:brightness-110 transition"
          >
            <PhoneIcon size="1em" />
            Call {{ venue.contact.phone }}
          </a>
          <a
            :href="mapsHref(venue.name, venue.address)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            Directions ↗
          </a>
          <a
            v-if="venue.socials?.facebook"
            :href="venue.socials.facebook"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            <FacebookIcon size="1.1rem" />
            Facebook
          </a>
          <a
            v-if="venue.website"
            :href="venue.website"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            <GlobeIcon size="1em" />
            {{ displayUrl(venue.website) }}
          </a>
          <a
            v-if="venue.contact?.email"
            :href="`mailto:${venue.contact.email}`"
            class="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg border border-line bg-raised text-sm font-medium text-ink hover:border-accent hover:text-accent transition"
          >
            <MailIcon size="1em" />
            Email
          </a>
        </div>
      </div>

      <!-- CueScore Tables & Equipment -->
      <section
        v-if="cuescoreVenue && cuescoreVenue.totalTables > 0"
        aria-labelledby="venue-tables-heading"
        class="mb-8 p-4 bg-sunken texture-felt rounded-xl border border-line"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 id="venue-tables-heading" class="text-xs font-semibold uppercase tracking-wider text-muted">
            Tables &amp; Equipment ({{ cuescoreVenue.totalTables }} {{ cuescoreVenue.totalTables === 1 ? 'table' : 'tables' }})
          </h2>
          <a
            v-if="cuescoreVenue.url"
            :href="cuescoreVenue.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center min-h-[44px] -my-2 px-1 text-xs font-medium text-accent hover:underline"
          >
            CueScore venue &rarr;
          </a>
        </div>
        <ul class="space-y-2 text-sm">
          <li
            v-for="(group, idx) in cuescoreVenue.tableGroups"
            :key="idx"
            class="flex flex-wrap items-center gap-2"
          >
            <span class="font-semibold text-ink">
              {{ group.count }} &times;
              <template v-if="group.size">{{ group.size }}ft </template>{{ [group.manufacturer, group.model].filter(Boolean).join(' ') || 'Pool table' }}
            </span>
            <span v-if="group.branch" class="rounded bg-raised border border-line px-2 py-0.5 text-xs text-muted">
              {{ group.branch }}
            </span>
            <span v-if="group.cloth" class="rounded bg-raised border border-line px-2 py-0.5 text-xs text-muted">
              {{ group.cloth }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Active competitions at this venue -->
      <section v-if="activeTournaments.length" aria-labelledby="venue-active-heading" class="mb-8">
        <h2 id="venue-active-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Upcoming &amp; Active Tournaments ({{ activeTournaments.length }})
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="t in activeTournaments"
            :key="t.slug"
            :to="`/tournaments/${t.slug}`"
            class="relative flex items-start justify-between gap-3 overflow-hidden rounded-xl border border-line bg-raised p-4 pl-5 shadow-sm transition hover:shadow-md"
          >
            <span
              class="absolute inset-y-0 left-0 w-1.5"
              :style="{ background: ballForSlug(t.slug).color }"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="font-semibold text-ink leading-snug">{{ t.meta.name }}</p>
              <p class="mt-1 text-xs font-medium text-accent">{{ t.nextDateLabel }}</p>
              <div class="mt-2 flex flex-wrap gap-1.5 text-xs text-muted">
                <span v-if="t.format?.rules" class="rounded bg-sunken px-2 py-0.5">{{ t.format.rules }}</span>
                <span v-if="t.format?.entryFee" class="rounded bg-sunken px-2 py-0.5 font-medium text-ink">
                  Entry {{ t.format.entryFee }}
                </span>
              </div>
            </div>
            <span class="text-accent text-sm shrink-0 self-center" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </section>

      <!-- Completed competitions at this venue -->
      <section v-if="completedTournaments.length" aria-labelledby="venue-past-heading">
        <h2 id="venue-past-heading" class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Past Tournaments ({{ completedTournaments.length }})
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="t in completedTournaments"
            :key="t.slug"
            :to="`/tournaments/${t.slug}`"
            class="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-line bg-raised/70 p-4 pl-5 opacity-80 transition hover:opacity-100"
          >
            <span class="absolute inset-y-0 left-0 w-1.5 bg-line" aria-hidden="true" />
            <p class="font-semibold text-ink leading-snug">{{ t.meta.name }}</p>
            <span class="shrink-0 rounded-full bg-sunken px-2.5 py-0.5 text-xs font-medium text-muted">
              Finished
            </span>
          </RouterLink>
        </div>
      </section>

      <p v-if="!activeTournaments.length && !completedTournaments.length" class="text-sm text-muted">
        No tournaments listed at this venue yet.
      </p>
    </template>

    <div v-else class="rounded-xl border border-line bg-raised p-8 text-center">
      <h1 class="font-display text-2xl text-ink mb-2">Venue not found</h1>
      <p class="text-sm text-muted mb-5">We couldn't find that venue in our directory.</p>
      <RouterLink
        to="/venues"
        class="inline-flex items-center justify-center min-h-[44px] rounded-full bg-accent text-accent-ink px-5 text-sm font-semibold hover:brightness-110 transition"
      >
        Browse all venues
      </RouterLink>
    </div>
  </div>
</template>
