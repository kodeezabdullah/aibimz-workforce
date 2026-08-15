import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function LabourCostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Labour Cost
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Labour cost intelligence reconciled against work package budgets — not just hourly rate × hours — with variance analysis and cost-to-complete projections.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
