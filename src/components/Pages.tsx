import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gallery from '../data/gallery.json'
import { HALLS, OCCASIONS, ROOMS, ROOM_COUNTS, type Space } from '../data/rooms'
import { CONTACT, wa } from '../data/journey'
import { CLIPS, DAY, NEARBY } from '../data/resort'
import { SectionFilm } from './Explore'
import { roomFilm } from './RoomFilm'
import { useFilmSize } from '../lib/play'
import { useBackToClose } from '../lib/backClose'
import { Logo } from './Logo'

const base = import.meta.env.BASE_URL
export const img = (id: string, thumb = false) => `${base}media/g/${id}${thumb ? '-t' : ''}.webp`
export interface GItem { id: string; category: string; caption: string; w: number; h: number; note?: string; video?: string; poster?: string; topic?: string }
const G = gallery as GItem[]
export const clip = (id: string, size: 'sm' | 'lg' | 'pt' = 'lg') => ({ src: `${base}media/clips/${id}-${size}.mp4`, poster: `${base}media/clips/${id}-poster.webp` })
/** the resort's short films, shown in the Photos page and the viewer */
export const VIDEO_ITEMS: GItem[] = CLIPS.map((c) => ({ id: `v-${c.id}`, category: 'Videos', topic: c.topic, caption: c.caption, w: 1920, h: 1080, video: clip(c.id).src, poster: clip(c.id).poster }))
const ALL = [...G, ...VIDEO_ITEMS]
const thumb = (g: GItem) => g.poster ?? img(g.id, true)
export const byId = Object.fromEntries(G.map((g) => [g.id, g]))

export type Page = 'rooms' | 'halls' | 'photos' | 'contact'

