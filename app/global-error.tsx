// The last resort: an error in the ROOT layout itself. It replaces the whole
// document, so it brings its own <html> and <body> and only inline styles
// (globals.css may not have loaded).
'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#e6e9e5', color: '#0c3436', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ maxWidth: '28rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem' }}>Kọ́kọ́rọ́ hit a problem</h1>
          <p>Something went wrong while loading the site. Your account is safe.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: '1rem', padding: '0.7rem 1.2rem', borderRadius: '0.5rem', border: 0, background: '#0e4547', color: '#f3f5f1', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
