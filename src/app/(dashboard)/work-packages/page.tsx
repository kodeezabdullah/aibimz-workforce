import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function WorkPackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Work Packages
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Budget and physical-progress tracking for all work package categories — Labour, Preliminary, and sub-types — across both WP-xxx and KSK/xxx ID schemes.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
