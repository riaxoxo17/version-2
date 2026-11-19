import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ROOMS } from '../data/rooms'
import { wa } from '../data/journey'

const base = import.meta.env.BASE_URL
export const roomFilm = (film: string) => ({
  src: `${base}media/rooms/${film}-${typeof window !== 'undefined' && window.innerWidth < 900 ? 'sm' : 'lg'}.mp4`,
  poster: `${base}media/rooms/${film}-poster.webp`,
})

/**
 * Full-screen walk-in: the room's film plays edge to edge (a path through the
 * grounds, the veranda, inside the room, the bathroom), with its details over it.
 */
export function RoomFilm({ id, onClose, onChange, onPhotos }: { id: string | null; onClose: () => void; onChange: (id: string) => void; onPhotos: (id: string) => void }) {
  const room = ROOMS.find((r) => r.id === id) ?? null
  const v = useRef<HTMLVideoElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const [progress, setProgress] = useState(0)
  const [info, setInfo] = useState(true)

  useEffect(() => {
    if (!room) return
    setProgress(0); setInfo(true)
    close.current?.focus({ preventScroll: true })
    const el = v.current
    if (el) { el.currentTime = 0; el.play().catch(() => {}) }
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.documentElement.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.documentElement.style.overflow = '' }
  }, [room, onClose])

  if (!room?.film) return null
  const f = roomFilm(room.film)
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${room.name}: walk-in film`} className="fixed inset-0 z-[70] bg-night">
      <video key={room.film} ref={v} src={f.src} poster={f.poster} muted playsInline autoPlay loop
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(12,10,8,0.55)_100%)]" />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night/90 via-night/40 to-transparent transition-opacity duration-700 ${info ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night/70 to-transparent" />

      {/* top bar: room switcher + close */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-7">
        <nav aria-label="Room types" className="flex gap-1 overflow-x-auto">
          {ROOMS.map((r) => (
            <button key={r.id} type="button" onClick={() => onChange(r.id)} aria-current={r.id === room.id}
              className={`label whitespace-nowrap border-b px-2 py-1.5 transition-colors ${r.id === room.id ? 'border-gold text-gold' : 'border-transparent text-cream/70 hover:text-cream'}`}>{r.name}</button>
          ))}
        </nav>
        <button ref={close} type="button" onClick={onClose} className="label shrink-0 bg-night/40 px-3 py-2 text-cream backdrop-blur hover:text-gold">Close ×</button>
      </div>

      {/* details */}
      <div className={`absolute inset-x-0 bottom-0 px-5 pb-8 transition-[opacity,transform] duration-700 md:px-10 md:pb-12 ${info ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="label text-gold">{room.kicker} · Walk inside</p>
            <h2 className="font-display mt-3 text-6xl font-light leading-none md:text-8xl">{room.name}</h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/80 md:text-base">{room.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {room.facts.map((x) => <li key={x.label} className="border border-cream/25 bg-night/30 px-3 py-1.5 text-xs text-cream/85 backdrop-blur-sm">{x.value}</li>)}
            </ul>
          </div>
          <div className="shrink-0 md:text-right">
            <p className="label text-[0.6rem] text-cream/55">{room.priceLabel}</p>
            <p className="font-display mt-1 text-4xl text-gold">{room.price ?? 'Enquire for rates'}</p>
            <div className="mt-5 flex flex-wrap gap-3 md:justify-end">
              <a href={wa(`Hello Vimal Resort, I'd like rates and availability for ${room.enquiry}.`)} target="_blank" rel="noreferrer" className="label bg-gold px-5 py-3.5 text-night hover:bg-cream">Check availability</a>
              <button type="button" onClick={() => onPhotos(room.id)} className="label border border-cream/35 bg-night/30 px-5 py-3.5 text-cream backdrop-blur hover:border-gold hover:text-gold">{room.photos.length} photos</button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <span className="block h-px flex-1 bg-cream/20"><span className="block h-full origin-left bg-gold" style={{ transform: `scaleX(${progress})` }} /></span>
          <button type="button" onClick={() => setInfo(false)} className="label text-[0.6rem] text-cream/60 hover:text-cream">Hide details</button>
        </div>
        <p className="mt-3 text-[0.62rem] text-cream/40">Filmed from the resort’s 360° virtual tour and photographs.</p>
      </div>
      {!info && (
        <button type="button" onClick={() => setInfo(true)} className="label absolute bottom-8 left-1/2 -translate-x-1/2 bg-night/50 px-4 py-2.5 text-cream backdrop-blur hover:text-gold">Show details</button>
      )}
    </div>,
    document.body,
  )
}
