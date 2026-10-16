// ROOT LAYOUT: only what every page needs: <html>/<body>, fonts, the
// no-flash theme script and the skip link. Headers live one level down, in
// each route group's layout.

import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Gelasio } from 'next/font/google'
import { site } from '@/lib/site'
import { themeScript } from '@/lib/theme'
import './globals.css'

// next/font downloads the fonts at build time and serves them from this
// site: no request to Google from the visitor's browser and no layout jump.
//
// GLYPH CHECK: the name "Kọ́kọ́rọ́" needs a tone mark STACKED on a dotted
// letter (ọ + ́). Rendered in Chrome, Piazzolla and Onest put the accent
// beside the letter and Bricolage Grotesque's grave collides with Ẹ;
// Gelasio and Atkinson Hyperlegible Next stack every mark correctly. The
// "vietnamese" subset is the one that holds ọ and the combining marks, so
// it is preloaded for Gelasio, which draws the wordmark on every page.
const gelasio = Gelasio({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-gelasio',
})
// next/font has no size-adjust metrics for the two Atkinson fonts yet, so
// it can't build a matched fallback; name the fallbacks ourselves instead.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-atkinson',
  adjustFontFallback: false,
  fallback: ['system-ui', 'sans-serif'],
})
const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ['latin'],
  variable: '--font-atkinson-mono',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'monospace'],
  // Only used for IP addresses on a few pages: no need to preload it everywhere.
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e6e9e5' },
    { media: '(prefers-color-scheme: dark)', color: '#081514' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      // The <head> script sets data-theme before React loads, so the server's
      // <html> and the browser's may differ ON PURPOSE. This silences that
      // one expected warning, for this element's attributes only.
      suppressHydrationWarning
      className={`${gelasio.variable} ${atkinson.variable} ${atkinsonMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh text-[1.0625rem] leading-relaxed antialiased">
        {/* SKIP LINK: the first Tab stop on every page. */}
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-teal px-4 py-2 font-semibold text-on-teal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
