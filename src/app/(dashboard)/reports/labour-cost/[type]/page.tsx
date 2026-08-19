'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Home, TrendingUp, TrendingDown,
  ChevronRight, ChevronDown, Search, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import {
  MOCK_PROJECT,
  getReportTypeLabel,
  getExpensesSummary,
  getThreeMonthExpenses,
  getTopSubElements,
  getTopWorkPackagesExpenses,
  getSubElementBreakdown,
  type LabourCostReportType,
  type WPExpensesRow,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// URL slug ↔ LabourCostReportType
// ---------------------------------------------------------------------------
const SLUG_TO_TYPE: Record<string, LabourCostReportType> = {
  'overall':       'overall',
  'general-worker': 'general_worker',
  'staff':          'staff',
  'subcon':         'subcon',
  'operator':       'operator',
  'subcon-as-gw':   'subcon_as_gw',
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ---------------------------------------------------------------------------
// Chart colors (no blue, accent family only)
// ---------------------------------------------------------------------------
const BAR_REGULAR = '#D97706'   // accent
const BAR_OT      = '#FBBF24'   // amber-400 (lighter shade)

const DONUT_COLORS = [
  '#D97706',  // accent
  '#3F6B4A',  // positive
  '#B3432E',  // alert
  '#B8862E',  // pending
  '#6B6358',  // ink-muted
]

// ---------------------------------------------------------------------------
// Inner page — uses hooks
// ---------------------------------------------------------------------------
function LabourCostDetailInner() {
  const params        = useParams<{ type: string }>()
  const searchParams  = useSearchParams()

  const slugType = params.type ?? 'overall'
  const type     = SLUG_TO_TYPE[slugType] ?? 'overall'
  const month    = parseInt(searchParams.get('month') ?? '8',  10)
  const year     = parseInt(searchParams.get('year')  ?? '2025', 10)

  const projectId = MOCK_PROJECT.id
  const typeLabel = getReportTypeLabel(type)
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  // data
  const summary   = getExpensesSummary(projectId, type, month, year)
  const threeMonth = getThreeMonthExpenses(projectId, type, month, year)
  const topSubs   = getTopSubElements(projectId, type, month, year)
  const wpRows    = getTopWorkPackagesExpenses(projectId, type, month, year)
  const breakdown = getSubElementBreakdown(projectId, type, month, year)

  // interactive state
  const [wpSort,      setWpSort]      = useState<'expenses' | 'usage' | 'health'>('expenses')
  const [subSearch,   setSubSearch]   = useState('')
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set())
  const [subFilter,   setSubFilter]   = useState('all')

  // sorted WP rows
  const sortedWpRows = useMemo(() => {
    const copy = [...wpRows]
    if (wpSort === 'expenses') copy.sort((a, b) => b.expensesMTD - a.expensesMTD)
    if (wpSort === 'usage')    copy.sort((a, b) => b.usagePct - a.usagePct)
    if (wpSort === 'health') {
      const order = { over_budget: 0, watch: 1, healthy: 2 }
      copy.sort((a, b) => order[a.health] - order[b.health])
    }
    return copy
  }, [wpRows, wpSort])

  // filtered breakdown rows
  const filteredBreakdown = useMemo(() => {
    if (!subSearch.trim()) return breakdown.rows
    const q = subSearch.toLowerCase()
    return breakdown.rows.filter(r => r.subElement.toLowerCase().includes(q))
  }, [breakdown.rows, subSearch])

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Stacked bar chart ────────────────────────────────────────────────────
  const MAX_BAR_H = 140 // px
  const maxTotal  = Math.max(...threeMonth.map(d => d.total), 1)

  // ── Donut chart ──────────────────────────────────────────────────────────
  const donutTotal = topSubs.reduce((s, d) => s + d.amount, 0)
  let angleAcc = 0
  const donutSegments = topSubs.map((d, i) => {
    const pct   = donutTotal > 0 ? d.amount / donutTotal : 0
    const start = angleAcc
    angleAcc   += pct * 360
    return { ...d, color: DONUT_COLORS[i], startDeg: start, sweepDeg: pct * 360 }
  })
  const donutGradient = (() => {
    let start = 0
    const stops = donutSegments.map(s => {
      const end = start + (s.sweepDeg / 360) * 100
      const stop = `${s.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
      start = end
      return stop
    })
    return `conic-gradient(${stops.join(', ')})`
  })()

  return (
    <div className="space-y-6 pb-10">
      {/* Back link */}
      <div>
        <Link
          href={`/reports/labour-cost`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Back to Report Picker
        </Link>

        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Labour Cost Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          This report is based on attendance and work package cost records.
        </p>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--color-ink-muted)]">
        <span>
          <span className="font-medium text-[var(--color-ink)]">Project: </span>
          <span className="font-mono uppercase tracking-widest">{MOCK_PROJECT.code}</span>
        </span>
        <span className="text-[var(--color-border)]">|</span>
        <span>
          <span className="font-medium text-[var(--color-ink)]">Report Date: </span>
          {monthLabel}
        </span>
        <span className="text-[var(--color-border)]">|</span>
        <span className="flex items-center gap-1">
          <span className="font-medium text-[var(--color-ink)]">Status: </span>
          <StatusBadge status="finalized" label="Ready" />
        </span>
        <span className="text-[var(--color-border)]">|</span>
        <span>
          <span className="font-medium text-[var(--color-ink)]">Type: </span>
          {typeLabel}
        </span>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2">
        <Home size={14} className="text-[var(--color-accent)] shrink-0" />
        <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
          {typeLabel} Expenses
        </h2>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Accumulated Expenses */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Accumulated Expenses
          </span>
          <div className="mt-2.5 font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
            {formatCurrency(summary.accumulatedExpenses)}
          </div>
          <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">since project start</div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-ink-muted)]">
            Year start: <span className="font-mono font-medium text-[var(--color-ink)]">
              {formatCurrency(summary.yearStartExpenses)}
            </span>
          </div>
        </div>

        {/* Accumulated Backcharge */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Accumulated Backcharge
          </span>
          <div className="mt-2.5 font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
            {formatCurrency(summary.accumulatedBackcharge)}
          </div>
          <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">since project start</div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-ink-muted)]">
            Year start: <span className="font-mono font-medium text-[var(--color-ink)]">
              {formatCurrency(summary.yearStartBackcharge)}
            </span>
          </div>
        </div>

        {/* Total Expenses this month */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="mt-2.5 flex items-end gap-2">
            <span className="font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
              {formatCurrency(summary.totalExpensesThisMonth)}
            </span>
            {summary.expensesTrendPct !== 0 && (
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium font-mono mb-0.5',
                summary.expensesTrendPct > 0
                  ? 'text-[var(--color-alert)]'    // up = more cost = bad
                  : 'text-[var(--color-positive)]', // down = less cost = good
              )}>
                {summary.expensesTrendPct > 0
                  ? <TrendingUp size={13} />
                  : <TrendingDown size={13} />}
                {Math.abs(summary.expensesTrendPct).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">{monthLabel}</div>
          {/* Regular vs OT stacked bar */}
          <div className="mt-3">
            <div className="flex rounded-full overflow-hidden h-1.5" style={{ background: 'var(--color-border)' }}>
              <div style={{ width: `${summary.regularPct}%`, background: BAR_REGULAR }} />
              <div style={{ width: `${summary.otPct}%`, background: BAR_OT }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-1.5 rounded-sm" style={{ background: BAR_REGULAR }} />
                Regular {summary.regularPct}%
              </span>
              <span className="flex items-center gap-1">
                OT {summary.otPct}%
                <span className="inline-block w-2 h-1.5 rounded-sm" style={{ background: BAR_OT }} />
              </span>
            </div>
          </div>
        </div>

        {/* Total Backcharge this month */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
            Total Backcharge
          </span>
          <div className="mt-2.5 flex items-end gap-2">
            <span className="font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
              {formatCurrency(summary.totalBackchargeThisMonth)}
            </span>
            {summary.backchargeTrendPct !== 0 && (
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium font-mono mb-0.5',
                summary.backchargeTrendPct < 0
                  ? 'text-[var(--color-positive)]'  // down = less backcharge recovered = hmm
                  : 'text-[var(--color-alert)]',     // up = more backcharge recovered could be issue
              )}>
                {summary.backchargeTrendPct > 0
                  ? <TrendingUp size={13} />
                  : <TrendingDown size={13} />}
                {Math.abs(summary.backchargeTrendPct).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">{monthLabel}</div>
        </div>
      </div>

      {/* ── Row 2: charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3-Month Expenses stacked bar chart */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col">
          <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-base font-medium text-[var(--color-ink)]">3-Month Expenses</h3>
            <div className="flex items-center gap-3 text-[11px] text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: BAR_REGULAR }} />
                Regular
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: BAR_OT }} />
                OT
              </span>
            </div>
          </div>
          <div className="p-5 flex-1">
            <div className="flex items-end gap-4" style={{ height: `${MAX_BAR_H + 48}px` }}>
              {threeMonth.map((d, i) => {
                const barH  = d.total > 0 ? Math.max(4, (d.total / maxTotal) * MAX_BAR_H) : 4
                const otH   = d.total > 0 ? (d.otAmount / d.total) * barH : 0
                const regH  = barH - otH
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    {/* Total above bar */}
                    <span className="text-[11px] font-mono font-medium text-[var(--color-ink)] text-center leading-none">
                      {formatCurrency(d.total)}
                    </span>
                    {/* Bar */}
                    <div
                      className="w-full rounded-t-sm overflow-hidden flex flex-col"
                      style={{ height: `${barH}px` }}
                    >
                      {/* OT (top) */}
                      <div
                        className="w-full flex items-center justify-center overflow-hidden shrink-0"
                        style={{ height: `${otH}px`, background: BAR_OT }}
                      >
                        {otH > 18 && (
                          <span className="text-[9px] text-[var(--color-ink)] font-medium px-0.5 text-center leading-tight">
                            {formatCurrency(d.otAmount)}
                          </span>
                        )}
                      </div>
                      {/* Regular (bottom) */}
                      <div
                        className="w-full flex items-center justify-center overflow-hidden flex-1"
                        style={{ background: BAR_REGULAR }}
                      >
                        {regH > 18 && (
                          <span className="text-[9px] text-white font-medium px-0.5 text-center leading-tight">
                            {formatCurrency(d.regularAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Month label */}
                    <span className="text-[11px] text-[var(--color-ink-muted)] text-center leading-none">
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Sub Elements donut */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col">
          <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-base font-medium text-[var(--color-ink)]">Top 5 Sub Elements</h3>
            <select
              value={subFilter}
              onChange={e => setSubFilter(e.target.value)}
              className={cn(
                'h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)]',
                'bg-[var(--color-surface)] px-2 text-xs text-[var(--color-ink)]',
                'focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
                'appearance-none cursor-pointer',
              )}
            >
              <option value="all">All</option>
              <option value="labour">Labour</option>
              <option value="preliminary">Preliminary</option>
            </select>
          </div>
          <div className="p-5 flex-1 flex flex-col sm:flex-row items-start gap-5">
            {/* Donut */}
            <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: 110, height: 110 }}>
              <div
                className="w-full h-full rounded-full"
                style={{ background: donutGradient }}
              />
              <div
                className="absolute rounded-full bg-[var(--color-surface)]"
                style={{ width: 52, height: 52, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
              />
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-2.5 flex-1 w-full">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: seg.color }}
                  />
                  <span className="text-xs text-[var(--color-ink-muted)] flex-1 truncate">
                    {seg.category}
                  </span>
                  <span className="text-xs font-mono font-medium text-[var(--color-ink)] shrink-0">
                    {formatCurrency(seg.amount)}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono shrink-0 w-12 text-right',
                      seg.trendPct > 0 ? 'text-[var(--color-alert)]' : 'text-[var(--color-positive)]',
                    )}
                  >
                    {seg.trendPct > 0 ? '+' : ''}{seg.trendPct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Work Packages table ──────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-[var(--color-ink)]">Top Work Packages</h3>
              <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                Work package expenses, budget, and progress — for monitoring and early warning purposes
              </p>
            </div>
            {/* Sort by */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[var(--color-ink-muted)]">Sort by:</span>
              <select
                value={wpSort}
                onChange={e => setWpSort(e.target.value as typeof wpSort)}
                className={cn(
                  'h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)]',
                  'bg-[var(--color-surface)] px-2 text-xs text-[var(--color-ink)]',
                  'focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
                  'appearance-none cursor-pointer',
                )}
              >
                <option value="expenses">Expenses</option>
                <option value="usage">Usage %</option>
                <option value="health">Health</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                {['Work Package','Work Nature','Work Type','Expenses (MTD)','Backcharge (MTD)','Usage','Health'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedWpRows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-[var(--color-border)] last:border-0',
                    'hover:bg-[var(--color-bg)] transition-colors',
                  )}
                >
                  {/* Work Package */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[var(--color-ink)] tracking-wider">
                      {row.packageCode}
                    </span>
                  </td>
                  {/* Work Nature */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-[var(--color-ink)]">{row.workNature ?? '—'}</span>
                  </td>
                  {/* Work Type */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {row.category && (
                        <span className="text-[11px] text-[var(--color-ink-muted)]">{row.category}</span>
                      )}
                      {row.subcategory && (
                        <>
                          <ChevronRight size={10} className="text-[var(--color-border)]" />
                          <span className="text-[11px] text-[var(--color-ink-muted)]">{row.subcategory}</span>
                        </>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded-[4px]',
                          'text-[10px] font-medium',
                          'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
                        )}
                      >
                        Labour
                      </span>
                    </div>
                  </td>
                  {/* Expenses MTD */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
                      {formatCurrency(row.expensesMTD)}
                    </span>
                  </td>
                  {/* Backcharge MTD */}
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      'font-mono text-xs font-medium',
                      row.backchargeMTD > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-ink-muted)]',
                    )}>
                      {row.backchargeMTD > 0 ? formatCurrency(row.backchargeMTD) : '—'}
                    </span>
                  </td>
                  {/* Usage */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(row.usagePct, 100)}%`,
                            background: row.usagePct > 100 ? 'var(--color-alert)'
                              : row.usagePct >= 80 ? 'var(--color-pending)'
                              : 'var(--color-positive)',
                          }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[var(--color-ink-muted)] shrink-0">
                        {row.usagePct}%
                      </span>
                    </div>
                  </td>
                  {/* Health */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: row.health === 'over_budget' ? 'var(--color-alert)'
                            : row.health === 'watch' ? 'var(--color-pending)'
                            : 'var(--color-positive)',
                        }}
                      />
                      <span
                        style={{
                          color: row.health === 'over_budget' ? 'var(--color-alert)'
                            : row.health === 'watch' ? 'var(--color-pending)'
                            : 'var(--color-positive)',
                        }}
                      >
                        {row.health === 'over_budget' ? 'Over Budget'
                          : row.health === 'watch' ? 'Watch'
                          : 'Healthy'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sub Element Breakdown table ──────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] flex items-center justify-between gap-4">
          <h3 className="text-base font-medium text-[var(--color-ink)]">Sub Element Breakdown</h3>
          {/* Search */}
          <div className="relative shrink-0">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
            />
            <input
              type="text"
              placeholder="Search by subelement…"
              value={subSearch}
              onChange={e => setSubSearch(e.target.value)}
              className={cn(
                'h-8 w-52 rounded-[var(--radius-sm)] border border-[var(--color-border)]',
                'bg-[var(--color-surface)] pl-7 pr-3 text-xs text-[var(--color-ink)]',
                'placeholder:text-[var(--color-ink-muted)]',
                'focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
              )}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                {['Sub Element','Expenses','Backcharge','Net Expenses','% of Overall','Acc. Expenses'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap first:text-left text-right first:text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBreakdown.map(row => {
                const isExpanded = expanded.has(row.subElement)
                const bgTint =
                  row.pctOfOverall > 30 ? 'bg-[var(--color-alert-subtle)]'
                  : row.pctOfOverall >= 15 ? 'bg-[var(--color-pending-subtle)]'
                  : ''

                return [
                  /* Main row */
                  <tr
                    key={row.subElement}
                    className={cn(
                      'border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer',
                    )}
                    onClick={() => toggleExpand(row.subElement)}
                  >
                    {/* Sub Element */}
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)]">
                        {isExpanded
                          ? <ChevronDown size={13} className="text-[var(--color-accent)] shrink-0" />
                          : <ChevronRight size={13} className="text-[var(--color-ink-muted)] shrink-0" />}
                        {row.subElement}
                      </span>
                    </td>
                    {/* Expenses */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
                        {formatCurrency(row.expenses)}
                      </span>
                    </td>
                    {/* Backcharge */}
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        'font-mono text-xs font-medium',
                        row.backcharge > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-ink-muted)]',
                      )}>
                        {row.backcharge > 0 ? formatCurrency(row.backcharge) : '—'}
                      </span>
                    </td>
                    {/* Net Expenses */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
                        {formatCurrency(row.netExpenses)}
                      </span>
                    </td>
                    {/* % of Overall */}
                    <td className={cn('px-4 py-3 text-right', bgTint)}>
                      <span className={cn(
                        'font-mono text-xs font-medium',
                        row.pctOfOverall > 30 ? 'text-[var(--color-alert)]'
                        : row.pctOfOverall >= 15 ? 'text-[var(--color-pending)]'
                        : 'text-[var(--color-ink)]',
                      )}>
                        {row.pctOfOverall.toFixed(1)}%
                      </span>
                    </td>
                    {/* Acc. Expenses */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs text-[var(--color-ink-muted)]">
                        {formatCurrency(row.accExpenses)}
                      </span>
                    </td>
                  </tr>,

                  /* Expanded detail row (placeholder) */
                  isExpanded && (
                    <tr key={`${row.subElement}-detail`} className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      <td colSpan={6} className="px-8 py-3">
                        <p className="text-xs text-[var(--color-ink-muted)] italic">
                          Detailed worker breakdown for <strong className="font-medium text-[var(--color-ink)]">{row.subElement}</strong> will be available when worker-to-work-package assignments are connected.
                        </p>
                      </td>
                    </tr>
                  ),
                ]
              })}
            </tbody>

            {/* Footer rows */}
            <tfoot>
              <FooterRow
                label="Total (Sub Element)"
                expenses={breakdown.totalSubElement}
                backcharge={null}
                netExpenses={null}
                pct={null}
                acc={null}
                variant="total"
              />
              <FooterRow
                label="Extra Pay"
                expenses={breakdown.extraPay}
                backcharge={null}
                netExpenses={null}
                pct={null}
                acc={null}
                variant="subtotal"
              />
              <FooterRow
                label="Adjustment"
                expenses={breakdown.adjustment}
                backcharge={null}
                netExpenses={null}
                pct={null}
                acc={null}
                variant="adjustment"
                isNegative={breakdown.adjustment < 0}
              />
              <FooterRow
                label="Net Total"
                expenses={breakdown.netTotal}
                backcharge={null}
                netExpenses={null}
                pct={null}
                acc={null}
                variant="total"
              />
              <FooterRow
                label="Acc. Backcharge"
                expenses={null}
                backcharge={breakdown.accBackcharge}
                netExpenses={null}
                pct={null}
                acc={null}
                variant="highlighted"
              />
              <FooterRow
                label="Acc. Net Expenses"
                expenses={null}
                backcharge={null}
                netExpenses={breakdown.accNetExpenses}
                pct={null}
                acc={null}
                variant="highlighted"
              />
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Footer row helper
// ---------------------------------------------------------------------------
interface FooterRowProps {
  label: string
  expenses:    number | null
  backcharge:  number | null
  netExpenses: number | null
  pct:         number | null
  acc:         number | null
  variant: 'total' | 'subtotal' | 'adjustment' | 'highlighted'
  isNegative?: boolean
}

function FooterRow({ label, expenses, backcharge, netExpenses, pct, acc, variant, isNegative }: FooterRowProps) {
  const rowCls = cn(
    'border-b border-[var(--color-border)] last:border-0',
    variant === 'total'       && 'bg-[var(--color-bg)]',
    variant === 'subtotal'    && 'bg-[var(--color-bg)]',
    variant === 'adjustment'  && 'bg-[var(--color-bg)]',
    variant === 'highlighted' && 'bg-[var(--color-accent-subtle)]',
  )
  const labelCls = cn(
    'text-xs font-bold',
    variant === 'highlighted' ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]',
  )
  const valCls = cn(
    'font-mono text-xs font-bold',
    isNegative ? 'text-[var(--color-alert)]' : 'text-[var(--color-ink)]',
    variant === 'highlighted' && 'text-[var(--color-accent)]',
  )

  const fmt = (v: number | null) => v !== null ? formatCurrency(Math.abs(v)) : '—'
  const sign = (v: number | null) => (isNegative && v !== null) ? '-' : ''

  return (
    <tr className={rowCls}>
      <td className="px-4 py-2.5">
        <span className={labelCls}>{label}</span>
      </td>
      <td className="px-4 py-2.5 text-right">
        {expenses !== null && (
          <span className={valCls}>{sign(expenses)}{fmt(expenses)}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {backcharge !== null && (
          <span className={valCls}>{fmt(backcharge)}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {netExpenses !== null && (
          <span className={valCls}>{fmt(netExpenses)}</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {pct !== null && (
          <span className={valCls}>{pct.toFixed(1)}%</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {acc !== null && (
          <span className={valCls}>{fmt(acc)}</span>
        )}
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Page export — wraps in Suspense for useSearchParams
// ---------------------------------------------------------------------------
export default function LabourCostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-40 text-sm text-[var(--color-ink-muted)]">
          Loading report…
        </div>
      }
    >
      <LabourCostDetailInner />
    </Suspense>
  )
}
