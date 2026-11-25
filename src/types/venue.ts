export interface Venue {
  slug: string
  name: string
  town: string
  address?: string | null
  logo?: string
  website?: string | null
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
