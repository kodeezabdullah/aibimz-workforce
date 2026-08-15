import { cn } from '@/lib/utils'

// Central status → color token mapping. One place for the whole app.
type BadgeVariant = 'positive' | 'pending' | 'alert' | 'accent' | 'muted'

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // Attendance
  present:         'positive',
  late:            'pending',
  early_leave:     'pending',
  absent:          'alert',
  // Period
  finalized:       'positive',
  processing:      'pending',
  // Work packages
  on_going:        'accent',
  in_review:       'pending',
  completed:       'positive',
  rejected_archived: 'alert',
  // Productivity
  high:            'positive',
  normal:          'muted',
  attention:       'alert',
  // Labour cost
  within_budget:   'positive',
  over_budget:     'alert',
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  positive: 'bg-[var(--color-positive-subtle)] text-[var(--color-positive)]',
  pending:  'bg-[var(--color-pending-subtle)]  text-[var(--color-pending)]',
  alert:    'bg-[var(--color-alert-subtle)]    text-[var(--color-alert)]',
  accent:   'bg-[var(--color-accent-subtle)]   text-[var(--color-accent)]',
  muted:    'bg-[var(--color-border)]          text-[var(--color-ink-muted)]',
}

const STATUS_LABELS: Record<string, string> = {
  present:           'Present',
  late:              'Late',
  early_leave:       'Early Leave',
  absent:            'Absent',
  finalized:         'Finalized',
  processing:        'Processing',
  on_going:          'On Going',
  in_review:         'In Review',
  completed:         'Completed',
  rejected_archived: 'Rejected / Archived',
  high:              'High',
  normal:            'Normal',
  attention:         'Attention',
  within_budget:     'Within Budget',
  over_budget:       'Over Budget',
}

interface StatusBadgeProps {
  status: string
  /** Override the auto-derived label */
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant: BadgeVariant = STATUS_VARIANT_MAP[status] ?? 'muted'
  const displayLabel = label ?? STATUS_LABELS[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'rounded-[var(--radius-sm)]',
        'text-xs font-medium leading-normal whitespace-nowrap',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {displayLabel}
    </span>
  )
}
