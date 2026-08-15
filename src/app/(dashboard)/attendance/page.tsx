import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Period-based attendance records (1st-half / 2nd-half / monthly) with RFID, face-scan, and manual source tracking — including period finalisation status.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
