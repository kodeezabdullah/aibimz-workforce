'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  AreaChart as RechartAreaChart,
  Area,
  ReferenceLine,
} from 'recharts'
import { ArrowUp, ArrowDown, Minus, ChevronsUpDown, AlertTriangle } from 'lucide-react'
import { StatCard }    from '@/components/dashboard/StatCard'
import { ChartCard }   from '@/components/dashboard/ChartCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn }          from '@/lib/utils'
import {
  getProductivityScores,
  getProductivityByWorkerType,
  getProductivityTrend,
  getWPAttentionList,
  MOCK_PROJECT,
  WORKER_TYPE_LABELS,
  type Granularity,
  type WorkerType,
  type ProductivityBand,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Design token hex values — used directly in Recharts SVG props
// ---------------------------------------------------------------------------
const C_ACCENT   = '#D97706'
const C_POSITIVE = '#3F6B4A'
const C_ALERT    = '#B3432E'
const C_MUTED    = '#6B6358'
const C_BORDER   = '#E7E0D4'
const C_SURFACE  = '#FFFFFF'

const AXIS_STYLE = { fill: C_MUTED, fontSize: 11, fontFamily: 'inherit' }

const PROJECT_ID = MOCK_PROJECT.id

// ---------------------------------------------------------------------------
// Granularity toggle
// ---------------------------------------------------------------------------
const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: Granularity; label: string }[]
  value: Granularity
  onChange: (v: Granularity) => void
}) {
  return (
    <div
      className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-[var(--color-border)] p-0.5"
      role="tablist"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-[4px] font-medium px-3 py-1.5 text-xs transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-1',
            value === opt.value
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip shell
// ---------------------------------------------------------------------------
function TooltipShell({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C_SURFACE,
        border: `1px solid ${C_BORDER}`,
        borderRadius: 10,
        boxShadow: '0 2px 4px rgba(33,29,24,0.08),0 8px 24px rgba(33,29,24,0.06)',
        padding: '8px 12px',
        minWidth: 120,
      }}
    >
      {label && <p style={{ color: C_MUTED, fontSize: 11, marginBottom: 4 }}>{label}</p>}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ClientOnly wrapper — prevents Recharts clip-path ID hydration mismatch
// ---------------------------------------------------------------------------
function ClientOnly({ children, height }: { children: React.ReactNode; height: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ height }} />
  return <>{children}</>
}

// ---------------------------------------------------------------------------
// Score trend area chart — dashed line + gradient fill, matches Dashboard style
// ---------------------------------------------------------------------------
function ScoreTrendChart({
  data,
  granularity,
}: {
  data: { date: string; Score: number }[]
  granularity: Granularity
}) {
  const isDaily    = granularity === 'daily'
  const xInterval  = isDaily ? 0 : (data.length > 14 ? Math.ceil(data.length / 6) : 'preserveStartEnd' as const)
  const xTickStyle = isDaily
    ? { ...AXIS_STYLE, angle: -45, textAnchor: 'end' as const, dy: 4 }
    : AXIS_STYLE

  return (
    <ClientOnly height={isDaily ? 208 : 176}>
      <ResponsiveContainer width="100%" height={isDaily ? 208 : 176}>
        <RechartAreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: isDaily ? 52 : 4 }}>
          <defs>
            <linearGradient id="prod-score-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={C_ACCENT} stopOpacity={0.12} />
              <stop offset="100%" stopColor={C_ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C_BORDER} vertical={false} />
          <XAxis
            dataKey="date"
            tick={xTickStyle}
            axisLine={{ stroke: C_BORDER }}
            tickLine={false}
            interval={xInterval}
            minTickGap={isDaily ? 0 : 44}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={36}
            domain={[30, 100]}
            tickFormatter={(v: number) => `${v}`}
          />
          {/* Band boundary reference lines */}
          <ReferenceLine y={90} stroke={C_POSITIVE} strokeDasharray="4 3" strokeOpacity={0.5} />
          <ReferenceLine y={70} stroke={C_ALERT}    strokeDasharray="4 3" strokeOpacity={0.5} />
          <RechartTooltip
            cursor={{ stroke: C_ACCENT, strokeWidth: 1, strokeDasharray: '4 2' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = payload[0].value as number
              return (
                <TooltipShell label={String(label)}>
                  <p style={{ color: C_ACCENT, fontSize: 13, fontWeight: 600 }}>{val} pts</p>
                  <p style={{ color: C_MUTED, fontSize: 11, marginTop: 2 }}>
                    {val >= 90 ? 'High Performance' : val >= 70 ? 'Normal' : 'Attention Required'}
                  </p>
                </TooltipShell>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="Score"
            stroke={C_ACCENT}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#prod-score-grad)"
            dot={{ r: 3.5, fill: C_ACCENT, stroke: C_SURFACE, strokeWidth: 1.5 }}
            activeDot={{ r: 5.5, fill: C_ACCENT, stroke: C_SURFACE, strokeWidth: 2 }}
            isAnimationActive
          />
        </RechartAreaChart>
      </ResponsiveContainer>
    </ClientOnly>
  )
}

// ---------------------------------------------------------------------------
// Worker Type score bar chart
// ---------------------------------------------------------------------------
function WorkerTypeScoreChart({ data }: { data: { name: string; avgScore: number }[] }) {
  return (
    <ClientOnly height={220}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C_BORDER} vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={{ stroke: C_BORDER }} tickLine={false} />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={32}
            domain={[0, 100]}
            tickCount={6}
          />
          {/* Band thresholds */}
          <ReferenceLine
            y={90}
            stroke={C_POSITIVE}
            strokeDasharray="4 3"
            strokeOpacity={0.6}
            label={{ value: 'High', position: 'insideTopRight', fill: C_POSITIVE, fontSize: 10 }}
          />
          <ReferenceLine
            y={70}
            stroke={C_ALERT}
            strokeDasharray="4 3"
            strokeOpacity={0.6}
            label={{ value: 'Attention', position: 'insideBottomRight', fill: C_ALERT, fontSize: 10 }}
          />
          <RechartTooltip
            cursor={{ fill: 'rgba(231,224,212,0.35)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = payload[0].value as number
              return (
                <TooltipShell label={String(label)}>
                  <p style={{ color: C_ACCENT, fontSize: 13, fontWeight: 600 }}>Avg score: {val}</p>
                  <p style={{ color: C_MUTED, fontSize: 11, marginTop: 2 }}>
                    {val >= 90 ? 'High Performance' : val >= 70 ? 'Normal' : 'Attention Required'}
                  </p>
                </TooltipShell>
              )
            }}
          />
          <Bar dataKey="avgScore" fill={C_ACCENT} radius={[6, 6, 0, 0]} maxBarSize={80} />
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  )
}

// ---------------------------------------------------------------------------
// Styled filter select (reused from attendance page pattern)
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
        'h-8 px-3 pr-7 text-xs rounded-[var(--radius-sm)]',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'text-[var(--color-ink)] appearance-none cursor-pointer',
        'focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-0',
        'bg-[image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'><path fill=\'%236B6358\' d=\'M7 10l5 5 5-5z\'/></svg>")]',
        'bg-no-repeat bg-[right_6px_center]',
      )}
    >
      {children}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Sort header button
