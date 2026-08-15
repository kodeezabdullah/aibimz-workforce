'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  TrendingUp,
  Banknote,
  FileText,
  Users,
  Sparkles,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIMARY_NAV = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/attendance',    label: 'Attendance',   icon: CalendarClock   },
  { href: '/work-packages', label: 'Work Package', icon: ClipboardList   },
  { href: '/productivity',  label: 'Productivity', icon: TrendingUp      },
  { href: '/labour-cost',   label: 'Labour Cost',  icon: Banknote        },
  { href: '/reports',       label: 'Reports',      icon: FileText        },
  { href: '/employees',     label: 'Employees',    icon: Users           },
  { href: '/ai-insights',   label: 'AI Insights',  icon: Sparkles        },
]

const SECONDARY_NAV = [
  { href: '/project', label: 'Project', icon: Building2 },
  { href: '/company', label: 'Company', icon: Briefcase },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full shrink-0 overflow-hidden',
        'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
        'shadow-[var(--shadow-sidebar)]',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[240px]',
      )}
    >
      {/* ── Logo / wordmark ───────────────────────────────────────────────── */}
      {/* px-5 py-5 gives generous breathing room; gap-3 separates mark+text */}
      <div
        className={cn(
          'flex items-center shrink-0 px-5 py-5 border-b border-[var(--color-border)]',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-card)] bg-[var(--color-accent)] shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            Workforce AI
          </span>
        )}
      </div>

      {/* ── Primary navigation ────────────────────────────────────────────── */}
      {/* pt-6 so there's air between the header border and first nav item    */}
      {/* px-3 gives the items room; flex+gap-1.5 spaces rows (not space-y)  */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-4 px-3 flex flex-col gap-1.5">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center rounded-[var(--radius-card)]',
                // px-3.5 / py-3 = 14px horizontal, 12px vertical
                'px-3.5 py-3 gap-3',
                'text-sm font-medium leading-normal',
                'relative overflow-hidden transition-colors duration-150',
                active
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
                collapsed && 'justify-center',
              )}
            >
              {/* Active left-border pill */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]"
                  aria-hidden
                />
              )}
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors duration-150',
                  active
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]',
                )}
              />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          )
        })}

        {/* Divider — my-4 gives 16px above and below */}
        <div className="my-4 h-px bg-[var(--color-border)]" />

        {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center rounded-[var(--radius-card)]',
                'px-3.5 py-3 gap-3',
                'text-sm font-medium leading-normal',
                'relative overflow-hidden transition-colors duration-150',
                active
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
                collapsed && 'justify-center',
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]"
                  aria-hidden
                />
              )}
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors duration-150',
                  active
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]',
                )}
              />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────────────────────── */}
      {/* border-t + pt-3 creates a clear visual break above; px-3 pb-4      */}
      <div className={cn(
        'shrink-0 border-t border-[var(--color-border)] pt-3 pb-4 px-3',
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center rounded-[var(--radius-card)]',
            'px-3.5 py-3 gap-3',
            'text-sm font-medium text-[var(--color-ink-muted)]',
            'hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
            'transition-colors duration-150',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? (
            <ChevronRight size={18} className="shrink-0" />
          ) : (
            <>
              <ChevronLeft size={18} className="shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
