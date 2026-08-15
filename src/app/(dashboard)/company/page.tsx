import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Company
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Organisation settings — company profile, subcontractor registry, and labour rate configurations shared across all projects.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
