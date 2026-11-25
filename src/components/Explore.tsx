import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AWARDS, CLIPS, DAY, NEARBY, PHOTO_ZONES, PROPERTY, WEDDING } from '../data/resort'
import { HALLS, ROOMS } from '../data/rooms'
import { CONTACT, wa } from '../data/journey'
import { Lightbox, byId, clip, galleryStart, type GItem, type Page } from './Pages'
import gallery from '../data/gallery.json'
import { Laurel, Logo } from './Logo'
import { prepVideo, safePlay, unwait, useFilmSize } from '../lib/play'
import { FullFilm, FullScreenButton, type FullFilmSpec } from './FullFilm'

gsap.registerPlugin(ScrollTrigger)

const base = import.meta.env.BASE_URL
const img = (id: string, thumb = false) => `${base}media/g/${id}${thumb ? '-t' : ''}.webp`
const ADVENTURE_MEDIA = `${gallery.filter((g) => g.category === 'Adventure').length} photos & ${CLIPS.filter((c) => c.topic === 'Adventure').length} films`
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A film that loads as it approaches and plays only while on screen. */
export function SectionFilm(p: { src: string; poster: string; className?: string }) {
  return <SectionFilmInner key={p.src} {...p} />
}
function SectionFilmInner({ src, poster, className = '' }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    prepVideo(v)
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.preload = 'auto'; near.disconnect() } }, { rootMargin: '120% 0px' })
    const vis = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduced()) safePlay(v)
      else { unwait(v); v.pause() }
    }, { threshold: 0.25 })
    near.observe(v); vis.observe(v)
    return () => { near.disconnect(); vis.disconnect() }
  }, [])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden className={`h-full w-full object-cover ${className}`} />
}
type Film = string | { clip: string }
const filmSrc = (film: Film, size: string) => typeof film === 'string'
  ? { src: `${base}media/scenes/${film}-${size}.mp4`, poster: `${base}media/scenes/${film}-poster.webp` }
  : clip(film.clip, size as 'lg' | 'pt')

function FilmSection({ id, film, kicker, title, children, labelledBy, onFull, sideFilm }: { sideFilm?: boolean; id: string; film: Film; kicker: React.ReactNode; title: React.ReactNode; children?: React.ReactNode; labelledBy: string; onFull: (f: FullFilmSpec) => void }) {
  const size = useFilmSize()
  const f = filmSrc(film, size)
  const wide = filmSrc(film, 'lg')
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative">
      <div data-film className="relative min-h-[100svh] overflow-hidden">
        <div data-film-inner className="absolute inset-0 will-change-transform"><SectionFilm {...f} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/45" />
        <FullScreenButton onClick={() => onFull({ title: id.charAt(0).toUpperCase() + id.slice(1), srcs: [wide.src], poster: wide.poster })} className="absolute right-5 top-[8.25rem] z-10 md:right-[6vw] md:top-32" />
        {/* sideFilm: the wide film shows an upright clip on the right, so the words keep to the left */}
        <div className={`relative flex min-h-[100svh] flex-col justify-end px-6 pb-14 pt-28 md:px-[6vw] md:pb-20 ${sideFilm ? 'md:pr-[42vw] [&_h2]:md:text-[4.6vw]' : ''}`}>
          <p data-reveal className="label text-gold">{kicker}</p>
          <h2 id={labelledBy} data-reveal className="font-display mt-5 max-w-5xl text-[13vw] font-light leading-[0.95] text-cream [text-shadow:0_4px_50px_rgba(0,0,0,0.35)] md:text-[6vw]">{title}</h2>
          {children}
        </div>
      </div>
    </section>
  )
}

/**
 * Everything after the opening film: one section per part of the resort, each
 * with its own film.
 */
