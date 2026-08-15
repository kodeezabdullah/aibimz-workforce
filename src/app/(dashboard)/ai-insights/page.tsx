import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function AiInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          AI Insights
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Natural-language Q&A over your workforce data — ask why productivity is dropping, which work packages are over-budget, or what's driving overtime cost spikes.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
