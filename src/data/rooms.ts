/**
 * Room types (7, rooms and tents) and venues (Marriage Hall & Banquets, Marriage Lawn).
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

// Room types from the resort's own folders (Drive, 25 Nov): A block (balcony), B block (deluxe,
// no balcony, bigger), C block (super deluxe, king), D block (super deluxe, family), the new
// building, and two kinds of tent. Descriptions say only what the photos show.
export const ROOMS: Space[] = [
  {
    id: 'balcony', name: 'Balcony Room', kicker: 'A Block',
    description:
      'Bright contemporary rooms that open onto a long balcony over the orchard: a king bed or twin beds, warm wooden floors, a writing desk and big landscape artwork.',
    facts: [
      { label: 'Beds', value: 'King or twin beds' },
      { label: 'Outside', value: 'Balcony over the garden' },
      { label: 'Comfort', value: 'Air-conditioned' },
      { label: 'Where', value: 'A Block' },
    ],
    photos: ['ra00',  'ra01',  'ra02',  'ra03',  'ra04',  'ra05',  'ra06',  'ra07',  'ra08',  'ra09',  'ra10',  'ra11'],
    ...ROOM_PRICE, enquiry: 'a Balcony Room',
  },
  {
    id: 'deluxe', name: 'Deluxe Room', kicker: 'B Block',
    description:
      'A larger room without a balcony: a king bed, a sitting corner with two armchairs by a wide window, a tea and coffee tray and a tiled bathroom. Twin beds too.',
    facts: [
      { label: 'Beds', value: 'King or twin beds' },
      { label: 'Space', value: 'Bigger, with a sitting corner' },
      { label: 'Comfort', value: 'Air-conditioned · tea & coffee tray' },
      { label: 'Where', value: 'B Block' },
    ],
    photos: ['rb00',  'rb01',  'rb02',  'rb03',  'rb04',  'rb05',  'rb06',  'rb07',  'rb08',  'rb09'],
    ...ROOM_PRICE, enquiry: 'a Deluxe Room',
  },
  {
    id: 'super-deluxe', name: 'Super Deluxe Room', kicker: 'C Block · Heritage',
    description:
      'Heritage rooms under high timber-beamed ceilings: a carved king bed with a tufted headboard, Rajasthani fort artwork, a sofa lounge and a writing desk, opening onto a shaded veranda.',
    facts: [
      { label: 'Beds', value: 'One king bed' },
      { label: 'Style', value: 'Heritage, timber-beamed ceiling' },
      { label: 'Lounge', value: 'Sofa and sitting corner' },
      { label: 'Where', value: 'C Block' },
    ],
    photos: ['rc00',  'rc01',  'rc02',  'rc03',  'rc04',  'rc05',  'rc06',  'rc07',  'rc08',  'rc09',  'rc10',  'rc11'],
    ...ROOM_PRICE, enquiry: 'a Super Deluxe Room', film: 'room-king',
  },
  {
    id: 'super-deluxe-family', name: 'Super Deluxe Family Room', kicker: 'D Block · Heritage',
    description:
      'The heritage super deluxe, made for families: two carved double beds side by side, extra floor mattresses, a sitting nook by the window and a bathroom with a bathtub.',
    facts: [
      { label: 'Beds', value: 'Two double beds' },
      { label: 'Bathroom', value: 'With a bathtub' },
      { label: 'Style', value: 'Heritage, timber-beamed ceiling' },
      { label: 'Where', value: 'D Block' },
    ],
    photos: ['rd00',  'rd01',  'rd02',  'rd03',  'rd04',  'rd05',  'rd06',  'rd07',  'rd08',  'rd09',  'rd10',  'rd11',  'rd12'],
    ...ROOM_PRICE, enquiry: 'a Super Deluxe Family Room', film: 'room-twin',
  },
  {
    id: 'courtyard', name: 'Courtyard Suite', kicker: 'New Building',
    description:
      'In the new building, rooms open onto galleries around a vast glass-roofed courtyard. Each has a carved wooden double bed, extra mattresses and its own dining table, made for big families and groups.',
    facts: [
      { label: 'Beds', value: 'Double bed + extra mattresses' },
      { label: 'Dining', value: 'Dining table in the room' },
      { label: 'Setting', value: 'Around a glass-roofed courtyard' },
      { label: 'Where', value: 'New building' },
    ],
    photos: ['rn00',  'rn01',  'rn02',  'rn03',  'rn04',  'rn05',  'rn06',  'rn07',  'rn08',  'rn09',  'rn10',  'rn11'],
    ...ROOM_PRICE, enquiry: 'a Courtyard Suite',
  },
  {
    id: 'tent', name: 'Nature Tent', kicker: 'Close to Nature',
    description:
      'A scalloped white canvas tent on the lawn, reached by its own steps: hand-printed interiors, a row of joined beds, a seating corner, air-conditioning and twin washbasins.',
    facts: [
      { label: 'Beds', value: 'A row of joined beds' },
      { label: 'Comfort', value: 'Air-conditioned' },
      { label: 'Bath', value: 'Twin washbasins' },
    ],
    photos: ['tn00',  'tn01',  'tn02',  'tn03',  'tn04'],
    ...ROOM_PRICE, enquiry: 'a Nature Tent', film: 'room-tent',
  },
  {
    id: 'family-tent', name: 'Family Tent', kicker: 'Close to Nature',
    description:
      'The larger tent, for families and groups: two long rows of beds under a hand-printed canopy, a seating corner, air-conditioning and twin washbasins.',
    facts: [
      { label: 'Beds', value: 'Two long rows of beds' },
      { label: 'Made for', value: 'Big families & groups' },
      { label: 'Comfort', value: 'Air-conditioned · twin washbasins' },
    ],
    photos: ['tf00',  'tf01',  'tf02',  'tf03',  'tf04',  'tf05',  'tf06'],
    ...ROOM_PRICE, enquiry: 'a Family Tent',
  },
]

const EVENT_PRICE = { price: null, priceLabel: 'Event pricing', priceNote: 'Venue rates and seating capacities are confirmed by the resort.' }

// Two wedding venues (client, 25 Nov): the main marriage hall with the big lawn in front, and the
// smaller marriage hall in the new building's glass-roofed courtyard.
export const HALLS: Space[] = [
  {
    id: 'main-hall', name: 'Main Marriage Hall & Lawn', kicker: 'The grand venue',
    description:
      'The main marriage hall, under warm timber beams with space for staging, décor and catering, opens onto a vast manicured lawn with pre-built mandap spaces for grand weddings under the open sky. Banquet halls alongside for receptions and parties.',
    facts: [
      { label: 'Marriage hall', value: '7,500 sq. ft.' },
      { label: 'Lawn', value: '40,000 sq. ft. · 1,000+ guests' },
      { label: 'Banquet halls', value: '2,500 sq. ft.' },
      { label: 'Services', value: 'Mandap spaces · staging · catering' },
    ],
    photos: ['n08', 'n09', 'h00', 'h01', 'h02', 'n10', 'a04', 'w11', 'w10', 'w09', 'w08', 'w12', 'w13', 'w14', 'w15'],
    clips: [
      { id: 'hall-drone', caption: 'The marriage hall and lawn from the air' },
      { id: 'banquet-hall', caption: 'Inside the hall, set for a celebration' },
      { id: 'wed-lawn-canopy', caption: 'Under the pink canopy on the lawn' },
      { id: 'wed-lawn-seating', caption: 'Lawn seating under the canopy' },
      { id: 'wed-garden-table', caption: 'Garden table under a pink umbrella' },
    ],
    ...EVENT_PRICE, enquiry: 'the Main Marriage Hall & Lawn',
  },
  {
    id: 'courtyard-hall', name: 'Courtyard Marriage Hall', kicker: 'Intimate weddings',
    description:
      'A smaller marriage hall in the new building: rows of seating down the open courtyard under its arched glass roof, a stage at the far end, and the guest rooms of the Courtyard Suites on the galleries all around.',
    facts: [
      { label: 'Setting', value: 'Glass-roofed courtyard' },
      { label: 'Size', value: 'Smaller, more intimate' },
      { label: 'Stay', value: 'Courtyard Suites all around' },
      { label: 'Services', value: 'Staging · décor · catering' },
    ],
    photos: ['w00', 'w01', 'q08', 'rn00', 'rn01', 'w03', 'w04', 'w05', 'w06', 'w07', 'w02', 'q09'],
    clips: [
      { id: 'wed-courtyard-stage', caption: 'The courtyard hall, set for a wedding' },
      { id: 'wed-stage-reveal', caption: 'From the stage to the whole courtyard' },
      { id: 'wed-hall-stage', caption: 'A stage with a temple-arch backdrop' },
      { id: 'wed-mandala-entry', caption: 'The mandala wall at the entrance' },
      { id: 'wed-mandala-wall', caption: 'Mandala wall and gramophone' },
    ],
    ...EVENT_PRICE, enquiry: 'the Courtyard Marriage Hall',
  },
]

export const OCCASIONS = ['Weddings & marriages', 'Receptions', 'Engagements', 'Birthdays & parties', 'Corporate events', 'Family get-togethers']

export const ROOM_COUNTS = '105 luxury rooms · 15 nature tents'
