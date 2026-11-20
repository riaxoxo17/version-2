/**
 * Detailed resort facts, carried over from version 0 (sources: the resort's
 * own site, vimalresort.netlify.app, and the MapX virtual tour).
 * Photos are ids in src/data/gallery.json.
 */
export const PROPERTY = {
  name: 'Vimal Resort & Entertainment Park',
  kannadaName: 'ವಿಮಲ ರೆಸಾರ್ಟ್', // as written on the resort's own gate sign
  tagline: 'Where every journey becomes a memory',
  facts: [
    { value: '23', unit: 'acres', label: 'of gardens & orchards' },
    { value: '105', unit: 'rooms', label: 'rustic luxury, AC' },
    { value: '15', unit: 'tents', label: 'glamping among the trees' },
    { value: '20+', unit: 'activities', label: 'in a 2-acre adventure park' },
    { value: '1,500+', unit: 'trees', label: 'on the property' },
    { value: '300', unit: 'cars', label: 'parking' },
  ],
  trees: [
    { label: 'Sapota', value: '375' },
    { label: 'Guava', value: '320' },
    { label: 'Mango', value: '300' },
    { label: 'Sagwan (teak)', value: '300' },
  ],
}

/** Driving distance from the resort by road (Google Maps, driving route), nearest first. */
export const NEARBY = [
  { place: 'Jala Shankar Temple', km: '7 km' },
  { place: 'Gadag Zoo', km: '12 km' },
  { place: 'Gadag town', km: '14 km' },
  { place: 'Basaveshwara Statue', km: '15 km' },
  { place: 'Gadag Railway Station', km: '16 km' },
  { place: 'Magadi Bird Sanctuary', km: '20 km' },
  { place: 'Lakkundi Temples', km: '24 km' },
  { place: 'Kappatagudda', km: '29 km' },
  { place: 'Hubli Airport', km: '75 km' },
  { place: 'Badami', km: '85 km' },
  { place: 'Hampi', km: '119 km' },
  { place: 'Belgaum Airport', km: '179 km' },
]

/** Day packages: published reference prices (MapX tour). */
export const DAY = {
  timings: '9:00 am – 5:00 pm',
  taxNote: 'GST as applicable',
  gold: {
    name: 'Gold Package',
    prices: [
      { label: 'Monday – Friday', price: '₹800' },
      { label: 'Sat, Sun & govt. holidays', price: '₹900' },
      { label: 'Children under 12 & seniors over 60', price: '₹600', note: 'Age proof mandatory' },
    ],
    includes: ['Swimming pool', 'Rain dance with music', 'Bamboo tower', 'See-saw & swings', 'Dart & archery', 'Mud games', 'Zorbing balls', 'Indoor games', 'Welcome juice, breakfast, lunch & hi-tea'],
  },
  adventure: {
    name: 'Adventure Package',
    price: '₹400',
    unit: 'per person, add-on to a day package',
    includes: ['Zipline', 'Sky cycling', 'Rappelling', 'Net climbing', 'Burma bridge', 'Multi-vines', "Bosun's chair", 'Tyre crossing', 'Tyre wall climbing', 'Ladder walk', 'Zig-zag bridge', 'Bungee trampoline', 'Human gyro', '360° cycling', 'Meltdown ride'],
  },
  extras: [{ label: 'Nylon swimwear', value: 'mandatory for the pool · rental ₹50 per person' }],
  groups: 'Schools, colleges, corporate outings and family functions welcome.',
}

export interface Zone {
  id: string
  name: string
  kicker: string
  summary: string
  facts: { label: string; value: string }[]
  details?: string[]
  photos: string[]
  /** position on the aerial photograph (n00), 0–1; only where unmistakable */
  pin?: { x: number; y: number }
  page?: 'rooms' | 'halls' | 'photos' | 'contact'
  pageLabel?: string
}

