import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { AuthCard } from '@/components/site/auth-card'

export const metadata: Metadata = { title: 'Create an account' }

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create an account"
      intro="We’ll email you a link to confirm your address."
      footer={
        <p>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  )
}
