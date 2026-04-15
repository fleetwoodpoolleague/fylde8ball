<script setup lang="ts">
import { useTournament } from '../composables/useTournament'
import EventTimeline from '../components/EventTimeline.vue'
import FacebookIcon from '../components/icons/FacebookIcon.vue'
import TwitterIcon from '../components/icons/TwitterIcon.vue'
import InstagramIcon from '../components/icons/InstagramIcon.vue'

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
          <a
            v-if="hasValue(tournament.meta.urls?.venue)"
            :href="tournament.meta.urls!.venue"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-accent underline"
          >{{ tournament.meta.venue }}</a>
          <template v-else>{{ tournament.meta.venue }}</template>
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
            class="hover:text-accent"
          >{{ tournament.meta.contact.phone }}</a>
          <span v-if="hasValue(tournament.meta.contact.whatsapp)">WhatsApp: {{ tournament.meta.contact.whatsapp }}</span>
          <a
            v-if="hasValue(tournament.meta.contact.email)"
            :href="`mailto:${tournament.meta.contact.email}`"
            class="hover:text-accent"
          >{{ tournament.meta.contact.email }}</a>
        </div>

        <!-- Social icons + scoreboard link -->
        <div class="flex items-center gap-3 mt-2">
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
        <dl class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <template v-if="hasValue(tournament.format.rules)">
            <dt class="text-gray-500">Rules</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.rules }}</dd>
          </template>
          <template v-if="hasValue(tournament.format.type)">
            <dt class="text-gray-500">Type</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.type }}</dd>
          </template>
          <template v-if="hasValue(tournament.format.raceToWin)">
            <dt class="text-gray-500">Race to</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.raceToWin }}</dd>
          </template>
          <template v-if="hasValue(tournament.format.entryFee)">
            <dt class="text-gray-500">Entry fee</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.entryFee }}</dd>
          </template>
          <template v-if="hasValue(tournament.format.handicap)">
            <dt class="text-gray-500">Handicap</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.handicap }}</dd>
          </template>
          <template v-if="hasValue(tournament.format.maxPlayers)">
            <dt class="text-gray-500">Max players</dt>
            <dd class="text-gray-900 font-medium">{{ tournament.format.maxPlayers }}</dd>
          </template>
        </dl>
      </div>

      <EventTimeline :dates="tournament.dates" />
    </template>
    <p v-else class="text-gray-500">Tournament not found.</p>
  </div>
</template>
