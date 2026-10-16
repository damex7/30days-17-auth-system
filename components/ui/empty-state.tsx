import type { ReactNode } from 'react'
import { KeyGlyph } from '@/components/brand/key'

/** A calm, centred message for empty lists, with the key motif. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong px-6 py-14 text-center motion-safe:animate-rise">
      <span className="mb-4 grid size-16 place-items-center rounded-full bg-door">
        <KeyGlyph className="h-5 w-10" />
      </span>
      <h2 className="text-xl">{title}</h2>
      {children ? <div className="mt-2 max-w-sm text-muted [&_a]:font-semibold [&_a]:text-teal [&_a]:underline">{children}</div> : null}
    </div>
  )
}
