import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function WorkPackagesReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Work Package Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Budget vs. actual and physical-progress summary across all work packages — by category, status, and ID scheme (WP-xxx and KSK/xxx).
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
