import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DAY, NEARBY, PROPERTY } from '../data/resort'
import { HALLS, ROOMS } from '../data/rooms'
import { CONTACT, wa } from '../data/journey'
import type { Page } from './Pages'

gsap.registerPlugin(ScrollTrigger)

const base = import.meta.env.BASE_URL
const img = (id: string, thumb = false) => `${base}media/g/${id}${thumb ? '-t' : ''}.webp`
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const small = () => typeof window !== 'undefined' && window.innerWidth < 900

/** A film that loads as it approaches and plays only while on screen. */
export function SectionFilm({ src, poster, className = '' }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.preload = 'auto'; near.disconnect() } }, { rootMargin: '120% 0px' })
    const vis = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduced()) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.25 })
    near.observe(v); vis.observe(v)
    return () => { near.disconnect(); vis.disconnect() }
  }, [])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden className={`h-full w-full object-cover ${className}`} />
}
const sceneSrc = (id: string) => ({ src: `${base}media/scenes/${id}-${small() ? 'sm' : 'lg'}.mp4`, poster: `${base}media/scenes/${id}-poster.webp` })

function FilmSection({ id, film, kicker, title, children, labelledBy }: { id: string; film: string; kicker: string; title: React.ReactNode; children?: React.ReactNode; labelledBy: string }) {
  const f = sceneSrc(film)
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative">
      <div data-film className="relative min-h-[100svh] overflow-hidden">
        <div data-film-inner className="absolute inset-0 will-change-transform"><SectionFilm {...f} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/45" />
        <div className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-14 pt-28 md:px-[6vw] md:pb-20">
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
      {/* ─────────── ROOMS ─────────── */}
      <FilmSection id="stay" film="stay" kicker={`${PROPERTY.facts[1].value} luxury rooms · 15 nature tents`} labelledBy="stay-title" title={<>Find your place <em className="text-cream/85">to unwind.</em></>}>
        <div data-reveal className="mt-10 grid max-w-5xl gap-3 sm:grid-cols-3">
          {ROOMS.map((r) => (
            <button key={r.id} type="button" onClick={() => openRoom(r.id)} className="group relative flex items-center overflow-hidden border border-cream/20 bg-night/40 text-left backdrop-blur-md transition-colors hover:border-gold sm:block">
              <span className="block h-20 w-28 shrink-0 overflow-hidden sm:aspect-[16/9] sm:h-auto sm:w-full"><img src={img(r.photos[0], true)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" /></span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3.5">
                <span><span className="font-display block text-2xl">{r.name}</span><span className="label block text-[0.58rem] text-cream/60">Walk inside · film</span></span>
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/70 text-[0.6rem] text-gold transition-colors group-hover:bg-gold group-hover:text-night">▶</span>
              </span>
            </button>
          ))}
        </div>
      </FilmSection>

      {/* ─────────── TENTS ─────────── */}
      <FilmSection id="tents" film="tents" kicker="15 nature tents" labelledBy="tents-title" title={<>Sleep beneath <em className="text-cream/85">the trees.</em></>}>
        <p data-reveal className="mt-6 max-w-lg text-cream/80">Scalloped canvas cottages on the lawn, with hand-printed interiors and private steps, made for families and groups.</p>
        <button data-reveal type="button" onClick={() => openRoom('tent')} className="label mt-8 inline-flex items-center gap-3 bg-gold px-6 py-4 text-night hover:bg-cream">▶ Walk into a tent</button>
      </FilmSection>

      {/* ─────────── POOL ─────────── */}
      <FilmSection id="pool" film="pool" kicker="5,000 sq. ft. pool · rain dance" labelledBy="pool-title" title={<>Dive into <em className="text-cream/85">the moment.</em></>}>
        <div data-reveal className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
          {DAY.gold.prices.map((p) => (
            <div key={p.label}><p className="font-display text-4xl text-gold">{p.price}</p><p className="mt-1 text-xs text-cream/70">{p.label}</p></div>
          ))}
          <a href="#packages" className="label border-b border-gold pb-1 text-gold">Gold day package →</a>
        </div>
      </FilmSection>

      {/* ─────────── ADVENTURE ─────────── */}
      <FilmSection id="adventure" film="adventure" kicker="2-acre park · 20+ activities" labelledBy="adventure-title" title={<>Adventure <em className="text-cream/85">is calling.</em></>}>
        <p data-reveal className="mt-6 max-w-2xl text-cream/80">{DAY.adventure.includes.slice(0, 8).join(' · ')} and more.</p>
        <div data-reveal className="mt-6 flex flex-wrap items-baseline gap-6">
          <p><span className="font-display text-4xl text-gold">{DAY.adventure.price}</span> <span className="text-sm text-cream/70">per person, add-on</span></p>
          <a href="#packages" className="label border-b border-gold pb-1 text-gold">All activities →</a>
        </div>
      </FilmSection>

      {/* ─────────── CELEBRATIONS ─────────── */}
      <FilmSection id="celebrate" film="lawn" kicker="Weddings · receptions · parties" labelledBy="celebrate-title" title={<>Room for every <em className="text-cream/85">celebration.</em></>}>
        <div data-reveal className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
          {HALLS.map((h) => (
            <button key={h.id} type="button" onClick={() => openPage('halls', h.id)} className="group flex items-center gap-4 border border-cream/20 bg-night/40 p-3 text-left backdrop-blur-md transition-colors hover:border-gold">
              <img src={img(h.photos[0], true)} alt="" loading="lazy" className="h-16 w-24 shrink-0 object-cover" />
              <span className="min-w-0 flex-1"><span className="font-display block text-2xl">{h.name}</span><span className="block truncate text-xs text-cream/60">{h.facts.map((f) => f.value).join(' · ')}</span></span>
              <span aria-hidden className="text-xl text-gold transition-transform group-hover:translate-x-1">→</span>
            </button>
          ))}
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
              <a className="label border border-cream/30 px-6 py-4 text-cream hover:border-gold hover:text-gold" href={CONTACT.tel}>Call {CONTACT.phone}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── VISIT ─────────── */}
      <section id="visit" aria-labelledby="visit-title" className="relative overflow-hidden">
        <div data-film className="relative min-h-svh overflow-hidden">
          <div data-film-inner className="absolute inset-0"><SectionFilm {...sceneSrc('finale')} /></div>
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
                <a className="font-display block text-2xl" href={CONTACT.tel}>{CONTACT.phone}</a>
                <a className="mt-1 block text-cream/80" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                <div className="mt-4 flex gap-5">
                  <a className="border-b border-gold pb-1 text-gold" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp →</a>
                  <button type="button" className="border-b border-gold pb-1 text-gold" onClick={() => openPage('contact')}>Enquiry form →</button>
                </div>
              </div>
              <div>
                <p className="label mb-3 text-cream/50">Nearby</p>
                <ul className="space-y-1.5 text-cream/80">
                  {NEARBY.map((n) => <li key={n.place} className="flex justify-between gap-4 border-b border-cream/10 pb-1.5"><span>{n.place}</span><span className="tabular-nums text-cream/55">{n.km}</span></li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <footer className="relative flex flex-col gap-3 border-t border-cream/10 bg-night px-6 py-8 text-[0.7rem] text-cream/45 md:flex-row md:items-center md:justify-between md:px-[6vw]">
          <span className="font-display text-base tracking-[0.3em] text-cream/85">VIMAL <span className="font-kn ml-3 text-sm tracking-normal text-cream/55">{PROPERTY.kannadaName}</span></span>
          <span>{PROPERTY.name} · Gadag, Karnataka · {CONTACT.instagramHandle}</span>
          <span>Day visits {DAY.timings}</span>
        </footer>
      </section>
    </div>
  )
}
