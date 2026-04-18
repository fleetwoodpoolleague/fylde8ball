# 🎱 Fylde 8 Ball

The central hub for pool tournaments and leagues on the Fylde Coast.

Fylde 8 Ball is a web application for the local pool community in Lancashire, England. It surfaces upcoming tournaments, event schedules, venue information, and contact details — all in one place — for players, spectators, and organisers across the Fylde Coast.

## Features

- **Next event spotlight** — the immediately upcoming tournament is shown prominently on the homepage
- **Upcoming events list** — a rolling 3-month view of scheduled events, with completed tournaments automatically hidden
- **Tournament detail pages** — per-tournament pages showing:
  - Venue name, address, and organiser
  - Contact details (phone, email, WhatsApp)
  - Social media links (Facebook, Twitter, Instagram)
  - Venue and organiser website links
  - Competition format (ruleset, type, race-to, entry fee, handicap, maximum players)
  - Full event timeline with dates and times
  - "Today" indicator for current-day events
  - TBC handling for unconfirmed dates
- **Completed status** — tournaments and individual events are marked when finished

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 |
| Language | TypeScript |
| Build tool | Vite |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS 4 |
| Testing | Vitest + Vue Test Utils |

## Project Structure

```
src/
├── pages/               # Route-level Vue components
│   ├── HomePage.vue
│   ├── TournamentsPage.vue
│   ├── TournamentDetailPage.vue
│   ├── LeaguesPage.vue
│   └── AboutPage.vue
├── components/          # Reusable UI components
│   ├── AppNav.vue
│   ├── AppFooter.vue
│   ├── NextEventCard.vue
│   ├── UpcomingEventsList.vue
│   ├── EventTimeline.vue
│   ├── EventTimelineItem.vue
│   ├── EightBallIcon.vue
│   └── icons/           # SVG icon components
├── composables/         # Vue composition functions
│   ├── useTournaments.ts   # Loads all tournament JSON files
│   └── useTournament.ts    # Finds a single tournament by slug
├── types/
│   └── tournament.ts    # TypeScript interfaces for tournament data
├── utils/
│   ├── tournament.ts    # getNextEvent(), isWithinMonths()
│   └── format.ts        # Date/time formatting helpers
└── data/
    └── tournaments/     # One JSON file per tournament
```

## Getting Started

**Prerequisites:** Node.js (LTS recommended) and npm.

```bash
git clone https://github.com/fleetwoodpoolleague/fylde8ball.git
cd fylde8ball
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest test suite |

## Adding Tournament Data

Each tournament is a JSON file in `src/data/tournaments/`. The file name becomes part of the URL slug. Create a new file following this structure:

```json
{
  "completed": false,
  "meta": {
    "name": "Tournament Name 2026",
    "venue": "Venue Name",
    "organiser": "Organiser Name",
    "logo": "logo_filename.jpg",
    "address": "Street, Town, Postcode",
    "contact": {
      "phone": "01234 567890",
      "whatsapp": "",
      "email": "contact@example.com"
    },
    "urls": {
      "venue": "https://example.com",
      "organiser": "",
      "scoreboard": ""
    },
    "socials": {
      "facebook": "https://facebook.com/...",
      "twitter": "",
      "instagram": ""
    }
  },
  "format": {
    "rules": "Blackball",
    "type": "Round Robin + KO Final",
    "raceToWin": 5,
    "entryFee": "£20",
    "handicap": null,
    "maxPlayers": 32
  },
  "dates": [
    { "name": "Round 1", "date": "2026-06-01", "time": "1900", "completed": false }
  ]
}
```

**Notes:**
- `date` must be an ISO 8601 date string (`YYYY-MM-DD`)
- `time` accepts 24-hour military format (`"1900"`) or 12-hour format (`"8pm"`)
- Leave `time` as an empty string if the time is not yet known
- Logo images go in `src/assets/img/`
- Tournament files are auto-discovered via `import.meta.glob()` — no manual registration required

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Make your changes and run the tests (`npm run test`)
4. Open a pull request

Please keep tournament data accurate and up to date.
