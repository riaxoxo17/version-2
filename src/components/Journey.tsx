import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ALL_IDS, DURATION } from '../data/journey'
import { filmSize, prepVideo, safePlay, unwait, useFilmSize } from '../lib/play'

/**
 * The whole site is one film. It plays on its own; scrolling moves the camera
 * forward or back (the page scroll position is the film's playhead).
 *  - auto:  the active clip plays natively; the page scroll follows it.
 *  - scrub: wheel / touch / key input hands control to the visitor; the film
 *           seeks to their scroll position, then resumes after a pause.
 * The route (scene order) can change at the fork without moving the playhead,
 * because every scene before the fork keeps its place.
 */
/**
 * The opening film is no longer driven by the scroll: it plays by itself in a one-screen
 * hero, and scrolling simply slides the page on to Weddings (and back). Kept as 0 so the
 * page's film-length maths (FILM_END) collapses to the hero.
 */
export const PX_PER_SEC = 0
const base = import.meta.env.BASE_URL
const src = (id: string, size: string) => `${base}media/scenes/${id}-${size}.mp4?v=2`
const poster = (id: string) => `${base}media/scenes/${id}-poster.webp?v=2`

export interface JourneyState {
  index: number
  id: string
  local: number
  progress: number
  playing: boolean
}

interface Props {
  route: string[]
  ready: () => void
  paused: boolean
  disabled: boolean
  onState: (s: JourneyState) => void
  jumpRef: React.MutableRefObject<((i: number) => void) | null>
  /** called once when the film finishes playing on its own */
  onEnd?: () => void
}

