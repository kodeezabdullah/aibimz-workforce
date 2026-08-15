import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function WeeklyReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Weekly Workforce Report
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Consolidated weekly snapshot — headcount, attendance rate, productivity score, and labour cost — exportable as PDF or Excel.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
