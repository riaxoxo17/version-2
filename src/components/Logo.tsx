import logo from '../assets/vimal-logo.svg?raw'

/** The resort's own wordmark ("Vimal Resort", gold dot over the i), as one inline SVG. */
export function Logo({ className = '', title = true }: { className?: string; title?: boolean }) {
  return <span role={title ? 'img' : undefined} aria-label={title ? 'Vimal Resort' : undefined} aria-hidden={title ? undefined : true} className={`logo-mark inline-block ${className}`} dangerouslySetInnerHTML={{ __html: logo.replace(' role="img" aria-label="Vimal Resort"', ' aria-hidden="true"') }} />
}

/** Award medal for the wedding award. */
export function Laurel({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M8.5 13.5 6 22l6-3 6 3-2.5-8.5" />
      <circle cx="12" cy="9" r="6.5" />
      <path d="m12 5.6 1.05 2.15 2.35.33-1.7 1.66.4 2.34L12 10.97l-2.1 1.11.4-2.34-1.7-1.66 2.35-.33z" fill="currentColor" stroke="none" />
    </svg>
  )
}
