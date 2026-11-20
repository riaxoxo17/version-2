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
function arm() {
  if (armed) return
  armed = true
  const go = () => { retryAll(); if (waiting.size === 0) { ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'].forEach((e) => window.removeEventListener(e, go)); armed = false } }
  ;['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'].forEach((e) => window.addEventListener(e, go, { passive: true }))
}

export function safePlay(v: HTMLVideoElement | null | undefined) {
  if (!v) return
  prepVideo(v)
  const p = v.play()
  if (!p) return
  p.then(() => { if (waiting.delete(v)) notify() }).catch((err: DOMException) => {
    if (err && err.name === 'AbortError') return // interrupted by a newer play/pause: not a refusal
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
