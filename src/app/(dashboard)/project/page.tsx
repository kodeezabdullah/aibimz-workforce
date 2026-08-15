import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard'

export default function ProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Project
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Manage project sites — create and configure project codes, set active periods, and control which data is scoped to each construction site.
        </p>
      </div>
      <EmptyStateCard />
    </div>
  )
}
