import Link from 'next/link'
import { cn } from '@/lib/cn'
import { site } from '@/lib/site'

/*
  THE KEY MOTIF, drawn by hand as SVG paths (no icon pack).

  An old warded door key, side on, in a 64×32 box:
    - the BOW (the ring you hold): an outer circle with a round hole,
      drawn as one path with fill-rule="evenodd" so the hole is see-through;
    - a COLLAR where the bow meets the shaft;
    - the SHAFT;
    - the BIT at the end, with two steps cut into it (the wards that make
      this key fit only its own lock).
*/
function KeyShape() {
  return (
    <g fill="currentColor">
      <path fillRule="evenodd" d="M3 16a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z M8.6 16a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0Z" />
      <rect x="22" y="12.5" width="3.2" height="7" rx="1" />
      <rect x="24" y="14.2" width="35" height="3.6" rx="1.2" />
      <path d="M45 17.5h13.5v8.5h-4v-3.5h-3v5.5h-3.5v-5h-3Z" />
    </g>
  )
}

/** The key on its own, in brass, e.g. beside headings. */
export function KeyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" aria-hidden className={cn('h-4 w-8 text-brass', className)}>
      <KeyShape />
    </svg>
  )
}

/** The logo mark: a brass key resting across an arched teal door. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn('size-9 shrink-0', className)}>
      <path d="M6 39V17.5a14 14 0 0 1 28 0V39Z" className="fill-door" />
      {/* Two panels, like a real door. */}
      <path d="M11 35v-9h7v9Zm11 0v-9h7v9Z" className="fill-none stroke-brass/35" strokeWidth="1" />
      <g className="text-brass" transform="translate(1.5 9.5) scale(0.58)">
        <KeyShape />
      </g>
    </svg>
  )
}

/** Mark + wordmark, linking home. */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-control no-underline">
      <LogoMark />
      <span className="font-display text-2xl leading-none font-semibold tracking-tight text-ink">{site.name}</span>
    </Link>
  )
}

/**
 * The landing page illustration: a tall teal door with a brass escutcheon
 * (the plate around the keyhole) and the key sliding towards the lock. The
 * key's animation is switched off for reduced-motion users by the
 * global rule in globals.css.
 */
export function DoorIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 300" aria-hidden className={cn('w-full max-w-60', className)}>
      {/* Frame and door */}
      <path d="M30 296V110a90 90 0 0 1 180 0v186" className="fill-none stroke-line-strong" strokeWidth="3" />
      <path d="M42 296V112a78 78 0 0 1 156 0v184Z" className="fill-door" />
      {/* Panels */}
      <path d="M62 160v-42a58 58 0 0 1 116 0v42Z M62 280v-96h52v96Z M126 280v-96h52v96Z" className="fill-none stroke-brass/30" strokeWidth="2" />
      {/* Studs along the arch */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angle = Math.PI * (1 - i / 6)
        return <circle key={i} cx={120 + 68 * Math.cos(angle)} cy={112 - 68 * Math.sin(angle)} r="2.6" className="fill-brass/70" />
      })}
      {/* Escutcheon and keyhole */}
      <rect x="150" y="186" width="22" height="44" rx="11" className="fill-brass" />
      <path d="M161 196a5 5 0 0 1 3 9l2 13h-10l2-13a5 5 0 0 1 3-9Z" className="fill-door" />
      {/* The key, on its way to the lock */}
      <g className="text-brass-bright motion-safe:animate-insert">
        <g transform="translate(26 174) scale(2)">
          <KeyShape />
        </g>
      </g>
    </svg>
  )
}
