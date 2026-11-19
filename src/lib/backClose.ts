import { useEffect, useRef } from 'react'

/**
 * Lets the device's own "back" close whatever is open: the browser Back button,
 * a two-finger swipe on a Mac trackpad, the Android back gesture/button, or an
 * edge swipe on iPhone.
 *
 * Each open overlay owns one history entry ({ d: depth }). Going back pops it,
 * and every overlay deeper than the new depth closes. Closing from the UI (a
 * close button, Esc) steps back through history so the entries stay in sync.
 * If one overlay closes and another opens in the same moment (e.g. the menu
 * opening a page), the new one takes over the entry instead of stacking a new one.
 */
let closing: number | null = null
const depthNow = () => (window.history.state && typeof window.history.state.d === 'number' ? window.history.state.d : 0)

export function useBackToClose(open: boolean, close: () => void, url?: string) {
  const closeRef = useRef(close)
  closeRef.current = close
  const my = useRef(0)
  const urlRef = useRef(url)

  // keep the address in step (e.g. switching from #rooms to #halls) without a new entry
  useEffect(() => {
    urlRef.current = url
    if (open && my.current && depthNow() === my.current && url !== undefined) window.history.replaceState({ d: my.current }, '', url)
  }, [url, open])

  useEffect(() => {
    if (!open) return
    if (closing !== null && depthNow() === closing) {
      my.current = closing
      closing = null
      window.history.replaceState({ d: my.current }, '', urlRef.current ?? window.location.href)
    } else {
      my.current = depthNow() + 1
      window.history.pushState({ d: my.current }, '', urlRef.current ?? window.location.href)
    }
    const d = my.current
    const onPop = (e: PopStateEvent) => {
      const now = e.state && typeof e.state.d === 'number' ? e.state.d : 0
      if (now < d) { my.current = 0; closeRef.current() }
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      if (my.current && depthNow() === d) {
        // closed from the UI: give the entry back, unless something opens straight away and takes it
        closing = d
        window.setTimeout(() => {
          if (closing === d) { closing = null; if (depthNow() === d) window.history.back() }
        }, 0)
      }
      my.current = 0
    }
  }, [open])
}
