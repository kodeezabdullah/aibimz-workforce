import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function AttendanceReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Attendance Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Period-by-period attendance breakdown by worker type and source — RFID, face scan, manual — with present, absent, late, and early-leave counts.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
