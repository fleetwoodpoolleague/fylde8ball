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
  completed: boolean
}

export interface Tournament {
  meta: TournamentMeta
  dates: TournamentDate[]
  slug: string
}
