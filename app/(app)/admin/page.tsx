import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { changeRoleAction, revokeUserSessionsAction } from '@/app/(app)/admin/actions'
import { ActionButton } from '@/components/forms/action-button'
import { PageSkeleton } from '@/components/site/page-skeleton'
import { button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { requireRole } from '@/lib/auth/dal'
import { fromNow, shortDate } from '@/lib/format'
import { ADMIN_PAGE_SIZE, listUsers } from '@/lib/users'
import { adminSearchSchema } from '@/lib/validation'

export const metadata: Metadata = { title: 'Admin' }

export default function AdminPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Admin searchParams={searchParams} />
    </Suspense>
  )
}

/** Builds /admin?q=…&page=… keeping the search when paging. */
function pageHref(q: string, page: number) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/admin?${query}` : '/admin'
}

async function Admin({ searchParams }: Pick<PageProps<'/admin'>, 'searchParams'>) {
  // requireRole redirects a non-admin (or an admin with an unconfirmed
  // email) before any user data is read.
  const { user: admin } = await requireRole('admin')
  const { q, page } = adminSearchSchema.parse(await searchParams)
  const { users, total } = await listUsers({ q, page })
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">Users</h1>
        <p className="mt-2 max-w-2xl text-muted">Every change made here is recorded in the audit log with your name. You can’t change your own role.</p>
      </div>

      {/* A plain GET form: the search lives in the URL, so it can be bookmarked and shared. */}
      <form action="/admin" className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1.5 block font-semibold">
            Search by name or email
          </label>
          <input id="q" name="q" type="search" defaultValue={q} maxLength={100} className="field block min-h-12 w-full px-3.5 text-base" />
        </div>
        <button type="submit" className={button.secondary}>
          <Icon name="search" />
          Search
        </button>
      </form>

      <p aria-live="polite" className="text-sm text-muted">
        {total === 0 ? 'No users found' : `${total} ${total === 1 ? 'user' : 'users'}${q ? ` matching “${q}”` : ''} · page ${page} of ${pages}`}
      </p>

      {users.length === 0 ? (
        <EmptyState title={q ? 'No one matches that search' : 'No users on this page'}>
          {q || page > 1 ? <Link href="/admin">Show everyone</Link> : null}
        </EmptyState>
      ) : (
        // `relative`: so screen-reader-only text inside can't escape the scroll box (a Day 12 lesson).
        <div className="relative overflow-x-auto rounded-card border border-line bg-raised shadow-card">
          <table className="w-full min-w-[52rem] text-left text-[0.95rem]">
            <caption className="sr-only">Users, newest first</caption>
            <thead className="bg-sunken text-sm">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">User</th>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                <th scope="col" className="px-4 py-3 font-semibold">Last sign-in</th>
                <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => {
                const isSelf = user.id === admin.id
                return (
                  <tr key={user.id} className="align-top">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <span className="font-semibold">{user.name}</span>
                      {isSelf ? <span className="ml-1.5 text-sm text-muted">(you)</span> : null}
                      <span className="block text-sm text-muted">Joined {shortDate(user.createdAt)}</span>
                    </th>
                    <td className="px-4 py-3">
                      <span className="break-all">{user.email}</span>
                      <span className={`block text-sm font-semibold ${user.emailVerifiedAt ? 'text-success' : 'text-warning'}`}>
                        {user.emailVerifiedAt ? '✓ Confirmed' : '! Not confirmed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'admin' ? <span className="rounded-pill bg-brass px-2.5 py-0.5 text-sm font-bold text-on-brass">Admin</span> : 'User'}
                    </td>
                    <td className="px-4 py-3">
                      {user.lastLoginAt ? fromNow(user.lastLoginAt) : <span className="text-muted">Never</span>}
                      <span className="block text-sm text-muted">
                        {user.activeSessions} active {user.activeSessions === 1 ? 'session' : 'sessions'}
                      </span>
                    </td>
                    <td className="space-y-2 px-4 py-3">
                      {isSelf ? null : (
                        <ActionButton action={changeRoleAction} fields={{ userId: user.id, role: user.role === 'admin' ? 'user' : 'admin' }}>
                          {user.role === 'admin' ? 'Make regular user' : 'Make admin'}
                        </ActionButton>
                      )}
                      {user.activeSessions > 0 && !isSelf ? (
                        <ActionButton action={revokeUserSessionsAction} fields={{ userId: user.id }} pendingLabel="Signing out…">
                          Sign out everywhere
                        </ActionButton>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between gap-2">
          {page > 1 ? (
            <Link href={pageHref(q, page - 1)} className={button.secondary}>
              <Icon name="chevronLeft" /> Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(q, page + 1)} className={button.secondary}>
              Next <Icon name="chevronRight" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  )
}
