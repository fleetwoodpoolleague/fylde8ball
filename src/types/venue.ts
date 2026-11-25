export interface Venue {
  slug: string
  name: string
  town: string
  address?: string | null
  logo?: string
  website?: string | null
  /** Optional CueScore venue ID (e.g. 58691482). Null or empty when not tracked on CueScore. */
  cuescoreVenueId?: number | string | null
  contact?: {
    phone?: string
    whatsapp?: string
    email?: string
  }
  socials?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
}
