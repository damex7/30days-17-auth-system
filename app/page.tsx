// THE PUBLIC LANDING PAGE. Fully static: only the header's account
// controls read the cookie, inside their own <Suspense>.

import Link from 'next/link'
import { DoorIllustration, KeyGlyph } from '@/components/brand/key'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'

const STEPS = [
  { title: 'You type your password', body: 'It travels over HTTPS to a Server Action. It is never stored, logged or sent anywhere else.' },
  { title: 'argon2id checks it', body: 'The server hashes what you typed with your account’s salt and compares it with the stored hash.' },
  { title: 'A random key is cut', body: '32 random bytes go into an httpOnly cookie. The database keeps only their SHA-256 hash.' },
  { title: 'Every request shows the key', body: 'The server hashes the cookie, finds the session row, and slides its expiry forward.' },
]

const PROTECTIONS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'lock', title: 'Passwords hashed, never encrypted', body: 'argon2id with a unique salt per password, at OWASP’s recommended cost.' },
  { icon: 'shield', title: 'Breached passwords refused', body: 'Checked against Have I Been Pwned with k-anonymity: only 5 characters of a hash leave the server.' },
  { icon: 'clock', title: 'Rate limits, not lockouts', body: 'Too many tries from one address or at one account means waiting a few minutes, never a locked account.' },
  { icon: 'eyeOff', title: 'No account fishing', body: 'Login and password reset answer the same way, and take the same time, whether or not an account exists.' },
  { icon: 'laptop', title: 'Sessions you can see', body: 'Every signed-in device is listed, with its location and last activity, and can be signed out remotely.' },
  { icon: 'list', title: 'An audit trail', body: 'Sign-ins, failures, password changes and admin actions are all written down, for you and for admins.' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto grid max-w-page grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:py-20">
          <div className="motion-safe:animate-rise">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted uppercase">
              <KeyGlyph /> Kọ́kọ́rọ́ means “key” in Yoruba
            </p>
            <h1 className="text-4xl sm:text-5xl">Accounts and sessions, built by hand.</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              A complete sign-in system with no login library: sign-up, email verification, database sessions, password reset, rate limiting and an
              admin area. Every protection is written out in plain code you can read.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className={button.primary}>
                Create an account
              </Link>
              <Link href="/login" className={button.secondary}>
                Sign in
              </Link>
            </div>
          </div>
          <DoorIllustration className="mx-auto hidden sm:block" />
        </section>

        <div className="stud-rule mx-auto h-2 max-w-page" aria-hidden />

        <section aria-labelledby="how" className="mx-auto max-w-page px-4 py-14 sm:px-6">
          <h2 id="how" className="text-3xl">
            What happens when you sign in
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-card border border-line bg-raised p-5 shadow-card">
                <span className="grid size-9 place-items-center rounded-full bg-brass font-display font-bold text-on-brass" aria-hidden>
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg">{step.title}</h3>
                <p className="mt-1 text-[0.95rem] text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="protections" className="mx-auto max-w-page px-4 pb-16 sm:px-6">
          <h2 id="protections" className="text-3xl">
            What protects your account
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROTECTIONS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-control bg-door text-brass">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h3 className="font-sans text-base font-bold">{item.title}</h3>
                  <p className="mt-0.5 text-[0.95rem] text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
