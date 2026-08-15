'use client'

import { useState, useMemo } from 'react'
import { Search, X, Building2, Home, Landmark, Layers, MapPin, Briefcase } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn } from '@/lib/utils'
import {
  getProjectsList,
  MOCK_PROJECTS_LIST,
  type ProjectListing,
  type ProjectListingStatus,
  type ProjectType,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Derived filter options from mock data
// ---------------------------------------------------------------------------
const COMPANIES = Array.from(new Set(MOCK_PROJECTS_LIST.map(p => p.company))).sort()
const STATUSES: ProjectListingStatus[] = ['Ongoing', 'Completed', 'On Hold']

// ---------------------------------------------------------------------------
// Type icon — varies by project type
// ---------------------------------------------------------------------------
const TYPE_ICONS: Record<ProjectType, React.ElementType> = {
  Highrise:       Building2,
  Landed:         Home,
  Infrastructure: Landmark,
}

// ---------------------------------------------------------------------------
// Shared filter select
// ---------------------------------------------------------------------------
function FilterSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn(
        'h-9 px-3 pr-8 text-sm rounded-[var(--radius-card)]',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'text-[var(--color-ink)] appearance-none cursor-pointer',
        'focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-0',
        'bg-[image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'><path fill=\'%236B6358\' d=\'M7 10l5 5 5-5z\'/></svg>")]',
        'bg-no-repeat bg-[right_8px_center]',
        className,
      )}
    >
      {children}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------
function ProjectCard({ project }: { project: ProjectListing }) {
  const TypeIcon = TYPE_ICONS[project.type]

  return (
    <div className="relative bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 flex flex-col gap-4">
      {/* Current ribbon */}
      {project.isCurrent && (
        <span
          className={cn(
            'absolute top-3 right-3',
            'inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)]',
            'text-xs font-medium whitespace-nowrap',
            'bg-[var(--color-positive-subtle)] text-[var(--color-positive)]',
          )}
        >
          Current
        </span>
      )}

      {/* Header: icon box + name/code */}
      <div className={cn('flex items-start gap-3', project.isCurrent && 'pr-14')}>
        <div className="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--color-accent-subtle)] flex items-center justify-center shrink-0">
          <TypeIcon size={18} className="text-[var(--color-accent)]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium text-[var(--color-ink)] leading-snug truncate">
            {project.name}
          </h3>
          <p className="font-mono text-[11px] font-medium text-[var(--color-accent)] uppercase tracking-widest mt-0.5">
            {project.code}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Layers size={14} className="shrink-0 text-[var(--color-ink-muted)]" />
          <span>{project.type}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Briefcase size={14} className="shrink-0 text-[var(--color-ink-muted)]" />
          <span className="truncate">{project.company}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <MapPin size={14} className="shrink-0 text-[var(--color-ink-muted)]" />
          <span className="truncate">{project.location}</span>
        </div>
      </div>

      {/* Footer: status */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-ink-muted)]">Status</span>
        <StatusBadge status={project.status} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProjectListPage() {
  const [search, setSearch]           = useState('')
  const [company, setCompany]         = useState('')
  const [status, setStatus]           = useState<ProjectListingStatus | ''>('')

  const allProjects = getProjectsList()

  const filtered = useMemo(() => {
    let list = allProjects
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      )
    }
    if (company) {
      list = list.filter(p => p.company === company)
    }
    if (status) {
      list = list.filter(p => p.status === status)
    }
    return list
  }, [allProjects, search, company, status])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Project List
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          All active and historical construction projects — select a project to scope analytics.
        </p>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              'h-9 w-56 pl-8 pr-3 text-sm',
              'bg-[var(--color-surface)] text-[var(--color-ink)]',
              'border border-[var(--color-border)] rounded-[var(--radius-card)]',
              'placeholder:text-[var(--color-ink-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
              'transition-shadow duration-150',
            )}
          />
        </div>

        {/* Company dropdown */}
        <FilterSelect value={company} onChange={setCompany}>
          <option value="">Select Company</option>
          {COMPANIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </FilterSelect>

        {/* Status dropdown + clear */}
        <div className="flex items-center gap-1.5">
          <FilterSelect value={status} onChange={v => setStatus(v as ProjectListingStatus | '')}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FilterSelect>
          {status && (
            <button
              onClick={() => setStatus('')}
              title="Clear status filter"
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)]',
                'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]',
                'transition-colors duration-150',
              )}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--color-border)]">
            <Search size={20} className="text-[var(--color-ink-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-ink)]">No projects match your filters</p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">Try clearing the search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
