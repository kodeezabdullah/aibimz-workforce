import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  /** positive value = up trend, negative = down trend, 0 or omitted = no trend shown */
  delta?: number
  /** When trend up is good (default true). Flips color for metrics where up = bad (e.g. absenteeism). */
  deltaGoodDirection?: 'up' | 'down'
  className?: string
  /** Optional icon placed in a small colored box at the top of the card */
  icon?: React.ReactNode
  /** CSS color value for the icon box background (e.g. 'rgba(184,134,46,0.15)') */
  iconBg?: string
  /** CSS color value for the icon itself */
  iconColor?: string
  /** Sub-line below delta: e.g. "From 127 last period" */
  fromPrevLabel?: string
}

export function StatCard({
  label,
  value,
  sublabel,
  delta,
  deltaGoodDirection = 'up',
  className,
  icon,
  iconBg,
  iconColor,
  fromPrevLabel,
}: StatCardProps) {
  const showDelta = delta !== undefined && delta !== 0
  const isUp   = delta !== undefined && delta > 0
  const isGood = showDelta
    ? deltaGoodDirection === 'up' ? isUp : !isUp
    : null

  const DeltaIcon = !showDelta ? Minus : isUp ? TrendingUp : TrendingDown

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-card)]',
        'shadow-[var(--shadow-card)] p-5 flex flex-col gap-3',
        className,
      )}
    >
      {/* Icon box (optional) */}
      {icon && (
        <div
          className="w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0"
          style={{ background: iconBg ?? 'var(--color-border)', color: iconColor ?? 'var(--color-ink-muted)' }}
        >
          {icon}
        </div>
      )}

      <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider leading-none">
        {label}
      </span>

      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-3xl font-semibold text-[var(--color-ink)] leading-none tabular-nums">
          {value}
        </span>

        {showDelta && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium font-mono mb-0.5',
              isGood ? 'text-[var(--color-positive)]' : 'text-[var(--color-alert)]',
            )}
          >
            <DeltaIcon size={13} />
            {Math.abs(delta!).toFixed(1)}%
          </span>
        )}
      </div>

      {sublabel && (
        <span className="text-xs text-[var(--color-ink-muted)] leading-snug">{sublabel}</span>
      )}

      {fromPrevLabel && (
        <span className="text-[11px] text-[var(--color-ink-muted)] leading-snug">{fromPrevLabel}</span>
      )}
    </div>
  )
}
