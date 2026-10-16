// npm run db:explain
//
// Shows HOW PostgreSQL runs the auth system's hottest queries, with
// EXPLAIN ANALYZE: the plan it chose, the rows each step touched and the
// time it took.
//
// 1. On the real data (a handful of users).
// 2. After adding 5,000 users, 50,000 sessions and 100,000 audit events
//    INSIDE A TRANSACTION that is rolled back at the end, so nothing is
//    kept. At that size the planner must use the indexes, and the session
//    lookup that runs on every request stays a single index probe.
//
// The SQL is the same as in lib/auth/session.ts, lib/auth/events.ts and
// lib/auth/rate-limit.ts, with the values filled in as parameters.

import { createHash } from 'node:crypto'
import { neonConfig, Pool } from '@neondatabase/serverless'

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and paste your Neon connection string.')
  process.exit(1)
}

const LIFETIME = 30 * 24 * 60 * 60
const RENEW = 15 * 24 * 60 * 60

/** The per-request lookup: readSession() in lib/auth/session.ts. */
const SESSION_LOOKUP = `
  WITH expired AS (
    DELETE FROM sessions WHERE id = $1 AND expires_at <= now()
  ),
  touched AS (
    UPDATE sessions SET
      last_seen_at = now(),
      expires_at = CASE WHEN expires_at < now() + make_interval(secs => $3)
                        THEN now() + make_interval(secs => $2) ELSE expires_at END
    WHERE id = $1 AND expires_at > now()
      AND (last_seen_at < now() - '5 minutes'::interval OR expires_at < now() + make_interval(secs => $3))
    RETURNING expires_at, last_seen_at
  )
  SELECT s.id, s.user_id, COALESCE(t.expires_at, s.expires_at) AS expires_at,
         u.email, u.name, u.role, u.email_verified_at
  FROM sessions s
  JOIN users u ON u.id = s.user_id
  LEFT JOIN touched t ON true
  WHERE s.id = $1 AND s.expires_at > now()`

const LIST_SESSIONS = `
  SELECT id, created_at, expires_at, last_seen_at, user_agent, ip, location
  FROM sessions WHERE user_id = $1 AND expires_at > now()
  ORDER BY last_seen_at DESC`

const ACTIVITY = `
  SELECT e.id, e.type, e.created_at FROM auth_events e
  WHERE e.user_id = $1 ORDER BY e.created_at DESC LIMIT 50`

const LOGIN_LOOKUP = `SELECT id, password_hash FROM users WHERE email = $1`

const pool = new Pool({ connectionString })
const client = await pool.connect()

async function explain(label: string, sql: string, params: unknown[]) {
  const { rows } = await client.query<{ 'QUERY PLAN': string }>(`EXPLAIN (ANALYZE, COSTS OFF, SUMMARY ON) ${sql}`, params)
  console.log(`\n-- ${label}\n${rows.map((r) => r['QUERY PLAN']).join('\n')}`)
}

try {
  await client.query('BEGIN')

  // A real session to look up: make one for the first user, so the plan
  // below shows a hit (inside the transaction, so it is rolled back too).
  const { rows: someone } = await client.query<{ id: string; email: string }>('SELECT id, email::text FROM users ORDER BY created_at LIMIT 1')
  const user = someone[0]
  if (!user) throw new Error('No users yet: run `npm run db:seed` first.')
  const sessionId = createHash('sha256').update('explain-demo-token').digest('hex')
  await client.query(`INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, now() + interval '20 days')`, [sessionId, user.id])

  const { rows: counts } = await client.query<{ users: number; sessions: number }>('SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM sessions)::int AS sessions')
  console.log(`== 1. Real data: ${counts[0]?.users} users, ${counts[0]?.sessions} sessions ==`)
  await explain('Session lookup on every request (readSession)', SESSION_LOOKUP, [sessionId, LIFETIME, RENEW])

  // generate_series(1, N) makes N rows in one statement.
  await client.query(`
    INSERT INTO users (email, name, password_hash)
    SELECT 'generated' || g || '@example.com', 'Generated ' || g, '$argon2id$v=19$m=19456,t=2,p=1$generated'
    FROM generate_series(1, 5000) g`)
  await client.query(`
    INSERT INTO sessions (id, user_id, created_at, expires_at, last_seen_at)
    SELECT encode(sha256(('generated-session-' || g)::bytea), 'hex'), u.id, now() - interval '31 days',
           -- Some already expired (up to 10 days ago), most still valid.
           now() + make_interval(days => (g % 40) - 10), now() - make_interval(mins => g % 5000)
    FROM generate_series(1, 50000) g
    JOIN LATERAL (SELECT id FROM users WHERE email = 'generated' || (g % 5000 + 1) || '@example.com') u ON true`)
  await client.query(`
    INSERT INTO auth_events (user_id, type, ip, created_at)
    SELECT u.id, CASE WHEN g % 7 = 0 THEN 'login_failed' ELSE 'logged_in' END, '203.0.113.' || (g % 250),
           now() - make_interval(mins => g)
    FROM generate_series(1, 100000) g
    JOIN LATERAL (SELECT id FROM users WHERE email = 'generated' || (g % 5000 + 1) || '@example.com') u ON true`)
  // ANALYZE refreshes the planner's statistics, which is how it decides
  // between reading the whole table and using an index.
  await client.query('ANALYZE users; ANALYZE sessions; ANALYZE auth_events')

  console.log('\n== 2. With 5,000 more users, 50,000 sessions and 100,000 events (rolled back below) ==')
  await explain('Session lookup on every request (readSession)', SESSION_LOOKUP, [sessionId, LIFETIME, RENEW])
  await explain('Login: find the user by email (citext UNIQUE index)', LOGIN_LOOKUP, [user.email.toUpperCase()])
  await explain('/account/sessions: one user’s sessions', LIST_SESSIONS, [user.id])
  await explain('/account/activity: one user’s newest 50 events', ACTIVITY, [user.id])
} finally {
  // Undo everything: the real data is exactly as it was.
  await client.query('ROLLBACK')
  client.release()
  await pool.end()
}
