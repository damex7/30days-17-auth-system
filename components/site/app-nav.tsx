// CLIENT COMPONENT: it highlights the current page with usePathname.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

const LINKS: { href: string; label: string; icon: IconName; adminOnly?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'door' },
  { href: '/account', label: 'Account', icon: 'user' },
  { href: '/account/sessions', label: 'Sessions', icon: 'laptop' },
  { href: '/account/activity', label: 'Activity', icon: 'list' },
  { href: '/admin', label: 'Admin', icon: 'shield', adminOnly: true },
]

/**
 * The tabs under the header on signed-in pages. The Admin tab only shows
 * for admins, but that's just tidiness: /admin itself checks the role on
 * the server (requireRole), so typing the URL gets a non-admin nowhere.
 */
export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Account" className="border-b border-line">
      <ul className="mx-auto flex max-w-page gap-1 overflow-x-auto px-2 sm:px-4">
        {LINKS.filter((link) => !link.adminOnly || isAdmin).map((link) => {
          const active = pathname === link.href
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // The brass underline marks "you are here"; aria-current says it to screen readers.
                  'relative flex min-h-12 items-center gap-2 rounded-control px-3 text-[0.95rem] font-semibold no-underline transition-colors',
                  active ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-pill after:bg-brass' : 'text-muted hover:bg-teal-soft hover:text-ink',
                )}
              >
                <Icon name={link.icon} className="size-[1.1rem]" />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
