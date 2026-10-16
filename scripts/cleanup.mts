// npm run db:cleanup
//
// Deletes rows the auth system no longer needs. The app already cleans up
// as it goes (an expired session is deleted when its cookie is next seen,
// and a user's expired sessions when they sign in), but a session whose
// browser never comes back would stay forever. Run this now and then, or on
// a schedule (a Vercel Cron Job calling a protected route is the usual next
// step; see the README).
//
// Every DELETE uses an index on the time column (see db/migrations), so it
// stays quick on big tables.

import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and paste your Neon connection string.')
  process.exit(1)
}

const sql = neon(connectionString)

// One transaction, one round trip. Each statement returns its own count.
const [sessions, tokens, limits, events] = await sql.transaction([
  // Expired sessions are useless: the lookup already ignores them.
  sql`DELETE FROM sessions WHERE expires_at <= now() RETURNING 1`,
  // Used or expired email links, kept a week so "this link was already
  // used" can still be told apart from "never existed".
  sql`DELETE FROM email_tokens WHERE expires_at <= now() - interval '7 days' RETURNING 1`,
  // Rate-limit windows that ended long ago (the longest window is 1 hour).
  sql`DELETE FROM rate_limits WHERE window_start <= now() - interval '1 day' RETURNING 1`,
  // The audit log is kept for a year.
  sql`DELETE FROM auth_events WHERE created_at <= now() - interval '1 year' RETURNING 1`,
])

console.log(`Deleted ${sessions?.length ?? 0} expired session(s), ${tokens?.length ?? 0} old email token(s), ${limits?.length ?? 0} stale rate-limit counter(s) and ${events?.length ?? 0} audit event(s) older than a year.`)
