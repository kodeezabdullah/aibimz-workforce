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
  Lock,
  LockOpen,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Nav data types
// ---------------------------------------------------------------------------
type NavLink = {
  type: 'link'
  href: string
  label: string
  icon: LucideIcon
}

type NavGroup = {
  type: 'group'
  id: string
  label: string
  icon: LucideIcon
  children: Array<{ href: string; label: string }>
}

type NavItem = NavLink | NavGroup

// ---------------------------------------------------------------------------
// Nav data
// ---------------------------------------------------------------------------
const PRIMARY_NAV: NavItem[] = [
  { type: 'link', href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { type: 'link', href: '/attendance',   label: 'Attendance',   icon: CalendarClock   },
  { type: 'link', href: '/work-packages',label: 'Work Package', icon: ClipboardList   },
  { type: 'link', href: '/productivity', label: 'Productivity', icon: TrendingUp      },
  { type: 'link', href: '/labour-cost',  label: 'Labour Cost',  icon: Banknote        },
  { type: 'link', href: '/reports',      label: 'Reports',      icon: FileText        },
  {
    type: 'group',
    id: 'employees',
    label: 'Employees',
    icon: Users,
    children: [
      { href: '/employees',              label: 'Employee List' },
      { href: '/employees/registration', label: 'Registration'  },
      { href: '/employees/resignation',  label: 'Resignation'   },
      { href: '/employees/transfer',     label: 'Transfer'      },
    ],
  },
  { type: 'link', href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
]

const SECONDARY_NAV: NavLink[] = [
  { type: 'link', href: '/project', label: 'Project', icon: Building2 },
  { type: 'link', href: '/company', label: 'Company', icon: Briefcase },
]

// ---------------------------------------------------------------------------
// Active-state helpers
// ---------------------------------------------------------------------------
function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

// Child links use exact + subtree match to avoid /employees matching /employees/registration
function isChildActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

function isGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((child) => isChildActive(pathname, child.href))
}

// ---------------------------------------------------------------------------
// Sidebar root
// ---------------------------------------------------------------------------
export function Sidebar() {
  const pathname = usePathname()

  // Hover-driven expand; isLocked overrides hover — sidebar stays expanded
  const [isLocked, setIsLocked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = isLocked || isHovered

  // Groups open independently of the sidebar's own expand/collapse
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const init = new Set<string>()
    PRIMARY_NAV.forEach((item) => {
      if (item.type === 'group' && isGroupActive(pathname, item)) {
        init.add(item.id)
      }
    })
    return init
  })

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <aside
      onMouseEnter={() => { if (!isLocked) setIsHovered(true) }}
      onMouseLeave={() => { if (!isLocked) setIsHovered(false) }}
      className={cn(
        'relative flex flex-col h-full shrink-0 overflow-hidden',
        'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
        'shadow-[var(--shadow-sidebar)] z-20',
        'transition-[width] duration-200 ease-in-out',
        isExpanded ? 'w-[240px]' : 'w-[72px]',
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center shrink-0 px-5 py-5 border-b border-[var(--color-border)]',
          isExpanded ? 'justify-between' : 'justify-center',
        )}
      >
        <div className={cn('flex items-center min-w-0', isExpanded && 'gap-3')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-card)] bg-[var(--color-accent)] shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          {isExpanded && (
            <span className="font-display font-semibold text-[var(--color-ink)] text-sm tracking-tight whitespace-nowrap">
              Workforce AI
            </span>
          )}
        </div>

        {/* Lock / pin button — only visible when expanded */}
        {isExpanded && (
          <button
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? 'Unlock sidebar' : 'Pin sidebar open'}
            className={cn(
              'shrink-0 p-1.5 rounded-[var(--radius-sm)] transition-colors duration-150',
              isLocked
                ? 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)] hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]'
                : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
            )}
          >
            {isLocked
              ? <Lock size={14} />
              : <LockOpen size={14} />
            }
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-4 px-3 flex flex-col gap-1.5">
        {PRIMARY_NAV.map((item) => {
          if (item.type === 'link') {
            return (
              <FlatLink
                key={item.href}
                item={item}
                isExpanded={isExpanded}
                isActive={isNavLinkActive(pathname, item.href)}
              />
            )
          }
          return (
            <GroupItem
              key={item.id}
              item={item}
              pathname={pathname}
              isExpanded={isExpanded}
              isActive={isGroupActive(pathname, item)}
              isOpen={openGroups.has(item.id)}
              onToggle={() => toggleGroup(item.id)}
            />
          )
        })}

        {/* Divider */}
        <div className="my-4 h-px bg-[var(--color-border)]" />

        {SECONDARY_NAV.map((item) => (
          <FlatLink
            key={item.href}
            item={item}
            isExpanded={isExpanded}
            isActive={isNavLinkActive(pathname, item.href)}
          />
        ))}
      </nav>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Shared nav item class builder
