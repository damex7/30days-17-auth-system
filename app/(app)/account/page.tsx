import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import { ChangePasswordForm, DeleteAccountForm, ProfileForm } from '@/components/account/account-forms'
import { PageSkeleton } from '@/components/site/page-skeleton'
import { verifySession } from '@/lib/auth/dal'
import { shortDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Your account' }

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Account />
    </Suspense>
  )
}

async function Account() {
  const { user } = await verifySession()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">Your account</h1>
        <p className="mt-2 text-muted">Member since {shortDate(user.createdAt)}.</p>
      </div>

      <Section id="profile" title="Profile">
        <ProfileForm name={user.name} />
        <div className="mt-6 border-t border-line pt-5">
          <p className="font-semibold">Email address</p>
          <p className="mt-0.5 break-all">
            {user.email}{' '}
            <span className={user.emailVerifiedAt ? 'font-semibold text-success' : 'font-semibold text-warning'}>
              ({user.emailVerifiedAt ? 'confirmed' : 'not confirmed yet'})
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">Changing your email address isn’t available yet. When it is, it will need a confirmed address first.</p>
        </div>
      </Section>

      <Section id="password" title="Change password">
        <ChangePasswordForm email={user.email} name={user.name} />
      </Section>

      <Section id="delete" title="Delete account" danger>
        <p className="mb-5 text-muted">Deletes your account, signs out every device and cancels any email links. Your audit history is kept without your name.</p>
        <DeleteAccountForm />
      </Section>
    </div>
  )
}

function Section({ id, title, danger = false, children }: { id: string; title: string; danger?: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className={`max-w-2xl rounded-card border bg-raised p-5 shadow-card sm:p-7 ${danger ? 'border-danger' : 'border-line'}`}>
      <h2 id={`${id}-title`} className={`mb-5 text-2xl ${danger ? 'text-danger' : ''}`}>
        {title}
      </h2>
      {children}
    </section>
  )
}
