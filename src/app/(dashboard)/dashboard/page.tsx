'use client'

import { useState } from 'react'
import { BarChart, DonutChart, AreaChart } from '@tremor/react'
import { StatCard } from '@/components/dashboard/StatCard'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn } from '@/lib/utils'
import {
  getWorkforceKPIs,
  getHeadcountByWorkerType,
  getTodaysAttendance,
  getAttendanceTrend,
  getWorkingHoursTrend,
  getOvertimeTrend,
  getManpowerTrend,
  MOCK_PROJECT,
  type Granularity,
  type WorkerType,
} from '@/lib/mock-data'

// Design-system chart colors — accent, positive, pending, alert, muted (no blue)
const CHART_COLORS = ['#D97706', '#3F6B4A', '#B8862E', '#B3432E', '#6B6358'] as const

const PROJECT_ID = MOCK_PROJECT.id

const TODAY = new Date('2025-08-15')
const TODAY_FORMATTED = TODAY.toLocaleDateString('en-MY', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

// Worker type filter options for the headcount chart
const WORKER_TYPE_OPTIONS: { value: WorkerType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All Types' },
  { value: 'general_worker',label: 'General Worker' },
  { value: 'subcon',        label: 'Subcon' },
  { value: 'subcon_as_gw',  label: 'Subcon As GW' },
  { value: 'operator',      label: 'Operator' },
  { value: 'staff',         label: 'Staff' },
]

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

// ---------------------------------------------------------------------------
// Segmented control (shared between granularity toggle and worker-type tabs)
// ---------------------------------------------------------------------------
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'xs'
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)]',
        'bg-[var(--color-bg)] border border-[var(--color-border)] p-0.5',
      )}
      role="tablist"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-[4px] font-medium transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-1',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[11px]',
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
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [workerTypeFilter, setWorkerTypeFilter] = useState<WorkerType | 'all'>('all')

  // --- Data ---
  const kpis = getWorkforceKPIs(PROJECT_ID)
  const todayAtt = getTodaysAttendance(PROJECT_ID)
  const headcountData = getHeadcountByWorkerType(PROJECT_ID)

  const filteredHeadcount =
    workerTypeFilter === 'all'
      ? headcountData
      : headcountData.filter(d => d.workerType === workerTypeFilter)

  const headcountChartData = filteredHeadcount.map(d => ({
    name: d.label,
    Headcount: d.headcount,
  }))

  const attTrend = getAttendanceTrend(PROJECT_ID, granularity).map(p => ({
    date: p.label,
    'Attendance %': p.value,
  }))
  const hoursTrend = getWorkingHoursTrend(PROJECT_ID, granularity).map(p => ({
    date: p.label,
    'Avg Hours': p.value,
  }))
  const otTrend = getOvertimeTrend(PROJECT_ID, granularity).map(p => ({
    date: p.label,
    'OT Hours': p.value,
  }))
  const manpowerTrend = getManpowerTrend(PROJECT_ID, granularity).map(p => ({
    date: p.label,
    Workers: p.value,
  }))

  // Donut data: present = present + late + earlyLeave, absent = absent
  const attending = todayAtt.present + todayAtt.late + todayAtt.earlyLeave
  const donutData = [
    { name: 'Attending', value: attending },
    { name: 'Absent', value: todayAtt.absent },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          <span className="font-mono text-xs font-medium text-[var(--color-accent)] uppercase tracking-widest mr-2">
            {MOCK_PROJECT.code}
          </span>
          {MOCK_PROJECT.name} &mdash; {TODAY_FORMATTED}
        </p>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Registered Workers"
          value={kpis.totalWorkers}
          sublabel="Across all worker types"
        />
        <StatCard
          label="Active Workers Today"
          value={kpis.activeToday}
          sublabel={`Of ${kpis.totalWorkers} registered`}
          delta={2.1}
          deltaGoodDirection="up"
        />
        <StatCard
          label="Attendance Rate"
          value={`${kpis.attendanceRate}%`}
          sublabel="Present + late + early leave"
          delta={1.4}
          deltaGoodDirection="up"
        />
        <StatCard
          label="Absenteeism Rate"
          value={`${kpis.absenteeismRate}%`}
          sublabel="Absent / total headcount"
          delta={-1.4}
          deltaGoodDirection="down"
        />
        <StatCard
          label="Overtime Hours (7d)"
          value={kpis.overtimeHours}
          sublabel="Last 7 working days"
          delta={3.8}
          deltaGoodDirection="up"
        />
      </div>

      {/* ── Row 2: Headcount chart + Today's Attendance ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Headcount by Worker Type (~60%) */}
        <ChartCard
          className="lg:col-span-3"
          title="Headcount by Worker Type"
          headerRight={
            <SegmentedControl
              options={WORKER_TYPE_OPTIONS}
              value={workerTypeFilter}
              onChange={setWorkerTypeFilter}
              size="xs"
            />
          }
        >
          <BarChart
            data={headcountChartData}
            index="name"
            categories={['Headcount']}
            colors={[CHART_COLORS[0]]}
            yAxisWidth={40}
            showLegend={false}
            showAnimation={true}
            className="h-56"
          />
          {/* Avg daily hours per type shown as a caption row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {filteredHeadcount.map(d => (
              <span key={d.workerType} className="text-xs text-[var(--color-ink-muted)]">
                <span className="font-medium text-[var(--color-ink)]">{d.workingHours}h</span>
                {' '}avg · {d.label}
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Today's Attendance (~40%) */}
        <ChartCard className="lg:col-span-2" title="Today's Attendance">
          <div className="flex flex-col gap-4">
            {/* Period status warning */}
            <div className="flex items-center gap-2">
              <StatusBadge status={todayAtt.periodStatus} />
              {todayAtt.periodStatus === 'processing' && (
                <span className="text-xs text-[var(--color-ink-muted)]">
                  Current period — data may be incomplete
                </span>
              )}
            </div>

            {/* Donut + stats */}
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <DonutChart
                  data={donutData}
                  category="value"
                  index="name"
                  colors={[CHART_COLORS[1], CHART_COLORS[3]]}
                  showAnimation={true}
                  className="h-36 w-36"
                  showLabel={false}
                />
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display text-2xl font-semibold text-[var(--color-ink)] leading-none">
                    {todayAtt.rate}%
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">rate</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-3 min-w-0">
                <StatRow
                  dot="positive"
                  label="Present"
                  value={todayAtt.present}
                />
                <StatRow
                  dot="pending"
                  label="Late"
                  value={todayAtt.late}
                />
                <StatRow
                  dot="pending"
                  label="Early leave"
                  value={todayAtt.earlyLeave}
                />
                <StatRow
                  dot="alert"
                  label="Absent"
                  value={todayAtt.absent}
                />
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Trend section ─────────────────────────────────────────────── */}
      <div>
        {/* Shared granularity toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
            Trends
          </h2>
          <SegmentedControl
            options={GRANULARITY_OPTIONS}
            value={granularity}
            onChange={setGranularity}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Attendance Trend">
            <AreaChart
              data={attTrend}
              index="date"
              categories={['Attendance %']}
              colors={[CHART_COLORS[1]]}
              showAnimation={true}
              showLegend={false}
              yAxisWidth={44}
              className="h-44"
            />
          </ChartCard>

          <ChartCard title="Working Hours Trend">
            <AreaChart
              data={hoursTrend}
              index="date"
              categories={['Avg Hours']}
              colors={[CHART_COLORS[0]]}
              showAnimation={true}
              showLegend={false}
              yAxisWidth={44}
              className="h-44"
            />
          </ChartCard>

          <ChartCard title="Overtime Trend">
            <AreaChart
              data={otTrend}
              index="date"
              categories={['OT Hours']}
              colors={[CHART_COLORS[2]]}
              showAnimation={true}
              showLegend={false}
              yAxisWidth={44}
              className="h-44"
            />
          </ChartCard>

          <ChartCard title="Manpower Trend">
            <AreaChart
              data={manpowerTrend}
              index="date"
              categories={['Workers']}
              colors={[CHART_COLORS[3]]}
              showAnimation={true}
              showLegend={false}
              yAxisWidth={44}
              className="h-44"
            />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Small helper used only in this file
// ---------------------------------------------------------------------------
type DotColor = 'positive' | 'pending' | 'alert'

const DOT_CLASSES: Record<DotColor, string> = {
  positive: 'bg-[var(--color-positive)]',
  pending:  'bg-[var(--color-pending)]',
  alert:    'bg-[var(--color-alert)]',
}

function StatRow({ dot, label, value }: { dot: DotColor; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn('w-2 h-2 rounded-full shrink-0', DOT_CLASSES[dot])} />
        <span className="text-sm text-[var(--color-ink-muted)] truncate">{label}</span>
      </div>
      <span className="font-mono text-sm font-medium text-[var(--color-ink)]">{value}</span>
    </div>
  )
}
