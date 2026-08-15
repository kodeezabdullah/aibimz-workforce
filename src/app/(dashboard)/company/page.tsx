'use client'

import { useState, useMemo } from 'react'
import { Search, Briefcase, Hash, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCompanies, type Company, type CompanyStatus } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Corner triangle colours per status
// ---------------------------------------------------------------------------
const TRIANGLE_COLORS: Record<CompanyStatus, string> = {
  New:      '#3F6B4A',   // positive
  Active:   '#D97706',   // accent
  Inactive: '#6B6358',   // ink-muted
}

// ---------------------------------------------------------------------------
// Corner ribbon triangle
// ---------------------------------------------------------------------------
function CornerRibbon({ status }: { status: CompanyStatus }) {
  const color = TRIANGLE_COLORS[status]
  return (
    <>
      {/* Triangle fill — top-right corner */}
      <div
        aria-hidden
        style={{
          position:    'absolute',
          top:         0,
          right:       0,
          width:       0,
          height:      0,
          borderStyle: 'solid',
          borderWidth: '0 64px 64px 0',
          borderColor: `transparent ${color} transparent transparent`,
          borderRadius: '0 10px 0 0',
        }}
      />
      {/* Status label rotated 45° inside the triangle */}
      <span
        style={{
          position:   'absolute',
          top:        12,
          right:      -2,
          width:      54,
          textAlign:  'center',
          transform:  'rotate(45deg)',
          transformOrigin: 'center',
          color:      '#fff',
          fontSize:   9,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        {status}
      </span>
    </>
  )
}

// ---------------------------------------------------------------------------
// Company card
// ---------------------------------------------------------------------------
function formatJoinedDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  return (
    <div className="relative bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 flex flex-col gap-4 overflow-hidden">
      <CornerRibbon status={company.status} />

      {/* Header */}
      <div className="flex items-start gap-3 pr-12">
        {/* Icon box */}
        <div className="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--color-accent-subtle)] flex items-center justify-center shrink-0">
          <Briefcase size={17} className="text-[var(--color-accent)]" />
        </div>
        <div className="min-w-0">
          <button
            type="button"
            className={cn(
              'text-base font-medium text-[var(--color-accent)] text-left leading-snug',
              'hover:text-[var(--color-accent-hover)] hover:underline underline-offset-2',
              'transition-colors duration-150',
            )}
          >
            {company.name}
          </button>
          <p className="font-mono text-[10px] font-medium text-[var(--color-ink-muted)] mt-0.5">
            #{String(index + 1).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Hash size={13} className="shrink-0" />
          <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
            {company.registrationNo}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <CalendarDays size={13} className="shrink-0" />
          <span className="text-xs">Joined {formatJoinedDate(company.joinedDate)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        <button
          type="button"
          className={cn(
            'inline-flex items-center px-3 py-1.5 text-xs font-medium',
            'border border-[var(--color-border)] rounded-[var(--radius-sm)]',
            'text-[var(--color-ink-muted)] bg-transparent',
            'hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
            'transition-colors duration-150',
          )}
        >
          Detail
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CompanyListPage() {
  const [search, setSearch] = useState('')

  const allCompanies = getCompanies()

  const filtered = useMemo(() => {
    if (!search.trim()) return allCompanies
    const q = search.toLowerCase().trim()
    return allCompanies.filter(c => c.name.toLowerCase().includes(q))
  }, [allCompanies, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Company List
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Registered companies and subcontractors — manage profiles, SSM registration details, and engagement history.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-fit">
        <Search
          size={14}
          strokeWidth={2}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by company name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={cn(
            'h-9 w-64 pl-8 pr-3 text-sm',
            'bg-[var(--color-surface)] text-[var(--color-ink)]',
            'border border-[var(--color-border)] rounded-[var(--radius-card)]',
            'placeholder:text-[var(--color-ink-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
            'transition-shadow duration-150',
          )}
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--color-border)]">
            <Search size={20} className="text-[var(--color-ink-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-ink)]">No companies match your search</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((company, idx) => (
              <CompanyCard key={company.id} company={company} index={idx} />
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Showing {filtered.length} of {allCompanies.length} result{allCompanies.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  )
}
