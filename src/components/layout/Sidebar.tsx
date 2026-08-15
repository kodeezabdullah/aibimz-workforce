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
  { href: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/attendance',     label: 'Attendance',    icon: CalendarClock   },
  { href: '/work-packages',  label: 'Work Package',  icon: ClipboardList   },
  { href: '/productivity',   label: 'Productivity',  icon: TrendingUp      },
  { href: '/labour-cost',    label: 'Labour Cost',   icon: Banknote        },
  { href: '/reports',        label: 'Reports',       icon: FileText        },
  { href: '/employees',      label: 'Employees',     icon: Users           },
  { href: '/ai-insights',    label: 'AI Insights',   icon: Sparkles        },
]

const SECONDARY_NAV = [
  { href: '/project',  label: 'Project', icon: Building2 },
  { href: '/company',  label: 'Company', icon: Briefcase },
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
      {/* Logo / wordmark area */}
      <div
        className={cn(
          'flex items-center h-16 shrink-0 px-4 border-b border-[var(--color-border)]',
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

      {/* Primary navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-0.5 px-2">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-[var(--radius-card)] px-2 py-2',
                'text-sm font-medium transition-colors duration-150',
                'relative overflow-hidden',
                active
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
              )}
            >
              {/* Active indicator — left border pill */}
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
                  collapsed ? 'mx-auto' : 'ml-1',
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]',
                )}
              />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-3 mx-2 h-px bg-[var(--color-border)]" />

        {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-[var(--radius-card)] px-2 py-2',
                'text-sm font-medium transition-colors duration-150 relative overflow-hidden',
                active
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
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
                  'shrink-0',
                  collapsed ? 'mx-auto' : 'ml-1',
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]',
                )}
              />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 px-2 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center rounded-[var(--radius-card)] px-2 py-2',
            'text-sm font-medium text-[var(--color-ink-muted)]',
            'hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
            'transition-colors duration-150',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          {collapsed ? (
            <ChevronRight size={18} className="shrink-0 mx-auto" />
          ) : (
            <>
              <ChevronLeft size={18} className="shrink-0 ml-1" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
