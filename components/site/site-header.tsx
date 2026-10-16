import Link from 'next/link'
import { unstable_rethrow } from 'next/navigation'
import { Suspense } from 'react'
import { Logo } from '@/components/brand/key'
import { button } from '@/components/ui/button'
import { getCurrentSession } from '@/lib/auth/dal'
import { SignOutButton } from './sign-out-button'
import { ThemeToggle } from './theme-toggle'

/**
 * The header on every page. The logo and theme toggle are static; the
 * right-hand side depends on the session cookie, so it sits in <Suspense>
 * and streams in. The rest of the page never waits for it.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-page items-center gap-2 px-4 py-3 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Suspense fallback={<span className="skeleton block h-10 w-20 sm:w-48" />}>
            <AccountControls />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function AccountControls() {
  let current = null
  try {
    current = await getCurrentSession()
  } catch (error) {
    // Let Next.js's own control-flow signals through, then treat a database
    // problem as "signed out" here: the header shouldn't take the whole
    // public page down. Protected pages still fail loudly through their
    // error boundary.
    unstable_rethrow(error)
    console.error('[header] Could not read the session:', error)
  }

  if (!current) {
    return (
      <>
        <Link href="/login" className={`${button.ghost} px-3 whitespace-nowrap`}>
          Sign in
        </Link>
        <Link href="/signup" className={`${button.primary} px-3 whitespace-nowrap max-sm:hidden`}>
          Create account
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/dashboard" className={`${button.ghost} max-w-48 px-3 max-sm:hidden`}>
        <span className="truncate">{current.user.name}</span>
      </Link>
      <SignOutButton />
    </>
  )
}
