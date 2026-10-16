import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cache Components (the Next.js 16.4 default): nothing is cached unless a
  // function says 'use cache'. Every page that reads the session cookie
  // does so inside <Suspense>, so the rest of the page can still be sent
  // straight away.
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the project root: there is an unrelated package-lock.json higher up
    // in the home folder that Turbopack would otherwise consider.
    root: __dirname,
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
