/**
 * Phones only autoplay a video that is muted and inline, and some (iPhone Low
 * Power Mode, Android battery savers, data savers) refuse to autoplay at all.
 * prepVideo() sets the attributes those browsers check; safePlay() starts a
 * video and, if the device refuses, starts it on the visitor's first touch,
 * scroll or key press instead, and tells the page so it can offer a play button.
 */
export function prepVideo(v: HTMLVideoElement | null) {
  if (!v) return
  v.muted = true
  v.defaultMuted = true
  v.playsInline = true
  v.setAttribute('muted', '')
  v.setAttribute('playsinline', '')
  v.setAttribute('webkit-playsinline', '')
}

const waiting = new Set<HTMLVideoElement>()
const listeners = new Set<(blocked: boolean) => void>()
let armed = false
const notify = () => listeners.forEach((f) => f(waiting.size > 0))

function retryAll() {
  waiting.forEach((v) => {
    prepVideo(v)
    v.play().then(() => { waiting.delete(v); notify() }).catch(() => {})
  })
}
// Phones only let a page start a video from a real tap: on iPhone that means the end of
// a touch (touchend / pointerup / click), not touchstart or a scroll. Any swipe on the page
// ends in a touchend, so the film starts with the visitor's first touch of any kind.
const GESTURES = ['touchend', 'pointerup', 'click', 'keydown', 'pointerdown', 'scroll', 'wheel']
function arm() {
  if (armed) return
  armed = true
  const go = () => { retryAll(); if (waiting.size === 0) { GESTURES.forEach((e) => window.removeEventListener(e, go, true)); armed = false } }
  GESTURES.forEach((e) => window.addEventListener(e, go, { passive: true, capture: true }))
  document.addEventListener('visibilitychange', () => { if (!document.hidden) retryAll() })
}

export function safePlay(v: HTMLVideoElement | null | undefined) {
  if (!v) return
  prepVideo(v)
  const p = v.play()
  if (!p) return
  p.then(() => { if (waiting.delete(v)) notify() }).catch((err: DOMException) => {
    // only a refusal to autoplay needs the visitor; an interrupted play or a slow file does not
    if (!err || err.name !== 'NotAllowedError') return
    waiting.add(v); notify(); arm()
  })
}

/** forget a video that has been paused on purpose */
export function unwait(v: HTMLVideoElement | null | undefined) {
  if (v && waiting.delete(v)) notify()
}

export function onPlaybackBlocked(f: (blocked: boolean) => void) {
  listeners.add(f)
  return () => { listeners.delete(f) }
}
export const retryPlayback = retryAll

/**
 * Which encode of a full-screen film to load. A phone held upright shows only the
 * middle third of a landscape film, so it gets its own tall 9:16 copy ('pt') at full
 * sharpness instead of a small landscape file stretched to fill the screen.
 */
export function filmSize(): 'pt' | 'lg' {
  if (typeof window === 'undefined') return 'lg'
  return window.innerWidth < 900 && window.innerHeight > window.innerWidth ? 'pt' : 'lg'
}
