import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useBackToClose } from '../lib/backClose'
import { prepVideo, safePlay } from '../lib/play'

export interface FullFilmSpec { title: string; srcs: string[]; poster?: string }

/**
 * Watch a film full screen, in widescreen. Must be opened from a tap: on Android the
 * page goes full screen and turns sideways by itself; an iPhone can't be turned by a
 * website, so there the film fills the screen and asks the visitor to turn the phone.
 */
export function enterLandscape() {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
  try {
    const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen?.(), undefined)
    const lock = () => { try { (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape')?.catch(() => {}) } catch { /* not supported */ } }
    if (p && typeof p.then === 'function') p.then(lock).catch(() => {})
    else lock()
  } catch { /* not supported: the visitor turns the phone */ }
}
function leaveLandscape() {
  try { (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.() } catch { /* ignore */ }
  try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) } catch { /* ignore */ }
}

export function FullFilm({ film, onClose }: { film: FullFilmSpec; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [upright, setUpright] = useState(() => window.innerHeight > window.innerWidth)
  const ref = useRef<HTMLVideoElement>(null)
  useBackToClose(true, onClose)
  useEffect(() => {
    const on = () => setUpright(window.innerHeight > window.innerWidth)
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('resize', on)
    window.addEventListener('keydown', key)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('keydown', key)
      document.documentElement.style.overflow = ''
      leaveLandscape()
    }
  }, [onClose])
  useEffect(() => { prepVideo(ref.current); safePlay(ref.current) }, [i])
  const last = film.srcs.length - 1
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={film.title} className="fixed inset-0 z-[95] flex items-center justify-center bg-black">
      <video ref={ref} key={film.srcs[i]} src={film.srcs[i]} poster={i === 0 ? film.poster : undefined} muted playsInline autoPlay
        loop={last === 0} onEnded={() => setI((n) => (n < last ? n + 1 : 0))} className="h-full w-full object-contain" />
      {upright && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[14svh] mx-auto flex w-max items-center gap-3 rounded-full border border-gold/50 bg-night/70 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-cream backdrop-blur">
          <RotateIcon /> Turn your phone sideways
        </p>
      )}
      <button type="button" onClick={onClose} autoFocus className="label absolute right-5 top-5 rounded-full bg-night/50 px-4 py-2 text-cream backdrop-blur hover:text-gold">Close ×</button>
    </div>,
    document.body,
  )
}

export function RotateIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`${className} rotate-hint-icon`} aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M3 9a9 9 0 0 1 3-4M21 15a9 9 0 0 1-3 4" />
      <path d="M2.5 5.5 6 5l.5 3.5M21.5 18.5 18 19l-.5-3.5" />
    </svg>
  )
}

/** the small "full screen" button shown on a film */
export function FullScreenButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); enterLandscape(); onClick() }}
      className={`label flex items-center gap-2 rounded-full border border-cream/40 bg-night/40 px-3.5 py-2 text-[0.62rem] text-cream backdrop-blur-md transition-colors hover:border-gold hover:text-gold ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5" aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
      Full screen
    </button>
  )
}