export function Explore({ openPage, openRoom }: { openPage: (p: Page, anchor?: string) => void; openRoom: (id: string) => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState<FullFilmSpec | null>(null)
  const visitSize = useFilmSize()

  useEffect(() => {
    if (reduced()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-film]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(9% 7% 9% 7% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: 0.6 } })
        const inner = el.querySelector('[data-film-inner]')
        if (inner) gsap.fromTo(inner, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: 0.6 } })
      })
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.from(el, { opacity: 0, y: 36, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }),
      )
    }, root)
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 1200)
    return () => { ctx.revert(); window.clearTimeout(t) }
  }, [])

  return (
    <div ref={root} className="relative z-20 bg-night">
      {/* ─────────── WEDDINGS ─────────── */}
      <FilmSection onFull={setFull} id="weddings" sideFilm film={{ clip: 'wedding-film' }} labelledBy="weddings-title"
        kicker={<span className="inline-flex items-center gap-2.5"><Laurel className="h-6 w-6 shrink-0 text-gold" /><span>{WEDDING.award}<span className="hidden md:inline"> · {WEDDING.awardBy}</span></span></span>}
        title={<>Karnataka’s best <em className="text-cream/85">destination wedding.</em></>}>
        <p data-reveal className="mt-6 max-w-2xl text-cream/80">Ceremonies in the hall or under the open sky, guests staying on the grounds, and every celebration in one place.</p>
        <dl data-reveal className="mt-8 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
          {WEDDING.facts.map((f) => (
            <div key={f.label}><dt className="sr-only">{f.label}</dt><dd><span className="font-display block text-4xl text-gold md:text-5xl">{f.value}</span><span className="mt-1 block text-xs text-cream/70">{f.label}</span></dd></div>
          ))}
        </dl>
        <div data-reveal className="mt-9 grid max-w-4xl gap-3 sm:grid-cols-2">
          {HALLS.map((h) => (
            <button key={h.id} type="button" onClick={() => openPage('halls', h.id)} className="group flex items-center gap-4 border border-cream/20 bg-night/40 p-3 text-left backdrop-blur-md transition-colors hover:border-gold">
              <img src={img(h.photos[0], true)} alt="" loading="lazy" className="h-16 w-24 shrink-0 object-cover" />
              <span className="min-w-0 flex-1"><span className="font-display block text-2xl">{h.name}</span><span className="block truncate text-xs text-cream/60">{h.facts.map((f) => f.value).join(' · ')}</span></span>
              <span aria-hidden className="text-xl text-gold transition-transform group-hover:translate-x-1">→</span>
            </button>
          ))}
        </div>
        <div data-reveal className="mt-6 flex flex-wrap gap-3">
          <a className="label bg-gold px-6 py-4 text-night hover:bg-cream" href={wa('Hello Vimal Resort, I would like to plan a wedding. Date: , Guests: ')} target="_blank" rel="noreferrer">Plan your wedding</a>
        </div>
      </FilmSection>

      {/* ─────────── ROOMS ─────────── */}
      <FilmSection onFull={setFull} id="stay" film="stay" kicker={`${PROPERTY.facts[1].value} luxury rooms · 15 nature tents`} labelledBy="stay-title" title={<>Find your place <em className="text-cream/85">to unwind.</em></>}>
        {/* every room type and both tents; a card with a walk-in film plays it, the others open their photos */}
        <div data-reveal className="mt-8 grid max-w-6xl grid-cols-2 gap-2.5 sm:grid-cols-4 md:gap-3">
          {ROOMS.map((r) => (
            <button key={r.id} type="button" onClick={() => (r.film ? openRoom(r.id) : openPage('rooms', r.id))} className="group relative overflow-hidden border border-cream/20 bg-night/40 text-left backdrop-blur-md transition-colors hover:border-gold">
              <span className="block aspect-[4/3] overflow-hidden"><img src={img(r.photos[0], true)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" /></span>
              <span className="flex items-center justify-between gap-2 px-3 py-2.5 md:px-4 md:py-3">
                <span className="min-w-0"><span className="font-display block text-lg leading-tight md:text-xl">{r.name}</span><span className="label block truncate text-[0.55rem] text-cream/60">{r.kicker} · {r.film ? 'Walk inside' : `${r.photos.length} photos`}</span></span>
                <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/70 text-[0.55rem] text-gold transition-colors group-hover:bg-gold group-hover:text-night">{r.film ? '▶' : '→'}</span>
              </span>
            </button>
          ))}
        </div>
      </FilmSection>

      {/* ─────────── POOL ─────────── */}
      <FilmSection onFull={setFull} id="pool" film={{ clip: 'pool-sunset' }} kicker="5,000 sq. ft. pool · rain dance" labelledBy="pool-title" title={<>Dive into <em className="text-cream/85">the moment.</em></>}>
        <div data-reveal className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
          {DAY.gold.prices.map((p) => (
            <div key={p.label}><p className="font-display text-4xl text-gold">{p.price}</p><p className="mt-1 text-xs text-cream/70">{p.label}</p></div>
          ))}
          <button type="button" onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} className="label border-b border-gold pb-1 text-gold">Gold day package →</button>
        </div>
      </FilmSection>

      {/* ─────────── ADVENTURE ─────────── */}
      <FilmSection onFull={setFull} id="adventure" film="adventure" kicker="2-acre park · 20+ activities" labelledBy="adventure-title" title={<>Adventure <em className="text-cream/85">is calling.</em></>}>
        <p data-reveal className="mt-6 max-w-2xl text-cream/80">{DAY.adventure.includes.slice(0, 8).join(' · ')} and more.</p>
        <div data-reveal className="mt-6 flex flex-wrap items-baseline gap-6">
          <p><span className="font-display text-4xl text-gold">{DAY.adventure.price}</span> <span className="text-sm text-cream/70">per person, add-on</span></p>
          <button type="button" onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} className="label border-b border-gold pb-1 text-gold">All activities →</button>
          <button type="button" onClick={() => { galleryStart.cat = 'Adventure'; openPage('photos') }} className="label border-b border-cream/50 pb-1 text-cream/85 hover:border-gold hover:text-gold">{ADVENTURE_MEDIA} →</button>
        </div>
      </FilmSection>

      {/* ─────────── PACKAGES ─────────── */}
      <section id="packages" aria-labelledby="packages-title" className="px-6 py-28 md:px-[6vw] md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p data-reveal className="label text-gold">Day packages</p>
            <h2 id="packages-title" data-reveal className="font-display mt-5 text-6xl font-light leading-[0.95] md:text-[4.6vw]">Make every moment <em>count.</em></h2>
            <p data-reveal className="mt-8 max-w-sm text-sm leading-relaxed text-cream/65">Day visits run {DAY.timings}. {DAY.groups}</p>
            <p data-reveal className="mt-6 max-w-sm border-l border-gold/40 pl-4 text-xs leading-relaxed text-cream/50">Published reference prices from the resort’s virtual tour, {DAY.taxNote}. Confirm with the resort before you visit.</p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <article data-reveal className="border-t border-gold/50 pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-4xl md:text-5xl">{DAY.gold.name}</h3>
                <span className="label text-cream/50">Per person</span>
              </div>
              <dl className="mt-8">
                {DAY.gold.prices.map((p) => (
                  <div key={p.label} className="flex items-baseline justify-between gap-4 border-b border-cream/10 py-4">
                    <dt className="text-sm text-cream/75">{p.label}{p.note && <span className="ml-2 text-xs text-cream/45">({p.note})</span>}</dt>
                    <dd className="font-display text-3xl text-gold">{p.price}</dd>
                  </div>
                ))}
              </dl>
              <p className="label mt-8 text-cream/50">Included</p>
              <p className="mt-3 text-[0.95rem] leading-loose text-cream/80">{DAY.gold.includes.join('  ·  ')}</p>
            </article>
            <article data-reveal className="mt-16 border-t border-gold/50 pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="font-display text-4xl md:text-5xl">{DAY.adventure.name}</h3>
                <p><span className="font-display text-3xl text-gold">{DAY.adventure.price}</span> <span className="text-sm text-cream/55">{DAY.adventure.unit}</span></p>
              </div>
              <p className="mt-6 text-[0.95rem] leading-loose text-cream/80">{DAY.adventure.includes.join('  ·  ')}</p>
            </article>
            <p data-reveal className="mt-10 text-sm text-cream/55">{DAY.extras.map((e) => `${e.label}: ${e.value}`).join(' · ')}</p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <a className="label bg-gold px-6 py-4 text-night hover:bg-cream" href={wa('Hello Vimal Resort, I would like to book a day package.')} target="_blank" rel="noreferrer">Book on WhatsApp</a>
              <a className="label border border-cream/30 px-6 py-4 text-cream hover:border-gold hover:text-gold" href={CONTACT.tel}>Call <span className="font-sans text-[0.8rem] font-medium normal-case tracking-normal tabular-nums">{CONTACT.phone}</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── AWARDS ─────────── */}
      <section id="awards" aria-labelledby="awards-title" className="border-y border-gold/15 px-6 py-24 md:px-[6vw] md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p data-reveal className="label inline-flex items-center gap-2.5 text-gold"><Laurel className="h-5 w-5 text-gold" /> Recognition</p>
            <h2 id="awards-title" data-reveal className="font-display mt-5 text-5xl font-light leading-[0.95] md:text-[4.2vw]">Award-winning, <em>year after year.</em></h2>
          </div>
          <button data-reveal type="button" onClick={() => { galleryStart.cat = 'Awards'; openPage('photos') }} className="label border-b border-gold pb-1 text-gold">See the awards →</button>
        </div>
        <ol data-reveal className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AWARDS.map((a) => (
            <li key={a.title} className="flex flex-col border border-cream/15 bg-cream/[0.03]">
              {a.photo
                ? <button type="button" onClick={() => { galleryStart.cat = 'Awards'; openPage('photos') }} className="block aspect-[4/3] overflow-hidden bg-night" aria-label={`See the ${a.by} award`}><img src={img(a.photo, true)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105" /></button>
                : <span aria-hidden className="grid aspect-[4/3] place-items-center bg-gold/[0.06]"><Laurel className="h-14 w-14 text-gold/70" /></span>}
              <div className="flex flex-1 flex-col p-5">
                <p className="font-display text-4xl text-gold">{a.year}</p>
                <p className="mt-3 font-display text-xl leading-snug text-cream">{a.title}</p>
                <p className="mt-3 text-xs leading-relaxed text-cream/55">{a.by}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─────────── PHOTO ZONES ─────────── */}
      <PhotoZones />

      {/* ─────────── VISIT ─────────── */}
      <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden">
        <div data-film className="relative min-h-svh overflow-hidden">
          <div data-film-inner className="absolute inset-0"><SectionFilm {...filmSrc('palms', visitSize)} /></div>
          <div className="absolute inset-0 bg-night/65" />
          <div className="relative flex min-h-svh flex-col justify-center px-6 py-32 md:px-[6vw]">
            <p data-reveal className="label text-gold">Visit</p>
            <h2 id="visit-title" data-reveal className="font-display mt-5 max-w-5xl text-6xl font-light leading-[0.95] md:text-[7vw]">Your story begins <em>at Vimal.</em></h2>
            <p data-reveal className="font-kn mt-6 text-2xl text-cream/80 md:text-3xl">{PROPERTY.kannadaName}</p>
            <div data-reveal className="mt-14 grid gap-10 text-sm md:grid-cols-3">
              <div>
                <p className="label mb-3 text-cream/50">Find us</p>
                <p className="leading-relaxed text-cream/85">{CONTACT.address}</p>
                <a className="mt-4 inline-block border-b border-gold pb-1 text-gold" href={CONTACT.maps} target="_blank" rel="noreferrer">Get directions →</a>
              </div>
              <div>
                <p className="label mb-3 text-cream/50">Talk to us</p>
                <a className="block font-sans text-2xl font-medium tracking-normal tabular-nums hover:text-gold" href={CONTACT.tel}>{CONTACT.phone}</a>
                <a className="mt-1 block text-cream/80" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                <div className="mt-4 flex gap-5">
                  <a className="border-b border-gold pb-1 text-gold" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp →</a>
                  <button type="button" className="border-b border-gold pb-1 text-gold" onClick={() => openPage('contact')}>Enquiry form →</button>
                </div>
              </div>
              <div>
                <p className="label mb-3 text-cream/50">Nearby <span className="normal-case tracking-normal text-cream/40">· by road</span></p>
                <ul className="space-y-1.5 text-cream/80">
                  {NEARBY.map((n) => <li key={n.place} className="flex justify-between gap-4 border-b border-cream/10 pb-1.5"><span>{n.place}</span><span className="tabular-nums text-cream/55">{n.km}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <footer className="relative flex flex-col gap-3 border-t border-cream/10 bg-night px-6 py-8 text-[0.7rem] text-cream/45 md:flex-row md:items-center md:justify-between md:px-[6vw]">
          <span className="flex items-center gap-4 text-cream/85"><Logo title={false} className="w-24" /><span className="font-kn text-sm text-cream/55">{PROPERTY.kannadaName}</span></span>
          <span>{PROPERTY.name} · Gadag, Karnataka · {CONTACT.instagramHandle}</span>
          <span>Day visits {DAY.timings}</span>
        </footer>
      </section>
      {full && <FullFilm film={full} onClose={() => setFull(null)} />}
    </div>
  )
}

/** Spots made for pictures: a framed set of glimpses; each plays its own short film (or shows a photo) and opens full screen. */
const SPAN = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  'lg:row-span-2',
  '', '', '', '', '', '',
  'lg:col-span-2', 'sm:col-span-2 lg:col-span-2',
]
function PhotoZones() {
  const [open, setOpen] = useState<number | null>(null)
  const items: GItem[] = PHOTO_ZONES.map((z) => z.clip
    ? { id: `z-${z.id}`, category: 'Photo zones', caption: `${z.name}: ${z.note}`, w: 1920, h: 1080, video: clip(z.clip).src, poster: clip(z.clip).poster }
    : { ...(byId[z.photo!] as GItem), caption: `${z.name}: ${z.note}` })
  return (
    <section id="photo-zones" aria-labelledby="zones-title" className="px-3 py-16 md:px-[3vw] md:py-24">
      <div className="relative border border-gold/35 px-4 pb-6 pt-14 md:px-10 md:pb-10 md:pt-20">
        <span aria-hidden className="pointer-events-none absolute inset-2 border border-gold/15 md:inset-3" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p data-reveal className="label text-gold">Photo zones</p>
          <h2 id="zones-title" data-reveal className="font-display mt-5 text-5xl font-light leading-[0.98] md:text-[4.6vw]">A place you’ll leave with <em>thousands of photos.</em></h2>
          <p data-reveal className="mx-auto mt-6 max-w-xl text-cream/70">Here are a few glimpses of the spots our guests love most, from the heart of lights and the lit gateway to the fountains, the cart wheels and the greenery.</p>
        </div>
        <ul className="relative mt-12 grid auto-rows-[15rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {PHOTO_ZONES.map((z, i) => (
            <li key={z.id} data-reveal className={SPAN[i] ?? ''}>
              <button type="button" onClick={() => setOpen(i)} className="group relative block h-full w-full overflow-hidden bg-cream/5 text-left" aria-label={`${z.name}: open full screen`}>
                {z.clip
                  ? <SectionFilm {...clip(z.clip, 'sm')} className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />
                  : <img src={img(z.photo!)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />}
                <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/5 to-transparent" />
                <span className="absolute inset-x-4 bottom-4">
                  <span className={`font-display block leading-tight text-cream ${i === 0 ? 'text-4xl' : 'text-2xl'}`}>{z.name}</span>
                  <span className={`mt-1 block text-sm text-cream/75 ${i === 0 || i === 1 ? '' : 'line-clamp-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100'}`}>{z.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open != null && <Lightbox items={items} index={open} setIndex={setOpen} />}
    </section>
  )
}
