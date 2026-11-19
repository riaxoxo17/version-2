import { useCallback, useEffect, useRef, useState } from 'react'
import { Journey, PX_PER_SEC, type JourneyState } from './components/Journey'
import { Explore } from './components/Explore'
import { RoomFilm } from './components/RoomFilm'
import { PROPERTY } from './data/resort'
import { ContactPage, GalleryPage, HallsPage, PageShell, RoomsPage, type Page } from './components/Pages'
import { CONTACT, DURATION, ROUTE, SCENES } from './data/journey'

const FILM_END = ROUTE.reduce((t, id) => t + DURATION[id], 0) * PX_PER_SEC
const SECTIONS: [string, string][] = [['stay', 'Rooms'], ['tents', 'Nature tents'], ['pool', 'The pool'], ['adventure', 'Adventure park'], ['celebrate', 'Celebrations'], ['packages', 'Day packages'], ['visit', 'Visit']]

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
  const [page, setPage] = useState<Page | null>(readHash)
  const jump = useRef<((i: number) => void) | null>(null)

  const onState = useCallback((s: JourneyState) => setState(s), [])
  const ready = useCallback(() => { setLoaded(true); window.setTimeout(() => setGone(true), 1600) }, [])

  // pages live on plain #hashes (#rooms, #gallery, #contact)
  useEffect(() => {
    const on = () => setPage(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const openPage = (p: Page | null, anchor?: string) => {
    setMenu(false)
    if (p) location.hash = p
    else history.replaceState(null, '', location.pathname + location.search)
    setPage(p)
    if (p && anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
  }
  const [room, setRoom] = useState<string | null>(null)
  const [after, setAfter] = useState(false)
  useEffect(() => {
    const on = () => setAfter(window.scrollY > FILM_END + window.innerHeight * 0.2)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const toSection = (id: string) => { setMenu(false); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'auto' }), 50) }


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
  const lineOn = isFirst || isLast || (state.local > 0.6 && state.local < d - 0.9)

  const goTo = (id: string) => {
    const i = route.indexOf(id)
    if (i < 0) return
    jump.current?.(i)
  }

  return (
    <>
      <Journey route={route} ready={ready} paused={paused} disabled={page !== null || menu || room !== null} onState={onState} jumpRef={jump} />
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
                  <p className="label mb-7 text-cream/80">{s.kicker}</p>
                  <p className="font-display text-[min(22vw,30svh)] font-light leading-[0.82] tracking-[0.18em] text-cream [text-shadow:0_6px_60px_rgba(0,0,0,0.35)]">VIMAL</p>
                  <p className="font-kn mt-5 text-xl tracking-[0.08em] text-cream/85 md:text-2xl">{PROPERTY.kannadaName}</p>
                  <span className="my-6 block h-px w-16 bg-gold/80" />
                  <p className="font-display text-2xl italic text-cream/95 md:text-4xl">{s.line}</p>
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

      {/* ───────────── into the resort cue ───────────── */}
      <button type="button" onClick={() => toSection('stay')} tabIndex={isLast && !after ? 0 : -1}
        className={`label fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-cream/85 transition-all duration-1000 hover:text-gold ${isLast && loaded && !page && !after ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
        Scroll to explore the resort
        <span aria-hidden className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </button>

      {/* ───────────── header ───────────── */}
      <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-[opacity,background-color] duration-1000 md:px-10 md:py-8 ${after ? "bg-night/85 backdrop-blur-md md:py-6" : ""} ${loaded && !page ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button type="button" onClick={() => goTo('arrival')} className="font-display text-xl tracking-[0.42em] text-cream" aria-label="Vimal Resort: back to the start">VIMAL</button>
        <nav aria-label="Main" className="flex items-center gap-6 md:gap-9">
          {PAGES.map((p) => (
            <button key={p} type="button" onClick={() => openPage(p)} className="label hidden text-cream/85 hover:text-gold md:inline">{PAGE_LABEL[p]}</button>
          ))}
          <button type="button" onClick={() => setMenu(true)} className="label flex items-center gap-3 text-cream" aria-expanded={menu} aria-controls="chapters">
            Explore
            <span aria-hidden className="flex w-6 flex-col gap-[5px]"><span className="h-px bg-cream" /><span className="h-px w-4 bg-cream" /></span>
          </button>
        </nav>
      </header>

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
        className={`fixed inset-0 z-[45] overflow-y-auto bg-night/92 backdrop-blur-lg transition-opacity duration-700 ${menu ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <button type="button" onClick={() => setMenu(false)} className="label absolute right-6 top-7 text-cream md:right-10 md:top-9" tabIndex={menu ? 0 : -1}>Close</button>
        <div className="grid min-h-full gap-12 px-8 py-24 md:grid-cols-2 md:px-[10vw]">
          <ol className="flex flex-col justify-center gap-0.5">
            <li className="label mb-4 text-[0.6rem] text-gold">The film</li>
            {route.map((id) => (
              <li key={id}>
                <button type="button" tabIndex={menu ? 0 : -1} onClick={() => { setMenu(false); goTo(id) }}
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

      <RoomFilm id={room} onClose={() => setRoom(null)} onChange={setRoom} onPhotos={(id) => { setRoom(null); openPage('rooms', id) }} />

      {/* ───────────── preloader ───────────── */}
      {!gone && (
        <div role="status" aria-label="Loading" className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-night transition-opacity duration-[1400ms] ${loaded ? 'opacity-0' : 'opacity-100'}`}>
          <p className="font-display animate-[breathe_2.4s_ease-in-out_infinite] text-5xl font-light tracking-[0.5em] text-cream md:text-7xl">VIMAL</p>
          <p className="label mt-6 text-cream/45">Gadag · Karnataka</p>
        </div>
      )}
    </>
  )
}
