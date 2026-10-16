import { KeyGlyph } from '@/components/brand/key'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-4 gap-y-1 px-4 py-6 text-sm text-muted sm:px-6">
        <KeyGlyph className="h-3 w-6" />
        <p>Kọ́kọ́rọ́ · Day 17 of a 30-day build challenge. Hand-built auth: no auth library, plain SQL on PostgreSQL.</p>
      </div>
    </footer>
  )
}
