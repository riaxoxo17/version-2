import { useCallback, useEffect, useRef, useState } from 'react'
import { Journey, PX_PER_SEC, type JourneyState } from './components/Journey'
import { Explore } from './components/Explore'
import { RoomFilm } from './components/RoomFilm'
import { useBackToClose } from './lib/backClose'
import { isUprightTouch, onPlaybackBlocked, retryPlayback, useFilmSize } from './lib/play'
import { FullFilm, FullScreenButton, RotateIcon } from './components/FullFilm'
import { PROPERTY, WEDDING } from './data/resort'
import { Laurel, Logo } from './components/Logo'
import { ContactPage, GalleryPage, HallsPage, PageShell, RoomsPage, type Page } from './components/Pages'
import { CONTACT, DURATION, ROUTE, SCENES, TITLE_OUT } from './data/journey'

const FILM_END = ROUTE.reduce((t, id) => t + DURATION[id], 0) * PX_PER_SEC
const SECTIONS: [string, string][] = [['weddings', 'Weddings'], ['stay', 'Rooms & tents'], ['pool', 'The pool'], ['adventure', 'Adventure park'], ['packages', 'Day packages'], ['awards', 'Awards'], ['photo-zones', 'Photo zones'], ['visit', 'Visit']]

const PAGES: Page[] = ['rooms', 'halls', 'photos', 'contact']
const PAGE_LABEL: Record<Page, string> = { rooms: 'Rooms', halls: 'Halls', photos: 'Photos', contact: 'Contact' }
const readHash = (): Page | null => {
  const h = location.hash.slice(1) === 'gallery' ? 'photos' : location.hash.slice(1)
  return (PAGES as string[]).includes(h) ? (h as Page) : null
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [gone, setGone] = useState(false)
  const route = ROUTE
  const [state, setState] = useState<JourneyState>({ index: 0, id: 'arrival', local: 0, progress: 0, playing: false })
  const [paused, setPaused] = useState(false)
  const [menu, setMenu] = useState(false)
  // a link straight to #rooms etc. opens that page on top of the home page, so Back returns home
  const [page, setPage] = useState<Page | null>(() => {
    const p = readHash()
    // any address #fragment (a page or an old section link) is cleared so the visit starts at the film
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search)
    return p
  })
  const jump = useRef<((i: number) => void) | null>(null)

  const onState = useCallback((s: JourneyState) => setState(s), [])
  const ready = useCallback(() => { setLoaded(true); window.setTimeout(() => setGone(true), 1600) }, [])

  // an in-site link to #rooms, #halls… opens that page too
  useEffect(() => {
    const on = () => {
      const p = readHash()
      if (!p || (window.history.state && typeof window.history.state.d === 'number')) return
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
      setPage(p)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const openPage = (p: Page | null, anchor?: string) => {
    setMenu(false)
    if (p) setRoom(null)
    setPage(p)
    if (p && anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
  }
  const [room, setRoom] = useState<string | null>(null)
  // some phones (Low Power Mode, battery or data savers) refuse to autoplay: offer a play button
  const [blocked, setBlocked] = useState(false)
  // on a phone held upright, suggest turning it for the widescreen film (once per visit, for a few seconds)
  const filmSz = useFilmSize()
  const [turnHint, setTurnHint] = useState(() => { try { return !sessionStorage.getItem('vr-turn') } catch { return true } })
  const [full, setFull] = useState(false)
  useEffect(() => {
    if (!gone || !turnHint) return
    const t = window.setTimeout(() => { setTurnHint(false); try { sessionStorage.setItem('vr-turn', '1') } catch { /* private mode */ } }, 9000)
    return () => window.clearTimeout(t)
  }, [gone, turnHint])
  useEffect(() => onPlaybackBlocked(setBlocked), [])
  // the device's back (swipe, back button, gesture) closes whatever is open, innermost first
  useBackToClose(page !== null, () => setPage(null), page ? `#${page}` : undefined)
  useBackToClose(room !== null, () => setRoom(null), room ? `#room-${room}` : undefined)
  useBackToClose(menu, () => setMenu(false))
  const [after, setAfter] = useState(false)
  useEffect(() => {
    const on = () => setAfter(window.scrollY > FILM_END + window.innerHeight * 0.2)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const toSection = (id: string) => { setMenu(false); setPage(null); setRoom(null); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'auto' }), 50) }


  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    if (!menu) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [menu])

  const scene = SCENES[state.id] ?? SCENES.arrival
  const d = DURATION[state.id]
  const isFirst = state.index === 0
  const isLast = state.index === route.length - 1
  // the title shows while the drone flies in, then clears so the real gate sign takes over
  const lineOn = state.id === 'arrival' ? state.local < TITLE_OUT : isFirst || isLast || (state.local > 0.6 && state.local < d - 0.9)

  const goTo = (id: string) => {
    const i = route.indexOf(id)
    if (i < 0) return
    jump.current?.(i)
  }

  return (
    <>
      <Journey route={route} ready={ready} paused={paused} disabled={page !== null || menu || room !== null || full} onState={onState} jumpRef={jump} onEnd={() => {
        const el = document.getElementById('weddings')
        if (el && !page && !menu && !room) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
      }} />
      <Explore openPage={openPage} openRoom={setRoom} />

      {/* ───────────── copy ───────────── */}
      <main className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-6 text-center">
        <h1 className="sr-only">Vimal Resort & Entertainment Park, Gadag</h1>
        {route.map((id, i) => {
          const s = SCENES[id]
          const on = i === state.index && lineOn && gone && !page && !after
          return (
            <section key={id} aria-hidden={!on} className={`absolute inset-x-6 flex flex-col items-center ${s.pos === 'top' ? 'top-[16svh]' : ''} transition-all duration-[1300ms] ease-[cubic-bezier(.22,1,.36,1)] ${on ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-4 opacity-0 blur-[6px]'}`}>
              {id === 'arrival' ? (
                <>
                  <p className="label title-sub mb-6 text-cream">{s.kicker}</p>
                  <Logo className="logo-hero w-[min(74vw,62svh)]" />
                  <p className="font-kn title-sub mt-4 text-xl tracking-[0.06em] text-cream md:text-2xl">{PROPERTY.kannadaName}</p>
                  <span className="my-5 block h-px w-16 bg-gold/80" />
                  <p className="font-display title-sub text-2xl italic text-cream md:text-4xl">{s.line}</p>
                  <p className="title-sub mt-6 flex items-center gap-2.5 rounded-full border border-gold/50 bg-night/35 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-cream backdrop-blur-sm md:text-xs">
                    <Laurel className="h-5 w-5 shrink-0 text-gold" />
                    <span>{WEDDING.award}<span className="hidden text-cream/65 sm:inline"> · {WEDDING.awardBy}</span></span>
                  </p>
                </>
              ) : (
                <>
                  <p className="label mb-6 text-cream/75">{s.kicker}</p>
                  <h2 className="font-display max-w-[16ch] text-[2.9rem] font-light leading-[1.02] text-cream [text-shadow:0_4px_50px_rgba(0,0,0,0.4)] md:text-[5.6vw]">{s.line}</h2>
                  {s.cta && (
                    <a href={s.cta.href} target={s.cta.href.startsWith('#') ? undefined : '_blank'} rel="noreferrer" tabIndex={on ? 0 : -1}
                      className={`label mt-9 border-b ${on ? 'pointer-events-auto' : 'pointer-events-none'} border-gold/70 pb-1.5 text-gold transition-colors hover:border-cream hover:text-cream`}>
                      {s.cta.label}
                    </a>
                  )}
                </>
              )}
            </section>
          )
        })}
      </main>

      {/* ───────────── play button, only if the device blocked autoplay ───────────── */}
      {blocked && gone && !page && !room && !menu && (
        <button type="button" onClick={() => retryPlayback()} className="fixed bottom-[11svh] left-1/2 z-[35] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-gold bg-night/60 py-1.5 pl-1.5 pr-4 text-cream backdrop-blur-md md:bottom-[9svh]">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-gold text-[0.6rem] text-night">▶</span>
          <span className="label whitespace-nowrap text-[0.62rem]">Tap to play the film</span>
        </button>
      )}

      {/* ───────────── phones held upright: turn sideways, or watch full screen ───────────── */}
      {turnHint && !blocked && gone && filmSz === 'pt' && isUprightTouch() && !page && !room && !menu && !after && (
        <div className="fixed bottom-[11svh] left-1/2 z-[35] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-gold/60 bg-night/60 py-1.5 pl-4 pr-1.5 text-cream backdrop-blur-md">
          <RotateIcon className="h-4 w-4 text-gold" />
          <span className="label text-[0.6rem]">Turn sideways</span>
          <FullScreenButton onClick={() => { setTurnHint(false); setFull(true) }} className="!py-1.5" />
        </div>
      )}
      {full && <FullFilm film={{ title: 'Vimal Resort', srcs: route.map((id) => `${import.meta.env.BASE_URL}media/scenes/${id}-lg.mp4?v=6`), poster: `${import.meta.env.BASE_URL}media/scenes/${route[0]}-poster.webp` }} onClose={() => setFull(false)} />}

      {/* ───────────── into the resort cue ───────────── */}
      <button type="button" onClick={() => toSection('weddings')} tabIndex={isLast && !after ? 0 : -1}
        className={`label fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-cream/85 transition-all duration-1000 hover:text-gold ${isLast && loaded && !page && !after ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
        Scroll to explore the resort
        <span aria-hidden className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </button>

      {/* ───────────── header ───────────── */}
      {/* Explore on the left (it turns into Close in the same spot), logo in the middle, Contact us always on the right */}
      <header className={`fixed inset-x-0 top-0 z-[80] grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 transition-[opacity,background-color] duration-1000 md:px-10 md:py-7 ${(after || page || room) && !menu ? "bg-night/85 backdrop-blur-md md:py-5" : ""} ${loaded ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <nav aria-label="Main" className="flex items-center gap-7 justify-self-start">
          <button type="button" onClick={() => { setRoom(null); setMenu((m) => !m) }} className="label flex items-center gap-3 text-cream hover:text-gold" aria-expanded={menu} aria-controls="chapters">
            {menu
              ? <span aria-hidden className="relative block h-4 w-6"><span className="absolute inset-x-0 top-1/2 h-px rotate-45 bg-current" /><span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-current" /></span>
              : <span aria-hidden className="flex w-6 flex-col gap-[5px]"><span className="h-px bg-current" /><span className="h-px w-4 bg-current" /></span>}
            {menu ? 'Close' : 'Explore'}
          </button>
          {!menu && PAGES.filter((p) => p !== 'contact').map((p) => (
            <button key={p} type="button" onClick={() => openPage(p)} className="label hidden text-cream/85 hover:text-gold lg:inline">{PAGE_LABEL[p]}</button>
          ))}
        </nav>
        <button type="button" onClick={() => { setMenu(false); setPage(null); setRoom(null); window.setTimeout(() => goTo('arrival'), 30) }} className="block w-[80px] justify-self-center text-cream md:w-[104px]" aria-label="Vimal Resort: back to the start"><Logo title={false} /></button>
        <button type="button" onClick={() => openPage('contact')} className="label justify-self-end whitespace-nowrap border border-gold/70 px-3.5 py-2 text-[0.62rem] text-cream transition-colors hover:bg-gold hover:text-night md:px-5 md:py-2.5 md:text-[0.68rem]">Contact us</button>
      </header>

      {/* a way to the contact page from every section and page */}
      <button type="button" onClick={() => openPage('contact')} aria-label="Contact us"
        className={`fixed bottom-5 right-5 z-[48] flex items-center gap-2.5 rounded-full bg-gold py-2.5 pl-3 pr-4 text-night shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-500 hover:bg-cream md:bottom-8 md:right-8 ${(after || (page && page !== 'contact')) && !menu && !room ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
        <span className="label text-[0.62rem]">Contact us</span>
      </button>

      {/* ───────────── footer: progress ───────────── */}
      <footer className={`fixed inset-x-0 bottom-0 z-30 flex items-end justify-between gap-6 px-6 pb-6 transition-opacity duration-1000 md:px-10 md:pb-8 ${loaded && !isLast && !page && !after ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="min-w-0">
          <p className="label text-[0.62rem] text-cream/70"><span className="text-gold">{String(state.index + 1).padStart(2, '0')}</span> — {scene.chapter}</p>
          <span className="mt-3 block h-px w-40 bg-cream/20 md:w-64"><span className="block h-full origin-left bg-gold" style={{ transform: `scaleX(${state.progress})` }} /></span>
        </div>
        <p className="label hidden text-[0.6rem] text-cream/55 md:block">{state.playing ? 'Scroll to move through the resort' : 'Paused, resumes in a moment'}</p>
        <button type="button" onClick={() => setPaused((p) => !p)} className="label pointer-events-auto flex h-10 items-center gap-2 border border-cream/25 px-4 text-cream/80 hover:border-gold hover:text-gold" aria-label={paused ? 'Play the film' : 'Pause the film'}>
          <span aria-hidden className="text-[0.6rem]">{paused ? '▶' : '❚❚'}</span>
        </button>
      </footer>

      {/* ───────────── explore menu ───────────── */}
      <div id="chapters" role="dialog" aria-modal="true" aria-label="Explore"
        className={`fixed inset-0 z-[78] overflow-y-auto bg-night/92 backdrop-blur-lg transition-opacity duration-700 ${menu ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="grid min-h-full gap-12 px-8 py-24 md:grid-cols-2 md:px-[10vw]">
          <ol className="flex flex-col justify-center gap-0.5">
            <li className="label mb-4 text-[0.6rem] text-gold">The film</li>
            {route.map((id) => (
              <li key={id}>
                <button type="button" tabIndex={menu ? 0 : -1} onClick={() => { setMenu(false); setPage(null); setRoom(null); goTo(id) }}
                  className={`group text-left font-display text-3xl font-light transition-colors md:text-[2.6rem] ${id === state.id ? 'text-gold' : 'text-cream/85 hover:text-cream'}`}>
                  <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">{SCENES[id].chapter}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex flex-col justify-center gap-2">
            <p className="label mb-4 text-[0.6rem] text-gold">The resort</p>
            {SECTIONS.map(([id, l]) => (
              <button key={id} type="button" tabIndex={menu ? 0 : -1} onClick={() => toSection(id)} className="group text-left font-display text-2xl font-light text-cream/85 hover:text-gold md:text-3xl">
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">{l}</span>
              </button>
            ))}
            <p className="label mb-4 mt-10 text-[0.6rem] text-gold">Plan</p>
            {([['rooms', 'Rooms & Tents'], ['halls', 'Halls & Lawns'], ['photos', 'Photos'], ['contact', 'Contact']] as [Page, string][]).map(([p, l]) => (
              <button key={p} type="button" tabIndex={menu ? 0 : -1} onClick={() => openPage(p)} className="group text-left font-display text-4xl font-light text-cream hover:text-gold md:text-6xl">
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">{l}</span>
              </button>
            ))}
            <p className="mt-10 text-sm text-cream/55"><a href={CONTACT.tel} className="hover:text-gold" tabIndex={menu ? 0 : -1}>{CONTACT.phone}</a> · <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="hover:text-gold" tabIndex={menu ? 0 : -1}>WhatsApp</a></p>
          </div>
        </div>
      </div>

      {/* ───────────── pages ───────────── */}
      <PageShell page={page} onClose={() => openPage(null)}>
        {page === 'rooms' && <RoomsPage onWalk={setRoom} />}
        {page === 'halls' && <HallsPage />}
        {page === 'photos' && <GalleryPage />}
        {page === 'contact' && <ContactPage />}
      </PageShell>

      <RoomFilm id={room} onClose={() => setRoom(null)} onChange={setRoom} />

      {/* ───────────── preloader ───────────── */}
      {!gone && (
        <div role="status" aria-label="Loading" className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-night transition-opacity duration-[1400ms] ${loaded ? 'opacity-0' : 'opacity-100'}`}>
          <Logo className="w-[min(60vw,320px)] animate-[breathe_2.4s_ease-in-out_infinite] text-cream" />
          <p className="label mt-6 text-cream/45">Gadag · Karnataka</p>
        </div>
      )}
    </>
  )
}
