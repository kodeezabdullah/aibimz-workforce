'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, ArrowUp, ArrowDown, ChevronsUpDown, Info } from 'lucide-react'
import { StatCard }    from '@/components/dashboard/StatCard'
import { ChartCard }   from '@/components/dashboard/ChartCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn }          from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import {
  getLabourCostKPIs,
  getLabourCostTrend,
  getLabourCostByWorkerType,
  getWorkPackageCostReconciliation,
  getIdleCostBreakdown,
  MOCK_PROJECT,
  WORKER_TYPE_LABELS,
  type Granularity,
  type WPCostReconciliation,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Design token hex values — used in Recharts SVG props
// ---------------------------------------------------------------------------
const C_ACCENT  = '#D97706'
const C_MUTED   = '#6B6358'
const C_BORDER  = '#E7E0D4'
const C_SURFACE = '#FFFFFF'
const C_ALERT   = '#B3432E'

const AXIS_STYLE = { fill: C_MUTED, fontSize: 11, fontFamily: 'inherit' }
const PROJECT_ID = MOCK_PROJECT.id

// ---------------------------------------------------------------------------
// ClientOnly — prevents Recharts hydration mismatch
// ---------------------------------------------------------------------------
function ClientOnly({ children, height }: { children: React.ReactNode; height: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ height }} />
  return <>{children}</>
}

// ---------------------------------------------------------------------------
// Granularity segmented control
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
        minWidth: 140,
      }}
    >
      {label && <p style={{ color: C_MUTED, fontSize: 11, marginBottom: 4 }}>{label}</p>}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cost trend area chart
// ---------------------------------------------------------------------------
function CostTrendChart({ data, granularity }: { data: { date: string; Cost: number }[]; granularity: Granularity }) {
  const isDaily   = granularity === 'daily'
  const xInterval = isDaily ? 0 : (data.length > 14 ? Math.ceil(data.length / 6) : 'preserveStartEnd' as const)
  const xTickStyle = isDaily
    ? { ...AXIS_STYLE, angle: -45, textAnchor: 'end' as const, dy: 4 }
    : AXIS_STYLE

  return (
    <ClientOnly height={isDaily ? 208 : 176}>
      <ResponsiveContainer width="100%" height={isDaily ? 208 : 176}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 12, bottom: isDaily ? 52 : 4 }}>
          <defs>
            <linearGradient id="cost-trend-grad" x1="0" y1="0" x2="0" y2="1">
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
            width={56}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
            }
          />
          <RechartTooltip
            cursor={{ stroke: C_ACCENT, strokeWidth: 1, strokeDasharray: '4 2' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = payload[0].value as number
              return (
                <TooltipShell label={String(label)}>
                  <p style={{ color: C_ACCENT, fontSize: 13, fontWeight: 600 }}>
                    {formatCurrency(val)}
                  </p>
                  <p style={{ color: C_MUTED, fontSize: 11, marginTop: 2 }}>Labour cost</p>
                </TooltipShell>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="Cost"
            stroke={C_ACCENT}
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#cost-trend-grad)"
            dot={{ r: 3.5, fill: C_ACCENT, stroke: C_SURFACE, strokeWidth: 1.5 }}
            activeDot={{ r: 5.5, fill: C_ACCENT, stroke: C_SURFACE, strokeWidth: 2 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </ClientOnly>
  )
}

// ---------------------------------------------------------------------------
// Cost by worker type bar chart
// ---------------------------------------------------------------------------
function CostByTypeChart({ data }: { data: { name: string; Cost: number }[] }) {
  return (
    <ClientOnly height={220}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C_BORDER} vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={{ stroke: C_BORDER }} tickLine={false} />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
            }
          />
          <RechartTooltip
            cursor={{ fill: 'rgba(231,224,212,0.35)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const val = payload[0].value as number
              return (
                <TooltipShell label={String(label)}>
                  <p style={{ color: C_ACCENT, fontSize: 13, fontWeight: 600 }}>
                    {formatCurrency(val)}
                  </p>
                  <p style={{ color: C_MUTED, fontSize: 11, marginTop: 2 }}>6-month total</p>
                </TooltipShell>
              )
            }}
          />
          <Bar dataKey="Cost" fill={C_ACCENT} radius={[6, 6, 0, 0]} maxBarSize={80} />
        </BarChart>
      </ResponsiveContainer>
    </ClientOnly>
  )
}

// ---------------------------------------------------------------------------
// Sort header
// ---------------------------------------------------------------------------
type SortKey = 'variance' | 'budget' | 'estCost' | 'code'
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
            ? <ArrowUp  size={12} className="text-[var(--color-accent)]" />
            : <ArrowDown size={12} className="text-[var(--color-accent)]" />
          : <ChevronsUpDown size={12} className="opacity-40" />
        }
      </span>
    </th>
  )
}

