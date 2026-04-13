export interface TournamentMeta {
  name: string
  venue: string
  organiser: string
  logo: string
}

export interface TournamentDate {
  name: string
  date: string
  completed: boolean
}

export interface Tournament {
  meta: TournamentMeta
  dates: TournamentDate[]
  slug: string
}
