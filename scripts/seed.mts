// npm run db:seed
//
// Creates two demo accounts, both with confirmed email addresses:
//   admin@example.com  (role admin)  password from SEED_ADMIN_PASSWORD
//   user@example.com   (role user)   password from SEED_USER_PASSWORD
//
// The passwords come from environment variables (.env.local, or Vercel's
// settings), never from this file: a password committed to git is public
// forever, even after it's deleted.
//
// SAFE TO RUN TWICE: each insert says ON CONFLICT (email) DO NOTHING, so a
// second run finds both accounts and changes nothing, not even a password
// someone has since changed.
//
// Run `npm run db:migrate` first: the seed needs the tables.

import { hash } from '@node-rs/argon2'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local and paste your Neon connection string.')
  process.exit(1)
}

// The same argon2id settings as lib/auth/password.ts (scripts run outside
// Next.js, and that file is server-only, so they're repeated here).
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 }

type SeedUser = { email: string; name: string; role: 'admin' | 'user'; passwordVar: string }

const users: SeedUser[] = [
  { email: 'admin@example.com', name: 'Adé Admin', role: 'admin', passwordVar: 'SEED_ADMIN_PASSWORD' },
  { email: 'user@example.com', name: 'Ọlá User', role: 'user', passwordVar: 'SEED_USER_PASSWORD' },
]

for (const user of users) {
  const password = process.env[user.passwordVar]
  if (!password || password.length < 8 || password.length > 128) {
    console.error(`${user.passwordVar} must be set to a password of 8 to 128 characters (in .env.local).`)
    process.exit(1)
  }
}

const sql = neon(connectionString)
let created = 0

for (const user of users) {
  const passwordHash = await hash(process.env[user.passwordVar] as string, ARGON2_OPTIONS)
  // One statement: insert if the email is free, and log a signed_up event
  // only for a row that was really inserted.
  const rows = await sql`
    WITH created AS (
      INSERT INTO users (email, name, password_hash, role, email_verified_at)
      VALUES (${user.email}, ${user.name}, ${passwordHash}, ${user.role}, now())
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    )
    INSERT INTO auth_events (user_id, type, ip, metadata)
    SELECT id, 'signed_up', 'seed', '{"seeded": true}'::jsonb FROM created
    RETURNING user_id`
  if (rows.length > 0) {
    created++
    console.log(`✓ created ${user.email} (${user.role})`)
  } else {
    console.log(`· ${user.email} already exists, left as it is`)
  }
}

console.log(created === 0 ? 'Seed accounts are already there. Nothing added.' : `Done: ${created} account(s) created.`)
