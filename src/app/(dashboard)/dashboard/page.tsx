'use client'

import { useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  LabelList,
  AreaChart as RechartAreaChart,
  Area,
} from 'recharts'
import { DonutChart } from '@tremor/react'
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

// ---------------------------------------------------------------------------
// Design token hex values — used directly in Recharts SVG props
// ---------------------------------------------------------------------------
const C_ACCENT   = '#D97706'
const C_POSITIVE = '#3F6B4A'
const C_PENDING  = '#B8862E'
const C_ALERT    = '#B3432E'
const C_MUTED    = '#6B6358'
const C_BORDER   = '#E7E0D4'
const C_SURFACE  = '#FFFFFF'
const C_INK      = '#211D18'

const AXIS_STYLE = { fill: C_MUTED, fontSize: 11, fontFamily: 'inherit' }

const PROJECT_ID = MOCK_PROJECT.id

const TODAY = new Date('2025-08-15')
const TODAY_FORMATTED = TODAY.toLocaleDateString('en-MY', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------
const WORKER_TYPE_OPTIONS: { value: WorkerType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'general_worker',label: 'GW' },
  { value: 'subcon',        label: 'SC' },
  { value: 'subcon_as_gw',  label: 'SAG' },
  { value: 'operator',      label: 'OP' },
  { value: 'staff',         label: 'Staff' },
]

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

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
// Shared tooltip shell — styled to design system
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
        minWidth: 110,
      }}
    >
      {label && (
        <p style={{ color: C_MUTED, fontSize: 11, marginBottom: 4 }}>{label}</p>
      )}
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Headcount + Working Hours combo chart (Recharts ComposedChart)
// Bars = headcount (blue, left axis)
// Line = avg working hours (mint green, right axis) with pill badge labels
// ---------------------------------------------------------------------------
const C_BAR_BLUE  = '#4B7AE8'
const C_MINT      = '#10C98F'

