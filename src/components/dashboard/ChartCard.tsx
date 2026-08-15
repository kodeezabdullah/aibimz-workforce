import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  /** Optional content placed right-aligned in the header (toggles, selects, etc.) */
  headerRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, headerRight, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-card)]',
        'shadow-[var(--shadow-card)] flex flex-col',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
        <h3 className="text-base font-medium text-[var(--color-ink)] leading-snug">
          {title}
        </h3>
        {headerRight && (
          <div className="shrink-0 flex items-center gap-2">{headerRight}</div>
        )}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  )
}
