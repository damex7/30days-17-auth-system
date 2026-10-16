// SIGNED-IN PAGES: header, account tabs, the "confirm your email" banner.
//
// The layout never awaits the session at its top level: that would hold
// every page behind the database. The tabs and the banner read it inside
// their own <Suspense> boundaries, and each page checks it again itself
// with verifySession(). (Layouts don't re-render on every navigation, so a
// check here alone would not protect the pages.)

import { Suspense } from 'react'
import { ResendVerificationForm } from '@/components/auth/verify-forms'
import { AppNav } from '@/components/site/app-nav'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { Notice } from '@/components/ui/notice'
import { getCurrentSession } from '@/lib/auth/dal'
import { rethrowNextErrors } from '@/lib/next-errors'

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <Suspense fallback={<div className="h-12 border-b border-line" />}>
        <AccountNav />
      </Suspense>
      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={null}>
          <VerifyBanner />
        </Suspense>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

/** The session, or null if it can't be read (the page's own check will report a database problem). */
async function sessionOrNull() {
  try {
    return await getCurrentSession()
  } catch (error) {
    rethrowNextErrors(error)
    return null
  }
}

async function AccountNav() {
  const current = await sessionOrNull()
  if (!current) return <div className="h-12 border-b border-line" />
  return <AppNav isAdmin={current.user.role === 'admin'} />
}

/** Unverified accounts can sign in, but see this until they confirm their address. */
async function VerifyBanner() {
  const current = await sessionOrNull()
  if (!current || current.user.emailVerifiedAt) return null
  return (
    <Notice tone="warning" title="Please confirm your email address" className="mb-8">
      <p>
        We sent a link to <strong className="break-all">{current.user.email}</strong>. Until you open it, the admin area stays locked.
      </p>
      <div className="mt-3">
        <ResendVerificationForm compact />
      </div>
    </Notice>
  )
}
