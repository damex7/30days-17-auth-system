import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { KeyGlyph } from '@/components/brand/key'
import { PageSkeleton } from '@/components/site/page-skeleton'
import { Notice } from '@/components/ui/notice'
import { verifySession } from '@/lib/auth/dal'
import { fromNow, longDate } from '@/lib/format'
import { describeUserAgent } from '@/lib/user-agent'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage({ searchParams }: PageProps<'/dashboard'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  )
}

const NOTICES: Record<string, { tone: 'success' | 'warning'; title: string; body: string }> = {
  verified: { tone: 'success', title: 'Email address confirmed', body: 'Thank you. Everything is unlocked.' },
  'password-reset': { tone: 'success', title: 'Password changed', body: 'Every other device was signed out. This one has a brand-new session.' },
  admin: { tone: 'warning', title: 'That area is for admins only', body: 'You were sent here instead. The server checked your role, not just the link.' },
  verify: { tone: 'warning', title: 'Confirm your email first', body: 'The admin area opens once your email address is confirmed.' },
}

/**
 * A simple protected page that shows the protection working: it calls
 * verifySession(), and prints what the server knows about this session.
 */
async function Dashboard({ searchParams }: Pick<PageProps<'/dashboard'>, 'searchParams'>) {
  const { user, session } = await verifySession()
  const params = await searchParams
  const key = [params.notice, params.denied].flat().find((value) => value && value in NOTICES)
  const notice = key ? NOTICES[key] : undefined

  return (
    <div className="space-y-8">
      {notice ? (
        <Notice tone={notice.tone} title={notice.title}>
          <p>{notice.body}</p>
        </Notice>
      ) : null}

      <div>
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">Signed in as</p>
        <h1 className="mt-1 text-4xl break-words">{user.name}</h1>
      </div>

      <section aria-labelledby="who" className="overflow-hidden rounded-card border border-line bg-raised shadow-card">
        <div className="flex items-center gap-3 bg-door px-5 py-3 text-brass">
          <KeyGlyph className="text-brass" />
          <h2 id="who" className="font-sans text-base font-bold text-white">
            What the server knows about you right now
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
          <Item label="Email">
            <span className="break-all">{user.email}</span>{' '}
            {user.emailVerifiedAt ? (
              <span className="ml-1 inline-flex items-center rounded-pill bg-success-soft px-2 text-sm font-semibold text-success">Confirmed</span>
            ) : (
              <span className="ml-1 inline-flex items-center rounded-pill bg-warning-soft px-2 text-sm font-semibold text-warning">Not confirmed</span>
            )}
          </Item>
          <Item label="Role">
            <span className={user.role === 'admin' ? 'rounded-pill bg-brass px-2.5 py-0.5 font-semibold text-on-brass' : 'font-semibold'}>
              {user.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </Item>
          <Item label="This session started">{longDate(session.createdAt)}</Item>
          <Item label="This session expires">
            {longDate(session.expiresAt)} <span className="text-muted">({fromNow(session.expiresAt)})</span>
          </Item>
          <Item label="Device">{describeUserAgent(session.userAgent)}</Item>
          <Item label="Location">{session.location ?? 'Unknown'}</Item>
        </dl>
      </section>

      <section aria-labelledby="how" className="max-w-3xl space-y-3 text-[0.98rem]">
        <h2 id="how" className="text-2xl">
          How this page knows it’s you
        </h2>
        <p>
          Your browser sent a cookie holding a random key. The server hashed it with SHA-256, found the matching row in the <code>sessions</code> table,
          and joined your account to it. Because you used it within the last 15 days of its life, the expiry slid forward to 30 days from now.
        </p>
        <p>
          Revoke this session from <Link href="/account/sessions" className="font-semibold text-teal underline">Sessions</Link> on another device,
          and the next request from this one goes straight to the sign-in page: there is nothing in the cookie that works on its own.
        </p>
      </section>
    </div>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
