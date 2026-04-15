export interface TournamentMeta {
  name: string
  venue: string
  organiser: string
  logo: string
  address?: string
  contact?: {
    phone?: string
    whatsapp?: string
    email?: string
  }
  urls?: {
    venue?: string
    organiser?: string
    scoreboard?: string
  }
  socials?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
}

export interface TournamentDate {
  name: string
  /** ISO 8601 date string, e.g. "2026-04-18" */
  date: string
  /** Optional start time. May be 4-digit military ("1900") or 12h ("8pm"). */
  time?: string
  completed: boolean
}

export interface TournamentFormat {
  rules?: string | null
  type?: string | null
  raceToWin?: number | null
  entryFee?: string | null
  handicap?: string | null
  maxPlayers?: number | null
}

export interface Tournament {
  /** When true, the tournament is finished and should be hidden from the homepage. */
  completed?: boolean
  meta: TournamentMeta
  format?: TournamentFormat
  dates: TournamentDate[]
  slug: string
}

export interface UpcomingEventInfo {
  event: TournamentDate
  tournamentName: string
  tournamentSlug: string
  logo: string
}
