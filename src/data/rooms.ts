/**
 * Room types and venues, carried over from the previous version of the site
 * (Twin Room, King Room, Nature Tent; Marriage Hall & Banquets, Marriage Lawn).
 * Facts are only what the resort's website states or what the photos show.
 * PRICES: no room or hall tariffs have been published or supplied. Set `price`
 * (e.g. '₹3,500') and it replaces "Enquire for rates".
 */
export interface Space {
  id: string
  name: string
  kicker: string
  description: string
  facts: { label: string; value: string }[]
  photos: string[] // ids in src/data/gallery.json
  /** walk-in film built from the resort's 360° tour (media/rooms/<film>-lg.mp4) */
  film?: string
  /** short phone films shown with the photos (media/clips/<id>) */
  clips?: { id: string; caption: string }[]
  price: string | null
  priceLabel: string
  priceNote: string
  enquiry: string
}

const ROOM_PRICE = { price: null, priceLabel: 'Per night', priceNote: 'Tariffs are confirmed by the resort.' }

export const ROOMS: Space[] = [
  {
    id: 'twin', name: 'Twin Room', kicker: 'Luxury Rooms',
    description:
      'Two carved wooden beds with tufted sage headboards, Hampi temple artwork, warm wooden floors and a garden-facing sitting corner. Also in a bright contemporary style.',
    facts: [
      { label: 'Beds', value: 'Two double beds' },
      { label: 'Comfort', value: 'Air-conditioned' },
      { label: 'Setting', value: 'Rustic architecture, garden windows' },
      { label: 'On property', value: '105 luxury rooms' },
    ],
    photos: ['p31', 'p38', 'p33', 'p05', 'p07', 'p02', 'q04', 'q06'],
    ...ROOM_PRICE, enquiry: 'a Twin Room', film: 'room-twin',
  },
  {
    id: 'king', name: 'King Room', kicker: 'Luxury Rooms',
    description:
      'A single king bed under a carved, tufted headboard, framed by heritage artwork of Hampi and the fort, with a quiet reading corner by the window. Also in a bright contemporary style.',
    facts: [
      { label: 'Beds', value: 'One king bed' },
      { label: 'Comfort', value: 'Air-conditioned' },
      { label: 'Family suites', value: 'Family suites available' },
      { label: 'On property', value: '105 luxury rooms' },
    ],
    photos: ['p06', 'p39', 'p41', 'p08', 'p36', 'p03', 'p10', 'q03', 'q05', 'q07', 'p28', 'p40'],
    ...ROOM_PRICE, enquiry: 'a King Room', film: 'room-king',
  },
  {
    id: 'tent', name: 'Nature Tent', kicker: 'Close to Nature',
    description:
      'Scalloped white canvas cottages on the lawn: hand-printed interiors, raised floors and private steps, made for families and groups.',
    facts: [
      { label: 'Style', value: 'Glamping for groups & families' },
      { label: 'On property', value: '15 nature tents' },
    ],
    photos: ['p43', 'p44', 'p46', 'p00', 'p45', 'p01'],
    ...ROOM_PRICE, enquiry: 'a Nature Tent', film: 'room-tent',
  },
]

const EVENT_PRICE = { price: null, priceLabel: 'Event pricing', priceNote: 'Venue rates and seating capacities are confirmed by the resort.' }

export const HALLS: Space[] = [
  {
    id: 'hall', name: 'Marriage Hall', kicker: 'Indoor ceremonies',
    description:
      'A grand hall under warm timber beams, with lights down the aisle and space for staging, décor and catering. Banquet halls alongside for receptions, parties and corporate events.',
    facts: [
      { label: 'Marriage hall', value: '7,500 sq. ft.' },
      { label: 'Banquet halls', value: '2,500 sq. ft.' },
      { label: 'Services', value: 'Staging & custom catering' },
    ],
    photos: ['n08', 'n09', 'q09', 'h00', 'h01', 'h02'],
    clips: [{ id: 'hall-drone', caption: 'The marriage hall and lawn from the air' }, { id: 'banquet-hall', caption: 'Inside the hall, set for a celebration' }],
    ...EVENT_PRICE, enquiry: 'the Marriage Hall or banquet halls',
  },
  {
    id: 'lawn', name: 'Marriage Lawn', kicker: 'Open-air celebrations',
    description:
      'An expansive manicured lawn with pre-built mandap spaces, ringed by gardens and orchards, for grand Indian weddings under the open sky.',
    facts: [
      { label: 'Area', value: '40,000 sq. ft.' },
      { label: 'Guests', value: '1,000+' },
      { label: 'Mandap', value: 'Pre-built spaces' },
    ],
    photos: ['n10', 'a04', 'a01'],
    ...EVENT_PRICE, enquiry: 'the Marriage Lawn',
  },
]

export const OCCASIONS = ['Weddings & marriages', 'Receptions', 'Engagements', 'Birthdays & parties', 'Corporate events', 'Family get-togethers']

export const ROOM_COUNTS = '105 luxury rooms · 15 nature tents'
