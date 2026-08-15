import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Reports
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Generate and export weekly management reports — attendance summaries, productivity scores, and labour cost breakdowns — in PDF or Excel format.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
