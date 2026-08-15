import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          High-level workforce KPIs, headcount, attendance rates, and cost summary across all active projects.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