export function Journey({ route, ready, paused, disabled, onState, jumpRef, onEnd }: Props) {
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd
  const vids = useRef<Record<string, HTMLVideoElement | null>>({})
  const timeline = useMemo(() => {
    const starts: number[] = []
    let acc = 0
    route.forEach((id) => { starts.push(acc); acc += DURATION[id] })
    return { starts, total: acc }
  }, [route])
  const tl = useRef(timeline)
  tl.current = timeline
  const routeRef = useRef(route)
  routeRef.current = route

  const [activeId, setActiveId] = useState(route[0])
  const activeIdRef = useRef(route[0])
  const active = useRef(0)
  const mode = useRef<'auto' | 'scrub'>('auto')
  const pending = useRef<number | null>(null)
  const pausedRef = useRef(paused || disabled)
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  // turning the phone swaps in the matching film (tall or widescreen) at the same moment
  const sizeNow = useFilmSize()
  const size = useRef(filmSize())
  const resume = useRef<{ id: string; t: number; play: boolean } | null>(null)
  if (sizeNow !== size.current) {
    const v = vids.current[activeIdRef.current]
    resume.current = { id: activeIdRef.current, t: v?.currentTime ?? 0, play: !!v && !v.paused }
    size.current = sizeNow
  }
  const onMeta = (id: string, v: HTMLVideoElement) => {
    const r = resume.current
    if (!r || r.id !== id) return
    resume.current = null
    v.currentTime = r.t
    if (r.play) safePlay(v)
  }
  const readyFired = useRef(false)
  const last = useRef({ index: -1, local: -1, playing: false })

  const vidAt = (i: number) => vids.current[routeRef.current[i]]

  const emit = useCallback((index: number, local: number, playing: boolean) => {
    const l = last.current
    if (index === l.index && Math.abs(local - l.local) < 0.08 && playing === l.playing) return
    last.current = { index, local, playing }
    onState({ index, id: routeRef.current[index], local, progress: (tl.current.starts[index] + local) / tl.current.total, playing })
  }, [onState])

  const seek = (v: HTMLVideoElement, t: number) => {
    if (v.seeking) { pending.current = t; return }
    v.currentTime = t
  }

  const switchTo = useCallback((i: number, local: number, play: boolean) => {
    const id = routeRef.current[i]
    const v = vids.current[id]
    if (!v) return
    active.current = i
    if (id !== activeIdRef.current) {
      activeIdRef.current = id
      setActiveId(id)
      Object.entries(vids.current).forEach(([k, o]) => { if (o && k !== id) window.setTimeout(() => activeIdRef.current !== k && o.pause(), 900) })
    }
    seek(v, Math.max(0, Math.min(local, (v.duration || DURATION[id]) - 0.05)))
    if (play) safePlay(v)
    else { unwait(v); v.pause() }
  }, [])

  // the film is out of view once the hero has mostly scrolled away
  const pastFilm = () => window.scrollY > window.innerHeight * 0.85
  const goAuto = useCallback(() => {
    if (pausedRef.current || reduced.current || pastFilm()) return
    mode.current = 'auto'
    safePlay(vidAt(active.current))
  }, [])

  const takeControl = useCallback(() => {}, [])

  useEffect(() => {
    jumpRef.current = (i: number) => {
      window.scrollTo({ top: 0, behavior: 'auto' })
      const play = !pausedRef.current && !reduced.current
      switchTo(i, 0, play)
      mode.current = play ? 'auto' : 'scrub'
    }
  }, [jumpRef, switchTo])

  useEffect(() => {
    pausedRef.current = paused || disabled
    const v = vidAt(active.current)
    if (!v) return
    if (paused || disabled) { mode.current = 'scrub'; v.pause() } else goAuto()
  }, [paused, disabled, goAuto])

  useEffect(() => {
    const onInput = () => { if (!disabled) takeControl() }
    const onKey = (e: KeyboardEvent) => {
      if (!disabled && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) takeControl()
    }
    let lastY = window.scrollY
    let glide = 0
    const glideTo = (top: number) => {
      glide = window.setTimeout(() => { glide = 0 }, 900)
      window.scrollTo({ top, behavior: 'smooth' })
    }
    const onScroll = () => {
      if (disabled) return
      const y = window.scrollY
      const h = window.innerHeight
      const down = y > lastY
      lastY = y
      // one scroll in the hero slides the whole film away and brings the next section up, and back
      const nextEl = document.getElementById('weddings') as HTMLElement | null
      const next = nextEl ? nextEl.getBoundingClientRect().top + y : h
      if (!glide && y > 2 && y < next - 2) glideTo(down ? next : 0)
      const last = routeRef.current.length - 1
      if (y > h * 0.85) {
        vidAt(active.current)?.pause()
        emit(active.current, vidAt(active.current)?.currentTime ?? 0, false)
      } else if (y < h * 0.5 && mode.current === 'auto' && !pausedRef.current && !reduced.current) {
        const v = vidAt(active.current)
        if (v && v.paused && !(active.current === last && v.currentTime >= (v.duration || DURATION[routeRef.current[last]]) - 0.15)) safePlay(v)
      }
    }
    window.addEventListener('wheel', onInput, { passive: true })
    window.addEventListener('touchstart', onInput, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onInput)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [takeControl, switchTo, emit, disabled])

  useEffect(() => {
    const offs = Object.values(vids.current).map((v) => {
      if (!v) return null
      const h = () => { if (pending.current != null) { const t = pending.current; pending.current = null; v.currentTime = t } }
      v.addEventListener('seeked', h)
      return () => v.removeEventListener('seeked', h)
    })
    return () => offs.forEach((o) => o?.())
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const i = active.current
      const v = vidAt(i)
      if (v && mode.current === 'auto' && !pausedRef.current && !pastFilm()) {
        const d = v.duration || DURATION[routeRef.current[i]]
        if (v.currentTime >= d - 0.12 || v.ended) {
          if (i < routeRef.current.length - 1) switchTo(i + 1, 0, true)
          else { mode.current = 'scrub'; v.pause(); window.setTimeout(() => onEndRef.current?.(), 150) }
        }
        const j = active.current
        emit(j, vidAt(j)?.currentTime ?? 0, true)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [switchTo, emit])

  const onFirstReady = () => {
    if (readyFired.current) return
    readyFired.current = true
    window.scrollTo(0, 0)
    ready()
    if (reduced.current) { mode.current = 'scrub'; return }
    window.setTimeout(() => { mode.current = 'auto'; safePlay(vidAt(0)) }, 900)
  }
  useEffect(() => { const t = window.setTimeout(onFirstReady, 6000); return () => window.clearTimeout(t) })

  const ai = route.indexOf(activeId)
  const near = new Set([route[ai - 1], route[ai], route[ai + 1], route[ai + 2]])

  return (
    <>
      <div aria-hidden style={{ height: '100svh' }} />
      <div className="fixed inset-0 overflow-hidden bg-night" aria-hidden>
        {ALL_IDS.map((id) => (
          <video
            key={id}
            ref={(el) => { vids.current[id] = el; prepVideo(el) }}
            src={src(id, size.current)}
            poster={poster(id)}
            muted
            playsInline
            preload={near.has(id) ? 'auto' : 'none'}
            onCanPlay={id === route[0] ? onFirstReady : undefined}
            onLoadedMetadata={(e) => onMeta(id, e.currentTarget)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(.65,0,.35,1)] ${id === activeId ? 'scale-100 opacity-100 blur-0' : 'scale-[1.06] opacity-0 blur-[2px]'}`}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,rgba(255,196,120,0.16),transparent_60%)] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(12,10,8,0.62)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/75 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/55 to-transparent" />
        <div className="grain absolute -inset-1/2" />
      </div>
    </>
  )
}
