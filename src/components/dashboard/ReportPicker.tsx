'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportCard {
  slug: string
  title: string
  description: string
}

interface ReportPickerProps {
  basePath: string
  cards: ReportCard[]
  defaultMonth?: number
  defaultYear?: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const AVAILABLE_YEARS = [2024, 2025, 2026]

export function ReportPicker({ basePath, cards, defaultMonth = 8, defaultYear = 2025 }: ReportPickerProps) {
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear]   = useState(defaultYear)

  const selectClass = cn(
    'h-9 rounded-[var(--radius-card)] border border-[var(--color-border)]',
    'bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
    'appearance-none cursor-pointer',
  )

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-ink-muted)] font-medium">Report Period:</span>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className={selectClass}
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className={selectClass}
        >
          {AVAILABLE_YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.slug}
            className={cn(
              'bg-[var(--color-surface)] rounded-[var(--radius-card)]',
              'shadow-[var(--shadow-card)] p-5 flex flex-col gap-3',
              'border border-[var(--color-border)]',
            )}
          >
            {/* Ready badge */}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5',
                  'rounded-[var(--radius-sm)] text-xs font-medium',
                  'bg-[var(--color-positive-subtle)] text-[var(--color-positive)]',
                )}
              >
                <CheckCircle2 size={11} />
                Ready
              </span>
            </div>

            <div>
              <h3 className="text-base font-medium text-[var(--color-ink)] leading-snug">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                {card.description}
              </p>
            </div>

            <Link
              href={`${basePath}/${card.slug}?month=${month}&year=${year}`}
              className={cn(
                'mt-auto self-start inline-flex items-center gap-1.5',
                'text-xs font-medium text-[var(--color-accent)]',
                'hover:text-[var(--color-accent-hover)] transition-colors',
              )}
            >
              View Report
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