// ---------------------------------------------------------------------------
// Variance cell
// ---------------------------------------------------------------------------
function VarianceCell({ variance, budget }: { variance: number; budget: number }) {
  const isOver   = variance < 0
  const isOnBudget = !isOver && variance <= budget * 0.10
  const color    = isOver ? 'var(--color-alert)' : isOnBudget ? 'var(--color-accent)' : 'var(--color-positive)'
  return (
    <span className="font-mono text-sm font-semibold" style={{ color }}>
      {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LabourCostPage() {
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [sortKey,     setSortKey]     = useState<SortKey>('variance')
  const [sortDir,     setSortDir]     = useState<SortDir>('asc')

  const kpis          = getLabourCostKPIs(PROJECT_ID)
  const trendRaw      = getLabourCostTrend(PROJECT_ID, granularity)
  const byType        = getLabourCostByWorkerType(PROJECT_ID)
  const reconciliation = getWorkPackageCostReconciliation(PROJECT_ID)
  const idleBreakdown  = getIdleCostBreakdown(PROJECT_ID)

  const trendData = trendRaw.map(p => ({ date: p.label, Cost: p.value }))
  const typeData  = byType.map(r => ({ name: r.label, Cost: r.totalCost }))

  function handleSort(k: SortKey) {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const sortedRows = useMemo<WPCostReconciliation[]>(() => {
    return [...reconciliation].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'variance')  return (a.variance - b.variance) * dir
      if (sortKey === 'budget')    return (a.budget   - b.budget)   * dir
      if (sortKey === 'estCost')   return (a.estActualCost - b.estActualCost) * dir
      return a.packageCode.localeCompare(b.packageCode) * dir
    })
  }, [reconciliation, sortKey, sortDir])

  const overCount  = reconciliation.filter(r => r.status === 'over_budget').length
  const underCount = reconciliation.filter(r => r.status === 'under_budget').length

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Labour Cost Intelligence
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Workforce activity converted into financial impact.
        </p>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          label="Monthly Labour Cost"
          value={formatCurrency(kpis.monthlyCost)}
          sublabel="Rolling 30-day window, regular + OT"
        />

        <StatCard
          label="Overtime Cost"
          value={formatCurrency(kpis.overtimeCost)}
          sublabel={`${kpis.monthlyCost > 0 ? Math.round((kpis.overtimeCost / kpis.monthlyCost) * 100) : 0}% of monthly total`}
        />

        {/* Idle Cost — alert-tinted callout, same visual treatment as Attention card on Productivity page */}
        <div className="relative">
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full z-10"
            style={{ background: 'var(--color-alert)' }}
          />
          <StatCard
            label="Idle Labour Cost Estimate"
            value={formatCurrency(kpis.idleCostEstimate)}
            sublabel="Paid but underutilised — Attention band workers"
            icon={<AlertTriangle size={16} />}
            iconBg="rgba(179,67,46,0.12)"
            iconColor="var(--color-alert)"
            className="pl-6"
          />
        </div>

        <StatCard
          label="Budget Utilization"
          value={`${kpis.budgetUtilizationPct}%`}
          sublabel="Est. actual cost vs total WP budget"
        />
      </div>

      {/* ── Cost Trend ──────────────────────────────────────────────────────── */}
      <ChartCard
        title="Labour Cost Trend"
        headerRight={
          <SegmentedControl
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={setGranularity}
          />
        }
      >
        <CostTrendChart data={trendData} granularity={granularity} />
      </ChartCard>

      {/* ── Cost by Worker Type ─────────────────────────────────────────────── */}
      <ChartCard title="Total Cost by Worker Type" >
        <p className="text-xs text-[var(--color-ink-muted)] mb-4">
          6-month cumulative labour cost (regular + overtime) per worker type.
        </p>
        <CostByTypeChart data={typeData} />
      </ChartCard>

      {/* ── Work Package Budget Reconciliation ──────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="flex-1">
              <h3 className="text-base font-medium text-[var(--color-ink)]">
                Work Package Budget Reconciliation
              </h3>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)] flex items-start gap-1.5 max-w-xl">
                <Info size={12} className="shrink-0 mt-0.5 text-[var(--color-pending)]" />
                Estimated actual cost is derived by matching each work package&apos;s trade
                categories to workers&apos; recorded hours × rate. This is an approximation — a
                direct worker↔work-package assignment table does not yet exist in the schema.
                Figures for completed packages use their audited actual cost.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)] shrink-0 mt-1 sm:mt-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-alert)] shrink-0" />
                Over budget: {overCount}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-positive)] shrink-0" />
                Under: {underCount}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <SortHeader colKey="code" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-5">
                  Package Code
                </SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap">
                  Category
                </th>
                <SortHeader colKey="budget" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Budget
                </SortHeader>
                <SortHeader colKey="estCost" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Est. Actual Cost
                </SortHeader>
                <SortHeader colKey="variance" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>
                  Variance
                </SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider whitespace-nowrap pr-5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sortedRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-[var(--color-bg)] transition-colors duration-100',
                    idx % 2 === 0 ? '' : 'bg-[#FDFBF8]',
                  )}
                >
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest">
                      {row.packageCode}
                    </span>
                    <span className="ml-2">
                      <StatusBadge status={row.wpStatus} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-ink-muted)] whitespace-nowrap">
                    {row.subcategory ?? row.category ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-[var(--color-ink)] whitespace-nowrap">
                    {row.budget > 0 ? formatCurrency(row.budget) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-[var(--color-ink)] whitespace-nowrap">
                    {formatCurrency(row.estActualCost)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <VarianceCell variance={row.variance} budget={row.budget} />
                  </td>
                  <td className="px-4 py-3 pr-5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[var(--color-border)] flex flex-wrap items-center gap-4 text-xs text-[var(--color-ink-muted)]">
          <span>
            Total budget:{' '}
            <span className="font-mono font-medium text-[var(--color-ink)]">
              {formatCurrency(reconciliation.reduce((s, r) => s + r.budget, 0))}
            </span>
          </span>
          <span>
            Total est. cost:{' '}
            <span className="font-mono font-medium text-[var(--color-ink)]">
              {formatCurrency(reconciliation.reduce((s, r) => s + r.estActualCost, 0))}
            </span>
          </span>
          <span className="ml-auto font-mono">{reconciliation.length} packages</span>
        </div>
      </div>

      {/* ── Idle Cost Breakdown ──────────────────────────────────────────────── */}
      <ChartCard title="Idle Cost Breakdown — Attention Required Workers">
        <p className="text-xs text-[var(--color-ink-muted)] mb-4">
          Workers in the Attention band (&lt;70 utilisation score) driving the idle cost
          estimate. Each figure represents wages paid for unproductive hours in the last 30 days.
          Review the{' '}
          <span className="text-[var(--color-accent)] font-medium">Productivity Analytics</span>{' '}
          page for full scoring detail.
        </p>
        {idleBreakdown.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)] py-2">
            No attention-band workers with recorded hours in the last 30 days.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Worker Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider pr-5">
                    Est. Idle Cost (30d)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {idleBreakdown.map((row, idx) => (
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
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-semibold text-[var(--color-alert)]">
                        {row.score}
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)] ml-0.5"> pts</span>
                    </td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: C_ALERT }}
                      >
                        {formatCurrency(row.estimatedIdleCost)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                  <td colSpan={3} className="px-5 py-2.5 text-xs font-medium text-[var(--color-ink-muted)]">
                    Total idle cost estimate
                  </td>
                  <td className="px-4 py-2.5 pr-5 text-right">
                    <span className="font-mono text-sm font-semibold" style={{ color: C_ALERT }}>
                      {formatCurrency(idleBreakdown.reduce((s, r) => s + r.estimatedIdleCost, 0))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ChartCard>

    </div>
  )
}