export const ZONES: Zone[] = [
  {
    id: 'pool', name: 'Swimming Pool', kicker: 'The Water Oasis',
    summary: 'A 5,000 sq. ft. swimming pool with a dedicated rain dance arena alongside.',
    facts: [{ label: 'Pool', value: '5,000 sq. ft.' }, { label: 'Rain dance', value: 'Dedicated arena with music' }, { label: 'Swimwear', value: 'Nylon, mandatory · rental ₹50' }],
    details: ['Pool and rain dance are included in the Gold day package.'],
    photos: ['a05', 'n06', 'n07'], pin: { x: 0.381, y: 0.383 },
  },
  {
    id: 'adventure', name: 'Adventure Park', kicker: 'Thrill Meets Serenity',
    summary: 'A dedicated 2-acre park with more than 20 activities, built around a multi-level rope and climbing tower.',
    facts: [{ label: 'Area', value: '2 acres' }, { label: 'Activities', value: '20+' }, { label: 'Adventure package', value: '₹400 per person (add-on)' }],
    details: ['Sky cycling, zip climbing, zipline, giant swing, bungee trampoline, mud race and suspension bridges.', 'Age, height and weight limits are not published. Ask the resort before you book.'],
    photos: ['n01', 'n02', 'n03', 'n04'], pin: { x: 0.828, y: 0.41 },
  },
  {
    id: 'rooms', name: 'Luxury Rooms', kicker: 'Sanctuary of Comfort',
    summary: 'Rustic architecture with AC, family suites and modern cottage amenities.',
    facts: [{ label: 'Rooms', value: '105' }, { label: 'Amenities', value: 'AC · family suites' }],
    photos: ['p31', 'p06', 'p39', 'p07'], page: 'rooms', pageLabel: 'See the rooms',
  },
  {
    id: 'tents', name: 'Nature Tents', kicker: 'Close to Nature',
    summary: 'Glamping tents for groups and families, set in the green part of the grounds.',
    facts: [{ label: 'Tents', value: '15' }],
    photos: ['p43', 'p44', 'p46'], page: 'rooms', pageLabel: 'See the tents',
  },
  {
    id: 'restaurant', name: 'Restaurant', kicker: 'Vimal Resort Kitchen',
    summary: 'A 2,500 sq. ft. multi-cuisine restaurant serving North Indian, South Indian and Jain dishes.',
    facts: [{ label: 'Area', value: '2,500 sq. ft.' }, { label: 'Cuisine', value: 'North Indian · South Indian · Jain' }, { label: 'Kitchen', value: 'Pure vegetarian · Jain on request' }],
    details: ['Food photos are illustrative; the day’s menu may vary.'],
    photos: ['f00', 'f01', 'f02'], page: 'photos', pageLabel: 'See the food',
  },
  {
    id: 'lawn', name: 'Marriage Lawn', kicker: 'Grand Celebrations',
    summary: 'A 40,000 sq. ft. lawn with pre-built mandap spaces for large Indian weddings.',
    facts: [{ label: 'Area', value: '40,000 sq. ft.' }, { label: 'Guests', value: '1,000+' }],
    photos: ['n10', 'a04'], page: 'halls', pageLabel: 'See halls & lawns',
  },
  {
    id: 'halls', name: 'Marriage Hall & Banquets', kicker: 'Indoor Ceremonies',
    summary: 'A 7,500 sq. ft. marriage hall for main ceremonies, plus 2,500 sq. ft. banquet halls for receptions and corporate events.',
    facts: [{ label: 'Marriage hall', value: '7,500 sq. ft.' }, { label: 'Banquet halls', value: '2,500 sq. ft.' }],
    details: ['Seating capacities for the halls are not published.'],
    photos: ['n08', 'n09'], page: 'halls', pageLabel: 'See halls & lawns',
  },
  {
    id: 'watchtower', name: '360° Watchtower', kicker: 'Eagle Views',
    summary: 'An observation tower with views across the resort and the surrounding farmland.',
    facts: [{ label: 'View', value: '360°' }],
    details: ['Photo: a drone view from above the resort, not the view from the tower itself.'],
    photos: ['a01'],
  },
]

/**
 * Destination weddings. Source for the award and the figures: the resort's own
 * Instagram post (@vimalresort): "recognised as the Best Destination Wedding
 * Venue in Karnataka at the Karnataka Tourism Awards".
 * awardPhoto: set to a gallery id once the award photo is supplied.
 */
export const WEDDING = {
  award: 'Best Destination Wedding Venue in Karnataka',
  awardBy: 'Karnataka Tourism Awards',
  awardPhoto: null as string | null,
  facts: [
    { value: '2', label: 'fully air-conditioned halls' },
    { value: '4,000+', label: 'floating capacity' },
    { value: '600+', label: 'guests can stay over' },
    { value: '40,000', label: 'sq. ft. open-sky lawn' },
  ],
  photos: ['q08', 'q09', 'n09', 'n10'],
}

