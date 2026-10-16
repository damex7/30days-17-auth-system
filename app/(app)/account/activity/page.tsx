import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageSkeleton } from '@/components/site/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { verifySession } from '@/lib/auth/dal'
import { EVENT_LABELS, WARNING_EVENTS } from '@/lib/auth/event-types'
import { listEventsForUser } from '@/lib/auth/events'
import { longDate } from '@/lib/format'
import { describeUserAgent } from '@/lib/user-agent'

export const metadata: Metadata = { title: 'Recent activity' }

export default function ActivityPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Activity />
    </Suspense>
  )
}

/** Turns an event's metadata into a short, human sentence. */
function detail(type: string, metadata: Record<string, unknown>, actorName: string | null): string | null {
  const by = actorName ? ` by ${actorName}` : ''
  if (type === 'role_changed') return `From ${String(metadata.from)} to ${String(metadata.to)}${by}`
  if (type === 'session_revoked') {
    if (metadata.scope === 'all') return `All sessions${by} (${String(metadata.count)})`
    if (metadata.scope === 'others') return `Every other session (${String(metadata.count)})`
    return `One session${by}`
  }
  if (type === 'logged_in' && metadata.via === 'password_reset') return 'Right after a password reset'
  if (type === 'password_reset' && typeof metadata.sessionsEnded === 'number') return `${metadata.sessionsEnded} ${metadata.sessionsEnded === 1 ? 'session' : 'sessions'} signed out`
  return by ? by.trim() : null
}

async function Activity() {
  const { user } = await verifySession()
  const events = await listEventsForUser(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">Recent activity</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Your last 50 security events, newest first. A failed sign-in you don’t recognise means someone tried your email address: a strong password and
          the rate limit keep them out.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState title="No activity yet">Sign-ins and changes to your account will appear here.</EmptyState>
      ) : (
        <ol className="max-w-3xl divide-y divide-line overflow-hidden rounded-card border border-line bg-raised shadow-card">
          {events.map((event) => {
            const warn = WARNING_EVENTS.has(event.type)
            const extra = detail(event.type, event.metadata, event.actorName)
            return (
              <li key={event.id} className="flex gap-3 p-4 sm:p-5">
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${warn ? 'bg-warning-soft text-warning' : 'bg-teal-soft text-teal'}`}>
                  <Icon name={warn ? 'alert' : 'checkCircle'} className="size-[1.1rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold ${warn ? 'text-warning' : ''}`}>
                    {warn ? <span className="sr-only">Warning: </span> : null}
                    {EVENT_LABELS[event.type]}
                  </p>
                  {extra ? <p className="text-[0.95rem]">{extra}</p> : null}
                  <p className="mt-0.5 text-sm text-muted">
                    <time dateTime={event.createdAt.toISOString()}>{longDate(event.createdAt)}</time>
                    {' · '}
                    {describeUserAgent(event.userAgent)}
                    {event.ip ? (
                      <>
                        {' · '}
                        <span className="font-mono">{event.ip}</span>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
