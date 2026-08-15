import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function ProductivityReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Productivity Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Utilisation score distribution across worker types and trade categories — High, Normal, and Attention-required bands with period-over-period trend.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
