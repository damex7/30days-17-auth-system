import type { Metadata } from 'next'
import Link from 'next/link'
import { KeyGlyph } from '@/components/brand/key'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Page not found' }

/** Any URL that matches no route. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-5 grid size-20 place-items-center rounded-full bg-door">
          <KeyGlyph className="h-6 w-12" />
        </span>
        <p className="font-semibold tracking-wide text-muted uppercase">404</p>
        <h1 className="mt-1 text-4xl">No door here</h1>
        <p className="mt-3 max-w-sm text-muted">This key doesn’t fit any lock: the address may be mistyped, or the page has moved.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={button.primary}>
            Home page
          </Link>
          <Link href="/dashboard" className={button.secondary}>
            Your dashboard
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
