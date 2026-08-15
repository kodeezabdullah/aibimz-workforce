import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function EmployeeResignationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Resignation
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Record worker resignations and off-board them from active project headcount — maintaining historical attendance and cost records.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
