import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function LabourCostReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Labour Cost Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Actual labour spend vs. work package budget by period — including overtime, work type breakdown, and variance to budget.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
