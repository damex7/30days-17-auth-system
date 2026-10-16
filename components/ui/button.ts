// Button looks as class strings, so <button>, <Link> and form buttons can
// share them without a wrapper component. Every button is at least 44px
// tall, a comfortable touch target.

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-[0.95rem] font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60'

export const button = {
  primary: `${base} bg-teal text-on-teal hover:bg-teal-hover`,
  secondary: `${base} border border-line-strong bg-raised text-teal hover:bg-teal-soft`,
  ghost: `${base} text-teal hover:bg-teal-soft`,
  danger: `${base} bg-danger text-on-danger hover:bg-danger-hover`,
  dangerOutline: `${base} border border-danger bg-raised text-danger hover:bg-danger-soft`,
  small: 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-control border border-line-strong bg-raised px-3 text-sm font-semibold text-teal transition-colors hover:bg-teal-soft disabled:cursor-not-allowed disabled:opacity-60',
  icon: 'inline-grid size-11 place-items-center rounded-control text-muted transition-colors hover:bg-teal-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-45',
}