/* ───────────────────────── shell ───────────────────────── */
export function PageShell({ page, onClose, children }: { page: Page | null; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!page) return
    ref.current?.scrollTo(0, 0)
    closeBtn.current?.focus({ preventScroll: true })
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[data-lightbox]')) onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [page, onClose])
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={page ?? undefined}
      className={`fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-night/[0.97] backdrop-blur-xl transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${page ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-night to-night/0 px-6 py-6 md:px-10 md:py-8">
        <button type="button" onClick={onClose} className="block w-[92px] text-cream md:w-[110px]" tabIndex={page ? 0 : -1} aria-label="Vimal Resort: back to the film"><Logo title={false} /></button>
        <button ref={closeBtn} type="button" onClick={onClose} className="label flex items-center gap-3 text-cream/85 hover:text-gold" tabIndex={page ? 0 : -1}>
          Back to the film <span aria-hidden className="text-base">×</span>
        </button>
      </div>
      {page && children}
    </div>
  )
}

const Heading = ({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) => (
  <header className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:px-10 md:pb-16">
    <p className="label text-gold">{kicker}</p>
    <h1 className="font-display mt-5 text-5xl font-light leading-[0.95] md:text-8xl">{title}</h1>
    {sub && <p className="mt-6 max-w-xl text-cream/70 md:text-lg">{sub}</p>}
  </header>
)

/* ───────────────────────── rooms & halls ───────────────────────── */
function FilmHero({ scene, kicker, title, sub }: { scene: string; kicker: string; title: string; sub: string }) {
  const size = useFilmSize()
  return (
    <header className="relative -mt-[88px] flex h-[78svh] min-h-[520px] items-end overflow-hidden md:-mt-[104px]">
      <video key={size} src={`${base}media/scenes/${scene}-${size}.mp4`} poster={`${base}media/scenes/${scene}-poster.webp`}
        autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/40" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-14 md:px-10 md:pb-20">
        <p className="label text-gold">{kicker}</p>
        <h1 className="font-display mt-5 text-6xl font-light leading-[0.92] md:text-9xl">{title}</h1>
        <p className="mt-6 max-w-xl text-cream/80 md:text-lg">{sub}</p>
      </div>
    </header>
  )
}

function SpaceCard({ s, index, onWalk }: { s: Space; index: number; onWalk?: (id: string) => void }) {
  const [shot, setShot] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  useEffect(() => {
    if (s.photos.length < 2) return
    const t = window.setInterval(() => setShot((x) => (x + 1) % s.photos.length), 4500)
    return () => window.clearInterval(t)
  }, [s.photos.length])
  return (
    <article id={s.id} className="grid gap-8 border-t border-cream/10 py-14 md:grid-cols-12 md:gap-12 md:py-20">
      <div className={`md:col-span-7 ${index % 2 ? 'md:order-2' : ''}`}>
        {s.film && onWalk ? (
          <button type="button" onClick={() => onWalk(s.id)} className="group relative block aspect-[3/2] w-full overflow-hidden bg-cream/5" aria-label={`Walk inside the ${s.name}: full-screen film`}>
            <SectionFilm {...roomFilm(s.film)} />
            <span className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 flex items-center gap-3 text-cream">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full border border-gold bg-night/40 text-xs text-gold backdrop-blur transition-colors group-hover:bg-gold group-hover:text-night">▶</span>
              <span className="label">Walk inside · full screen</span>
            </span>
          </button>
        ) : (
          <button type="button" onClick={() => setOpen(shot)} className="relative block aspect-[3/2] w-full overflow-hidden bg-cream/5" aria-label={`View ${s.name} photos full screen`}>
          {s.photos.map((p, i) => (
            <img key={p} src={img(p)} alt={`${s.name}: ${byId[p]?.caption ?? ''}`} loading={i < 2 ? 'eager' : 'lazy'} decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[2000ms] ease-out ${i === shot ? 'scale-[1.035] opacity-100' : 'scale-100 opacity-0'}`} />
          ))}
          <span className="label absolute right-4 top-4 bg-night/50 px-3 py-1.5 text-[0.58rem] text-cream backdrop-blur">{s.photos.length} photos{s.clips?.length ? ` · ${s.clips.length} film${s.clips.length > 1 ? 's' : ''}` : ''} · view</span>
        </button>
        )}
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {s.clips?.map((c, k) => (
            <button key={c.id} type="button" onClick={() => setOpen(s.photos.length + k)} aria-label={`Play film: ${c.caption}`} className="relative aspect-square overflow-hidden opacity-90 ring-1 ring-gold/60 transition-opacity hover:opacity-100">
              <img src={clip(c.id).poster} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span aria-hidden className="absolute inset-0 grid place-items-center bg-night/30 text-xs text-gold">▶</span>
            </button>
          ))}
          {s.photos.map((p, i) => (
            <button key={p} type="button" onClick={() => setShot(i)} aria-label={`Show photo ${i + 1}`} className={`aspect-square overflow-hidden transition-opacity ${i === shot ? 'opacity-100 ring-1 ring-gold' : 'opacity-50 hover:opacity-90'}`}>
              <img src={img(p, true)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center md:col-span-5">
        <p className="label text-gold">{s.kicker}</p>
        <h2 className="font-display mt-4 text-5xl font-light md:text-6xl">{s.name}</h2>
        <p className="mt-6 leading-relaxed text-cream/75">{s.description}</p>
        <dl className="mt-7 divide-y divide-cream/10 border-y border-cream/10 text-sm">
          {s.facts.map((f) => (
            <div key={f.label} className="flex justify-between gap-6 py-3"><dt className="text-cream/50">{f.label}</dt><dd className="text-right text-cream/90">{f.value}</dd></div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-[0.6rem] text-cream/50">{s.priceLabel}</p>
            <p className="font-display mt-1 text-4xl text-gold">{s.price ?? 'Enquire for rates'}</p>
            <p className="mt-1 text-xs text-cream/45">{s.priceNote}</p>
          </div>
          <a href={wa(`Hello Vimal Resort, I'd like rates and availability for ${s.enquiry}.`)} target="_blank" rel="noreferrer" className="label bg-gold px-6 py-3.5 text-night transition-colors hover:bg-cream">Check availability</a>
        </div>
      </div>
      {open != null && <Lightbox items={[...s.photos.map((p) => byId[p]).filter(Boolean), ...(s.clips ?? []).map((c) => ({ id: `c-${c.id}`, category: 'Videos', caption: c.caption, w: 1920, h: 1080, video: clip(c.id).src, poster: clip(c.id).poster }))]} index={open} setIndex={setOpen} />}
    </article>
  )
}

export function RoomsPage({ onWalk }: { onWalk?: (id: string) => void }) {
  return (
    <div className="pb-24">
      <FilmHero scene="stay" kicker={ROOM_COUNTS} title="Rooms & Tents" sub="Carved-wood heritage rooms, bright contemporary rooms on the garden, and canvas tents among the trees. Press play to walk inside each one." />
      <nav aria-label="Room types" className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-6 pt-10 md:px-10">
        {ROOMS.map((r) => <a key={r.id} href={`#rooms`} onClick={(e) => { e.preventDefault(); document.getElementById(r.id)?.scrollIntoView({ behavior: 'smooth' }) }} className="label text-cream/70 hover:text-gold">{r.name}</a>)}
      </nav>
      <div className="mx-auto mt-6 max-w-6xl px-6 md:px-10">
        {ROOMS.map((r, i) => <SpaceCard key={r.id} s={r} index={i} onWalk={onWalk} />)}
      </div>
      <section className="mx-auto mt-10 max-w-6xl px-6 md:px-10">
        <div className="border border-gold/30 p-8 md:p-12">
          <p className="label text-gold">Day visits</p>
          <h2 className="font-display mt-4 text-4xl font-light md:text-5xl">Not staying over?</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <p className="label text-[0.62rem] text-cream/55">{DAY.gold.name} · per person</p>
              <dl className="mt-3">
                {DAY.gold.prices.map((p) => (
                  <div key={p.label} className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-3">
                    <dt className="text-sm text-cream/75">{p.label}{p.note && <span className="ml-2 text-xs text-cream/45">({p.note})</span>}</dt>
                    <dd className="font-display text-2xl text-gold">{p.price}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-cream/65">Includes {DAY.gold.includes.join(', ').toLowerCase()}.</p>
            </div>
            <div>
              <p className="label text-[0.62rem] text-cream/55">{DAY.adventure.name}</p>
              <p className="font-display mt-3 text-4xl text-gold">{DAY.adventure.price} <span className="font-sans text-sm text-cream/55">{DAY.adventure.unit}</span></p>
              <p className="mt-4 text-sm leading-relaxed text-cream/65">{DAY.adventure.includes.join(' · ')}</p>
              <p className="mt-4 text-sm text-cream/55">{DAY.extras.map((e) => `${e.label}: ${e.value}`).join(' · ')}</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-cream/45">Day visits {DAY.timings} · {DAY.taxNote} · published reference prices. {DAY.groups}</p>
        </div>
      </section>
    </div>
  )
}

export function HallsPage() {
  return (
    <div className="pb-24">
      <FilmHero scene="lawn" kicker="Weddings · receptions · parties" title="Halls & Lawns" sub="A 7,500 sq. ft. marriage hall, banquet halls and a 40,000 sq. ft. lawn for every kind of celebration." />
      <div className="mx-auto max-w-6xl px-6 pt-12 md:px-10">
        <p className="label mb-5 text-[0.6rem] text-cream/50">Celebrations we host</p>
        <ul className="flex flex-wrap gap-3">
          {OCCASIONS.map((o) => <li key={o} className="border border-cream/20 px-4 py-2 text-sm text-cream/85">{o}</li>)}
        </ul>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-6 md:px-10">
        {HALLS.map((h, i) => <SpaceCard key={h.id} s={h} index={i} />)}
      </div>
      <section className="mx-auto mt-6 max-w-6xl px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 border border-gold/30 p-8 md:flex-row md:items-center md:p-12">
          <div>
            <p className="label text-gold">Plan an event</p>
            <p className="font-display mt-3 text-3xl font-light md:text-4xl">Stay, dine and celebrate in one place.</p>
            <p className="mt-2 text-sm text-cream/60">105 rooms and 15 tents for your guests · pure-vegetarian catering, Jain on request · parking for 300 cars</p>
          </div>
          <a href={wa("Hello Vimal Resort, I'd like to plan an event. Date: , Guests: , Occasion: ")} target="_blank" rel="noreferrer" className="label shrink-0 bg-gold px-7 py-4 text-night hover:bg-cream">Enquire on WhatsApp</a>
        </div>
      </section>
    </div>
  )
}

/* ───────────────────────── gallery ───────────────────────── */
const CATS = ['All', 'Videos', 'Rooms', 'Tents', 'Grounds', 'Pool', 'Adventure', 'Play', 'Celebrations', 'Food', 'Aerial']

export function Lightbox({ items, index, setIndex }: { items: GItem[]; index: number; setIndex: (f: number | null | ((o: number | null) => number | null)) => void }) {
  const n = items.length
  const go = (d: number) => setIndex((o) => ((o ?? 0) + d + n) % n)
  useBackToClose(true, () => setIndex(null))
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })
  const cur = items[index]
  if (!cur) return null
  return createPortal(
    <div data-lightbox role="dialog" aria-modal="true" aria-label={cur.caption} className="fixed inset-0 z-[90] flex items-center justify-center bg-night/97 p-3 md:p-10" onClick={() => setIndex(null)}>
      {cur.video
        ? <video key={cur.id} src={cur.video} poster={cur.poster} autoPlay muted loop playsInline controls className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        : <img key={cur.id} src={img(cur.id)} alt={cur.caption} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-night/80 to-transparent p-6 text-sm" onClick={(e) => e.stopPropagation()}>
        <p className="text-cream/85">{cur.caption}{cur.note && <span className="ml-2 text-cream/50">· {cur.note}</span>}</p>
        <p className="label text-[0.6rem] text-cream/55">{index + 1} / {n}</p>
      </div>
      {n > 1 && <>
        <button type="button" onClick={(e) => { e.stopPropagation(); go(-1) }} className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-4xl text-cream/80 hover:text-gold" aria-label="Previous photo">‹</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); go(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-4xl text-cream/80 hover:text-gold" aria-label="Next photo">›</button>
      </>}
      <button type="button" onClick={() => setIndex(null)} className="label absolute right-6 top-6 text-cream" autoFocus>Close ×</button>
    </div>,
    document.body,
  )
}

/** lets a section open the gallery on one category (e.g. Adventure) */
export const galleryStart = { cat: 'All' }
export function GalleryPage() {
  const [cat, setCat] = useState(() => { const c = galleryStart.cat; galleryStart.cat = 'All'; return c })
  const [open, setOpen] = useState<number | null>(null)
  const items = useMemo(() => (cat === 'All' ? ALL : ALL.filter((g) => g.category === cat || g.topic === cat)), [cat])
  return (
    <div className="pb-24">
      <Heading kicker={`${G.length} photographs · ${VIDEO_ITEMS.length} films`} title="Photos & films" />
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div role="tablist" aria-label="Filter photos" className="mb-10 flex flex-wrap gap-x-6 gap-y-3">
          {CATS.filter((c) => c === 'All' || ALL.some((g) => g.category === c)).map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} type="button" onClick={() => setCat(c)}
              className={`label border-b pb-1.5 transition-colors ${cat === c ? 'border-gold text-gold' : 'border-transparent text-cream/60 hover:text-cream'}`}>{c}</button>
          ))}
        </div>
        {cat === 'Food' && <p className="-mt-4 mb-8 text-sm text-cream/55">These are illustrative images from the resort’s tour; the day’s menu may vary. Pure vegetarian, Jain on request.</p>}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <button key={g.id} type="button" onClick={() => setOpen(i)} className="group relative mb-4 block w-full overflow-hidden break-inside-avoid bg-cream/5" aria-label={`Open: ${g.caption}`}>
              <img src={thumb(g)} alt={g.caption} loading="lazy" decoding="async" style={{ aspectRatio: `${g.w} / ${g.h}` }} className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
              {g.video && <span aria-hidden className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-gold bg-night/50 text-[0.6rem] text-gold backdrop-blur">▶</span>}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-4 text-left text-sm text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">{g.caption}</span>
            </button>
          ))}
        </div>
      </div>
      {open != null && <Lightbox items={items} index={open} setIndex={setOpen} />}
    </div>
  )
}

/* ───────────────────────── contact ───────────────────────── */
export function ContactPage() {
  const [f, setF] = useState({ name: '', phone: '', date: '', guests: '', interest: 'A room stay', message: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const text = [
    `Hello Vimal Resort, I'd like to enquire about: ${f.interest}.`,
    f.name && `Name: ${f.name}`, f.phone && `Phone: ${f.phone}`, f.date && `Date: ${f.date}`, f.guests && `Guests: ${f.guests}`, f.message && `Message: ${f.message}`,
  ].filter(Boolean).join('\n')
  const field = 'mt-2 w-full border-b border-cream/25 bg-transparent py-2.5 text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-gold'

  return (
    <div className="pb-24">
      <Heading kicker="Contact" title="Plan your visit" sub="Call, message or visit. The team will confirm rates, availability and anything you need for your stay or event." />
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="space-y-10 md:col-span-5">
          <div>
            <p className="label text-[0.62rem] text-cream/50">Call</p>
            <a href={CONTACT.tel} className="mt-2 block font-sans text-4xl font-medium tracking-normal tabular-nums text-cream hover:text-gold">{CONTACT.phone}</a>
          </div>
          <div>
            <p className="label text-[0.62rem] text-cream/50">WhatsApp</p>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="mt-2 block text-lg text-cream hover:text-gold">Message us on WhatsApp →</a>
          </div>
          <div>
            <p className="label text-[0.62rem] text-cream/50">Email</p>
            <a href={`mailto:${CONTACT.email}`} className="mt-2 block text-lg text-cream hover:text-gold">{CONTACT.email}</a>
          </div>
          <div>
            <p className="label text-[0.62rem] text-cream/50">Find us</p>
            <p className="mt-2 leading-relaxed text-cream/80">{CONTACT.address}</p>
            <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="label mt-4 inline-block border-b border-gold pb-1 text-gold">Get directions</a>
          </div>
          <div>
            <p className="label text-[0.62rem] text-cream/50">Day visits</p>
            <p className="mt-2 text-cream/80">{DAY.timings}</p>
          </div>
          <div>
            <p className="label text-[0.62rem] text-cream/50">Follow</p>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="mt-2 block text-cream hover:text-gold">Instagram {CONTACT.instagramHandle}</a>
          </div>
          <div className="border-t border-cream/10 pt-6 text-sm text-cream/55">
            <p className="label mb-3 text-[0.6rem] text-cream/45">Nearby · by road</p>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
              {NEARBY.map((n) => <li key={n.place} className="flex justify-between gap-4 border-b border-cream/10 pb-1.5"><span>{n.place}</span><span className="tabular-nums">{n.km}</span></li>)}
            </ul>
          </div>
        </div>

        <form className="md:col-span-7" onSubmit={(e) => e.preventDefault()} aria-label="Enquiry">
          <div className="border border-cream/10 p-7 md:p-10">
            <p className="label text-gold">Send an enquiry</p>
            <div className="mt-8 grid gap-7 sm:grid-cols-2">
              <label className="block text-sm text-cream/60">Your name<input className={field} value={f.name} onChange={set('name')} autoComplete="name" /></label>
              <label className="block text-sm text-cream/60">Phone<input className={field} value={f.phone} onChange={set('phone')} type="tel" autoComplete="tel" /></label>
              <label className="block text-sm text-cream/60">Date<input className={field} value={f.date} onChange={set('date')} type="date" style={{ colorScheme: 'dark' }} /></label>
              <label className="block text-sm text-cream/60">Guests<input className={field} value={f.guests} onChange={set('guests')} inputMode="numeric" /></label>
              <label className="block text-sm text-cream/60 sm:col-span-2">I'm interested in
                <select className={`${field} [&>option]:bg-night`} value={f.interest} onChange={set('interest')}>
                  {['A room stay', 'A nature tent', 'A day visit (Gold package)', 'The adventure park', 'A wedding or celebration', 'A corporate or school group', 'Something else'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="block text-sm text-cream/60 sm:col-span-2">Message<textarea className={`${field} min-h-24 resize-y`} value={f.message} onChange={set('message')} /></label>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a href={wa(text)} target="_blank" rel="noreferrer" className="label bg-gold px-7 py-4 text-night transition-colors hover:bg-cream">Send on WhatsApp</a>
              <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Enquiry: ${f.interest}`)}&body=${encodeURIComponent(text)}`} className="label border-b border-cream/40 pb-1 text-cream/80 hover:text-gold">Or send by email</a>
            </div>
            <p className="mt-5 text-xs text-cream/40">This opens WhatsApp or your email app with your message filled in. Nothing is sent until you press send there.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
