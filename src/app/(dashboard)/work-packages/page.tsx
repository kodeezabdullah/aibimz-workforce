'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { WorkPackageCard } from '@/components/dashboard/WorkPackageCard'
import { cn } from '@/lib/utils'
import { getWorkPackages, MOCK_PROJECT, type WorkPackageStatus } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
type Tab = WorkPackageStatus

interface TabDef {
  value: Tab
  label: string
  subtitle: string
}

const TABS: TabDef[] = [
  {
    value: 'on_going',
    label: 'On Going',
    subtitle: 'Work packages currently in progress with active field operations',
  },
  {
    value: 'in_review',
    label: 'In Review',
    subtitle: 'Work packages submitted and awaiting review',
  },
  {
    value: 'completed',
    label: 'Completed',
    subtitle: 'Successfully completed work packages with final cost reconciliation',
  },
  {
    value: 'rejected_archived',
    label: 'Rejected / Archived',
    subtitle: 'Work packages that were rejected or archived',
  },
]

const PROJECT_ID = MOCK_PROJECT.id

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function WorkPackagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('on_going')
  const [search, setSearch] = useState('')

  const allPackages = getWorkPackages(PROJECT_ID)

  const filtered = useMemo(() => {
    const byStatus = allPackages.filter(wp => wp.status === activeTab)
    if (!search.trim()) return byStatus
    const q = search.toLowerCase().trim()
    return byStatus.filter(wp =>
      wp.package_code.toLowerCase().includes(q) ||
      (wp.remark ?? '').toLowerCase().includes(q) ||
      (wp.work_nature ?? '').toLowerCase().includes(q) ||
      (wp.subcategory ?? '').toLowerCase().includes(q),
    )
  }, [allPackages, activeTab, search])

  const activeTabDef = TABS.find(t => t.value === activeTab)!

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Work Package Listing
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest mr-2">
            {MOCK_PROJECT.code}
          </span>
          Budget and physical-progress tracking — Labour, Preliminary, and sub-types
        </p>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setSearch('') }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-0',
                activeTab === tab.value
                  ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] -mb-px'
                  : 'text-[var(--color-ink-muted)] border-b-2 border-transparent hover:text-[var(--color-ink)]',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full',
                  activeTab === tab.value
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'bg-[var(--color-border)] text-[var(--color-ink-muted)]',
                )}
              >
                {allPackages.filter(wp => wp.status === tab.value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Subtitle + controls ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-[var(--color-ink-muted)] flex-1 min-w-0">
          {activeTabDef.subtitle}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              strokeWidth={2}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search packages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={cn(
                'w-52 pl-8 pr-3 py-2 text-sm',
                'bg-[var(--color-surface)] text-[var(--color-ink)]',
                'border border-[var(--color-border)] rounded-[var(--radius-card)]',
                'placeholder:text-[var(--color-ink-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
                'transition-shadow duration-150',
              )}
            />
          </div>

          {/* Create button — accent/amber, no blue */}
          <button
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium',
              'bg-[var(--color-accent)] text-white rounded-[var(--radius-card)]',
              'hover:bg-[var(--color-accent-hover)] transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
              'shadow-sm',
            )}
          >
            <Plus size={15} strokeWidth={2.5} />
            Create Work Package
          </button>
        </div>
      </div>

      {/* ── Package list ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--color-border)' }}
          >
            <Search size={20} className="text-[var(--color-ink-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {search.trim() ? 'No packages match your search' : 'No packages in this tab'}
          </p>
          {search.trim() && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Try a different package code or keyword
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wp => (
            <WorkPackageCard key={wp.id} wp={wp} />
          ))}
        </div>
      )}
    </div>
  )
}
