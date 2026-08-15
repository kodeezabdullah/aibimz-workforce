import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function EmployeeRegistrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Registration
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Register new workers to a project — capture worker type, trade category, company, and enrol them for RFID or face-scan attendance.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
