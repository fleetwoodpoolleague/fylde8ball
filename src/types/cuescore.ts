export interface CueScoreParticipant {
  rank: number
  name: string
  participantId: number
  url: string
  points: number
  tournamentCount: number
}

export interface CueScoreEventRef {
  id: number
  name: string
  url: string
  starttime: string
  stoptime?: string
  status: string
}

export interface CueScoreRankingSnapshot {
  rankingId: number
  name: string
  url: string
  season?: number
  fetchedAt: string
  participants: CueScoreParticipant[]
  tournaments: CueScoreEventRef[]
}

export interface CueScoreTableGroup {
  count: number
  manufacturer: string
  model: string
  size: number | null
  cloth: string
  branch: string
}

export interface CueScoreVenueSnapshot {
  venueId: number
  name: string
  url: string
  fetchedAt: string
  totalTables: number
  tableGroups: CueScoreTableGroup[]
}
