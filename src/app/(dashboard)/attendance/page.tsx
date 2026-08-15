'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn } from '@/lib/utils'
import {
  getAttendancePeriods,
  getPersonalAttendance,
  countWorkingDaysInMonth,
  MOCK_WORKERS,
  MOCK_PROJECT,
  type WorkerType,
  type PeriodStatus,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PROJECT_ID = MOCK_PROJECT.id

const WORKER_TYPE_OPTIONS: { value: WorkerType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'general_worker', label: 'General Worker' },
  { value: 'staff',         label: 'Staff' },
  { value: 'subcon',        label: 'Subcon' },
  { value: 'operator',      label: 'Operator' },
  { value: 'subcon_as_gw',  label: 'Subcon As GW' },
]

// Months that have data (Feb 2025 – Aug 2025)
const DATA_MONTHS: { value: string; label: string }[] = [
  { value: '2025-8',  label: 'Aug 2025' },
  { value: '2025-7',  label: 'Jul 2025' },
  { value: '2025-6',  label: 'Jun 2025' },
  { value: '2025-5',  label: 'May 2025' },
  { value: '2025-4',  label: 'Apr 2025' },
  { value: '2025-3',  label: 'Mar 2025' },
  { value: '2025-2',  label: 'Feb 2025' },
]

const PERIOD_TYPE_LABELS: Record<string, string> = {
  '1st_half': '1st Half',
  '2nd_half': '2nd Half',
  'monthly':  'Monthly',
}

// ---------------------------------------------------------------------------
// Shared styled select
// ---------------------------------------------------------------------------
function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn(
        'h-9 px-3 pr-8 text-sm rounded-[var(--radius-sm)]',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'text-[var(--color-ink)] appearance-none cursor-pointer',
        'focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-0',
        'bg-[image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'><path fill=\'%236B6358\' d=\'M7 10l5 5 5-5z\'/></svg>")]',
        'bg-no-repeat bg-[right_8px_center]',
      )}
    >
      {children}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'pb-3 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
        active
          ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
          : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Tab A: Search Amend Attendance
