import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function EmployeeListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Employee List
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Full worker registry — General Worker, Staff, Subcon, Operator, and Subcon-as-GW — with trade category, company, and current project assignment.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
