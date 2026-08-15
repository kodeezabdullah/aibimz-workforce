'use client'

import { useState, useEffect } from 'react'
import { MapPin, User, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell } from 'recharts'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn } from '@/lib/utils'
import type { WorkPackage } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Design token constants (hex — used in SVG props)
// ---------------------------------------------------------------------------
const C_POSITIVE = '#3F6B4A'
const C_ALERT    = '#B3432E'
const C_ACCENT   = '#D97706'
const C_PENDING  = '#B8862E'
const C_MUTED    = '#E8E3DA'  // ring fill for empty portion

// ---------------------------------------------------------------------------
// ClientOnly — prevents Recharts clip-path ID hydration mismatch
// ---------------------------------------------------------------------------
function ClientOnly({ children, height }: { children: React.ReactNode; height: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ height }} />
  return <>{children}</>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRM(value: number) {
  return `RM ${value.toLocaleString('en-MY')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function buildBreadcrumb(wp: WorkPackage): string[] {
  const parts: string[] = []
  if (wp.category)        parts.push(wp.category)
  if (wp.subcategory)     parts.push(wp.subcategory)
  if (wp.sub_subcategory) parts.push(wp.sub_subcategory)
  return parts
}

// ---------------------------------------------------------------------------
// Progress Donut — used for On Going + In Review
// ---------------------------------------------------------------------------
function ProgressDonut({ progress }: { progress: number }) {
  const filled = Math.max(0, Math.min(100, progress))
  const data = [{ value: filled }, { value: 100 - filled }]
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wide">
        Physical Progress
      </p>
      <div className="relative">
        <ClientOnly height={120}>
          <PieChart width={120} height={120}>
            <Pie
              data={data}
              cx={58} cy={58}
              innerRadius={40} outerRadius={56}
              startAngle={90} endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={C_ACCENT} />
              <Cell fill={C_MUTED} />
            </Pie>
          </PieChart>
        </ClientOnly>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-xl font-bold text-[var(--color-ink)] leading-none">
            {filled}%
          </span>
          <span className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 leading-tight text-center">
            Complete
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Financial Health panel — used for Completed
// ---------------------------------------------------------------------------
function FinancialPanel({ wp }: { wp: WorkPackage }) {
  const budget = wp.budget_amount ?? 0
  const actual = wp.actual_cost ?? 0
  const variance = budget - actual
  const savingsPct = budget > 0 ? Math.round((variance / budget) * 100) : 0
  const isOver = variance < 0

  const donutFilled = Math.max(0, Math.min(100, savingsPct))
  const fillColor = donutFilled === 0 ? C_MUTED : isOver ? C_ALERT : C_POSITIVE
  const data = [{ value: donutFilled }, { value: 100 - donutFilled }]

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wide">
        Financial Health
      </p>
      <div className="relative">
        <ClientOnly height={120}>
          <PieChart width={120} height={120}>
            <Pie
              data={data}
              cx={58} cy={58}
              innerRadius={40} outerRadius={56}
              startAngle={90} endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={fillColor} />
              <Cell fill={C_MUTED} />
            </Pie>
          </PieChart>
        </ClientOnly>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-display text-xl font-bold leading-none"
            style={{ color: fillColor === C_MUTED ? 'var(--color-ink-muted)' : fillColor }}
          >
            {savingsPct}%
          </span>
          <span className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 leading-tight text-center">
            Savings
          </span>
        </div>
      </div>

      <div className="w-full space-y-1.5 text-xs mt-1">
        <FinancialRow label="Budget"      value={budget}   />
        <FinancialRow label="Actual Cost" value={actual}   />
        <div className="border-t border-[var(--color-border)] pt-1.5">
          <FinancialRow
            label="Variance"
            value={Math.abs(variance)}
            prefix={variance >= 0 ? '+' : '−'}
            color={isOver ? C_ALERT : C_POSITIVE}
          />
        </div>
      </div>
    </div>
  )
}

function FinancialRow({
  label, value, prefix = '', color,
}: {
  label: string; value: number; prefix?: string; color?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span
        className="font-mono font-medium"
        style={{ color: color ?? 'var(--color-ink)' }}
      >
        {prefix}RM {value.toLocaleString('en-MY')}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rejected / Archived panel
// ---------------------------------------------------------------------------
function RejectedPanel({ wp }: { wp: WorkPackage }) {
  // Packages with some progress were actively rejected; zero-progress ones were archived before starting
  const label = (wp.physical_progress ?? 0) > 0 ? 'Rejected' : 'Archived'
  const date = formatDate(wp.created_at)

  return (
    <div className="flex flex-col gap-3">
      <StatusBadge status="rejected_archived" label={label} />
      <p className="text-xs text-[var(--color-ink-muted)]">{date}</p>
      {wp.rejection_reason && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-alert-subtle)] p-2.5">
          <p className="text-xs text-[var(--color-alert)] leading-relaxed">
            {wp.rejection_reason}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------
interface WorkPackageCardProps {
  wp: WorkPackage
}

export function WorkPackageCard({ wp }: WorkPackageCardProps) {
  const breadcrumb = buildBreadcrumb(wp)

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-card)]',
        'shadow-[var(--shadow-card)] border border-[var(--color-border)]',
        'p-5 flex flex-col sm:flex-row gap-5',
      )}
    >
      {/* ── Left: main content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Package code + created-by line */}
        <div>
          <h3 className="font-mono text-base font-semibold text-[var(--color-ink)] tracking-wide">
            {wp.package_code}
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Created by {wp.created_by_name ?? '—'} &bull; {formatDate(wp.created_at)}
          </p>
        </div>

        {/* Assigned chip */}
        {wp.assigned_to_name && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1',
              'rounded-[var(--radius-sm)] text-xs font-medium',
              'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
            )}
          >
            <User size={11} strokeWidth={2.5} />
            {wp.assigned_to_name}
          </span>
        )}

        {/* Category breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    size={12}
                    strokeWidth={2}
                    className="text-[var(--color-ink-muted)] shrink-0"
                  />
                )}
                <span
                  className={cn(
                    'text-xs',
                    i === breadcrumb.length - 1
                      ? 'text-[var(--color-ink)] font-medium'
                      : 'text-[var(--color-ink-muted)]',
                  )}
                >
                  {seg}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Location (only when present) */}
        {wp.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} strokeWidth={2} className="text-[var(--color-ink-muted)] shrink-0" />
            <span className="text-xs text-[var(--color-ink-muted)]">{wp.location}</span>
          </div>
        )}

        {/* Work nature badge */}
        {wp.work_nature && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-ink-muted)] font-medium shrink-0">
              Work Nature:
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5',
                'rounded-[var(--radius-sm)]',
                'text-xs font-medium',
                'bg-[var(--color-border)] text-[var(--color-ink-muted)]',
              )}
            >
              {wp.work_nature}
            </span>
          </div>
        )}

        {/* Remark */}
        {wp.remark && (
          <div>
            <span className="text-xs text-[var(--color-ink-muted)] font-medium">Remark: </span>
            <span className="text-xs text-[var(--color-ink)]">{wp.remark}</span>
          </div>
        )}

        {/* Budget */}
        {wp.budget_amount != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-ink-muted)] font-medium">Budget Amount:</span>
            <span className="font-mono text-sm font-semibold text-[var(--color-ink)]">
              {formatRM(wp.budget_amount)}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: status panel ────────────────────────────────────────────── */}
      <div
        className={cn(
          'sm:w-44 shrink-0',
          'sm:border-l sm:border-[var(--color-border)] sm:pl-5',
          'border-t border-[var(--color-border)] pt-4 sm:border-t-0 sm:pt-0',
        )}
      >
        {(wp.status === 'on_going' || wp.status === 'in_review') && (
          <ProgressDonut progress={wp.physical_progress ?? 0} />
        )}
        {wp.status === 'completed' && (
          <FinancialPanel wp={wp} />
        )}
        {wp.status === 'rejected_archived' && (
          <RejectedPanel wp={wp} />
        )}
      </div>
    </div>
  )
}