// ---------------------------------------------------------------------------
type SortKey = 'score' | 'name'
type SortDir = 'asc' | 'desc'

function SortHeader({
  children,
  colKey,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  children: React.ReactNode
  colKey: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (k: SortKey) => void
  className?: string
}) {
  const active = sortKey === colKey
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap',
        'cursor-pointer select-none hover:text-[var(--color-ink)] transition-colors',
        className,
      )}
      onClick={() => onSort(colKey)}
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="flex items-center gap-1">
        {children}
        {active
          ? sortDir === 'asc'
            ? <ArrowUp size={12} className="text-[var(--color-accent)]" />
            : <ArrowDown size={12} className="text-[var(--color-accent)]" />
          : <ChevronsUpDown size={12} className="opacity-40" />
        }
      </span>
    </th>
  )
}

// ---------------------------------------------------------------------------
// Trend delta cell
// ---------------------------------------------------------------------------
function TrendDelta({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span className="flex items-center gap-1 text-[var(--color-ink-muted)] font-mono text-xs">
      <Minus size={12} /> —
    </span>
  )
  const up = delta > 0
  return (
    <span
      className={cn(
        'flex items-center gap-1 font-mono text-xs font-medium',
        up ? 'text-[var(--color-positive)]' : 'text-[var(--color-alert)]',
      )}
    >
      {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(delta)} pts
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const WORKER_TYPE_FILTER_OPTIONS: { value: WorkerType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All Types' },
  { value: 'general_worker', label: 'General Worker' },
  { value: 'staff',         label: 'Staff' },
  { value: 'subcon',        label: 'Subcon' },
  { value: 'operator',      label: 'Operator' },
  { value: 'subcon_as_gw',  label: 'Subcon As GW' },
]

const BAND_FILTER_OPTIONS: { value: ProductivityBand | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Bands' },
  { value: 'high',       label: 'High Performance' },
  { value: 'normal',     label: 'Normal' },
  { value: 'attention',  label: 'Attention Required' },
]

export default function ProductivityPage() {
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState<WorkerType | 'all'>('all')
  const [bandFilter,  setBandFilter]  = useState<ProductivityBand | 'all'>('all')
  const [sortKey,     setSortKey]     = useState<SortKey>('score')
  const [sortDir,     setSortDir]     = useState<SortDir>('asc')

  // Data
  const scores      = getProductivityScores(PROJECT_ID)
  const byType      = getProductivityByWorkerType(PROJECT_ID)
  const wpAttention = getWPAttentionList(PROJECT_ID)
  const trendRaw    = getProductivityTrend(PROJECT_ID, granularity)

  const trendData = trendRaw.map(p => ({ date: p.label, Score: p.value }))
  const typeChartData = byType.map(r => ({ name: r.label, avgScore: r.avgScore }))

  // Band summary counts (verified: must add up to scores.length)
  const highCount      = scores.filter(s => s.band === 'high').length
  const normalCount    = scores.filter(s => s.band === 'normal').length
  const attentionCount = scores.filter(s => s.band === 'attention').length
  const total          = scores.length

  const highPct      = Math.round((highCount      / total) * 100)
  const normalPct    = Math.round((normalCount    / total) * 100)
  const attentionPct = Math.round((attentionCount / total) * 100)

  // Sort toggle: clicking the same key flips direction
  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  // Table rows — filtered and sorted
  const tableRows = useMemo(() => {
    let rows = scores

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.tradeCategory?.toLowerCase() ?? '').includes(q)
      )
    }
    if (typeFilter !== 'all') rows = rows.filter(r => r.workerType === typeFilter)
    if (bandFilter !== 'all') rows = rows.filter(r => r.band === bandFilter)

    return [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'score') return (a.score - b.score) * dir
      return a.name.localeCompare(b.name) * dir
    })
  }, [scores, search, typeFilter, bandFilter, sortKey, sortDir])

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Productivity Analytics
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Worker utilisation scoring based on attendance, punctuality, and hours worked.
        </p>
      </div>

      {/* ── Band summary row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <StatCard
          label="High Performance"
          value={highCount}
          sublabel={`${highPct}% of workforce · score ≥ 90`}
          icon={<span className="text-base">↑</span>}
          iconBg="rgba(63,107,74,0.12)"
          iconColor="var(--color-positive)"
        />

        <StatCard
          label="Normal"
          value={normalCount}
          sublabel={`${normalPct}% of workforce · score 70–89`}
        />

        {/* Attention Required — left border callout for visual emphasis */}
        <div className="relative">
          {/* Left rail — 3 px alert stripe, matching sidebar nav motif */}
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full z-10"
            style={{ background: 'var(--color-alert)' }}
          />
          <StatCard
            label="Attention Required"
            value={attentionCount}
            sublabel={`${attentionPct}% of workforce · score < 70`}
            icon={<AlertTriangle size={16} />}
            iconBg="rgba(179,67,46,0.12)"
            iconColor="var(--color-alert)"
            className="pl-6"
          />
        </div>
      </div>

      {/* ── Utilisation Score Trend ────────────────────────────────────────── */}
      <ChartCard
        title="Utilisation Score Trend"
        headerRight={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-6 border-t-2 border-dashed inline-block" style={{ borderColor: C_POSITIVE, opacity: 0.6 }} />
                High (90)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 border-t-2 border-dashed inline-block" style={{ borderColor: C_ALERT, opacity: 0.6 }} />
                Attention (70)
              </span>
            </div>
            <SegmentedControl
              options={GRANULARITY_OPTIONS}
              value={granularity}
              onChange={setGranularity}
            />
          </div>
        }
      >
        <ScoreTrendChart data={trendData} granularity={granularity} />
      </ChartCard>

      {/* ── Average Score by Worker Type ──────────────────────────────────── */}
      <ChartCard title="Average Score by Worker Type">
        <WorkerTypeScoreChart data={typeChartData} />
      </ChartCard>

      {/* ── Worker Utilisation Table ──────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">

        {/* Table header + filters */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-base font-medium text-[var(--color-ink)] shrink-0">
              Worker Utilisation Scores
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {/* Search */}
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or trade…"
                className={cn(
                  'h-8 px-3 text-xs rounded-[var(--radius-sm)] w-48',
                  'bg-[var(--color-bg)] border border-[var(--color-border)]',
                  'text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]',
                  'focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-0',
                )}
              />
              {/* Worker type filter */}
              <FilterSelect
                value={typeFilter}
                onChange={v => setTypeFilter(v as WorkerType | 'all')}
              >
                {WORKER_TYPE_FILTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </FilterSelect>
              {/* Band filter */}
              <FilterSelect
                value={bandFilter}
                onChange={v => setBandFilter(v as ProductivityBand | 'all')}
              >
                {BAND_FILTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </FilterSelect>

              {/* Row count */}
              <span className="text-xs text-[var(--color-ink-muted)] font-mono">
                {tableRows.length} / {total}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <SortHeader colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-5">
                  Worker Name
                </SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap">
                  Trade
                </th>
                <SortHeader colKey="score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Score
                </SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap">
                  Band
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap pr-5">
                  vs Last Period
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--color-ink-muted)]">
                    No workers match the current filters.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr
                    key={row.workerId}
                    className={cn(
                      'hover:bg-[var(--color-bg)] transition-colors duration-100',
                      idx % 2 === 0 ? '' : 'bg-[#FDFBF8]',
                    )}
                  >
                    <td className="px-5 py-3 text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)] whitespace-nowrap">
                      {WORKER_TYPE_LABELS[row.workerType]}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-ink-muted)] whitespace-nowrap">
                      {row.tradeCategory ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-mono text-sm font-semibold',
                          row.band === 'high'      && 'text-[var(--color-positive)]',
                          row.band === 'normal'    && 'text-[var(--color-ink)]',
                          row.band === 'attention' && 'text-[var(--color-alert)]',
                        )}
                      >
                        {row.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.band} />
                    </td>
                    <td className="px-4 py-3 pr-5">
                      <TrendDelta delta={row.trendDelta} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: band count verification */}
        <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-positive)] shrink-0" />
            High: {highCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-border)] shrink-0" />
            Normal: {normalCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-alert)] shrink-0" />
            Attention: {attentionCount}
          </span>
          <span className="ml-auto font-mono">Total: {total}</span>
        </div>
      </div>

      {/* ── Work Packages Needing Attention ───────────────────────────────── */}
      <ChartCard title="Work Packages Needing Attention">
        {wpAttention.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)] py-2">
            No active work packages have workers in the Attention Required band.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Package Code
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Subcategory
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider pr-5">
                    Low Scoring Workers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {wpAttention.map(wp => (
                  <tr key={wp.packageCode} className="hover:bg-[var(--color-bg)] transition-colors duration-100">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest">
                        {wp.packageCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-ink-muted)]">
                      {wp.category ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-ink-muted)]">
                      {wp.subcategory ?? '—'}
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <span className="font-mono text-sm font-semibold text-[var(--color-alert)]">
                        {wp.attentionCount}
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)] ml-1.5">
                        / {wp.totalAssigned} ({wp.pct}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

    </div>
  )
}
