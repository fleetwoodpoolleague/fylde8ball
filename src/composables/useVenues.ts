import type { Venue } from '../types/venue'

const modules = import.meta.glob<Omit<Venue, 'slug'>>(
  '../data/venues/*.json',
  { eager: true },
)

const venues: Venue[] = Object.entries(modules)
  .map(([path, data]) => {
    const slug = path.split('/').pop()!.replace('.json', '')
    return { ...data, slug } as Venue
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const venueBySlug = new Map(venues.map(v => [v.slug, v]))
const venueByLowerName = new Map(venues.map(v => [v.name.trim().toLowerCase(), v]))

export function useVenues(): Venue[] {
  return venues
}

export function getVenueBySlug(slug: string): Venue | undefined {
  return venueBySlug.get(slug)
}

export function findVenueByName(name: string | undefined): Venue | undefined {
  if (!name) return undefined
  return venueByLowerName.get(name.trim().toLowerCase())
}