type HeadcountDatum = { name: string; Headcount: number; workingHours: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HoursBadge(props: any) {
  const x = props.x as number | undefined
  const y = props.y as number | undefined
  const value = typeof props.value === 'number' ? props.value as number : undefined
  if (x == null || y == null || value == null) return null
  const text = `${value}h`
  const w = Math.max(36, text.length * 7.5 + 16)
  const h = 22
  return (
    <g transform={`translate(${x},${y - h - 8})`}>
      <rect x={-w / 2} y={0} width={w} height={h} rx={6} fill={C_MINT} />
      <text
        x={0} y={h / 2 + 4.5}
        textAnchor="middle"
        fill="#fff"
        fontSize={11}
        fontWeight={700}
        fontFamily="inherit"
      >
        {text}
      </text>
    </g>
  )
}

function HeadcountComboChart({ data }: { data: HeadcountDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 40, right: 48, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C_BORDER} vertical={false} />

        <XAxis
          dataKey="name"
          tick={AXIS_STYLE}
          axisLine={{ stroke: C_BORDER }}
          tickLine={false}
        />

        {/* Left axis: headcount */}
        <YAxis
          yAxisId="hc"
          orientation="left"
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          width={32}
          allowDecimals={false}
        />

        {/* Right axis: avg hours */}
        <YAxis
          yAxisId="hrs"
          orientation="right"
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          width={36}
          domain={[0, 12]}
          tickCount={4}
          tickFormatter={(v: number) => `${v}h`}
        />

        <RechartTooltip
          cursor={{ fill: 'rgba(231,224,212,0.35)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const hc  = payload.find(p => p.dataKey === 'Headcount')
            const hrs = payload.find(p => p.dataKey === 'workingHours')
            return (
              <TooltipShell label={String(label)}>
                {hc && (
                  <p style={{ color: C_BAR_BLUE, fontSize: 12, fontWeight: 600 }}>
                    Headcount: {hc.value}
                  </p>
                )}
                {hrs && (
                  <p style={{ color: C_MINT, fontSize: 12, fontWeight: 600 }}>
                    Avg hours: {hrs.value}h
                  </p>
                )}
              </TooltipShell>
            )
          }}
        />

        <Bar
          yAxisId="hc"
          dataKey="Headcount"
          fill={C_BAR_BLUE}
          radius={[6, 6, 0, 0]}
          maxBarSize={54}
        />

        <Line
          yAxisId="hrs"
          type="monotone"
          dataKey="workingHours"
          name="Avg Hours"
          stroke={C_MINT}
          strokeWidth={2.5}
          dot={{ r: 6, fill: C_MINT, stroke: C_SURFACE, strokeWidth: 2 }}
          activeDot={{ r: 8, fill: C_MINT, stroke: C_SURFACE, strokeWidth: 2 }}
        >
          <LabelList dataKey="workingHours" content={HoursBadge} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Trend area chart — monotone dashed line, gradient fill, always-visible dots
// ---------------------------------------------------------------------------
interface TrendAreaChartProps {
  data: Record<string, string | number>[]
  dataKey: string
  color: string
  /** Gradient ID must be unique per chart on the page */
  gradientId: string
  granularity: Granularity
  unit?: string
}

function TrendAreaChart({
  data,
  dataKey,
  color,
  gradientId,
  granularity,
  unit = '',
}: TrendAreaChartProps) {
  const isDaily = granularity === 'daily'

  // Daily: show every label angled; weekly/monthly: sparse auto interval
  const xInterval: number | 'preserveStartEnd' = isDaily
    ? 0
    : data.length > 14 ? Math.ceil(data.length / 6) : 'preserveStartEnd'

  const xTickStyle = isDaily
    ? { ...AXIS_STYLE, angle: -45, textAnchor: 'end' as const, dy: 4 }
    : AXIS_STYLE

  return (
    <ResponsiveContainer width="100%" height={isDaily ? 208 : 176}>
      <RechartAreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -8, bottom: isDaily ? 52 : 4 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
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
          width={40}
        />

        <RechartTooltip
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <TooltipShell label={String(label)}>
                <p style={{ color, fontSize: 13, fontWeight: 600 }}>
                  {payload[0].value}{unit}
                </p>
              </TooltipShell>
            )
          }}
        />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="6 3"
          fill={`url(#${gradientId})`}
          dot={{ r: 3.5, fill: color, stroke: C_SURFACE, strokeWidth: 1.5 }}
          activeDot={{ r: 5.5, fill: color, stroke: C_SURFACE, strokeWidth: 2 }}
          isAnimationActive={true}
        />
      </RechartAreaChart>
    </ResponsiveContainer>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [workerTypeFilter, setWorkerTypeFilter] = useState<WorkerType | 'all'>('all')

  // Data
  const kpis       = getWorkforceKPIs(PROJECT_ID)
  const todayAtt   = getTodaysAttendance(PROJECT_ID)
  const headcountData = getHeadcountByWorkerType(PROJECT_ID)

  const filteredHeadcount =
    workerTypeFilter === 'all'
      ? headcountData
      : headcountData.filter(d => d.workerType === workerTypeFilter)

  const headcountChartData: HeadcountDatum[] = filteredHeadcount.map(d => ({
    name: d.label,
    Headcount: d.headcount,
    workingHours: d.workingHours,
  }))

  const attTrend      = getAttendanceTrend(PROJECT_ID, granularity).map(p => ({ date: p.label, 'Attendance %': p.value }))
  const hoursTrend    = getWorkingHoursTrend(PROJECT_ID, granularity).map(p => ({ date: p.label, 'Avg Hours': p.value }))
  const otTrend       = getOvertimeTrend(PROJECT_ID, granularity).map(p => ({ date: p.label, 'OT Hours': p.value }))
  const manpowerTrend = getManpowerTrend(PROJECT_ID, granularity).map(p => ({ date: p.label, Workers: p.value }))

  // Donut: Tremor accepts named colors only — emerald = positive, rose = alert
  const attending = todayAtt.present + todayAtt.late + todayAtt.earlyLeave
  const donutData = [
    { name: 'Attending', value: attending },
    { name: 'Absent',    value: todayAtt.absent },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Registered Workers" value={kpis.totalWorkers}     sublabel="Across all worker types" />
        <StatCard label="Active Workers Today"      value={kpis.activeToday}      sublabel={`Of ${kpis.totalWorkers} registered`} delta={2.1}  deltaGoodDirection="up"   />
        <StatCard label="Attendance Rate"           value={`${kpis.attendanceRate}%`}  sublabel="Present + late + early leave" delta={1.4}  deltaGoodDirection="up"   />
        <StatCard label="Absenteeism Rate"          value={`${kpis.absenteeismRate}%`} sublabel="Absent / total headcount"     delta={-1.4} deltaGoodDirection="down" />
        <StatCard label="Overtime Hours (7d)"       value={kpis.overtimeHours}    sublabel="Last 7 working days"  delta={3.8}  deltaGoodDirection="up"   />
      </div>

      {/* ── Row 2: Headcount combo + Today's Attendance ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Headcount by Worker Type — bar (headcount) + line (avg hours) */}
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
          <div className="flex items-center gap-4 mb-3 text-xs text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: C_BAR_BLUE }} />
              Headcount (left axis)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 inline-block" style={{ background: C_MINT }} />
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: C_MINT }} />
              Avg daily hours (right axis)
            </span>
          </div>
          <HeadcountComboChart data={headcountChartData} />
        </ChartCard>

        {/* Today's Attendance donut */}
        <ChartCard className="lg:col-span-2" title="Today's Attendance">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={todayAtt.periodStatus} />
              {todayAtt.periodStatus === 'processing' && (
                <span className="text-xs text-[var(--color-ink-muted)]">
                  Current period — data may be incomplete
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              {/* Donut — emerald = positive (attending), rose = alert (absent) */}
              <div className="relative shrink-0">
                <DonutChart
                  data={donutData}
                  category="value"
                  index="name"
                  colors={['emerald', 'rose']}
                  showAnimation={true}
                  showLabel={false}
                  className="h-36 w-36"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display text-2xl font-semibold text-[var(--color-ink)] leading-none">
                    {todayAtt.rate}%
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">rate</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-3 min-w-0">
                <StatRow dot="positive" label="Present"     value={todayAtt.present}    />
                <StatRow dot="pending"  label="Late"        value={todayAtt.late}        />
                <StatRow dot="pending"  label="Early leave" value={todayAtt.earlyLeave}  />
                <StatRow dot="alert"    label="Absent"      value={todayAtt.absent}      />
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Trend section ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">Trends</h2>
          <SegmentedControl options={GRANULARITY_OPTIONS} value={granularity} onChange={setGranularity} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <ChartCard title="Attendance Trend">
            <TrendAreaChart
              data={attTrend}
              dataKey="Attendance %"
              color={C_POSITIVE}
              gradientId="grad-att"
              granularity={granularity}
              unit="%"
            />
          </ChartCard>

          <ChartCard title="Working Hours Trend">
            <TrendAreaChart
              data={hoursTrend}
              dataKey="Avg Hours"
              color={C_ACCENT}
              gradientId="grad-hours"
              granularity={granularity}
              unit="h"
            />
          </ChartCard>

          <ChartCard title="Overtime Trend">
            <TrendAreaChart
              data={otTrend}
              dataKey="OT Hours"
              color={C_PENDING}
              gradientId="grad-ot"
              granularity={granularity}
              unit="h"
            />
          </ChartCard>

          <ChartCard title="Manpower Trend">
            <TrendAreaChart
              data={manpowerTrend}
              dataKey="Workers"
              color={C_ACCENT}
              gradientId="grad-manpower"
              granularity={granularity}
            />
          </ChartCard>

        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatRow helper (donut breakdown)
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
