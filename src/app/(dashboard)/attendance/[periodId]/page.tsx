'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Banknote, ArrowLeftRight, History } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { cn } from '@/lib/utils'
import {
  getAttendanceSummary,
  type AttendanceSource,
} from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SummaryTab = 'summary' | 'details' | 'payment'

const SOURCE_LABELS: Record<AttendanceSource, string> = {
  rfid:      'RFID',
  face_scan: 'Face Scan',
  manual:    'Manual',
}

const PERIOD_TYPE_LABELS: Record<string, string> = {
  '1st_half': '1st Half',
  '2nd_half': '2nd Half',
  'monthly':  'Monthly',
}

// ---------------------------------------------------------------------------
// Tab button (inner, for Summary / Details / Payment)
// ---------------------------------------------------------------------------
function InnerTab({
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
// Delta percent helper
// ---------------------------------------------------------------------------
function pctChange(curr: number, prev: number): number {
  if (prev === 0) return 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AttendanceSummaryPage({
  params,
}: {
  params: Promise<{ periodId: string }>
}) {
  const { periodId: rawId } = use(params)
  const periodId = decodeURIComponent(rawId)

  const [source,     setSource]     = useState<AttendanceSource>('face_scan')
  const [activeTab,  setActiveTab]  = useState<SummaryTab>('summary')

  const data = useMemo(() => getAttendanceSummary(periodId, source), [periodId, source])

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
          <ArrowLeft size={14} />
          Back to Attendance
        </Link>
        <p className="text-sm text-[var(--color-alert)]">Period not found.</p>
      </div>
    )
  }

  const otherSource: AttendanceSource = source === 'face_scan' ? 'rfid' : 'face_scan'

  const headcountDelta  = pctChange(data.totalHeadcount,   data.totalHeadcountPrev)
  const paymentDelta    = pctChange(data.totalPayment,     data.totalPaymentPrev)
  const backchargeDelta = pctChange(data.totalBackcharge,  data.totalBackchargePrev)

  return (
    <div className="space-y-6">

      {/* Back link */}
      <Link
        href="/attendance"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Attendance
      </Link>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
            Attendance Summary
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)] flex flex-wrap items-center gap-2">
            <span>{data.workerTypeLabel}</span>
            <span className="text-[var(--color-border)]">·</span>
            <StatusBadge status={data.status} />
            <span className="text-[var(--color-border)]">·</span>
            <span className="font-mono text-xs">{data.dateRangeLabel}</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>{PERIOD_TYPE_LABELS[data.periodType]}</span>
          </p>
        </div>

        {/* Source toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-ink-muted)]">Source:</span>
          <div className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] overflow-hidden">
            {(['face_scan', 'rfid'] as AttendanceSource[]).map(s => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  source === s
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
                )}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-5 py-4',
          'rounded-[var(--radius-card)] border border-[var(--color-border)]',
        )}
        style={{ background: 'rgba(217,119,6,0.06)' }}
      >
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Currently viewing <span className="font-semibold text-[var(--color-accent)]">{SOURCE_LABELS[source]}</span> Record
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Attendance data captured via {SOURCE_LABELS[source]} device for this period.
            {data.status === 'processing' && ' Period is still processing — figures may be incomplete.'}
          </p>
        </div>
        <button
          onClick={() => setSource(otherSource)}
          className={cn(
            'shrink-0 px-3 py-1.5 text-xs font-medium whitespace-nowrap',
            'rounded-[var(--radius-sm)] border border-[var(--color-accent)]',
            'text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white',
            'transition-colors duration-150',
          )}
        >
          Switch to {SOURCE_LABELS[otherSource]}
        </button>
      </div>

      {/* Inner tabs */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex gap-8">
          <InnerTab active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
            Summary
          </InnerTab>
          <InnerTab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
            Details
          </InnerTab>
          <InnerTab active={activeTab === 'payment'} onClick={() => setActiveTab('payment')}>
            Payment
          </InnerTab>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Headcount"
              value={data.totalHeadcount}
              delta={headcountDelta}
              deltaGoodDirection="up"
              fromPrevLabel={`From ${data.totalHeadcountPrev} last period`}
              icon={<Users size={16} />}
              iconBg="rgba(184,134,46,0.15)"
              iconColor="#B8862E"
            />
            <StatCard
              label="Total Payment"
              value={`RM ${data.totalPayment.toLocaleString()}`}
              delta={paymentDelta}
              deltaGoodDirection="down"
              fromPrevLabel={`From RM ${data.totalPaymentPrev.toLocaleString()} last period`}
              icon={<Banknote size={16} />}
              iconBg="rgba(179,67,46,0.12)"
              iconColor="#B3432E"
            />
            <StatCard
              label="Total Backcharge"
              value={`RM ${data.totalBackcharge.toLocaleString()}`}
              delta={backchargeDelta}
              deltaGoodDirection="down"
              fromPrevLabel={`From RM ${data.totalBackchargePrev.toLocaleString()} last period`}
              icon={<ArrowLeftRight size={16} />}
              iconBg="rgba(63,107,74,0.12)"
              iconColor="#3F6B4A"
            />
          </div>

          {/* Approval List */}
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
              <h3 className="text-base font-medium text-[var(--color-ink)]">Approval List</h3>
              <button
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                  'rounded-[var(--radius-sm)] border border-[var(--color-border)]',
                  'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)]',
                  'transition-colors duration-150',
                )}
              >
                <History size={12} />
                History
              </button>
            </div>
            <div className="px-5 py-4">
              {data.employeesYetToSubmit === 0 ? (
                <p className="text-sm text-[var(--color-positive)]">
                  All employees have submitted for this period.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full font-display text-lg font-semibold text-[var(--color-pending)]"
                    style={{ background: 'rgba(184,134,46,0.12)' }}
                  >
                    {data.employeesYetToSubmit}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      Employee{data.employeesYetToSubmit !== 1 ? 's' : ''} yet to submit
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      Pending submission for {data.workerTypeLabel} — {SOURCE_LABELS[source]} records
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'details' || activeTab === 'payment') && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            {activeTab === 'details' ? 'Details' : 'Payment'} view — coming soon
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1 opacity-70">
            This section will be built out in a future sprint.
          </p>
        </div>
      )}

    </div>
  )
}
