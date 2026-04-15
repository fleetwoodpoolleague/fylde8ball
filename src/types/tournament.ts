export interface TournamentMeta {
  name: string
  venue: string
  organiser: string
  logo: string
}

export interface TournamentDate {
  name: string
  /** ISO 8601 date string, e.g. "2026-04-18" */
  date: string
  /** Optional start time. May be 4-digit military ("1900") or 12h ("8pm"). */
  time?: string
  completed: boolean
}

export interface Tournament {
  meta: TournamentMeta
  dates: TournamentDate[]
  slug: string
}

export interface UpcomingEventInfo {
  event: TournamentDate
  tournamentName: string
  tournamentSlug: string
  logo: string
}