// ---------------------------------------------------------------------------
function navItemCn(isActive: boolean, isExpanded: boolean, extra?: string) {
  return cn(
    'group relative flex items-center overflow-hidden',
    'rounded-[var(--radius-card)] px-3.5 py-3 gap-3',
    'text-sm font-medium leading-normal transition-colors duration-150',
    isActive
      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
      : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
    !isExpanded && 'justify-center',
    extra,
  )
}

function ActivePill() {
  return (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]"
      aria-hidden
    />
  )
}

function NavIcon({
  icon: Icon,
  isActive,
}: {
  icon: LucideIcon
  isActive: boolean
}) {
  return (
    <Icon
      size={18}
      className={cn(
        'shrink-0 transition-colors duration-150',
        isActive
          ? 'text-[var(--color-accent)]'
          : 'text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]',
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// Flat link item
// ---------------------------------------------------------------------------
function FlatLink({
  item,
  isExpanded,
  isActive,
}: {
  item: NavLink
  isExpanded: boolean
  isActive: boolean
}) {
  return (
    <Link
      href={item.href}
      title={!isExpanded ? item.label : undefined}
      className={navItemCn(isActive, isExpanded)}
    >
      {isActive && <ActivePill />}
      <NavIcon icon={item.icon} isActive={isActive} />
      {isExpanded && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Group item (header button + collapsible children)
// ---------------------------------------------------------------------------
function GroupItem({
  item,
  pathname,
  isExpanded,
  isActive,
  isOpen,
  onToggle,
}: {
  item: NavGroup
  pathname: string
  isExpanded: boolean
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        title={!isExpanded ? item.label : undefined}
        className={cn(navItemCn(isActive, isExpanded), 'w-full text-left')}
      >
        {isActive && <ActivePill />}
        <NavIcon icon={item.icon} isActive={isActive} />
        {isExpanded && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {/* Chevron rotates 90° when open */}
            <ChevronRight
              size={14}
              className={cn(
                'shrink-0 transition-transform duration-200',
                isOpen && 'rotate-90',
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)]',
              )}
            />
          </>
        )}
      </button>

      {/* Children — rendered only when sidebar is expanded AND group is open */}
      {isExpanded && isOpen && (
        <div
          className="mt-1 mb-0.5 flex flex-col gap-0.5"
          // pl aligns child text with parent label:
          // parent px-3.5(14px) + icon-18px + gap-3(12px) = 44px
          style={{ paddingLeft: '44px' }}
        >
          {/* Subtle left connector rail */}
          <div className="relative">
            <span
              className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-border)]"
              aria-hidden
            />
            <div className="flex flex-col gap-0.5 pl-3">
              {item.children.map((child) => {
                const childActive = isChildActive(pathname, child.href)
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block px-2.5 py-1.5 rounded-[var(--radius-sm)]',
                      'text-xs font-medium leading-normal transition-colors duration-150',
                      childActive
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                        : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]',
                    )}
                  >
                    {child.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
