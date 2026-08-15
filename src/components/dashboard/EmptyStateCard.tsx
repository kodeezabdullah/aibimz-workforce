import { DatabaseZap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateCardProps {
  className?: string
}

export function EmptyStateCard({ className }: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-6',
        'rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)]',
        'bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
        'text-center',
        className,
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-card)] bg-[var(--color-pending-subtle)]">
        <DatabaseZap size={22} className="text-[var(--color-pending)]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-ink)]">
          No data yet
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] max-w-[280px]">
          Connect QTime data to populate this view — import a CSV/Excel export
          or configure the API integration.
        </p>
      </div>
    </div>
  )
}
