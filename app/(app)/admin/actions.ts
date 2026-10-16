// ADMIN SERVER ACTIONS. Each one starts with requireRole('admin'): hiding
// the buttons from non-admins is only tidiness, because anyone can send
// this POST with any user id. Every change is written to auth_events with
// the admin as actor_id.
'use server'

import { refresh } from 'next/cache'
import { requireRole } from '@/lib/auth/dal'
import { getRequestInfo } from '@/lib/auth/request'
import { revokeOtherSessions } from '@/lib/auth/session'
import { setRole } from '@/lib/users'
import { changeRoleSchema, failed, field, userIdSchema, type FormState } from '@/lib/validation'

export async function changeRoleAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const { user: admin } = await requireRole('admin')
  const parsed = changeRoleSchema.safeParse({ userId: field(formData, 'userId'), role: field(formData, 'role') })
  if (!parsed.success) return failed('That request wasn’t valid.')
  const { userId, role } = parsed.data

  // Checked here for a clear message, and again in SQL (setRole's
  // `id <> actorId`), which is the check that can't be skipped.
  if (userId === admin.id) return failed('You can’t change your own role.')

  const changed = await setRole(admin.id, userId, role, await getRequestInfo())
  if (!changed) return failed('Nothing changed: the user may already have that role, or no longer exists.')
  refresh()
  return { status: 'success', message: role === 'admin' ? 'Now an admin.' : 'Now a regular user.', submissionId: Date.now() }
}

/**
 * Signs a user out everywhere: deletes all their session rows. Takes effect
 * on their very next request. (If an admin does this to themselves, their
 * current session is kept so they aren't thrown out mid-click.)
 */
export async function revokeUserSessionsAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const { user: admin, session } = await requireRole('admin')
  const parsed = userIdSchema.safeParse({ userId: field(formData, 'userId') })
  if (!parsed.success) return failed('That request wasn’t valid.')
  const { userId } = parsed.data

  const keep = userId === admin.id ? session.id : null
  const count = await revokeOtherSessions(userId, keep, await getRequestInfo(), admin.id)
  refresh()
  return {
    status: 'success',
    message: count === 0 ? 'No active sessions.' : `Signed out of ${count} ${count === 1 ? 'session' : 'sessions'}.`,
    submissionId: Date.now(),
  }
}
