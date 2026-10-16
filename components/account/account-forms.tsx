'use client'

import { useActionState, useRef } from 'react'
import { changePasswordAction, deleteAccountAction, updateProfile } from '@/app/(app)/account/actions'
import { ErrorSummary } from '@/components/forms/error-summary'
import { TextField } from '@/components/forms/field'
import { PasswordField } from '@/components/forms/password-field'
import { SubmitButton } from '@/components/forms/submit-button'
import { button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN, type FormState } from '@/lib/validation'

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateProfile, { status: 'idle' } satisfies FormState<'name'>)
  return (
    <form action={action} noValidate>
      <ErrorSummary state={state} labels={{ name: 'Name' }} />
      {state.status === 'success' ? <Notice tone="success" title={state.message ?? 'Saved'} className="mb-5" live /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          required
          maxLength={NAME_MAX}
          defaultValue={state.values?.name ?? name}
          errors={state.fieldErrors?.name}
          className="flex-1"
        />
        <SubmitButton variant="secondary">Save name</SubmitButton>
      </div>
    </form>
  )
}

type PasswordFields = 'currentPassword' | 'newPassword'

export function ChangePasswordForm({ email, name }: { email: string; name: string }) {
  const [state, action] = useActionState(changePasswordAction, { status: 'idle' } satisfies FormState<PasswordFields>)
  return (
    <form action={action} noValidate>
      <ErrorSummary state={state} labels={{ currentPassword: 'Current password', newPassword: 'New password' }} />
      {state.status === 'success' ? <Notice tone="success" title={state.message ?? 'Password changed'} className="mb-5" live /> : null}
      {/* Tells password managers which account the new password belongs to. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <div className="space-y-5">
        <PasswordField key={`c${state.submissionId}`} name="currentPassword" label="Current password" autoComplete="current-password" errors={state.fieldErrors?.currentPassword} />
        <PasswordField
          key={`n${state.submissionId}`}
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          showStrength
          userInputs={[name, email]}
          hint={`${PASSWORD_MIN} to ${PASSWORD_MAX} characters. Every other device will be signed out.`}
          errors={state.fieldErrors?.newPassword}
        />
        <SubmitButton>Change password</SubmitButton>
      </div>
    </form>
  )
}

/**
 * Two steps: the password, then a native <dialog> asking "are you sure?".
 *
 * Submitting the form first opens the dialog (onSubmit prevents the real
 * submit). "Yes, delete" marks the next submit as confirmed and submits
 * again. A modal <dialog> traps focus inside itself, closes on Escape, and
 * returns focus to the button that opened it.
 */
export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, { status: 'idle' } satisfies FormState<'password'>)
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmed = useRef(false)

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onSubmit={(event) => {
        if (confirmed.current) {
          confirmed.current = false
          return
        }
        event.preventDefault()
        dialogRef.current?.showModal()
      }}
    >
      <ErrorSummary state={state} labels={{ password: 'Your password' }} />
      <div className="space-y-5">
        <PasswordField key={state.submissionId} name="password" label="Your password" autoComplete="current-password" errors={state.fieldErrors?.password} />
        <SubmitButton variant="dangerOutline" pendingLabel="Deleting…">
          Delete my account…
        </SubmitButton>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        aria-describedby="delete-body"
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-line bg-raised p-6 text-ink shadow-pop"
      >
        <h2 id="delete-title" className="text-2xl">
          Delete your account?
        </h2>
        <p id="delete-body" className="mt-2 text-muted">
          Your account, every signed-in session and any email links are deleted for good. This can’t be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {/* autoFocus: the SAFE choice gets focus, so a stray Enter doesn't delete anything. */}
          <button type="button" autoFocus className={button.secondary} onClick={() => dialogRef.current?.close()}>
            Keep my account
          </button>
          <button
            type="button"
            className={button.danger}
            onClick={() => {
              confirmed.current = true
              dialogRef.current?.close()
              formRef.current?.requestSubmit()
            }}
          >
            Yes, delete everything
          </button>
        </div>
      </dialog>
    </form>
  )
}