/** Short films from the resort's own phone footage (media/clips/<id>-lg.mp4). */
/** topic: also list the film under that photo category (e.g. Adventure) */
export interface Clip { id: string; caption: string; topic?: string }
export const CLIPS: Clip[] = [
  { id: 'gate-dusk', caption: 'The Vimal Resort gateway at dusk' },
  { id: 'gate-sign', caption: 'The gateway sign, lit up' },
  { id: 'heart-lights', caption: 'The heart of lights by the gate' },
  { id: 'entrance-wide', caption: 'Arriving at the entrance' },
  { id: 'entrance-plaza', caption: 'The entrance plaza: topiary and cart wheels' },
  { id: 'light-tunnel', caption: 'The light tunnel and rain curtain' },
  { id: 'palm-path', caption: 'Under the palms' },
  { id: 'garden-path', caption: 'Garden pathway' },
  { id: 'sculpture-garden', caption: 'The sculpture garden' },
  { id: 'pool-sunset', caption: 'The pool at sunset' },
  { id: 'pool-dusk', caption: 'The pool at dusk' },
  { id: 'adventure-drone', caption: 'The adventure park from the air', topic: 'Adventure' },
  { id: 'tower-drone', caption: 'Around the climbing tower', topic: 'Adventure' },
  { id: 'rope-course', caption: 'The rope course and climbing towers', topic: 'Adventure' },
  { id: 'zipline', caption: 'Sky cycling above the adventure park', topic: 'Adventure' },
  { id: 'sky-cycling-3', caption: 'Sky cycling over the trees', topic: 'Adventure' },
  { id: 'sky-cycling-4', caption: 'Sky cycling past the tyre wall', topic: 'Adventure' },
  { id: 'zipline-2', caption: 'Sky cycling', topic: 'Adventure' },
  { id: 'zip-tower', caption: 'The adventure tower', topic: 'Adventure' },
  { id: 'kids-play', caption: 'Kids’ play area', topic: 'Adventure' },
  { id: 'banquet-walk', caption: 'Walking into the banquet hall' },
  { id: 'hall-drone', caption: 'The marriage hall and lawn from the air' },
  { id: 'banquet-hall', caption: 'Banquet hall, set for a celebration' },
  { id: 'thank-you', caption: 'Thank you, visit again' },
]

/** Spots made for pictures. A zone shows a short film (clip) or a photo (gallery id). */
export interface PhotoZone { id: string; name: string; note: string; clip?: string; photo?: string }
export const PHOTO_ZONES: PhotoZone[] = [
  { id: 'heart', name: 'The heart of lights', note: 'A heart of fairy lights beside the gate, glowing from dusk.', clip: 'heart-lights' },
  { id: 'gateway', name: 'The Vimal Resort gateway', note: 'The lit sign at dusk is the classic arrival photo.', clip: 'gate-dusk' },
  { id: 'tunnel', name: 'The light tunnel', note: 'A vine-covered arch of lights with a rain curtain at its heart.', clip: 'light-tunnel' },
  { id: 'fountain', name: 'Fountain plaza', note: 'The white statue fountain on its patterned stone circle.', photo: 'p30' },
  { id: 'sculpture', name: 'Sculpture garden', note: 'Flowering trees around a white sculpture, best at golden hour.', clip: 'sculpture-garden' },
  { id: 'plaza', name: 'Entrance plaza', note: 'Topiary in the round, framed by the cart-wheel walls.', clip: 'entrance-plaza' },
  { id: 'wheel', name: 'Cart-wheel wall', note: 'Stone, greenery and a painted wheel, softly lit in the evening.', photo: 'q00' },
  { id: 'palms', name: 'Palm pathway', note: 'A long, lamp-lit walk beneath the coconut palms.', photo: 'q01' },
  { id: 'greenery', name: 'The orchards', note: 'Shade, grass and 1,500+ trees: mango, sapota, guava and teak.', photo: 'p20' },
  { id: 'garden-path', name: 'Garden pathway', note: 'A winding red-brick path through the trees.', clip: 'garden-path' },
]