// ---------------------------------------------------------------------------
function SearchAmendTab() {
  const [typeFilter,   setTypeFilter]   = useState<WorkerType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PeriodStatus | 'all'>('all')
  const [monthFilter,  setMonthFilter]  = useState<string>('')

  const periods = useMemo(() => {
    const f: { workerType?: WorkerType | 'all'; status?: PeriodStatus | 'all'; month?: string } = {}
    if (typeFilter !== 'all')   f.workerType = typeFilter
    if (statusFilter !== 'all') f.status     = statusFilter
    if (monthFilter)            f.month      = monthFilter
    return getAttendancePeriods(PROJECT_ID, f)
  }, [typeFilter, statusFilter, monthFilter])

  return (
    <div className="space-y-4">

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)] whitespace-nowrap">Employee Type</label>
          <FilterSelect value={typeFilter} onChange={v => setTypeFilter(v as WorkerType | 'all')}>
            {WORKER_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)]">Status</label>
          <FilterSelect value={statusFilter} onChange={v => setStatusFilter(v as PeriodStatus | 'all')}>
            <option value="all">All</option>
            <option value="processing">Processing</option>
            <option value="finalized">Finalized</option>
          </FilterSelect>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)]">Month</label>
          <FilterSelect value={monthFilter} onChange={setMonthFilter}>
            <option value="">All months</option>
            {DATA_MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </FilterSelect>
        </div>

        <span className="ml-auto text-xs text-[var(--color-ink-muted)]">
          {periods.length} period{periods.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Periods table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['Employee Type', 'Period', 'Date Range', 'Expired Date', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {periods.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--color-ink-muted)]">
                    No periods match the current filters.
                  </td>
                </tr>
              )}
              {periods.map(p => (
                <tr key={p.id} className="hover:bg-[var(--color-bg)] transition-colors duration-100">
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)] whitespace-nowrap">
                    {p.workerTypeLabel}
                    <span className="ml-2 text-[11px] font-normal text-[var(--color-ink-muted)]">
                      ({p.workerCount} workers)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)] whitespace-nowrap">
                    {PERIOD_TYPE_LABELS[p.periodType]}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                    {p.dateRangeLabel}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)] whitespace-nowrap">
                    {p.expiredDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/attendance/${encodeURIComponent(p.id)}`}
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 text-xs font-medium',
                        'rounded-[var(--radius-sm)] border border-[var(--color-accent)]',
                        'text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white',
                        'transition-colors duration-150',
                      )}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab B: Personal Dashboard
// ---------------------------------------------------------------------------
const MONTH_LABELS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function PersonalDashboardTab() {
  const sortedWorkers = useMemo(
    () => [...MOCK_WORKERS].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const [workerId, setWorkerId] = useState<string>(sortedWorkers[0]?.id ?? '')
  const [month,    setMonth]    = useState<number>(8)    // August (current mock month)
  const [year,     setYear]     = useState<number>(2025)

  const dailyRecords   = useMemo(() => getPersonalAttendance(workerId, month, year), [workerId, month, year])
  const totalWorkingDays = useMemo(() => countWorkingDaysInMonth(month, year), [month, year])
  const selectedWorker = useMemo(() => MOCK_WORKERS.find(w => w.id === workerId), [workerId])

  return (
    <div className="space-y-5">

      {/* Selectors row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)]">Worker</label>
          <FilterSelect value={workerId} onChange={setWorkerId}>
            {sortedWorkers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)]">Month</label>
          <FilterSelect value={String(month)} onChange={v => setMonth(Number(v))}>
            {[2,3,4,5,6,7,8].map(m => (
              <option key={m} value={m}>{MONTH_LABELS[m - 1]}</option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-ink-muted)]">Year</label>
          <FilterSelect value={String(year)} onChange={v => setYear(Number(v))}>
            <option value="2025">2025</option>
          </FilterSelect>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
            Main Project
          </p>
          <p className="font-mono text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest">
            {MOCK_PROJECT.code}
          </p>
          <p className="text-sm text-[var(--color-ink)] mt-1">{MOCK_PROJECT.name}</p>
          {selectedWorker && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{selectedWorker.trade_category}</p>
          )}
        </div>

        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
            Total Working Day
          </p>
          <p className="font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
            {totalWorkingDays}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-2">
            {MONTH_LABELS[month - 1]} {year} — excl. Sundays
          </p>
        </div>
      </div>

      {/* Daily attendance table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['Date','Day','In Time','Out Time','Work Hours','Late In','OT (Eligible)','Remark','Status'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {dailyRecords.map(row => {
                const isSun = row.isSunday
                const dash  = <span className="text-[var(--color-border)]">—</span>
                return (
                  <tr
                    key={row.date}
                    className={cn(
                      'transition-colors duration-100',
                      isSun
                        ? 'bg-[var(--color-bg)] opacity-60'
                        : 'hover:bg-[var(--color-bg)]',
                    )}
                  >
                    {/* Date */}
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-[var(--color-ink)] whitespace-nowrap">
                      {String(row.dayOfMonth).padStart(2, '0')}
                    </td>
                    {/* Day */}
                    <td className={cn(
                      'px-4 py-2.5 text-xs whitespace-nowrap',
                      isSun ? 'text-[var(--color-ink-muted)] italic' : 'text-[var(--color-ink-muted)]',
                    )}>
                      {row.dayName}
                    </td>
                    {/* In Time */}
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                      {isSun || !row.checkIn ? dash : row.checkIn}
                    </td>
                    {/* Out Time */}
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                      {isSun || !row.checkOut ? dash : row.checkOut}
                    </td>
                    {/* Work Hours */}
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-ink)] whitespace-nowrap">
                      {isSun || row.workingHours == null ? dash : `${row.workingHours}h`}
                    </td>
                    {/* Late In */}
                    <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                      {isSun || !row.lateIn ? dash
                        : <span className="text-[var(--color-pending)]">{row.lateIn}</span>}
                    </td>
                    {/* OT Eligible */}
                    <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                      {isSun || row.otEligible === 0 ? dash
                        : <span className="text-[var(--color-accent)]">+{row.otEligible}h</span>}
                    </td>
                    {/* Remark (non-functional styled input) */}
                    <td className="px-4 py-2.5">
                      {isSun ? dash : (
                        <input
                          type="text"
                          placeholder="—"
                          className={cn(
                            'w-28 h-7 px-2 text-xs rounded-[var(--radius-sm)]',
                            'bg-[var(--color-bg)] border border-[var(--color-border)]',
                            'text-[var(--color-ink)] placeholder:text-[var(--color-border)]',
                            'focus:outline-1 focus:outline-[var(--color-accent)]',
                          )}
                          readOnly
                        />
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {isSun
                        ? <span className="text-xs text-[var(--color-border)]">Non-working</span>
                        : row.status === 'non_working'
                          ? dash
                          : <StatusBadge status={row.status} />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
type Tab = 'search_amend' | 'personal'

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('search_amend')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest mr-2">
            {MOCK_PROJECT.code}
          </span>
          {MOCK_PROJECT.name}
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex gap-8">
          <TabButton active={activeTab === 'search_amend'} onClick={() => setActiveTab('search_amend')}>
            Search Amend Attendance
          </TabButton>
          <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>
            Personal Dashboard
          </TabButton>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'search_amend' ? <SearchAmendTab /> : <PersonalDashboardTab />}

    </div>
  )
}
