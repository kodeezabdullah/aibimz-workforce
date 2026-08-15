import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Employees
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Worker registry across all types — General Worker, Staff, Subcon, Operator, Subcon-as-GW — with registration, transfer, and resignation management.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
