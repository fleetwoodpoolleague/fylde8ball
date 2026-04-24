# CLAUDE.md

Guidance for working in this repo. See `README.md` for the user-facing overview.

## Project shape

Vue 3 + Vite + TypeScript static site (vite-ssg). Content is a set of JSON tournament files under `src/data/tournaments/`. Each JSON file's basename becomes its URL slug — tournaments are auto-discovered at runtime via `import.meta.glob('../data/tournaments/*.json', { eager: true })` in `src/composables/useTournaments.ts`. No manual registration is needed.

## Build pipeline

`npm run build` chains three steps:
1. `vue-tsc` — type-check
2. `node scripts/generate-ics.mjs` — emit `public/fylde8ball.ics` from the tournament JSON
3. `vite-ssg build` — static render

Because the ICS file is emitted into `public/` it is served from the site root at `/fylde8ball.ics`. The Google Calendar subscribe links in `UpcomingEventsList.vue` and `TournamentsPage.vue` point there.

**When adding a new tournament JSON** you must also add its slug to `vite.config.ts` under `ssgOptions.includedRoutes`. Otherwise the `/tournaments/:slug` static page for it will not be generated (the dynamic route only becomes a real file per slug that is enumerated there).

## Tournament JSON conventions

- `dates[].date` is ISO `YYYY-MM-DD` or the literal string `"TBC"` (no other sentinels). TBC dates are excluded from the 3-month "upcoming" window and sorted last when picking the global next event.
- `dates[].time` is optional; `"1900"` (24h, 4 digits) or `"8pm"`/`"8PM"` (12h). Normalise for display with `formatTime()` in `src/utils/format.ts`.
- `meta.logo` is a filename referenced against `src/assets/img/<filename>` via `new URL('../assets/img/...', import.meta.url)`.
- Empty string or missing optional fields (`meta.contact.email`, `meta.socials.twitter`, etc.) are both treated as "absent" by the `hasValue()` helper in `TournamentDetailPage.vue`.
- Setting `completed: true` at the tournament root hides it from the homepage hero card and upcoming list. Completing individual `dates[]` entries uses `completed: true` on the date itself.

## Testing

- `vitest` with `happy-dom`. Config is in `vite.config.ts` under `test:`. Globals are enabled — `describe`/`it`/`expect` are available without import.
- Shared setup at `src/__tests__/setup.ts` installs a no-op unhead injection under the key `"usehead"` — this matches `@unhead/vue` v2's Vue-inject key exactly. Any test mounting a component that calls `useHead()` transitively will fail at mount without this.
- Component tests use `@vue/test-utils` `mount()`. Router-dependent tests create a `createMemoryHistory()` router and pass it as a plugin.
- Tests that mock `useTournaments`/`useTournament` must place `vi.mock(...)` **before** importing the module under test, because `vi.mock` is hoisted but the import isn't.
- Date-sensitive code (`isToday`, `isWithinMonths`) should be tested with `vi.useFakeTimers()` + `vi.setSystemTime(...)`.

## ICS generation

The RFC 5545 helpers (`fold`, `esc`, `toIcsTime`, `toIcsDate`, `addFourHours`) are factored into `scripts/ics-utils.mjs` so they can be unit-tested from `src/__tests__/scripts/ics-utils.test.ts`. Keep them pure so the tests stay simple. `fold()` measures in **bytes**, not characters — necessary for correct line lengths with multi-byte UTF-8 content.

## SEO

Page-level meta tags go through `useSeo()` in `src/composables/useSeo.ts` — pass `title`, `description`, `path`. Structured data (JSON-LD) is added directly via `useHead({ script: [{ type: 'application/ld+json', innerHTML: ... }] })` in the page components. The canonical base URL is exported as `BASE_URL` from the same file.
