/**
 * The opening film (first three scenes, ~38 s), cut from the resort's own drone
 * footage. Everything after it is a scrolling page of sections, each with its
 * own film (see components/Explore.tsx).
 */
import durations from './durations.json'

export interface Scene {
  id: string
  chapter: string
  kicker: string
  line: string
  cta?: { label: string; href: string }
  pos?: 'top' | 'center'
  ai?: boolean
  /** quick connective shot: no line of copy */
  bridge?: boolean
}

export const CONTACT = {
  phone: '+91 98867 84189',
  tel: 'tel:+919886784189',
  whatsapp: 'https://wa.me/919886784189',
  email: 'vimalresort@gmail.com',
  instagram: 'https://www.instagram.com/vimalresort/',
  instagramHandle: '@vimalresort',
  address: 'New Bengaluru Highway, Shiratti Road, near Beladadi, Gadag, Karnataka 582101',
  maps: 'https://www.google.com/maps/search/?api=1&query=Vimal+Resort+Gadag',
}

export const wa = (text: string) => `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`

export const SCENES: Record<string, Scene> = {
  arrival: { id: 'arrival', chapter: 'Arrival', kicker: 'Gadag · North Karnataka', line: 'Where every journey becomes a memory' },
  gate: { id: 'gate', chapter: 'The Gate', kicker: 'On the New Bengaluru Highway', line: 'Welcome to Vimal', pos: 'top' },
  palms: { id: 'palms', chapter: 'The Grounds', kicker: '23 acres · 1,500+ trees', line: 'Slow down beneath the palms' },
  stay: { id: 'stay', chapter: 'Rooms', kicker: '105 luxury rooms', line: 'Find your place to unwind', cta: { label: 'See the rooms', href: '#rooms' } },
  tents: { id: 'tents', chapter: 'Nature Tents', kicker: '15 nature tents', line: 'Sleep beneath the trees', cta: { label: 'See the tents', href: '#rooms' } },
  adventure: { id: 'adventure', chapter: 'Adventure', kicker: '2-acre park · 20+ activities', line: 'Adventure is calling', cta: { label: 'Adventure package · ₹400', href: '#contact' } },
  pool: { id: 'pool', chapter: 'The Pool', kicker: '5,000 sq. ft. pool · rain dance', line: 'Dive into the moment', cta: { label: 'Day packages from ₹800', href: '#contact' } },
  lawn: { id: 'lawn', chapter: 'Celebrations', kicker: 'Weddings · receptions · parties', line: 'Room for every celebration', cta: { label: 'See the halls', href: '#halls' } },
  finale: { id: 'finale', chapter: 'Visit', kicker: 'Vimal Resort & Entertainment Park', line: 'Your story begins at Vimal' },
}

// the opening film: arrival and the gate. The palm-path drone shot now closes the site (Visit section).
export const ROUTE = ['arrival', 'gate']
export const ALL_IDS = ROUTE

export const DURATION: Record<string, number> = Object.fromEntries(Object.keys(SCENES).map((id) => [id, (durations as Record<string, number>)[id] ?? 6]))

export const PACKAGES = [
  { name: 'Gold day package', price: '₹800', note: 'Mon–Fri · ₹900 weekends & holidays · ₹600 under-12 / over-60' },
  { name: 'Adventure add-on', price: '₹400', note: 'Zipline, sky cycling, rappelling & more' },
  { name: 'Rooms & tents', price: 'On request', note: 'Ask the resort for tonight’s rates' },
]
export const PACKAGE_NOTE = '9 am – 5 pm · GST extra · published reference prices'
