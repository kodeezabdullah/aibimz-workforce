import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function ProductivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Productivity
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Worker utilisation scoring by type and period — High (90–100%), Normal (70–90%), Attention required (&lt;70%) — with drill-down by trade category.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
